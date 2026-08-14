import MaterialDto from './materialDto.js';

/**
 * Material Transaction Data Transfer Object
 */
class MaterialTransactionDto {
  static toResponse(transaction) {
    if (!transaction) return null;
    return {
      id: transaction._id || transaction.id,
      projectId: transaction.projectId,
      material: MaterialDto.toResponse(transaction.materialId),
      type: transaction.type,
      quantity: transaction.quantity,
      referenceId: transaction.referenceId || null,
      createdAt: transaction.createdAt
    };
  }

  static toResponseList(transactions) {
    if (!Array.isArray(transactions)) return [];
    return transactions.map(t => this.toResponse(t));
  }
}

export default MaterialTransactionDto;
