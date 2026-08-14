import workerRepository from '../repositories/workerRepository.js';
import attendanceRepository from '../repositories/attendanceRepository.js';
import auditLogService from './auditLogService.js';
import userRepository from '../repositories/userRepository.js';
import { ConflictError, BadRequestError, ForbiddenError, NotFoundError } from '../utils/customErrors.js';
import logger from '../config/logger.js';
import ROLES from '../constants/roles.js';

class WorkerService {
  // Helper to check contractor permissions on a worker
  verifyContractorScope(user, contractorId) {
    if (user.role === ROLES.CONTRACTOR && user._id.toString() !== contractorId.toString()) {
      throw new ForbiddenError('Access Denied: Contractors can only manage their own labor workforce');
    }
  }

  // --- Workforce labor CRUD ---
  async createWorker(workerData, creator) {
    // Contractor role scope restriction check
    this.verifyContractorScope(creator, workerData.contractorId);

    // Verify contractor user exists and has role contractor
    const contractor = await userRepository.findById(workerData.contractorId);
    if (!contractor || contractor.role !== ROLES.CONTRACTOR) {
      throw new BadRequestError('Specified contractor ID must belong to an active Contractor');
    }

    const worker = await workerRepository.create(workerData);

    await auditLogService.logAction({
      userId: creator._id,
      action: 'WORKER_CREATE',
      entity: 'Worker',
      entityId: worker._id,
      details: { name: worker.name, role: worker.role }
    });

    return worker;
  }

  async updateWorker(id, updateData, updater) {
    const worker = await workerRepository.findByIdRaw(id);
    if (!worker) {
      throw new NotFoundError('Worker labor registry not found');
    }

    // Restrict contractor scopes
    this.verifyContractorScope(updater, worker.contractorId);
    if (updateData.contractorId) {
      this.verifyContractorScope(updater, updateData.contractorId);
    }

    const updatedWorker = await workerRepository.update(id, updateData);

    await auditLogService.logAction({
      userId: updater._id,
      action: 'WORKER_UPDATE',
      entity: 'Worker',
      entityId: id,
      details: updateData
    });

    return updatedWorker;
  }

  async deleteWorker(id, deleter) {
    const worker = await workerRepository.findByIdRaw(id);
    if (!worker) {
      throw new NotFoundError('Worker labor registry not found');
    }

    this.verifyContractorScope(deleter, worker.contractorId);

    await workerRepository.softDelete(id);

    await auditLogService.logAction({
      userId: deleter._id,
      action: 'WORKER_DELETE',
      entity: 'Worker',
      entityId: id
    });

    return worker;
  }

  async getWorkerById(id, user) {
    const worker = await workerRepository.findById(id);
    if (!worker) {
      throw new NotFoundError('Worker labor registry not found');
    }

    this.verifyContractorScope(user, worker.contractorId._id || worker.contractorId);
    return worker;
  }

  async listWorkers({ filter = {}, page = 1, limit = 10, sort = { name: 1 }, search = '', user = null } = {}) {
    const finalFilter = { ...filter };

    // If contractor, restrict search list to their supervised workforce
    if (user && user.role === ROLES.CONTRACTOR) {
      finalFilter.contractorId = user._id;
    }

    return await workerRepository.findAll({ filter: finalFilter, page, limit, sort, search });
  }

  // --- Attendance logging ---
  async logAttendance(projectId, attendanceData, loggerId) {
    const { workerId, date, status, shift, overtimeHours } = attendanceData;

    // Verify worker exists
    const worker = await workerRepository.findById(workerId);
    if (!worker) {
      throw new NotFoundError('Worker labor registry not found');
    }

    // Date normalization to UTC Midnight (00:00:00.000 UTC) to ensure unique compound index checks succeed
    const targetDate = new Date(date);
    const normalizedDate = new Date(Date.UTC(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      targetDate.getDate(),
      0, 0, 0, 0
    ));

    // Unique Constraint Check: check if attendance already logged for this worker + project + date
    const existing = await attendanceRepository.findByWorkerProjectDate(workerId, projectId, normalizedDate);
    if (existing) {
      throw new ConflictError(`Attendance already logged for worker '${worker.name}' on this project for this date`);
    }

    const attendance = await attendanceRepository.create({
      workerId,
      projectId,
      date: normalizedDate,
      status,
      shift,
      overtimeHours
    });

    await auditLogService.logAction({
      userId: loggerId,
      action: 'WORKER_ATTENDANCE_LOG',
      entity: 'Attendance',
      entityId: attendance._id,
      details: { projectId, workerId, status, date: normalizedDate }
    });

    return attendance;
  }

  async getAttendanceReport(projectId, { filter = {}, page = 1, limit = 10 } = {}) {
    return await attendanceRepository.findByProject(projectId, { filter, page, limit });
  }
}

export default new WorkerService();
