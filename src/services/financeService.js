const mongoose = require('mongoose');
const deliveryRepository = require('../repositories/deliveryRepository');
const budgetRepository = require('../repositories/budgetRepository');
const expenseRepository = require('../repositories/expenseRepository');
const materialRepository = require('../repositories/materialRepository');
const materialInventoryRepository = require('../repositories/materialInventoryRepository');
const materialTransactionRepository = require('../repositories/materialTransactionRepository');
const userRepository = require('../repositories/userRepository');
const auditLogService = require('./auditLogService');
const { BadRequestError, NotFoundError } = require('../utils/customErrors');
const logger = require('../config/logger');
const STATUS = require('../constants/status');
const ROLES = require('../constants/roles');

class FinanceService {
  // Helper to run transaction operations (with serial fallback for standalone developer MongoDB)
  async runTransaction(actions) {
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      const result = await actions(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      if (error.message.includes('replica set') || error.code === 20 || error.message.includes('transaction')) {
        logger.warn('Mongoose Transactions not supported on this MongoDB configuration. Running actions sequentially...');
        return await actions(null);
      }
      throw error;
    } finally {
      session.endSession();
    }
  }

  // --- Logistics (Deliveries) ---
  async createDelivery(projectId, deliveryData, supplierId) {
    const { materialId, quantityOrdered } = deliveryData;

    // Verify material exists
    const material = await materialRepository.findById(materialId);
    if (!material) {
      throw new NotFoundError('Material not found in catalog');
    }

    // Verify supplier
    const supplier = await userRepository.findById(supplierId);
    if (!supplier || supplier.role !== ROLES.SUPPLIER) {
      throw new BadRequestError('Specified supplier ID must belong to an active Supplier');
    }

    const delivery = await deliveryRepository.create({
      ...deliveryData,
      projectId,
      supplierId,
      status: STATUS.DELIVERY.ORDERED
    });

    await auditLogService.logAction({
      userId: supplierId,
      action: 'DELIVERY_CREATE',
      entity: 'Delivery',
      entityId: delivery._id,
      details: { projectId, materialId, quantityOrdered }
    });

    return delivery;
  }

  async updateDeliveryStatus(projectId, deliveryId, updateData, userId) {
    const { status, quantityReceived, carrierName, deliveryDate } = updateData;

    const delivery = await deliveryRepository.findByIdRaw(deliveryId);
    if (!delivery) {
      throw new NotFoundError('Delivery not found');
    }

    const oldStatus = delivery.status;
    if (oldStatus === STATUS.DELIVERY.DELIVERED) {
      throw new BadRequestError('Cannot update details of an already delivered shipment');
    }

    // Prepare update parameters
    const updates = { status };
    if (carrierName) updates.carrierName = carrierName;
    if (deliveryDate) updates.deliveryDate = deliveryDate;
    if (quantityReceived !== undefined) updates.quantityReceived = quantityReceived;

    return await this.runTransaction(async (session) => {
      // If transitioning to DELIVERED, automatically add received quantity to project stock inventory
      if (status === STATUS.DELIVERY.DELIVERED) {
        const receivedAmount = quantityReceived !== undefined ? quantityReceived : delivery.quantityOrdered;
        updates.quantityReceived = receivedAmount;

        // Increment project stock
        await materialInventoryRepository.updateStock(
          projectId,
          delivery.materialId,
          receivedAmount,
          session
        );

        // Record material double-entry transaction ledger log
        await materialTransactionRepository.create({
          projectId,
          materialId: delivery.materialId,
          type: STATUS.MATERIAL_TRANSACTION.RECEIVED,
          quantity: receivedAmount,
          referenceId: delivery._id
        }, session);
      }

      const updatedDelivery = await Delivery.findByIdAndUpdate(
        deliveryId,
        { $set: updates },
        { new: true, session }
      );

      await auditLogService.logAction({
        userId,
        action: `DELIVERY_${status.toUpperCase()}`,
        entity: 'Delivery',
        entityId: deliveryId,
        details: { oldStatus, newStatus: status, quantityReceived: updates.quantityReceived }
      });

      return updatedDelivery;
    });
  }

