import EquipmentDto from './equipmentDto.js';

/**
 * Equipment Usage Telemetry Log Data Transfer Object
 */
class EquipmentUsageLogDto {
  static toResponse(log) {
    if (!log) return null;
    return {
      id: log._id || log.id,
      equipment: EquipmentDto.toResponse(log.equipmentId),
      projectId: log.projectId,
      date: log.date,
      hoursUsed: log.hoursUsed,
      fuelUsedLiters: log.fuelUsedLiters || null,
      createdAt: log.createdAt
    };
  }

  static toResponseList(logs) {
    if (!Array.isArray(logs)) return [];
    return logs.map(l => this.toResponse(l));
  }
}

export default EquipmentUsageLogDto;
