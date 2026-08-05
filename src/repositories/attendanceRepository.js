const Attendance = require('../models/Attendance');

class AttendanceRepository {
  async create(attendanceData) {
    const attendance = new Attendance(attendanceData);
    return await attendance.save();
  }

  async findByWorkerProjectDate(workerId, projectId, date) {
    return await Attendance.findOne({
      workerId,
      projectId,
      date
    }).lean().exec();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10, sort = { date: -1 } } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Attendance.find(queryFilter)
        .populate('workerId')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      Attendance.countDocuments(queryFilter)
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

module.exports = new AttendanceRepository();
