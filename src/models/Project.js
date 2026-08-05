const mongoose = require('mongoose');
const STATUS = require('../constants/status');

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters']
    },
    description: {
      type: String,
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true
    },
    coordinates: {
      latitude: {
        type: Number,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        min: -180,
        max: 180
      }
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required']
    },
    status: {
      type: String,
      enum: Object.values(STATUS.PROJECT),
      default: STATUS.PROJECT.PLANNING
    },
    budgetEstimated: {
      type: Number,
      required: [true, 'Estimated budget is required'],
      min: [0, 'Budget cannot be negative']
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Manager ID is required']
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

// Indexes
ProjectSchema.index({ managerId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Project', ProjectSchema);
