import mongoose from 'mongoose';
import STATUS from '../constants/status.js';

const EquipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    type: {
      type: String,
      required: [true, 'Equipment type is required'],
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(STATUS.EQUIPMENT),
      default: STATUS.EQUIPMENT.AVAILABLE
    },
    purchaseDate: {
      type: Date
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

EquipmentSchema.index({ type: 1 });
EquipmentSchema.index({ status: 1 });
EquipmentSchema.index({ isDeleted: 1 });

export default mongoose.model('Equipment', EquipmentSchema);
