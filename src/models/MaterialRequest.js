import mongoose from 'mongoose';
import STATUS from '../constants/status.js';

const MaterialRequestSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Material',
      required: [true, 'Material ID is required']
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester User ID is required']
    },
    quantityRequested: {
      type: Number,
      required: [true, 'Quantity requested is required'],
      min: [0.01, 'Quantity requested must be greater than zero']
    },
    status: {
      type: String,
      enum: Object.values(STATUS.MATERIAL_REQUEST),
      default: STATUS.MATERIAL_REQUEST.PENDING
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    aiDuplicateFlag: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

MaterialRequestSchema.index({ projectId: 1, status: 1 });
MaterialRequestSchema.index({ requestedBy: 1 });
MaterialRequestSchema.index({ createdAt: -1 });

export default mongoose.model('MaterialRequest', MaterialRequestSchema);
