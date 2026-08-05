const Expense = require('../models/Expense');

class ExpenseRepository {
  async create(expenseData, session = null) {
    const expense = new Expense(expenseData);
    if (session) {
      return await expense.save({ session });
    }
    return await expense.save();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10 } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Expense.find(queryFilter)
        .populate('loggedBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Expense.countDocuments(queryFilter)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findRecentExpenses(projectId, category, limit = 10) {
    return await Expense.find({ projectId, category })
      .sort({ date: -1 })
      .limit(limit)
      .lean()
      .exec();
  }
}

module.exports = new ExpenseRepository();
