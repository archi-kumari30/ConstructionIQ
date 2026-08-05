const mongoose = require('mongoose');
const STATUS = require('../constants/status');

const DeliverySchema = new mongoose.Schema(
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
    quantityOrdered: {
      type: Number,
      required: [true, 'Quantity ordered is required'],
      min: [1, 'Quantity ordered must be at least 1']
    },
    quantityReceived: {
      type: Number,
      default: 0,
      min: [0, 'Quantity received cannot be negative']
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Supplier ID is required']
    },
    carrierName: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(STATUS.DELIVERY),
      default: STATUS.DELIVERY.ORDERED
    },
    deliveryDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

DeliverySchema.index({ projectId: 1, status: 1 });
DeliverySchema.index({ supplierId: 1 });

module.exports = mongoose.model('Delivery', DeliverySchema);
