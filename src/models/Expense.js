const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    category: {
      type: String,
      required: [true, 'Expense category is required'],
      enum: ['materials', 'labor', 'equipment', 'logistics', 'subcontractors', 'miscellaneous']
    },
    amount: {
      type: Number,
      required: [true, 'Expense amount is required'],
      min: [0.01, 'Expense amount must be greater than zero']
    },
    date: {
      type: Date,
      required: [true, 'Expense date is required']
    },
    loggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User logging expense is required']
    },
    description: {
      type: String,
      trim: true
    },
    receiptUrl: {
      type: String,
      trim: true
    },
    aiAnomalyFlag: {
      type: Boolean,
      default: false
    },
    aiAnomalyDetails: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

ExpenseSchema.index({ projectId: 1, category: 1, date: -1 });
ExpenseSchema.index({ aiAnomalyFlag: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
