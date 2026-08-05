/**
 * Project Team Member Data Transfer Object
 */
class ProjectTeamDto {
  static toResponse(member) {
    if (!member) return null;
    return {
      projectId: member.projectId._id || member.projectId.id || member.projectId,
      user: member.userId ? {
        id: member.userId._id || member.userId.id || member.userId,
        name: member.userId.name || null,
        email: member.userId.email || null,
        role: member.userId.role || null,
        phone: member.userId.phone || null
      } : null,
      roleOnProject: member.roleOnProject,
      assignedAt: member.createdAt
    };
  }

  static toResponseList(members) {
    if (!Array.isArray(members)) return [];
    return members.map(m => this.toResponse(m));
  }
}

module.exports = ProjectTeamDto;
