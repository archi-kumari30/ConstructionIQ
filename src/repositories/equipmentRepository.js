import Equipment from '../models/Equipment.js';

class EquipmentRepository {
  async findById(id) {
    return await Equipment.findOne({ _id: id, isDeleted: false }).lean().exec();
  }

  async findByIdRaw(id) {
    return await Equipment.findOne({ _id: id, isDeleted: false }).exec();
  }

  async create(equipmentData) {
    const equipment = new Equipment(equipmentData);
    return await equipment.save();
  }

  async update(id, updateData) {
    return await Equipment.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async softDelete(id) {
    return await Equipment.findOneAndUpdate(
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
        { type: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Equipment.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Equipment.countDocuments(queryFilter)
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

export default new EquipmentRepository();
