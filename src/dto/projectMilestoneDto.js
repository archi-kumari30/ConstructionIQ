/**
 * Project Milestone Data Transfer Object
 */
class ProjectMilestoneDto {
  static toResponse(milestone) {
    if (!milestone) return null;
    return {
      id: milestone._id || milestone.id,
      projectId: milestone.projectId,
      title: milestone.title,
      targetDate: milestone.targetDate,
      completedDate: milestone.completedDate || null,
      status: milestone.status,
      createdAt: milestone.createdAt,
      updatedAt: milestone.updatedAt
    };
  }

  static toResponseList(milestones) {
    if (!Array.isArray(milestones)) return [];
    return milestones.map(m => this.toResponse(m));
  }
}

export default ProjectMilestoneDto;
