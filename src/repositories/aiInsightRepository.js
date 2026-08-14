import AiInsight from '../models/AiInsight.js';

class AiInsightRepository {
  async create(insightData) {
    const insight = new AiInsight(insightData);
    return await insight.save();
  }

  async findByProject(projectId, { filter = {}, page = 1, limit = 10 } = {}) {
    const queryFilter = { ...filter, projectId };
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      AiInsight.find(queryFilter)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      AiInsight.countDocuments(queryFilter)
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

export default new AiInsightRepository();
