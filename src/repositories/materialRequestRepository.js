const MaterialRequest = require('../models/MaterialRequest');

class MaterialRequestRepository {
  async findById(id, session = null) {
    let query = MaterialRequest.findById(id);
    if (session) {
      query = query.session(session);
    }
    return await query
      .populate('materialId')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .exec();
  }

  async create(requestData) {
    const request = new MaterialRequest(requestData);
    return await request.save();
  }

  async update(id, updateData, session = null) {
    let query = MaterialRequest.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    if (session) {
      query = query.session(session);
    }
    return await query.exec();
  }

  // Duplicate Check: search for matching requests in past X hours
  async findDuplicates(projectId, materialId, quantityRequested, timeframeHours = 24) {
    const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
    return await MaterialRequest.find({
      projectId,
      materialId,
      quantityRequested,
      createdAt: { $gte: cutoffTime },
      status: { $ne: 'rejected' } // Only match pending, approved, or fulfilled requests
    })
      .lean()
      .exec();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10, sort = { createdAt: -1 } } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      MaterialRequest.find(queryFilter)
        .populate('materialId')
        .populate('requestedBy', 'name email role')
        .populate('approvedBy', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      MaterialRequest.countDocuments(queryFilter)
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

module.exports = new MaterialRequestRepository();
