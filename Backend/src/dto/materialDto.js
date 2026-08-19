/**
 * Material Catalog Data Transfer Object
 */
class MaterialDto {
  static toResponse(material) {
    if (!material) return null;
    return {
      id: material._id || material.id,
      name: material.name,
      category: material.category,
      unit: material.unit,
      unitCost: material.unitCost,
      createdAt: material.createdAt,
      updatedAt: material.updatedAt
    };
  }

  static toResponseList(materials) {
    if (!Array.isArray(materials)) return [];
    return materials.map(m => this.toResponse(m));
  }
}

export default MaterialDto;
