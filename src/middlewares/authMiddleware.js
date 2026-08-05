const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const userRepository = require('../repositories/userRepository');
const { UnauthorizedError } = require('../utils/customErrors');
const asyncWrapper = require('../utils/asyncWrapper');

const protect = asyncWrapper(async (req, res, next) => {
  let token;

  // Check headers for authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('Not authenticated, no token provided');
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, jwtConfig.accessSecret);

    // Get user from repository
    const user = await userRepository.findById(decoded.id);
    if (!user) {
      throw new UnauthorizedError('User no longer exists');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('User account has been deactivated');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Authentication token has expired');
    }
    throw new UnauthorizedError('Invalid authentication token');
  }
});

module.exports = {
  protect
};
