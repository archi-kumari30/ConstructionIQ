const Joi = require('joi');
const STATUS = require('../constants/status');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createEquipmentSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'any.required': 'Equipment name is required'
  }),
  type: Joi.string().required().messages({
    'any.required': 'Equipment type is required'
  }),
  status: Joi.string().valid(...Object.values(STATUS.EQUIPMENT)).optional(),
  purchaseDate: Joi.date().optional()
});

const updateEquipmentSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  type: Joi.string().optional(),
  status: Joi.string().valid(...Object.values(STATUS.EQUIPMENT)).optional(),
  purchaseDate: Joi.date().optional()
});

const createBookingSchema = Joi.object({
  equipmentId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Equipment ID is required',
    'string.pattern.base': 'Equipment ID must be a valid 24-character ObjectId'
  }),
  startTime: Joi.date().required().messages({
    'any.required': 'Booking start time is required'
  }),
  endTime: Joi.date().min(Joi.ref('startTime')).required().messages({
    'any.required': 'Booking end time is required',
    'date.min': 'End time must be after or equal to the start time'
  })
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid(...Object.values(STATUS.EQUIPMENT_BOOKING)).required().messages({
    'any.required': 'Booking status is required',
    'any.only': `Status must be one of: ${Object.values(STATUS.EQUIPMENT_BOOKING).join(', ')}`
  })
});

const logUsageSchema = Joi.object({
  equipmentId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Equipment ID is required',
    'string.pattern.base': 'Equipment ID must be a valid 24-character ObjectId'
  }),
  date: Joi.date().required().messages({
    'any.required': 'Telemetry log date is required'
  }),
  hoursUsed: Joi.number().min(0).max(24).required().messages({
    'any.required': 'Engine hours used is required',
    'number.min': 'Engine hours cannot be negative',
    'number.max': 'Engine hours cannot exceed 24 in a single day'
  }),
  fuelUsedLiters: Joi.number().min(0).optional()
});

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema,
  createBookingSchema,
  updateBookingStatusSchema,
  logUsageSchema
};
