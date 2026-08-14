import Incident from '../models/Incident.js';

class IncidentRepository {
  async findById(id) {
    return await Incident.findById(id)
      .populate('reportedBy', 'name email role')
      .lean()
      .exec();
  }

  async findByIdRaw(id) {
    return await Incident.findById(id).exec();
  }

  async create(incidentData) {
    const incident = new Incident(incidentData);
    return await incident.save();
  }

  async update(id, updateData) {
    return await Incident.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10 } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Incident.find(queryFilter)
        .populate('reportedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Incident.countDocuments(queryFilter)
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

export default new IncidentRepository();
