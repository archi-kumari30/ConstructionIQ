import EquipmentUsageLog from '../models/EquipmentUsageLog.js';

class EquipmentUsageLogRepository {
  async create(usageData) {
    const log = new EquipmentUsageLog(usageData);
    return await log.save();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10, sort = { date: -1 } } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      EquipmentUsageLog.find(queryFilter)
        .populate('equipmentId')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      EquipmentUsageLog.countDocuments(queryFilter)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByEquipment(equipmentId, { filter = {}, page = 1, limit = 10, sort = { date: -1 } } = {}) {
    const queryFilter = { ...filter, equipmentId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      EquipmentUsageLog.find(queryFilter)
        .populate('projectId', 'name')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      EquipmentUsageLog.countDocuments(queryFilter)
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

export default new EquipmentUsageLogRepository();
