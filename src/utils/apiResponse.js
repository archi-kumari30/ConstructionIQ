/**
 * Standard API Response utility functions
 */
const HTTP_CODES = require('../constants/httpCodes');

class ApiResponse {
  static success(res, message = 'Success', data = null, statusCode = HTTP_CODES.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      errors: null
    });
  }

  static error(res, message = 'Error occurred', errors = null, statusCode = HTTP_CODES.INTERNAL_SERVER_ERROR) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors
    });
  }
}

module.exports = ApiResponse;
