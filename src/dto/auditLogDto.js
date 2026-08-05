/**
 * Audit Log Data Transfer Object
 */
class AuditLogDto {
  static toResponse(log) {
    if (!log) return null;
    return {
      id: log._id || log.id,
      user: log.userId ? {
        id: log.userId._id || log.userId.id || log.userId,
        name: log.userId.name || null,
        email: log.userId.email || null,
        role: log.userId.role || null
      } : null,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId || null,
      details: log.details || null,
      ipAddress: log.ipAddress || null,
      createdAt: log.createdAt
    };
  }

  static toResponseList(logs) {
    if (!Array.isArray(logs)) return [];
    return logs.map(log => this.toResponse(log));
  }
}

module.exports = AuditLogDto;
