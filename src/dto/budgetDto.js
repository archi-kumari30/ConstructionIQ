/**
 * Budget Category Data Transfer Object
 */
class BudgetDto {
  static toResponse(budget) {
    if (!budget) return null;
    return {
      id: budget._id || budget.id,
      projectId: budget.projectId,
      category: budget.category,
      allocatedAmount: budget.allocatedAmount,
      spentAmount: budget.spentAmount,
      remainingAmount: Math.max(0, budget.allocatedAmount - budget.spentAmount),
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt
    };
  }

  static toResponseList(budgets) {
    if (!Array.isArray(budgets)) return [];
    return budgets.map(b => this.toResponse(b));
  }
}

export default BudgetDto;
