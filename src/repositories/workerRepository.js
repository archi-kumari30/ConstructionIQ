const Worker = require('../models/Worker');

class WorkerRepository {
  async findById(id) {
    return await Worker.findOne({ _id: id, isDeleted: false })
      .populate('contractorId', 'name email role phone')
      .lean()
      .exec();
  }

  async findByIdRaw(id) {
    return await Worker.findOne({ _id: id, isDeleted: false }).exec();
  }

  async create(workerData) {
    const worker = new Worker(workerData);
    return await worker.save();
  }

  async update(id, updateData) {
    return await Worker.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async softDelete(id) {
    return await Worker.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    ).exec();
  }

  async findAll({ filter = {}, page = 1, limit = 10, sort = { name: 1 }, search = '' } = {}) {
    const queryFilter = { ...filter, isDeleted: false };

    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Worker.find(queryFilter)
        .populate('contractorId', 'name email role')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Worker.countDocuments(queryFilter)
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

module.exports = new WorkerRepository();
