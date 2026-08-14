import MaterialTransaction from '../models/MaterialTransaction.js';

class MaterialTransactionRepository {
  async create(transactionData, session = null) {
    const transaction = new MaterialTransaction(transactionData);
    if (session) {
      return await transaction.save({ session });
    }
    return await transaction.save();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10, sort = { createdAt: -1 } } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      MaterialTransaction.find(queryFilter)
        .populate('materialId')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      MaterialTransaction.countDocuments(queryFilter)
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

export default new MaterialTransactionRepository();
