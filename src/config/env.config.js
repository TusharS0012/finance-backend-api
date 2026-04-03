const Joi = require("joi");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../.env") });

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

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  console.error(`Config validation error: ${error.message}`);
  process.exit(1);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
  jwtSecret: envVars.JWT_SECRET,
  frontendUrl: envVars.FRONTEND_URL,
};
