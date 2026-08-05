const WorkerDto = require('./workerDto');

/**
 * Attendance Log Data Transfer Object
 */
class AttendanceDto {
  static toResponse(attendance) {
    if (!attendance) return null;
    return {
      id: attendance._id || attendance.id,
      worker: WorkerDto.toResponse(attendance.workerId),
      projectId: attendance.projectId,
      date: attendance.date,
      status: attendance.status,
      shift: attendance.shift || null,
      overtimeHours: attendance.overtimeHours,
      createdAt: attendance.createdAt
    };
  }

  static toResponseList(attendanceList) {
    if (!Array.isArray(attendanceList)) return [];
    return attendanceList.map(a => this.toResponse(a));
  }
}

module.exports = AttendanceDto;
