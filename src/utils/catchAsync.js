/**
 * Wraps async route handlers to automatically pass errors to the global error handler.
 * Eliminates the need for repetitive try/catch blocks in controllers.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

module.exports = catchAsync;
