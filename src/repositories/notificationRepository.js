const Notification = require('../models/Notification');

class NotificationRepository {
  async create(notificationData) {
    const notification = new Notification(notificationData);
    return await notification.save();
  }

  async markAsRead(id) {
    return await Notification.findByIdAndUpdate(
      id,
      { $set: { read: true } },
      { new: true }
    ).exec();
  }

  async markAllAsRead(userId) {
    return await Notification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    ).exec();
  }

  async findAllByUser(userId, { page = 1, limit = 10, filter = {} } = {}) {
    const queryFilter = { ...filter, userId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Notification.find(queryFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Notification.countDocuments(queryFilter)
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

module.exports = new NotificationRepository();
