import MaterialDto from './materialDto.js';

/**
 * Material Inventory Stock Data Transfer Object
 */
class MaterialInventoryDto {
  static toResponse(inventory) {
    if (!inventory) return null;
    return {
      id: inventory._id || inventory.id,
      projectId: inventory.projectId,
      material: MaterialDto.toResponse(inventory.materialId),
      quantityAvailable: inventory.quantityAvailable,
      warehouseLocation: inventory.warehouseLocation || null,
      lowStockThreshold: inventory.lowStockThreshold,
      updatedAt: inventory.updatedAt
    };
  }

  static toResponseList(inventories) {
    if (!Array.isArray(inventories)) return [];
    return inventories.map(i => this.toResponse(i));
  }
}

export default MaterialInventoryDto;
