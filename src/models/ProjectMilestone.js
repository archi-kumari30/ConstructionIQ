const mongoose = require('mongoose');
const STATUS = require('../constants/status');

const ProjectMilestoneSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    targetDate: {
      type: Date,
      required: [true, 'Target date is required']
    },
    completedDate: {
      type: Date
    },
    status: {
      type: String,
      enum: Object.values(STATUS.MILESTONE),
      default: STATUS.MILESTONE.PENDING
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

ProjectMilestoneSchema.index({ projectId: 1, status: 1 });
ProjectMilestoneSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('ProjectMilestone', ProjectMilestoneSchema);
