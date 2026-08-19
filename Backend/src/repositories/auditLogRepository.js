import AuditLog from '../models/AuditLog.js';

class AuditLogRepository {
  async create(auditLogData) {
    const auditLog = new AuditLog(auditLogData);
    return await auditLog.save();
  }

  async findAll({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 } } = {}) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('userId', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      AuditLog.countDocuments(filter)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }
}

export default new AuditLogRepository();
