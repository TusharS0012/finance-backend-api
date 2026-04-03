/**
 * Factory function that returns a middleware checking if the user's role
 * is included in the allowed roles array.
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // req.user is guaranteed to exist here because this runs AFTER auth.middleware.js
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "error",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};
