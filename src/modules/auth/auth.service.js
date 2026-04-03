const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../../config/env.config");

const prisma = new PrismaClient();

class AuthService {
  /**
   * Helper: Generate a JWT for a user
   */
  generateToken(id) {
    return jwt.sign({ id }, config.jwtSecret, {
      expiresIn: "1d", // Token expires in 1 day
    });
  }

  /**
   * Register a new user
   */
  async register(userData) {
    const { email, password, role } = userData;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const error = new Error("Email already in use");
      error.statusCode = 400;
      throw error;
    }

    // 2. Hash the password (Cost factor 12 is the current OWASP standard)
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Create the user
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role || "VIEWER", // Default to VIEWER if not provided
      },
    });

    // 4. Remove password from the returned object!
    delete newUser.passwordHash;

    return newUser;
  }

  /**
   * Login an existing user
   */
  async login(email, password) {
    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email, status: "ACTIVE", deletedAt: null },
    });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // 2. Check if password matches
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    // 3. Generate token
    const token = this.generateToken(user.id);

    // 4. Log the login event (Audit Trail)
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_LOGIN",
        entityId: user.id,
      },
    });

    // 5. Clean up user object
    delete user.passwordHash;

    return { user, token };
  }
}

module.exports = new AuthService();
