const equipmentService = require('../services/equipmentService');
const ApiResponse = require('../utils/apiResponse');
const EquipmentDto = require('../dto/equipmentDto');
const EquipmentBookingDto = require('../dto/equipmentBookingDto');
const EquipmentUsageLogDto = require('../dto/equipmentUsageLogDto');
const HTTP_CODES = require('../constants/httpCodes');
const asyncWrapper = require('../utils/asyncWrapper');

// --- Global Fleet ---
const createEquipment = asyncWrapper(async (req, res) => {
  const equipment = await equipmentService.createEquipment(req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Equipment added to fleet successfully',
    EquipmentDto.toResponse(equipment),
    HTTP_CODES.CREATED
  );
});

const updateEquipment = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const equipment = await equipmentService.updateEquipment(id, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Equipment updated successfully',
    EquipmentDto.toResponse(equipment),
    HTTP_CODES.OK
  );
});

const deleteEquipment = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  await equipmentService.deleteEquipment(id, req.user._id);
  return ApiResponse.success(res, 'Equipment removed from fleet successfully', null, HTTP_CODES.OK);
});

const getEquipment = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const equipment = await equipmentService.getEquipmentById(id);
  return ApiResponse.success(res, 'Equipment retrieved successfully', EquipmentDto.toResponse(equipment), HTTP_CODES.OK);
});

const listEquipment = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const search = req.query.search || '';
  const type = req.query.type ? { type: req.query.type } : {};

  const result = await equipmentService.listEquipment({ filter: type, page, limit, search });
  return ApiResponse.success(res, 'Fleet registry retrieved successfully', {
    fleet: EquipmentDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

// --- Bookings ---
const createBooking = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const booking = await equipmentService.createBooking(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Equipment reserved successfully',
    EquipmentBookingDto.toResponse(booking),
    HTTP_CODES.CREATED
  );
});

const updateBookingStatus = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const booking = await equipmentService.updateBookingStatus(id, status, req.user._id);
  return ApiResponse.success(
    res,
    `Booking status updated to ${status}`,
    EquipmentBookingDto.toResponse(booking),
    HTTP_CODES.OK
  );
});

const listBookings = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await equipmentService.listBookings(projectId, { page, limit });
  return ApiResponse.success(res, 'Equipment bookings retrieved successfully', {
    bookings: EquipmentBookingDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

// --- Telemetry logs ---
const logUsage = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const log = await equipmentService.logUsage(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Usage telemetry logged successfully',
    EquipmentUsageLogDto.toResponse(log),
    HTTP_CODES.CREATED
  );
});

const listUsageLogs = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await equipmentService.listUsageLogs(projectId, { page, limit });
  return ApiResponse.success(res, 'Equipment usage logs retrieved successfully', {
    logs: EquipmentUsageLogDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

module.exports = {
  createEquipment,
  updateEquipment,
  deleteEquipment,
  getEquipment,
  listEquipment,
  createBooking,
  updateBookingStatus,
  listBookings,
  logUsage,
  listUsageLogs
};
