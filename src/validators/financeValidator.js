const Joi = require('joi');
const STATUS = require('../constants/status');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;
const budgetCategories = ['materials', 'labor', 'equipment', 'logistics', 'subcontractors', 'miscellaneous'];

const createDeliverySchema = Joi.object({
  materialId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Material ID is required',
    'string.pattern.base': 'Material ID must be a valid 24-character ObjectId'
  }),
  quantityOrdered: Joi.number().min(1).required().messages({
    'any.required': 'Quantity ordered is required',
    'number.min': 'Quantity ordered must be at least 1'
  }),
  supplierId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Supplier ID is required',
    'string.pattern.base': 'Supplier ID must be a valid 24-character ObjectId'
  }),
  carrierName: Joi.string().allow('').optional(),
  deliveryDate: Joi.date().optional()
});

const updateDeliveryStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(STATUS.DELIVERY)).required().messages({
    'any.required': 'Delivery status is required',
    'any.only': `Status must be one of: ${Object.values(STATUS.DELIVERY).join(', ')}`
  }),
  quantityReceived: Joi.number().min(0).optional(),
  carrierName: Joi.string().allow('').optional(),
  deliveryDate: Joi.date().optional()
});

const createBudgetSchema = Joi.object({
  category: Joi.string().valid(...budgetCategories).required().messages({
    'any.required': 'Budget category is required',
    'any.only': `Category must be one of: ${budgetCategories.join(', ')}`
  }),
  allocatedAmount: Joi.number().min(0).required().messages({
    'any.required': 'Allocated budget amount is required',
    'number.min': 'Allocated amount cannot be negative'
  })
});

const createExpenseSchema = Joi.object({
  category: Joi.string().valid(...budgetCategories).required().messages({
    'any.required': 'Expense category is required',
    'any.only': `Category must be one of: ${budgetCategories.join(', ')}`
  }),
  amount: Joi.number().min(0.01).required().messages({
    'any.required': 'Expense amount is required',
    'number.min': 'Expense amount must be greater than zero'
  }),
  date: Joi.date().required().messages({
    'any.required': 'Expense date is required'
  }),
  description: Joi.string().allow('').optional(),
  receiptUrl: Joi.string().allow('').optional()
});

module.exports = {
  createDeliverySchema,
  updateDeliveryStatusSchema,
  createBudgetSchema,
  createExpenseSchema
};
