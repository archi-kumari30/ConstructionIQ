import mongoose from 'mongoose';

const EquipmentUsageLogSchema = new mongoose.Schema(
  {
    equipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: [true, 'Equipment ID is required']
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required']
    },
    date: {
      type: Date,
      required: [true, 'Date is required']
    },
    hoursUsed: {
      type: Number,
      required: [true, 'Hours used is required'],
      min: [0, 'Hours used cannot be negative'],
      max: [24, 'Hours used cannot exceed 24 in a single day']
    },
    fuelUsedLiters: {
      type: Number,
      min: [0, 'Fuel used cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

EquipmentUsageLogSchema.index({ equipmentId: 1, date: -1 });
EquipmentUsageLogSchema.index({ projectId: 1, date: -1 });

export default mongoose.model('EquipmentUsageLog', EquipmentUsageLogSchema);
