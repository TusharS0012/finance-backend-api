const winston = require("winston");
const config = require("./env.config");

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Define where the logs should go
const transports = [
  // 1. Console Transport (For local development view)
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        if (stack) {
          return `${timestamp} ${level}: ${message}\n${stack}`;
        }
        return `${timestamp} ${level}: ${message}`;
      }),
    ),
  }),
];

// 2. File Transports (Only active in production)
if (config.env === "production") {
  transports.push(
    // Write all ERROR level logs to a dedicated file
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    // Write all logs to a combined file
    new winston.transports.File({ filename: "logs/combined.log" }),
  );
}

const logger = winston.createLogger({
  level: config.env === "development" ? "debug" : "info",
  format: logFormat,
  transports,
  exitOnError: false,
});

module.exports = logger;
