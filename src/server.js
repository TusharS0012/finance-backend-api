const config = require("./config/env.config");
const logger = require("./config/logger");
const app = require("./app");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const PORT = config.port;

// Connect to Database and Start Server
async function startServer() {
  try {
    await prisma.$connect();
    logger.info(`
      ----------------------
      PostgreSQL Database connected successfully via Prisma
      ----------------------
    `);

    // 3. Boot Express App
    const server = app.listen(PORT, () => {
      logger.info(
        `-----------------
         Server is running on port ${PORT} in ${config.env} mode.
         -----------------`,
      );
    });

    // 4. Handle unhandled promise rejections (e.g., DB goes down)
    process.on("unhandledRejection", (err) => {
      logger.error(`
        ---------------------------
        UNHANDLED REJECTION! Shutting down...
        ---------------------------
      `);
      // Pass the whole error object so Winston can extract and format the stack trace
      logger.error(err);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    logger.error(`
      --------------------------
      Failed to start server: ${error.message}
      ---------------------------
    `);
    process.exit(1);
  }
}

startServer();
