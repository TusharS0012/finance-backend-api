const Joi = require("joi");
const path = require("path");

// Load the .env file explicitly before validation
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

// Define the exact shape and requirements of our environment variables
const envVarsSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().default(8000),
  DATABASE_URL: Joi.string()
    .required()
    .description("PostgreSQL connection string is required"),
  JWT_SECRET: Joi.string()
    .required()
    .min(32) // Enforce strong secrets
    .description("JWT Secret Key is required"),
  FRONTEND_URL: Joi.string()
    .uri()
    .default("http://localhost:3000")
    .description("Allowed CORS origin"),
}).unknown(); // Allow other variables (like OS defaults) to pass through

// Validate the process.env object
const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  // FAST FAIL: Kill the app immediately if config is invalid
  console.error(`Config validation error: ${error.message}`);
  process.exit(1);
}

// Export a clean, validated configuration object
module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  jwtSecret: envVars.JWT_SECRET,
  frontendUrl: envVars.FRONTEND_URL,
};
