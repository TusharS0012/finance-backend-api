const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Log full error in development or to a logging service in prod
  if (process.env.NODE_ENV !== "production") {
    console.error(`[ERROR]: ${err.stack}`);
  }

  // Handle specific Prisma database errors
  if (err.code === "P2002") {
    statusCode = 400;
    message =
      "Duplicate field value entered. A unique constraint was violated.";
  } else if (err.code === "P2025") {
    statusCode = 404;
    message = "Record to update/delete not found.";
  }

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Something went wrong on our end."
        : message,
  });
};

module.exports = { errorHandler };
