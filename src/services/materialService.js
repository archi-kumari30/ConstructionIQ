const mongoose = require('mongoose');
const materialRepository = require('../repositories/materialRepository');
const materialInventoryRepository = require('../repositories/materialInventoryRepository');
const materialRequestRepository = require('../repositories/materialRequestRepository');
const materialTransactionRepository = require('../repositories/materialTransactionRepository');
const notificationRepository = require('../repositories/notificationRepository');
const socketService = require('../socket/socketService');
const auditLogService = require('./auditLogService');
const { ConflictError, BadRequestError, NotFoundError } = require('../utils/customErrors');
const logger = require('../config/logger');
const STATUS = require('../constants/status');

class MaterialService {
  // Helper to run operations in transaction (with graceful fallback for standalone developer MongoDB)
  async runTransaction(actions) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await actions(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      // Code 20 or replica set error indicates standalone MongoDB
      if (error.message.includes('replica set') || error.code === 20 || error.message.includes('transaction')) {
        logger.warn('Mongoose Transactions not supported on this MongoDB configuration. Running actions sequentially...');
        return await actions(null);
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  // --- Global Material Catalog CRUD ---
  async createMaterial(materialData, userId) {
    const existing = await materialRepository.findByName(materialData.name);
    if (existing) {
      throw new ConflictError(`Material with name '${materialData.name}' already exists in catalog`);
    }

    const material = await materialRepository.create(materialData);

    await auditLogService.logAction({
      userId,
      action: 'MATERIAL_CATALOG_CREATE',
      entity: 'Material',
      entityId: material._id,
      details: { name: material.name, category: material.category }
    });

    return material;
  }

  async updateMaterial(id, updateData, userId) {
    if (updateData.name) {
      const existing = await materialRepository.findByName(updateData.name);
      if (existing && existing._id.toString() !== id) {
        throw new ConflictError(`Another material with name '${updateData.name}' already exists`);
      }
    }

    const material = await materialRepository.update(id, updateData);
    if (!material) {
      throw new NotFoundError('Material not found in catalog');
    }

    await auditLogService.logAction({
      userId,
      action: 'MATERIAL_CATALOG_UPDATE',
      entity: 'Material',
      entityId: material._id,
      details: updateData
    });

    return material;
  }

  async deleteMaterial(id, userId) {
    const material = await materialRepository.softDelete(id);
    if (!material) {
      throw new NotFoundError('Material not found in catalog');
    }

    await auditLogService.logAction({
      userId,
      action: 'MATERIAL_CATALOG_DELETE',
      entity: 'Material',
      entityId: material._id
    });

    return material;
  }

  async listMaterials(params) {
    return await materialRepository.findAll(params);
  }

  // --- Project Inventory ---
  async getProjectInventory(projectId, params) {
    return await materialInventoryRepository.findByProject(projectId, params);
  }

  async updateInventoryThreshold(projectId, materialId, { lowStockThreshold, warehouseLocation }, userId) {
    // Verify material exists
    const material = await materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundError('Material not found');
    }

    const inventory = await materialInventoryRepository.setThreshold(
      projectId,
      materialId,
      lowStockThreshold,
      warehouseLocation
    );

    await auditLogService.logAction({
      userId,
      action: 'INVENTORY_THRESHOLD_UPDATE',
      entity: 'MaterialInventory',
      entityId: inventory._id,
      details: { projectId, materialId, lowStockThreshold, warehouseLocation }
    });

    return inventory;
  }

  // --- Transaction Ledger ---
  async logTransaction(projectId, transactionData, userId) {
    const { materialId, type, quantity, referenceId } = transactionData;

    // Verify material
    const material = await materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundError('Material not found in catalog');
    }

    return await this.runTransaction(async (session) => {
      // 1. Log transaction
      const transaction = await materialTransactionRepository.create({
        projectId,
        materialId,
        type,
        quantity,
        referenceId
      }, session);

      // 2. Adjust stock
      // Received or returned increases stock. Issued decreases stock.
      const stockAdjustment = (type === STATUS.MATERIAL_TRANSACTION.RECEIVED || type === STATUS.MATERIAL_TRANSACTION.RETURNED)
        ? quantity
        : -quantity;

      const inventory = await materialInventoryRepository.updateStock(projectId, materialId, stockAdjustment, session);

      // Check low stock levels
      if (inventory.quantityAvailable < inventory.lowStockThreshold) {
        const message = `Alert: Material '${material.name}' has fallen below the threshold on project. Available: ${inventory.quantityAvailable} ${material.unit}`;
        
        // Save database notification (non-blocking)
        notificationRepository.create({
          userId, // or assign to project manager
          message,
          type: 'low_stock'
        }).catch(err => logger.error(`Failed to save notification: ${err.message}`));

        // Emit Socket Event
        socketService.emitToProject(projectId, 'low_stock_alert', {
          materialId,
          materialName: material.name,
          quantityAvailable: inventory.quantityAvailable,
          lowStockThreshold: inventory.lowStockThreshold,
          unit: material.unit
        });
      }

      await auditLogService.logAction({
        userId,
        action: `MATERIAL_STOCK_${type.toUpperCase()}`,
        entity: 'MaterialInventory',
        entityId: inventory._id,
        details: { quantity, adjustment: stockAdjustment }
      });

      return transaction;
    });
  }

