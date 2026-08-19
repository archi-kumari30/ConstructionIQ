import Material from '../models/Material.js';

class MaterialRepository {
  async findById(id) {
    return await Material.findOne({ _id: id, isDeleted: false }).lean().exec();
  }

  async findByIdRaw(id) {
    return await Material.findOne({ _id: id, isDeleted: false }).exec();
  }

  async findByName(name) {
    return await Material.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, isDeleted: false }).lean().exec();
  }

  async create(materialData) {
    const material = new Material(materialData);
    return await material.save();
  }

  async update(id, updateData) {
    return await Material.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async softDelete(id) {
    return await Material.findOneAndUpdate(
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
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Material.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Material.countDocuments(queryFilter)
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

export default new MaterialRepository();
