/**
 * Standard API Response utility functions
 */
import HTTP_CODES from '../constants/httpCodes.js';

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

export default ApiResponse;
