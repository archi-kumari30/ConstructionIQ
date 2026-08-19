import mongoose from 'mongoose';

const MaterialInventorySchema = new mongoose.Schema(
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
    quantityAvailable: {
      type: Number,
      default: 0,
      min: [0, 'Quantity available cannot be negative']
    },
    warehouseLocation: {
      type: String,
      trim: true
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Threshold cannot be negative']
    }
  },
  {
    timestamps: true
  }
);

// Unique composite index: stock level per project + material
MaterialInventorySchema.index({ projectId: 1, materialId: 1 }, { unique: true });
MaterialInventorySchema.index({ materialId: 1 });

export default mongoose.model('MaterialInventory', MaterialInventorySchema);
