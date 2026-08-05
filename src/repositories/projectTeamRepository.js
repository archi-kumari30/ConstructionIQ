const ProjectTeam = require('../models/ProjectTeam');

class ProjectTeamRepository {
  async addMember(memberData) {
    const member = new ProjectTeam(memberData);
    return await member.save();
  }

  async removeMember(projectId, userId) {
    return await ProjectTeam.findOneAndDelete({ projectId, userId }).exec();
  }

  async findMember(projectId, userId) {
    return await ProjectTeam.findOne({ projectId, userId })
      .populate('userId', 'name email role phone')
      .lean()
      .exec();
  }

  async findByProject(projectId) {
    return await ProjectTeam.find({ projectId })
      .populate('userId', 'name email role phone')
      .lean()
      .exec();
  }

  async findByUser(userId) {
    return await ProjectTeam.find({ userId })
      .populate('projectId')
      .lean()
      .exec();
  }

  async isUserOnProjectTeam(projectId, userId) {
    const count = await ProjectTeam.countDocuments({ projectId, userId });
    return count > 0;
  }
}

module.exports = new ProjectTeamRepository();
