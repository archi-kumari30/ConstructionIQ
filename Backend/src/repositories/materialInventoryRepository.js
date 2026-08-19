import MaterialInventory from '../models/MaterialInventory.js';

class MaterialInventoryRepository {
  async findByProjectAndMaterial(projectId, materialId, session = null) {
    let query = MaterialInventory.findOne({ projectId, materialId });
    if (session) {
      query = query.session(session);
    }
    return await query.populate('materialId').lean().exec();
  }

  async findByProjectAndMaterialRaw(projectId, materialId, session = null) {
    let query = MaterialInventory.findOne({ projectId, materialId });
    if (session) {
      query = query.session(session);
    }
    return await query.exec();
  }

  // Atomically update inventory quantity
  async updateStock(projectId, materialId, quantityChange, session = null) {
    const updateQuery = MaterialInventory.findOneAndUpdate(
      { projectId, materialId },
      { $inc: { quantityAvailable: quantityChange } },
      { new: true, upsert: true } // Creates record if it doesn't exist
    );
    if (session) {
      updateQuery.session(session);
    }
    return await updateQuery.exec();
  }

  async setThreshold(projectId, materialId, lowStockThreshold, warehouseLocation = null) {
    const updateData = { lowStockThreshold };
    if (warehouseLocation !== null) {
      updateData.warehouseLocation = warehouseLocation;
    }
    return await MaterialInventory.findOneAndUpdate(
      { projectId, materialId },
      { $set: updateData },
      { new: true, upsert: true }
    ).exec();
  }

  async findByProject(projectId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      MaterialInventory.find({ projectId })
        .populate('materialId')
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      MaterialInventory.countDocuments({ projectId })
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export default new MaterialInventoryRepository();
