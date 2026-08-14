import mongoose from 'mongoose';
import ApiResponse from '../utils/apiResponse.js';
import HTTP_CODES from '../constants/httpCodes.js';
import asyncWrapper from '../utils/asyncWrapper.js';

const checkHealth = asyncWrapper(async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'UP' : 'DOWN';
  
  const healthData = {
    status: 'UP',
    timestamp: new Date(),
    services: {
      database: dbStatus,
      server: 'UP'
    },
    uptime: process.uptime()
  };

  if (dbStatus === 'DOWN') {
    return ApiResponse.error(res, 'Database connection is unavailable', healthData, HTTP_CODES.INTERNAL_SERVER_ERROR);
  }

  return ApiResponse.success(res, 'System is healthy', healthData, HTTP_CODES.OK);
});

export {
  checkHealth
};
export default { checkHealth };
