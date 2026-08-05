const mongoose = require('mongoose');

const ProjectTeamSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required']
    },
    roleOnProject: {
      type: String,
      required: [true, 'Role on project is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure a user can only be added to a project team once
ProjectTeamSchema.index({ projectId: 1, userId: 1 }, { unique: true });
ProjectTeamSchema.index({ userId: 1 });

module.exports = mongoose.model('ProjectTeam', ProjectTeamSchema);
