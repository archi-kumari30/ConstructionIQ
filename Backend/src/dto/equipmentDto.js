/**
 * Equipment Fleet Data Transfer Object
 */
class EquipmentDto {
  static toResponse(equipment) {
    if (!equipment) return null;
    return {
      id: equipment._id || equipment.id,
      name: equipment.name,
      type: equipment.type,
      status: equipment.status,
      purchaseDate: equipment.purchaseDate || null,
      createdAt: equipment.createdAt,
      updatedAt: equipment.updatedAt
    };
  }

  static toResponseList(fleet) {
    if (!Array.isArray(fleet)) return [];
    return fleet.map(e => this.toResponse(e));
  }
}

export default EquipmentDto;
