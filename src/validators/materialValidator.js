import Joi from 'joi';
import STATUS from '../constants/status.js';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createMaterialSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'any.required': 'Material name is required'
  }),
  category: Joi.string().required().messages({
    'any.required': 'Category is required'
  }),
  unit: Joi.string().required().messages({
    'any.required': 'Measurement unit is required'
  }),
  unitCost: Joi.number().min(0).required().messages({
    'any.required': 'Unit cost is required',
    'number.min': 'Unit cost cannot be negative'
  })
});

const updateMaterialSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  category: Joi.string().optional(),
  unit: Joi.string().optional(),
  unitCost: Joi.number().min(0).optional()
});

const createRequestSchema = Joi.object({
  materialId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Material ID is required',
    'string.pattern.base': 'Material ID must be a valid 24-character ObjectId'
  }),
  quantityRequested: Joi.number().greater(0).required().messages({
    'any.required': 'Quantity requested is required',
    'number.greater': 'Quantity must be greater than zero'
  })
});

const approveRequestSchema = Joi.object({
  status: Joi.string().valid('approved', 'rejected').required().messages({
    'any.required': 'Approval status is required',
    'any.only': 'Status must be either approved or rejected'
  })
});

const logTransactionSchema = Joi.object({
  materialId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Material ID is required',
    'string.pattern.base': 'Material ID must be a valid 24-character ObjectId'
  }),
  type: Joi.string().valid(...Object.values(STATUS.MATERIAL_TRANSACTION)).required().messages({
    'any.required': 'Transaction type is required',
    'any.only': `Transaction type must be one of: ${Object.values(STATUS.MATERIAL_TRANSACTION).join(', ')}`
  }),
  quantity: Joi.number().greater(0).required().messages({
    'any.required': 'Quantity is required',
    'number.greater': 'Quantity must be greater than zero'
  }),
  referenceId: Joi.string().pattern(objectIdPattern).optional()
});

const updateThresholdSchema = Joi.object({
  lowStockThreshold: Joi.number().min(0).required().messages({
    'any.required': 'Low stock threshold is required',
    'number.min': 'Threshold cannot be negative'
  }),
  warehouseLocation: Joi.string().allow('').optional()
});

export {
  createMaterialSchema,
  updateMaterialSchema,
  createRequestSchema,
  approveRequestSchema,
  logTransactionSchema,
  updateThresholdSchema
};
export default { createMaterialSchema, updateMaterialSchema, createRequestSchema, approveRequestSchema, logTransactionSchema, updateThresholdSchema };
