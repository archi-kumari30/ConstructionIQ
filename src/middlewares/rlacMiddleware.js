import projectRepository from '../repositories/projectRepository.js';
import projectTeamRepository from '../repositories/projectTeamRepository.js';
import { ForbiddenError, NotFoundError } from '../utils/customErrors.js';
import ROLES from '../constants/roles.js';
import asyncWrapper from '../utils/asyncWrapper.js';

const checkProjectAccess = asyncWrapper(async (req, res, next) => {
  // Extract project ID from typical parameters
  const projectId = req.params.projectId || req.params.id || req.body.projectId || req.query.projectId;

  if (!projectId) {
    return next(); // If no project context is specified, skip check (handled by global validation)
  }

  // Confirm format matches ObjectId pattern
  if (!/^[0-9a-fA-F]{24}$/.test(projectId)) {
    return next(); // Invalid ObjectId format gets handled by validation layer or model casting
  }

  const user = req.user;
  if (!user) {
    throw new ForbiddenError('Not authenticated');
  }

  // 1. Admins have global access
  if (user.role === ROLES.ADMIN) {
    return next();
  }

  // 2. Fetch the project
  const project = await projectRepository.findById(projectId);
  if (!project) {
    throw new NotFoundError('Project not found');
  }

  // Attach project context to request so controllers don't need to query it again
  req.projectContext = project;

  // 3. Project Managers have access if they own the project
  if (user.role === ROLES.PROJECT_MANAGER && project.managerId.toString() === user._id.toString()) {
    return next();
  }

  // 4. Check if user is assigned to the Project Team (Engineers, Contractors, Suppliers, PMs)
  const isTeamMember = await projectTeamRepository.isUserOnProjectTeam(projectId, user._id);
  if (isTeamMember) {
    return next();
  }

  // Otherwise, deny access
  throw new ForbiddenError('Access Denied: You are not assigned to this project workspace team');
});

export {
  checkProjectAccess
};
export default { checkProjectAccess };
