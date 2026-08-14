import Project from '../models/Project.js';

class ProjectRepository {
  async findById(id) {
    return await Project.findOne({ _id: id, isDeleted: false })
      .populate('managerId', 'name email role phone')
      .lean()
      .exec();
  }

  async findByIdRaw(id) {
    return await Project.findOne({ _id: id, isDeleted: false }).exec();
  }

  async create(projectData) {
    const project = new Project(projectData);
    return await project.save();
  }

  async update(id, updateData) {
    return await Project.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async softDelete(id) {
    return await Project.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    ).exec();
  }

  async findAll({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, search = '' } = {}) {
    const queryFilter = { ...filter, isDeleted: false };

    if (search) {
      const searchOrCondition = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];

      if (filter.$or) {
        queryFilter.$and = [
          { $or: filter.$or },
          { $or: searchOrCondition }
        ];
        delete queryFilter.$or;
      } else {
        queryFilter.$or = searchOrCondition;
      }
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Project.find(queryFilter)
        .populate('managerId', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Project.countDocuments(queryFilter)
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

export default new ProjectRepository();
