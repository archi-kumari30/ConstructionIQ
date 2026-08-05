const projectRepository = require('../repositories/projectRepository');
const projectTeamRepository = require('../repositories/projectTeamRepository');
const projectMilestoneRepository = require('../repositories/projectMilestoneRepository');
const auditLogService = require('./auditLogService');
const userRepository = require('../repositories/userRepository');
const { ConflictError, BadRequestError, NotFoundError } = require('../utils/customErrors');
const logger = require('../config/logger');

class ProjectService {
  // --- Projects ---
  async createProject(projectData, creatorId) {
    // Verify that manager exists and has appropriate role
    const manager = await userRepository.findById(projectData.managerId);
    if (!manager) {
      throw new NotFoundError('Project Manager user not found');
    }

    const project = await projectRepository.create(projectData);

    // Automatically add the manager to the project team
    await projectTeamRepository.addMember({
      projectId: project._id,
      userId: projectData.managerId,
      roleOnProject: 'Project Manager (Owner)'
    });

    // Write audit log
    await auditLogService.logAction({
      userId: creatorId,
      action: 'PROJECT_CREATE',
      entity: 'Project',
      entityId: project._id,
      details: { name: project.name, managerId: project.managerId }
    });

    return project;
  }

  async updateProject(id, updateData, updaterId) {
    if (updateData.managerId) {
      const manager = await userRepository.findById(updateData.managerId);
      if (!manager) {
        throw new NotFoundError('Project Manager user not found');
      }
    }

    const project = await projectRepository.update(id, updateData);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Write audit log
    await auditLogService.logAction({
      userId: updaterId,
      action: 'PROJECT_UPDATE',
      entity: 'Project',
      entityId: project._id,
      details: updateData
    });

    return project;
  }

  async deleteProject(id, deleterId) {
    const project = await projectRepository.softDelete(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Write audit log
    await auditLogService.logAction({
      userId: deleterId,
      action: 'PROJECT_DELETE',
      entity: 'Project',
      entityId: project._id
    });

    return project;
  }

  async getProjectById(id) {
    const project = await projectRepository.findById(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }
    return project;
  }

  async listProjects({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 }, search = '', userId = null, userRole = null } = {}) {
    // If not Admin, restrict based on role and assignments
    const finalFilter = { ...filter };
    
    if (userRole && userRole !== 'admin') {
      // Find project IDs user is assigned to
      const assignments = await projectTeamRepository.findByUser(userId);
      const projectIds = assignments.map(a => a.projectId._id);
      
      // Managers also see projects they own directly
      if (userRole === 'project_manager') {
        finalFilter.$or = [
          { _id: { $in: projectIds } },
          { managerId: userId }
        ];
      } else {
        finalFilter._id = { $in: projectIds };
      }
    }

    return await projectRepository.findAll({ filter: finalFilter, page, limit, sort, search });
  }

  // --- Workspace Teams ---
  async addTeamMember(projectId, memberData, assignerId) {
    const { userId, roleOnProject } = memberData;

    // Verify user exists
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User to assign not found');
    }

    // Check if user is already on team
    const isMember = await projectTeamRepository.isUserOnProjectTeam(projectId, userId);
    if (isMember) {
      throw new ConflictError('User is already assigned to this project team');
    }

    const member = await projectTeamRepository.addMember({
      projectId,
      userId,
      roleOnProject
    });

    // Write audit log
    await auditLogService.logAction({
      userId: assignerId,
      action: 'PROJECT_MEMBER_ADD',
      entity: 'Project',
      entityId: projectId,
      details: { memberUserId: userId, roleOnProject }
    });

    // Return populated member
    return await projectTeamRepository.findMember(projectId, userId);
  }

  async removeTeamMember(projectId, memberUserId, assignerId) {
    const member = await projectTeamRepository.removeMember(projectId, memberUserId);
    if (!member) {
      throw new NotFoundError('Team member assignment not found');
    }

    // Write audit log
    await auditLogService.logAction({
      userId: assignerId,
      action: 'PROJECT_MEMBER_REMOVE',
      entity: 'Project',
      entityId: projectId,
      details: { memberUserId }
    });

    return member;
  }

  async getTeamMembers(projectId) {
    return await projectTeamRepository.findByProject(projectId);
  }

  // --- Milestones ---
  async addMilestone(projectId, milestoneData, creatorId) {
    const milestone = await projectMilestoneRepository.create({
      ...milestoneData,
      projectId
    });

    // Write audit log
    await auditLogService.logAction({
      userId: creatorId,
      action: 'PROJECT_MILESTONE_CREATE',
      entity: 'ProjectMilestone',
      entityId: milestone._id,
      details: { projectId, title: milestone.title }
    });

    return milestone;
  }

  async updateMilestone(id, updateData, updaterId) {
    const milestone = await projectMilestoneRepository.update(id, updateData);
    if (!milestone) {
      throw new NotFoundError('Milestone not found');
    }

    // Write audit log
    await auditLogService.logAction({
      userId: updaterId,
      action: 'PROJECT_MILESTONE_UPDATE',
      entity: 'ProjectMilestone',
      entityId: milestone._id,
      details: updateData
    });

    return milestone;
  }

  async deleteMilestone(id, deleterId) {
    const milestone = await projectMilestoneRepository.softDelete(id);
    if (!milestone) {
      throw new NotFoundError('Milestone not found');
    }

    // Write audit log
    await auditLogService.logAction({
      userId: deleterId,
      action: 'PROJECT_MILESTONE_DELETE',
      entity: 'ProjectMilestone',
      entityId: milestone._id
    });

    return milestone;
  }

  async listMilestones(projectId, { filter = {}, page = 1, limit = 10 } = {}) {
    return await projectMilestoneRepository.findByProject(projectId, { filter, page, limit });
  }
}

module.exports = new ProjectService();
