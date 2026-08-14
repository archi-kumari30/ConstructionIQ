import projectService from '../services/projectService.js';
import ApiResponse from '../utils/apiResponse.js';
import ProjectDto from '../dto/projectDto.js';
import ProjectTeamDto from '../dto/projectTeamDto.js';
import ProjectMilestoneDto from '../dto/projectMilestoneDto.js';
import HTTP_CODES from '../constants/httpCodes.js';
import asyncWrapper from '../utils/asyncWrapper.js';

// --- Project Endpoints ---
const createProject = asyncWrapper(async (req, res) => {
  const project = await projectService.createProject(req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Project created successfully',
    ProjectDto.toResponse(project),
    HTTP_CODES.CREATED
  );
});

const updateProject = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const project = await projectService.updateProject(id, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Project updated successfully',
    ProjectDto.toResponse(project),
    HTTP_CODES.OK
  );
});

const deleteProject = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  await projectService.deleteProject(id, req.user._id);
  return ApiResponse.success(res, 'Project deleted successfully', null, HTTP_CODES.OK);
});

const getProject = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  // If the RLAC middleware ran successfully, req.projectContext contains the populated project
  const project = req.projectContext || await projectService.getProjectById(id);
  return ApiResponse.success(res, 'Project retrieved successfully', ProjectDto.toResponse(project), HTTP_CODES.OK);
});

const listProjects = asyncWrapper(async (req, res) => {
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);
  const search = req.query.search || '';
  
  const result = await projectService.listProjects({
    page,
    limit,
    search,
    userId: req.user._id,
    userRole: req.user.role
  });

  return ApiResponse.success(res, 'Projects retrieved successfully', {
    projects: ProjectDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

// --- Team Management Endpoints ---
const addTeamMember = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const member = await projectService.addTeamMember(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Team member added successfully',
    ProjectTeamDto.toResponse(member),
    HTTP_CODES.CREATED
  );
});

const removeTeamMember = asyncWrapper(async (req, res) => {
  const { projectId, userId } = req.params;
  await projectService.removeTeamMember(projectId, userId, req.user._id);
  return ApiResponse.success(res, 'Team member removed successfully', null, HTTP_CODES.OK);
});

const getTeamMembers = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const members = await projectService.getTeamMembers(projectId);
  return ApiResponse.success(
    res,
    'Team members retrieved successfully',
    ProjectTeamDto.toResponseList(members),
    HTTP_CODES.OK
  );
});

// --- Milestone Endpoints ---
const addMilestone = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const milestone = await projectService.addMilestone(projectId, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Milestone created successfully',
    ProjectMilestoneDto.toResponse(milestone),
    HTTP_CODES.CREATED
  );
});

const updateMilestone = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const milestone = await projectService.updateMilestone(id, req.body, req.user._id);
  return ApiResponse.success(
    res,
    'Milestone updated successfully',
    ProjectMilestoneDto.toResponse(milestone),
    HTTP_CODES.OK
  );
});

const deleteMilestone = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  await projectService.deleteMilestone(id, req.user._id);
  return ApiResponse.success(res, 'Milestone deleted successfully', null, HTTP_CODES.OK);
});

const listMilestones = asyncWrapper(async (req, res) => {
  const { projectId } = req.params;
  const page = parseInt(req.query.page || '1', 10);
  const limit = parseInt(req.query.limit || '10', 10);

  const result = await projectService.listMilestones(projectId, { page, limit });
  return ApiResponse.success(res, 'Milestones retrieved successfully', {
    milestones: ProjectMilestoneDto.toResponseList(result.data),
    pagination: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    }
  }, HTTP_CODES.OK);
});

export {
  createProject,
  updateProject,
  deleteProject,
  getProject,
  listProjects,
  addTeamMember,
  removeTeamMember,
  getTeamMembers,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  listMilestones
};
export default { createProject, updateProject, deleteProject, getProject, listProjects, addTeamMember, removeTeamMember, getTeamMembers, addMilestone, updateMilestone, deleteMilestone, listMilestones };
