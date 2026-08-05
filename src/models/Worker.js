const mongoose = require('mongoose');

const WorkerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Worker name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor ID is required']
    },
    role: {
      type: String,
      required: [true, 'Labor role is required'],
      trim: true
    },
    contact: {
      type: String,
      trim: true
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

WorkerSchema.index({ contractorId: 1 });
WorkerSchema.index({ role: 1 });
WorkerSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Worker', WorkerSchema);
