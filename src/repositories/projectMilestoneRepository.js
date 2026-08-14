import ProjectMilestone from '../models/ProjectMilestone.js';

class ProjectMilestoneRepository {
  async findById(id) {
    return await ProjectMilestone.findOne({ _id: id, isDeleted: false }).lean().exec();
  }

  async findByIdRaw(id) {
    return await ProjectMilestone.findOne({ _id: id, isDeleted: false }).exec();
  }

  async create(milestoneData) {
    const milestone = new ProjectMilestone(milestoneData);
    return await milestone.save();
  }

  async update(id, updateData) {
    return await ProjectMilestone.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async softDelete(id) {
    return await ProjectMilestone.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    ).exec();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10, sort = { targetDate: 1 } } = {}) {
    const queryFilter = { ...filter, projectId, isDeleted: false };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      ProjectMilestone.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      ProjectMilestone.countDocuments(queryFilter)
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

export default new ProjectMilestoneRepository();
