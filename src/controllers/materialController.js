const materialService = require('../services/materialService');
const ApiResponse = require('../utils/apiResponse');
const MaterialDto = require('../dto/materialDto');
const MaterialInventoryDto = require('../dto/materialInventoryDto');
const MaterialRequestDto = require('../dto/materialRequestDto');
const MaterialTransactionDto = require('../dto/materialTransactionDto');
const HTTP_CODES = require('../constants/httpCodes');
const asyncWrapper = require('../utils/asyncWrapper');

// --- Global Catalog ---
const createMaterial = asyncWrapper(async (req, res) => {
  const material = await materialService.createMaterial(req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Material added to catalog successfully',
    MaterialDto.toResponse(material),
    HTTP_CODES.CREATED
  );
});

const updateMaterial = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const material = await materialService.updateMaterial(id, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Material updated successfully',
    MaterialDto.toResponse(material),
    HTTP_CODES.OK
  );
});

const deleteMaterial = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  await materialService.deleteMaterial(id, req.user._id);
  return ApiResponse.success(res, 'Material deleted from catalog successfully', null, HTTP_CODES.OK);
});

const listMaterials = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const search = req.query.search || '';

  const result = await materialService.listMaterials({ page, limit, search });
  return ApiResponse.success(res, 'Materials catalog retrieved successfully', {
    materials: MaterialDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

// --- Project Stock levels ---
const getInventory = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await materialService.getProjectInventory(projectId, { page, limit });
  return ApiResponse.success(res, 'Project inventory retrieved successfully', {
    inventory: MaterialInventoryDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

const updateThreshold = asyncWrapper(async (req, res) => {
  const { projectId, materialId } = req.params;
  const inventory = await materialService.updateInventoryThreshold(
    projectId,
    materialId,
    req.body,
    req.user._id
  );
  return ApiResponse.success(
    res,
    'Inventory threshold configured successfully',
    MaterialInventoryDto.toResponse(inventory),
    HTTP_CODES.OK
  );
});

// --- Transactions Ledger ---
const logTransaction = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const transaction = await materialService.logTransaction(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Material stock ledger updated successfully',
    MaterialTransactionDto.toResponse(transaction),
    HTTP_CODES.CREATED
  );
});

const listTransactions = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await materialService.listTransactions(projectId, { page, limit });
  return ApiResponse.success(res, 'Material transactions ledger retrieved successfully', {
    transactions: MaterialTransactionDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

// --- Material Requests ---
const createRequest = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const request = await materialService.createRequest(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Material request submitted successfully',
    MaterialRequestDto.toResponse(request),
    HTTP_CODES.CREATED
  );
});

const approveRequest = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const request = await materialService.approveRequest(id, req.body, req.user._id);
  return ApiResponse.success(
    res,
    `Material request ${request.status} successfully`,
    MaterialRequestDto.toResponse(request),
    HTTP_CODES.OK
  );
});

const fulfillRequest = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const request = await materialService.fulfillRequest(id, req.user._id);
  return ApiResponse.success(
    res,
    'Material request fulfilled and stock level adjusted',
    MaterialRequestDto.toResponse(request),
    HTTP_CODES.OK
  );
});

const listRequests = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const status = req.query.status ? { status: req.query.status } : {};

  const result = await materialService.listRequests(projectId, { filter: status, page, limit });
  return ApiResponse.success(res, 'Material requests retrieved successfully', {
    requests: MaterialRequestDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

module.exports = {
  createMaterial,
  updateMaterial,
  deleteMaterial,
  listMaterials,
  getInventory,
  updateThreshold,
  logTransaction,
  listTransactions,
  createRequest,
  approveRequest,
  fulfillRequest,
  listRequests
};
