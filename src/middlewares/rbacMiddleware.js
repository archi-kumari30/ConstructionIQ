const { ForbiddenError } = require('../utils/customErrors');

/**
 * Authorize access to specific roles
 * @param  {...string} allowedRoles - roles allowed to access endpoint
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('Access Denied: Not Authenticated'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access Denied: Your role '${req.user.role}' is not authorized to access this resource`
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize
};
