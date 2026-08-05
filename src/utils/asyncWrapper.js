/**
 * Express Async Controller Wrapper to avoid try-catch boilerplate
 */
module.exports = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
