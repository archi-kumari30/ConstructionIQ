import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    category: {
      type: String,
      required: [true, 'Budget category is required'],
      enum: ['materials', 'labor', 'equipment', 'logistics', 'subcontractors', 'miscellaneous']
    },
    allocatedAmount: {
      type: Number,
      required: [true, 'Allocated budget amount is required'],
      min: [0, 'Allocated amount cannot be negative']
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Spent amount cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Unique composite index: ensures only one budget record exists per category per project
BudgetSchema.index({ projectId: 1, category: 1 }, { unique: true });

export default mongoose.model('Budget', BudgetSchema);