  async listDeliveries(projectId, params) {
    return await deliveryRepository.findByProject(projectId, params);
  }

  async listSupplierDeliveries(supplierId, params) {
    return await deliveryRepository.findBySupplier(supplierId, params);
  }

  // --- Budgeting ---
  async allocateBudget(projectId, budgetData, userId) {
    const { category, allocatedAmount } = budgetData;

    const budget = await budgetRepository.upsertBudget(projectId, category, allocatedAmount);

    await auditLogService.logAction({
      userId,
      action: 'BUDGET_ALLOCATION',
      entity: 'Budget',
      entityId: budget._id,
      details: { projectId, category, allocatedAmount }
    });

    return budget;
  }

  async getBudgetSummary(projectId) {
    return await budgetRepository.findByProject(projectId);
  }

  // --- Expenses & Anomaly Detection ---
  async logExpense(projectId, expenseData, loggerId) {
    const { category, amount, date } = expenseData;

    return await this.runTransaction(async (session) => {
      // 1. Verify budget allocation exists
      const budget = await budgetRepository.findByCategoryRaw(projectId, category, session);
      if (!budget) {
        throw new NotFoundError(`No budget allocated for category '${category}' on this project`);
      }

      // 2. Budget Capping validation check
      if (budget.spentAmount + amount > budget.allocatedAmount) {
        throw new BadRequestError(
          `Expense exceeds allocated budget for category '${category}'. Allocated: $${budget.allocatedAmount}, Currently Spent: $${budget.spentAmount}, Requested: $${amount}`
        );
      }

      // 3. AI Cost Anomaly Check
      const recentExpenses = await expenseRepository.findRecentExpenses(projectId, category, 10);
      let aiAnomalyFlag = false;
      let aiAnomalyDetails = '';

      if (recentExpenses.length >= 3) {
        // Calculate mean and standard deviation
        const amounts = recentExpenses.map(e => e.amount);
        const mean = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
        const sqDiffs = amounts.map(val => Math.pow(val - mean, 2));
        const variance = sqDiffs.reduce((sum, val) => sum + val, 0) / amounts.length;
        const stdDev = Math.sqrt(variance);

        // Flag if amount is > mean + 2 * stdDev OR > 150% of the mean
        if (amount > mean + 2 * stdDev || amount > mean * 1.5) {
          aiAnomalyFlag = true;
          aiAnomalyDetails = `Expense of $${amount} is statistically anomalous. Category average: $${mean.toFixed(2)}, standard deviation: $${stdDev.toFixed(2)}. Exceeds 150% threshold limit.`;
        }
      } else {
        // Fallback simple threshold check
        if (amount > 10000) {
          aiAnomalyFlag = true;
          aiAnomalyDetails = `Expense of $${amount} exceeds the default safety limit of $10,000 for uncalibrated budget categories.`;
        }
      }

      if (aiAnomalyFlag) {
        logger.warn(`[AI Finance Audit] Potential expense anomaly flagged on project ${projectId}, category: ${category}, amount: $${amount}. Details: ${aiAnomalyDetails}`);
      }

      // 4. Double-entry write updates: Increment budget spentAmount & write expense log
      const expense = await expenseRepository.create({
        ...expenseData,
        projectId,
        loggedBy: loggerId,
        aiAnomalyFlag,
        aiAnomalyDetails
      }, session);

      await budgetRepository.updateSpentAmount(projectId, category, amount, session);

      await auditLogService.logAction({
        userId: loggerId,
        action: 'EXPENSE_CREATE',
        entity: 'Expense',
        entityId: expense._id,
        details: { projectId, category, amount, aiAnomalyFlag }
      });

      return expense;
    });
  }

  async listExpenses(projectId, params) {
    return await expenseRepository.findByProject(projectId, params);
  }
}

// Sub-classing model import to bypass schema mapping lookup errors during transaction execution
const Delivery = require('../models/Delivery');

module.exports = new FinanceService();
