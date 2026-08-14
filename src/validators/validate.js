import { ValidationError } from '../utils/customErrors.js';

/**
 * Joi request validation middleware helper
 * @param {Object} schema - Joi schema object
 * @param {string} source - property to validate on req ('body', 'query', 'params')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      errors: { wrap: { label: '' } }
    });

    if (error) {
      const errorDetails = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return next(new ValidationError(errorDetails));
    }

    // Replace request payload with sanitized and validated Joi output
    req[source] = value;
    next();
  };
};

export default validate;
