import MaterialDto from './materialDto.js';

/**
 * Delivery Tracking Data Transfer Object
 */
class DeliveryDto {
  static toResponse(delivery) {
    if (!delivery) return null;
    return {
      id: delivery._id || delivery.id,
      projectId: delivery.projectId._id || delivery.projectId.id || delivery.projectId,
      projectName: delivery.projectId?.name || null,
      material: MaterialDto.toResponse(delivery.materialId),
      quantityOrdered: delivery.quantityOrdered,
      quantityReceived: delivery.quantityReceived,
      supplier: delivery.supplierId ? {
        id: delivery.supplierId._id || delivery.supplierId.id || delivery.supplierId,
        name: delivery.supplierId.name || null,
        email: delivery.supplierId.email || null
      } : null,
      carrierName: delivery.carrierName || null,
      status: delivery.status,
      deliveryDate: delivery.deliveryDate || null,
      createdAt: delivery.createdAt,
      updatedAt: delivery.updatedAt
    };
  }

  static toResponseList(deliveries) {
    if (!Array.isArray(deliveries)) return [];
    return deliveries.map(d => this.toResponse(d));
  }
}

export default DeliveryDto;
