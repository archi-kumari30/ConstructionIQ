/**
 * Project Data Transfer Object
 */
class ProjectDto {
  static toResponse(project) {
    if (!project) return null;
    return {
      id: project._id || project.id,
      name: project.name,
      description: project.description || null,
      location: project.location,
      coordinates: project.coordinates ? {
        latitude: project.coordinates.latitude,
        longitude: project.coordinates.longitude
      } : null,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      budgetEstimated: project.budgetEstimated,
      manager: project.managerId ? {
        id: project.managerId._id || project.managerId.id || project.managerId,
        name: project.managerId.name || null,
        email: project.managerId.email || null,
        phone: project.managerId.phone || null
      } : null,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt
    };
  }

  static toResponseList(projects) {
    if (!Array.isArray(projects)) return [];
    return projects.map(p => this.toResponse(p));
  }
}

export default ProjectDto;
