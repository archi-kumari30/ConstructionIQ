import mongoose from 'mongoose';

const DailySiteReportSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Report date is required']
    },
    compiledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Compiling User ID is required']
    },
    notes: {
      type: String,
      trim: true
    },
    materialsUsed: [
      {
        materialId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Material',
          required: true
        },
        quantityUsed: {
          type: Number,
          required: true,
          min: [0, 'Quantity used cannot be negative']
        }
      }
    ],
    equipmentHours: [
      {
        equipmentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Equipment',
          required: true
        },
        hoursUsed: {
          type: Number,
          required: true,
          min: [0, 'Hours used cannot be negative'],
          max: [24, 'Hours used cannot exceed 24']
        }
      }
    ],
    laborHeadcount: {
      type: Number,
      default: 0,
      min: [0, 'Labor headcount cannot be negative']
    },
    incidentCount: {
      type: Number,
      default: 0,
      min: [0, 'Incident count cannot be negative']
    },
    pdfUrl: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Unique composite index: only one daily site report per project per day
DailySiteReportSchema.index({ projectId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailySiteReport', DailySiteReportSchema);
