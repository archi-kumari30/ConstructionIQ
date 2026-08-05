const Budget = require('../models/Budget');

class BudgetRepository {
  async findByCategory(projectId, category) {
    return await Budget.findOne({ projectId, category }).lean().exec();
  }

  async findByCategoryRaw(projectId, category, session = null) {
    return await Budget.findOne({ projectId, category }).session(session).exec();
  }

  async upsertBudget(projectId, category, allocatedAmount) {
    return await Budget.findOneAndUpdate(
      { projectId, category },
      { $set: { allocatedAmount } },
      { new: true, upsert: true }
    ).exec();
  }

  async updateSpentAmount(projectId, category, incrementAmount, session = null) {
    return await Budget.findOneAndUpdate(
      { projectId, category },
      { $inc: { spentAmount: incrementAmount } },
      { new: true, session }
    ).exec();
  }

  async findByProject(projectId) {
    return await Budget.find({ projectId }).lean().exec();
  }
}

module.exports = new BudgetRepository();
