const MaterialDto = require('./materialDto');

/**
 * Material Request Data Transfer Object
 */
class MaterialRequestDto {
  static toResponse(request) {
    if (!request) return null;
    return {
      id: request._id || request.id,
      projectId: request.projectId,
      material: MaterialDto.toResponse(request.materialId),
      requestedBy: request.requestedBy ? {
        id: request.requestedBy._id || request.requestedBy.id || request.requestedBy,
        name: request.requestedBy.name || null,
        email: request.requestedBy.email || null
      } : null,
      quantityRequested: request.quantityRequested,
      status: request.status,
      approvedBy: request.approvedBy ? {
        id: request.approvedBy._id || request.approvedBy.id || request.approvedBy,
        name: request.approvedBy.name || null,
        email: request.approvedBy.email || null
      } : null,
      aiDuplicateFlag: request.aiDuplicateFlag,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt
    };
  }

  static toResponseList(requests) {
    if (!Array.isArray(requests)) return [];
    return requests.map(r => this.toResponse(r));
  }
}

module.exports = MaterialRequestDto;
