import Joi from 'joi';
import STATUS from '../constants/status.js';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

const createIncidentSchema = Joi.object({
  title: Joi.string().required().max(100).messages({
    'any.required': 'Incident title is required'
  }),
  description: Joi.string().required().messages({
    'any.required': 'Incident description is required'
  }),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  images: Joi.array().items(Joi.string().uri()).optional()
});

const updateIncidentSchema = Joi.object({
  title: Joi.string().max(100).optional(),
  description: Joi.string().optional(),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
  status: Joi.string().valid(...Object.values(STATUS.INCIDENT)).optional(),
  images: Joi.array().items(Joi.string().uri()).optional(),
  resolutionDetails: Joi.string().allow('').optional()
});

const createDailyReportSchema = Joi.object({
  date: Joi.date().required().messages({
    'any.required': 'Report date is required'
  }),
  notes: Joi.string().allow('').optional(),
  materialsUsed: Joi.array().items(
    Joi.object({
      materialId: Joi.string().pattern(objectIdPattern).required().messages({
        'any.required': 'Material ID is required'
      }),
      quantityUsed: Joi.number().min(0).required().messages({
        'any.required': 'Quantity used is required'
      })
    })
  ).optional(),
  equipmentHours: Joi.array().items(
    Joi.object({
      equipmentId: Joi.string().pattern(objectIdPattern).required().messages({
        'any.required': 'Equipment ID is required'
      }),
      hoursUsed: Joi.number().min(0).max(24).required().messages({
        'any.required': 'Equipment hours used is required'
      })
    })
  ).optional()
});

export {
  createIncidentSchema,
  updateIncidentSchema,
  createDailyReportSchema
};
export default { createIncidentSchema, updateIncidentSchema, createDailyReportSchema };
