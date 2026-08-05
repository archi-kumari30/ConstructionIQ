const mongoose = require('mongoose');
const STATUS = require('../constants/status');

const AttendanceSchema = new mongoose.Schema(
  {
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Worker',
      required: [true, 'Worker ID is required']
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Attendance date is required']
    },
    status: {
      type: String,
      enum: Object.values(STATUS.ATTENDANCE),
      default: STATUS.ATTENDANCE.PRESENT
    },
    shift: {
      type: String,
      trim: true
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: [0, 'Overtime hours cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Unique composite index: ensures attendance is only logged once per worker per project per date
AttendanceSchema.index({ workerId: 1, projectId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: -1 });

module.exports = mongoose.model('Attendance', AttendanceSchema);
