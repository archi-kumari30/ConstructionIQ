import reportService from '../services/reportService.js';
import ApiResponse from '../utils/apiResponse.js';
import DailySiteReportDto from '../dto/dailySiteReportDto.js';
import IncidentDto from '../dto/incidentDto.js';
import AiInsightDto from '../dto/aiInsightDto.js';
import HTTP_CODES from '../constants/httpCodes.js';
import asyncWrapper from '../utils/asyncWrapper.js';

// --- Daily Site Reports ---
const compileDailyReport = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const report = await reportService.compileDailyReport(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Daily site report compilation queued successfully',
    DailySiteReportDto.toResponse(report),
    HTTP_CODES.CREATED
  );
});

const getDailyReport = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const report = await reportService.getDailyReportById(id);
  return ApiResponse.success(res, 'Daily site report retrieved successfully', DailySiteReportDto.toResponse(report), HTTP_CODES.OK);
});

const listDailyReports = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await reportService.listDailyReports(projectId, { page, limit });
  return ApiResponse.success(res, 'Daily site reports retrieved successfully', {
    reports: DailySiteReportDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

// --- Incidents ---
const logIncident = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  // images were uploaded and URLs placed in req.uploadedImages by the uploadAndCompressImages middleware
  const uploadedImages = req.uploadedImages || [];
  const incident = await reportService.logIncident(projectId, req.body, req.user._id, uploadedImages);
  return ApiResponse.success(
    res,
    'Incident reported and logged successfully',
    IncidentDto.toResponse(incident),
    HTTP_CODES.CREATED
  );
});

const updateIncident = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const uploadedImages = req.uploadedImages || [];
  const incident = await reportService.updateIncident(id, req.body, req.user._id, uploadedImages);
  return ApiResponse.success(
    res,
    'Incident details updated successfully',
    IncidentDto.toResponse(incident),
    HTTP_CODES.OK
  );
});

const getIncident = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const incident = await reportService.getIncidentById(id);
  return ApiResponse.success(res, 'Incident logs retrieved successfully', IncidentDto.toResponse(incident), HTTP_CODES.OK);
});

const listIncidents = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await reportService.listIncidents(projectId, { page, limit });
  return ApiResponse.success(res, 'Incident reports list retrieved successfully', {
    incidents: IncidentDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

// --- AI Insights ---
const listInsights = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await reportService.listInsights(projectId, { page, limit });
  return ApiResponse.success(res, 'Project AI summary insights retrieved successfully', {
    insights: AiInsightDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

export {
  compileDailyReport,
  getDailyReport,
  listDailyReports,
  logIncident,
  updateIncident,
  getIncident,
  listIncidents,
  listInsights
};
export default { compileDailyReport, getDailyReport, listDailyReports, logIncident, updateIncident, getIncident, listIncidents, listInsights };
