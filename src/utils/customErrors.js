const ERROR_CODES = require('../constants/errorCodes');
const HTTP_CODES = require('../constants/httpCodes');

class AppError extends Error {
  constructor(message, statusCode, errorCode, errors = null) {
    super(message);
    this.statusCode = statusCode || HTTP_CODES.INTERNAL_SERVER_ERROR;
    this.errorCode = errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad Request', errorCode = ERROR_CODES.BAD_REQUEST, errors = null) {
    super(message, HTTP_CODES.BAD_REQUEST, errorCode, errors);
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized', errorCode = ERROR_CODES.UNAUTHORIZED) {
    super(message, HTTP_CODES.UNAUTHORIZED, errorCode);
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden', errorCode = ERROR_CODES.FORBIDDEN) {
    super(message, HTTP_CODES.FORBIDDEN, errorCode);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource Not Found', errorCode = ERROR_CODES.NOT_FOUND) {
    super(message, HTTP_CODES.NOT_FOUND, errorCode);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflict Occurred', errorCode = ERROR_CODES.CONFLICT) {
    super(message, HTTP_CODES.CONFLICT, errorCode);
  }
}

class ValidationError extends AppError {
  constructor(errors, message = 'Validation Failed') {
    super(message, HTTP_CODES.UNPROCESSABLE_ENTITY, ERROR_CODES.VALIDATION_ERROR, errors);
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError
};
