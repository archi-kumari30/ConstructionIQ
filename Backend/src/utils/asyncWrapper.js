/**
 * Express Async Controller Wrapper to avoid try-catch boilerplate
 */
export default (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
