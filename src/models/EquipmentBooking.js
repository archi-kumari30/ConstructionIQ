import mongoose from 'mongoose';
import STATUS from '../constants/status.js';

const EquipmentBookingSchema = new mongoose.Schema(
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
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booked by User ID is required']
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required']
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required']
    },
    status: {
      type: String,
      enum: Object.values(STATUS.EQUIPMENT_BOOKING),
      default: STATUS.EQUIPMENT_BOOKING.BOOKED
    }
  },
  {
    timestamps: true
  }
);

EquipmentBookingSchema.index({ equipmentId: 1, status: 1 });
EquipmentBookingSchema.index({ projectId: 1 });
EquipmentBookingSchema.index({ startTime: 1, endTime: 1 });

export default mongoose.model('EquipmentBooking', EquipmentBookingSchema);
