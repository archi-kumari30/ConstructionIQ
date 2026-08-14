/**
 * Worker Labor Data Transfer Object
 */
class WorkerDto {
  static toResponse(worker) {
    if (!worker) return null;
    return {
      id: worker._id || worker.id,
      name: worker.name,
      contractor: worker.contractorId ? {
        id: worker.contractorId._id || worker.contractorId.id || worker.contractorId,
        name: worker.contractorId.name || null,
        email: worker.contractorId.email || null
      } : null,
      role: worker.role,
      contact: worker.contact || null,
      createdAt: worker.createdAt,
      updatedAt: worker.updatedAt
    };
  }

  static toResponseList(workers) {
    if (!Array.isArray(workers)) return [];
    return workers.map(w => this.toResponse(w));
  }
}

export default WorkerDto;
