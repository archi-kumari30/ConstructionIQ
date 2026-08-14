import mongoose from 'mongoose';

const AiInsightSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Insight date is required']
    },
    type: {
      type: String,
      required: [true, 'Insight type is required'],
      enum: ['safety_audit', 'financial_forecast', 'inventory_optimization']
    },
    summary: {
      type: String,
      required: [true, 'Insight summary is required'],
      trim: true
    },
    recommendations: {
      type: [String],
      default: []
    },
    confidenceScore: {
      type: Number,
      required: [true, 'Confidence score is required'],
      min: [0, 'Confidence score must be at least 0'],
      max: [1, 'Confidence score cannot exceed 1']
    }
  },
  {
    timestamps: true
  }
);

AiInsightSchema.index({ projectId: 1, type: 1 });
AiInsightSchema.index({ date: -1 });

export default mongoose.model('AiInsight', AiInsightSchema);
