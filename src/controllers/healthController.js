const mongoose = require('mongoose');
const ApiResponse = require('../utils/apiResponse');
const HTTP_CODES = require('../constants/httpCodes');
const asyncWrapper = require('../utils/asyncWrapper');

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

module.exports = {
  checkHealth
};
