import DailySiteReport from '../models/DailySiteReport.js';

class DailySiteReportRepository {
  async findById(id) {
    return await DailySiteReport.findById(id)
      .populate('compiledBy', 'name email role')
      .populate('materialsUsed.materialId', 'name unit')
      .populate('equipmentHours.equipmentId', 'name type')
      .lean()
      .exec();
  }

  async findByProjectAndDate(projectId, date) {
    return await DailySiteReport.findOne({ projectId, date }).lean().exec();
  }

  async create(reportData) {
    const report = new DailySiteReport(reportData);
    return await report.save();
  }

  async updatePdfUrl(id, pdfUrl) {
    return await DailySiteReport.findByIdAndUpdate(id, { $set: { pdfUrl } }, { new: true }).exec();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10 } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      DailySiteReport.find(queryFilter)
        .populate('compiledBy', 'name email')
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      DailySiteReport.countDocuments(queryFilter)
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

export default new DailySiteReportRepository();
