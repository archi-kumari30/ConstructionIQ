const Joi = require('joi');
const STATUS = require('../constants/status');

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createProjectSchema = Joi.object({
  name: Joi.string().required().max(150).messages({
    'any.required': 'Project name is required'
  }),
  description: Joi.string().allow('').optional(),
  location: Joi.string().required().messages({
    'any.required': 'Location is required'
  }),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).optional(),
  startDate: Joi.date().required().messages({
    'any.required': 'Start date is required'
  }),
  endDate: Joi.date().min(Joi.ref('startDate')).required().messages({
    'any.required': 'End date is required',
    'date.min': 'End date must be after or equal to the start date'
  }),
  status: Joi.string().valid(...Object.values(STATUS.PROJECT)).optional(),
  budgetEstimated: Joi.number().min(0).required().messages({
    'any.required': 'Estimated budget is required',
    'number.min': 'Budget cannot be negative'
  }),
  managerId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'Manager ID is required',
    'string.pattern.base': 'Manager ID must be a valid 24-character ObjectId'
  })
});

const updateProjectSchema = Joi.object({
  name: Joi.string().max(150).optional(),
  description: Joi.string().allow('').optional(),
  location: Joi.string().optional(),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
  }).optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().min(Joi.ref('startDate')).optional(),
  status: Joi.string().valid(...Object.values(STATUS.PROJECT)).optional(),
  budgetEstimated: Joi.number().min(0).optional(),
  managerId: Joi.string().pattern(objectIdPattern).optional()
});

const addTeamMemberSchema = Joi.object({
  userId: Joi.string().pattern(objectIdPattern).required().messages({
    'any.required': 'User ID is required',
    'string.pattern.base': 'User ID must be a valid 24-character ObjectId'
  }),
  roleOnProject: Joi.string().required().messages({
    'any.required': 'Project role is required'
  })
});

const createMilestoneSchema = Joi.object({
  title: Joi.string().required().max(100).messages({
    'any.required': 'Milestone title is required'
  }),
  targetDate: Joi.date().required().messages({
    'any.required': 'Target date is required'
  }),
  status: Joi.string().valid(...Object.values(STATUS.MILESTONE)).optional()
});

const updateMilestoneSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  targetDate: Joi.date().optional(),
  completedDate: Joi.date().optional(),
  status: Joi.string().valid(...Object.values(STATUS.MILESTONE)).optional()
});

module.exports = {
  createProjectSchema,
  updateProjectSchema,
  addTeamMemberSchema,
  createMilestoneSchema,
  updateMilestoneSchema
};
