/**
 * DailySiteReport Data Transfer Object
 */
class DailySiteReportDto {
  static toResponse(report) {
    if (!report) return null;
    return {
      id: report._id || report.id,
      projectId: report.projectId,
      date: report.date,
      compiledBy: report.compiledBy ? {
        id: report.compiledBy._id || report.compiledBy.id || report.compiledBy,
        name: report.compiledBy.name || null,
        email: report.compiledBy.email || null
      } : null,
      notes: report.notes || null,
      materialsUsed: Array.isArray(report.materialsUsed)
        ? report.materialsUsed.map(m => ({
            materialId: m.materialId._id || m.materialId,
            materialName: m.materialId.name || null,
            materialUnit: m.materialId.unit || null,
            quantityUsed: m.quantityUsed
          }))
        : [],
      equipmentHours: Array.isArray(report.equipmentHours)
        ? report.equipmentHours.map(e => ({
            equipmentId: e.equipmentId._id || e.equipmentId,
            equipmentName: e.equipmentId.name || null,
            equipmentType: e.equipmentId.type || null,
            hoursUsed: e.hoursUsed
          }))
        : [],
      laborHeadcount: report.laborHeadcount,
      incidentCount: report.incidentCount,
      pdfUrl: report.pdfUrl || null,
      createdAt: report.createdAt
    };
  }

  static toResponseList(reports) {
    if (!Array.isArray(reports)) return [];
    return reports.map(r => this.toResponse(r));
  }
}

export default DailySiteReportDto;
