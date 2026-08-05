const auditLogRepository = require('../repositories/auditLogRepository');
const logger = require('../config/logger');

class AuditLogService {
  async logAction({ userId, action, entity, entityId = null, details = {}, ipAddress = null }) {
    try {
      const log = await auditLogRepository.create({
        userId,
        action,
        entity,
        entityId,
        details,
        ipAddress
      });
      logger.info(`[Audit Log] User: ${userId} performed ${action} on ${entity} (${entityId || 'N/A'})`);
      return log;
    } catch (error) {
      // Don't throw database errors on audit logs to avoid blocking the main business request
      logger.error(`[Audit Log Error] Failed to write log: ${error.message}`);
      return null;
    }
  }

  async getLogs({ filter = {}, page = 1, limit = 10 } = {}) {
    return await auditLogRepository.findAll({ filter, page, limit });
  }
}

module.exports = new AuditLogService();