  // --- Material Requests ---
  async createRequest(projectId, requestData, requesterId) {
    const { materialId, quantityRequested } = requestData;

    // Verify material
    const material = await materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundError('Material not found in catalog');
    }

    // AI Check: Duplicate check in the last 24 hours
    const duplicates = await materialRequestRepository.findDuplicates(projectId, materialId, quantityRequested, 24);
    const aiDuplicateFlag = duplicates.length > 0;

    if (aiDuplicateFlag) {
      logger.warn(`[AI Guard] Potential duplicate material request detected for project ${projectId}, material: ${material.name}, quantity: ${quantityRequested}`);
    }

    const request = await materialRequestRepository.create({
      projectId,
      materialId,
      requestedBy: requesterId,
      quantityRequested,
      aiDuplicateFlag,
      status: STATUS.MATERIAL_REQUEST.PENDING
    });

    await auditLogService.logAction({
      userId: requesterId,
      action: 'MATERIAL_REQUEST_CREATE',
      entity: 'MaterialRequest',
      entityId: request._id,
      details: { quantityRequested, aiDuplicateFlag }
    });

    return request;
  }

  async approveRequest(requestId, { status }, reviewerId) {
    // status must be approved or rejected
    const request = await materialRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Material request not found');
    }

    if (request.status !== STATUS.MATERIAL_REQUEST.PENDING) {
      throw new BadRequestError(`Cannot approve/reject request that is already ${request.status}`);
    }

    request.status = status;
    request.approvedBy = reviewerId;
    await request.save();

    await auditLogService.logAction({
      userId: reviewerId,
      action: `MATERIAL_REQUEST_${status.toUpperCase()}`,
      entity: 'MaterialRequest',
      entityId: request._id
    });

    return request;
  }

  async fulfillRequest(requestId, userId) {
    const request = await materialRequestRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Material request not found');
    }

    if (request.status !== STATUS.MATERIAL_REQUEST.APPROVED) {
      throw new BadRequestError(`Only approved requests can be fulfilled. Current status: ${request.status}`);
    }

    // Verify inventory levels first before starting transaction
    const inventory = await materialInventoryRepository.findByProjectAndMaterial(request.projectId, request.materialId._id);
    const available = inventory ? inventory.quantityAvailable : 0;
    if (available < request.quantityRequested) {
      throw new BadRequestError(`Insufficient stock in project inventory to fulfill request. Available: ${available}, Requested: ${request.quantityRequested}`);
    }

    return await this.runTransaction(async (session) => {
      // 1. Change status to fulfilled
      request.status = STATUS.MATERIAL_REQUEST.FULFILLED;
      await request.save({ session });

      // 2. Append MaterialTransaction of type 'issued'
      const transaction = await materialTransactionRepository.create({
        projectId: request.projectId,
        materialId: request.materialId._id,
        type: STATUS.MATERIAL_TRANSACTION.ISSUED,
        quantity: request.quantityRequested,
        referenceId: request._id
      }, session);

      // 3. Decrement quantityAvailable in inventory atomically
      const updatedInventory = await materialInventoryRepository.updateStock(
        request.projectId,
        request.materialId._id,
        -request.quantityRequested,
        session
      );

      // Check low stock levels
      if (updatedInventory.quantityAvailable < updatedInventory.lowStockThreshold) {
        const message = `Alert: Material '${request.materialId.name}' has fallen below the threshold on project. Available: ${updatedInventory.quantityAvailable} ${request.materialId.unit}`;
        
        notificationRepository.create({
          userId,
          message,
          type: 'low_stock'
        }).catch(err => logger.error(`Failed to save notification: ${err.message}`));

        socketService.emitToProject(request.projectId, 'low_stock_alert', {
          materialId: request.materialId._id,
          materialName: request.materialId.name,
          quantityAvailable: updatedInventory.quantityAvailable,
          lowStockThreshold: updatedInventory.lowStockThreshold,
          unit: request.materialId.unit
        });
      }

      await auditLogService.logAction({
        userId,
        action: 'MATERIAL_REQUEST_FULFILL',
        entity: 'MaterialRequest',
        entityId: request._id,
        details: { quantity: request.quantityRequested }
      });

      return request;
    });
  }

  async listRequests(projectId, params) {
    return await materialRequestRepository.findByProject(projectId, params);
  }

  async listTransactions(projectId, params) {
    return await materialTransactionRepository.findByProject(projectId, params);
  }
}

module.exports = new MaterialService();
