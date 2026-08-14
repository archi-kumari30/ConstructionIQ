import mongoose from 'mongoose';
import STATUS from '../constants/status.js';

const MaterialTransactionSchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: Object.values(STATUS.MATERIAL_TRANSACTION),
      required: [true, 'Transaction type is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0.01, 'Quantity must be greater than zero']
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  {
    // Append-only logs do not require update hooks, only track creation
    timestamps: { createdAt: true, updatedAt: false }
  }
);

MaterialTransactionSchema.index({ projectId: 1, materialId: 1 });
MaterialTransactionSchema.index({ createdAt: -1 });

export default mongoose.model('MaterialTransaction', MaterialTransactionSchema);
