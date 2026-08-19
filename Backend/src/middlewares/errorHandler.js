import logger from '../config/logger.js';
import HTTP_CODES from '../constants/httpCodes.js';
import ERROR_CODES from '../constants/errorCodes.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_CODES.INTERNAL_SERVER_ERROR;
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = HTTP_CODES.UNPROCESSABLE_ENTITY;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    message = 'Validation Failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // Handle Mongoose Cast Error (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = HTTP_CODES.BAD_REQUEST;
    errorCode = ERROR_CODES.BAD_REQUEST;
    message = `Invalid value for field: ${err.path}`;
  }

  // Handle MongoDB Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = HTTP_CODES.CONFLICT;
    errorCode = ERROR_CODES.CONFLICT;
    const duplicatedField = Object.keys(err.keyValue)[0];
    message = `A record with this ${duplicatedField} already exists`;
  }

  // Log error (for server visibility)
  if (statusCode === HTTP_CODES.INTERNAL_SERVER_ERROR) {
    logger.error(`[Unhandled Error] ${err.stack}`);
  } else {
    logger.warn(`[Operational Error] Status: ${statusCode} - Code: ${errorCode} - Message: ${message}`);
  }

  // Respond to client
  return res.status(statusCode).json({
    success: false,
    message,
    data: null,
    errors
  });
};

export default errorHandler;
