/**
 * Incident Data Transfer Object
 */
class IncidentDto {
  static toResponse(incident) {
    if (!incident) return null;
    return {
      id: incident._id || incident.id,
      projectId: incident.projectId,
      reportedBy: incident.reportedBy ? {
        id: incident.reportedBy._id || incident.reportedBy.id || incident.reportedBy,
        name: incident.reportedBy.name || null,
        email: incident.reportedBy.email || null
      } : null,
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      images: incident.images || [],
      resolutionDetails: incident.resolutionDetails || null,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt
    };
  }

  static toResponseList(incidents) {
    if (!Array.isArray(incidents)) return [];
    return incidents.map(i => this.toResponse(i));
  }
}

export default IncidentDto;
