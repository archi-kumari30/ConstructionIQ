const mongoose = require('mongoose');

const MaterialSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Material name is required'],
      unique: true,
      trim: true,
      maxlength: [100, 'Material name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
    },
    unit: {
      type: String,
      required: [true, 'Measurement unit is required'],
      trim: true
    },
    unitCost: {
      type: Number,
      required: [true, 'Unit cost is required'],
      min: [0, 'Unit cost cannot be negative']
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

// Indexes
MaterialSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Material', MaterialSchema);
