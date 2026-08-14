import User from '../models/User.js';

class UserRepository {
  async findById(id, selectFields = null) {
    let query = User.findOne({ _id: id, isDeleted: false });
    if (selectFields) {
      query = query.select(selectFields);
    }
    return await query.lean().exec();
  }

  async findByEmail(email, selectFields = null) {
    let query = User.findOne({ email, isDeleted: false });
    if (selectFields) {
      query = query.select(selectFields);
    }
    return await query.exec(); // Don't use lean if we need to call comparePassword instance method
  }

  async findByEmailLean(email, selectFields = null) {
    let query = User.findOne({ email, isDeleted: false });
    if (selectFields) {
      query = query.select(selectFields);
    }
    return await query.lean().exec();
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async update(id, updateData) {
    return await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async softDelete(id) {
    return await User.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    ).exec();
  }

  async findAll({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, search = '' } = {}) {
    const queryFilter = { ...filter, isDeleted: false };
    
    if (search) {
      queryFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      User.find(queryFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      User.countDocuments(queryFilter)
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

export default new UserRepository();
