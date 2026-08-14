import projectService from '../services/projectService.js';
import projectRepository from '../repositories/projectRepository.js';
import { ForbiddenError } from '../utils/customErrors.js';
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

  // Reusable service-level access check
  await projectService.validateProjectAccess(projectId, user);

  // Fetch project context to attach to request context
  const project = await projectRepository.findById(projectId);
  req.projectContext = project;

  next();
});

export {
  checkProjectAccess
};
export default { checkProjectAccess };
