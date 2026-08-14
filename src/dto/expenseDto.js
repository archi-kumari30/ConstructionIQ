/**
 * Expense Data Transfer Object
 */
class ExpenseDto {
  static toResponse(expense) {
    if (!expense) return null;
    return {
      id: expense._id || expense.id,
      projectId: expense.projectId,
      category: expense.category,
      amount: expense.amount,
      date: expense.date,
      loggedBy: expense.loggedBy ? {
        id: expense.loggedBy._id || expense.loggedBy.id || expense.loggedBy,
        name: expense.loggedBy.name || null,
        email: expense.loggedBy.email || null
      } : null,
      description: expense.description || null,
      receiptUrl: expense.receiptUrl || null,
      aiAnomalyFlag: expense.aiAnomalyFlag,
      aiAnomalyDetails: expense.aiAnomalyDetails || null,
      createdAt: expense.createdAt
    };
  }

  static toResponseList(expenses) {
    if (!Array.isArray(expenses)) return [];
    return expenses.map(e => this.toResponse(e));
  }
}

export default ExpenseDto;
