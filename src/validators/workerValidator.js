const Joi = require('joi');
const STATUS = require('../constants/status');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createWorkerSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'any.required': 'Worker name is required'
  }),
  contractorId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Contractor ID is required',
    'string.pattern.base': 'Contractor ID must be a valid 24-character ObjectId'
  }),
  role: Joi.string().required().messages({
    'any.required': 'Labor role is required'
  }),
  contact: Joi.string().allow('').optional()
});

const updateWorkerSchema = Joi.object({
  name: Joi.string().max(100).optional(),
  contractorId: Joi.string().pattern(objectIdPattern).optional(),
  role: Joi.string().optional(),
  contact: Joi.string().allow('').optional()
});

const logAttendanceSchema = Joi.object({
  workerId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Worker ID is required',
    'string.pattern.base': 'Worker ID must be a valid 24-character ObjectId'
  }),
  date: Joi.date().required().messages({
    'any.required': 'Attendance log date is required'
  }),
  status: Joi.string().valid(...Object.values(STATUS.ATTENDANCE)).required().messages({
    'any.required': 'Attendance status is required',
    'any.only': `Status must be one of: ${Object.values(STATUS.ATTENDANCE).join(', ')}`
  }),
  shift: Joi.string().allow('').optional(),
  overtimeHours: Joi.number().min(0).optional()
});

module.exports = {
  createWorkerSchema,
  updateWorkerSchema,
  logAttendanceSchema
};
