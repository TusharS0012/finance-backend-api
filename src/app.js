const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

// 1. Security HTTP headers
app.use(helmet());

// 2. CORS setup (Allow frontend to connect)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);

// 3. Request parsing
app.use(express.json({ limit: "10kb" })); // Prevent large payload DOS attacks

// 4. Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// 5. Rate Limiting (Prevent Brute Force / Scraping)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests from this IP, please try again later." },
});
app.use("/api", limiter);
    
// 6. API Routes
app.use("/api/v1/auth", require("./modules/auth/auth.routes"));
app.use("/api/v1/records", require("./modules/records/record.routes"));
app.use("/api/v1/analytics", require("./modules/analytics/analytics.routes"));


// 6. Handle Unmatched Routes (404)
app.use((req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// 7. Global Error Handling Middleware
app.use(errorHandler);

module.exports = app;
