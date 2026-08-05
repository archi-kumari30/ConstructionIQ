const Joi = require('joi');
const ROLES = require('../constants/roles');

const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(100).messages({
    'any.required': 'Name is required',
    'string.min': 'Name must be at least 2 characters long'
  }),
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address'
  }),
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  }),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .messages({
      'any.only': `Role must be one of: ${Object.values(ROLES).join(', ')}`
    }),
  phone: Joi.string()
    .pattern(/^[+]?[0-9]{8,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Phone number must be between 8 and 15 digits'
    })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token is required'
  })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'any.required': 'Email is required',
    'string.email': 'Email must be a valid email address'
  })
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required().messages({
    'any.required': 'Password is required',
    'string.min': 'Password must be at least 6 characters long'
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
