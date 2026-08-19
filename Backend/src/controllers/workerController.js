import workerService from '../services/workerService.js';
import ApiResponse from '../utils/apiResponse.js';
import WorkerDto from '../dto/workerDto.js';
import AttendanceDto from '../dto/attendanceDto.js';
import HTTP_CODES from '../constants/httpCodes.js';
import asyncWrapper from '../utils/asyncWrapper.js';

// --- Workers CRUD ---
const createWorker = asyncWrapper(async (req, res) => {
  const worker = await workerService.createWorker(req.body, req.user);
  return ApiResponse.success(
    res,
    'Worker registry created successfully',
    WorkerDto.toResponse(worker),
    HTTP_CODES.CREATED
  );
});

const updateWorker = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const worker = await workerService.updateWorker(id, req.body, req.user);
  return ApiResponse.success(
    res,
    'Worker registry updated successfully',
    WorkerDto.toResponse(worker),
    HTTP_CODES.OK
  );
});

const deleteWorker = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  await workerService.deleteWorker(id, req.user);
  return ApiResponse.success(res, 'Worker removed from registry successfully', null, HTTP_CODES.OK);
});

const getWorker = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const worker = await workerService.getWorkerById(id, req.user);
  return ApiResponse.success(res, 'Worker retrieved successfully', WorkerDto.toResponse(worker), HTTP_CODES.OK);
});

const listWorkers = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const search = req.query.search || '';

  const result = await workerService.listWorkers({ page, limit, search, user: req.user });
  return ApiResponse.success(res, 'Workforce registry retrieved successfully', {
    workers: WorkerDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

// --- Nested Project Attendance logs ---
const logAttendance = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const attendance = await workerService.logAttendance(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Attendance logged successfully',
    AttendanceDto.toResponse(attendance),
    HTTP_CODES.CREATED
  );
});

const getAttendanceReport = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const date = req.query.date ? { date: new Date(req.query.date) } : {};

  const result = await workerService.getAttendanceReport(projectId, { filter: date, page, limit });
  return ApiResponse.success(res, 'Project attendance report retrieved successfully', {
    attendance: AttendanceDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

export {
  createWorker,
  updateWorker,
  deleteWorker,
  getWorker,
  listWorkers,
  logAttendance,
  getAttendanceReport
};
export default { createWorker, updateWorker, deleteWorker, getWorker, listWorkers, logAttendance, getAttendanceReport };
