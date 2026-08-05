/**
 * AiInsight Data Transfer Object
 */
class AiInsightDto {
  static toResponse(insight) {
    if (!insight) return null;
    return {
      id: insight._id || insight.id,
      projectId: insight.projectId,
      date: insight.date,
      type: insight.type,
      summary: insight.summary,
      recommendations: insight.recommendations || [],
      confidenceScore: insight.confidenceScore,
      createdAt: insight.createdAt
    };
  }

  static toResponseList(insights) {
    if (!Array.isArray(insights)) return [];
    return insights.map(i => this.toResponse(i));
  }
}

module.exports = AiInsightDto;
