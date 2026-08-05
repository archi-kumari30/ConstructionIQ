const mongoose = require('mongoose');
const STATUS = require('../constants/status');

const IncidentSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporting User ID is required']
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: [true, 'Incident description is required'],
      trim: true
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: Object.values(STATUS.INCIDENT),
      default: STATUS.INCIDENT.REPORTED
    },
    images: {
      type: [String],
      default: []
    },
    resolutionDetails: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

IncidentSchema.index({ projectId: 1, severity: 1 });
IncidentSchema.index({ status: 1 });

module.exports = mongoose.model('Incident', IncidentSchema);
