import Delivery from '../models/Delivery.js';

class DeliveryRepository {
  async findById(id) {
    return await Delivery.findById(id)
      .populate('materialId')
      .populate('projectId')
      .populate('supplierId', 'name email role')
      .lean()
      .exec();
  }

  async findByIdRaw(id) {
    return await Delivery.findById(id).exec();
  }

  async create(deliveryData) {
    const delivery = new Delivery(deliveryData);
    return await delivery.save();
  }

  async update(id, updateData) {
    return await Delivery.findByIdAndUpdate(id, { $set: updateData }, { new: true }).exec();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10 } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Delivery.find(queryFilter)
        .populate('materialId')
        .populate('supplierId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Delivery.countDocuments(queryFilter)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findBySupplier(supplierId, { filter = {}, page = 1, limit = 10 } = {}) {
    const queryFilter = { ...filter, supplierId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Delivery.find(queryFilter)
        .populate('materialId')
        .populate('projectId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Delivery.countDocuments(queryFilter)
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

export default new DeliveryRepository();
