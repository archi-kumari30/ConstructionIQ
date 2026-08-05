const EquipmentBooking = require('../models/EquipmentBooking');

class EquipmentBookingRepository {
  async findById(id) {
    return await EquipmentBooking.findById(id)
      .populate('equipmentId')
      .populate('projectId')
      .populate('bookedBy', 'name email role')
      .lean()
      .exec();
  }

  async findByIdRaw(id) {
    return await EquipmentBooking.findById(id).exec();
  }

  async create(bookingData) {
    const booking = new EquipmentBooking(bookingData);
    return await booking.save();
  }

  // Conflict Check: overlapping active bookings for the target equipment
  async findOverlappingBookings(equipmentId, startTime, endTime, excludeBookingId = null) {
    const query = {
      equipmentId,
      status: { $in: ['booked', 'in_progress'] },
      startTime: { $lt: new Date(endTime) },
      endTime: { $gt: new Date(startTime) }
    };

    if (excludeBookingId) {
      query._id = { $ne: excludeBookingId };
    }

    return await EquipmentBooking.find(query).populate('projectId', 'name').lean().exec();
  }

  async findByProject(projectId, { page = 1, limit = 10, filter = {} } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      EquipmentBooking.find(queryFilter)
        .populate('equipmentId')
        .populate('bookedBy', 'name email')
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      EquipmentBooking.countDocuments(queryFilter)
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findByEquipment(equipmentId, { page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      EquipmentBooking.find({ equipmentId })
        .populate('projectId', 'name')
        .populate('bookedBy', 'name email')
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      EquipmentBooking.countDocuments({ equipmentId })
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

module.exports = new EquipmentBookingRepository();
