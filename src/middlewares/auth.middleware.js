const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const catchAsync = require("../utils/catchAsync");

const prisma = new PrismaClient();

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Get token from headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({
        status: "error",
        message: "You are not logged in. Please log in to get access.",
      });
  }

  // 2. Verify token
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "your-fallback-dev-secret",
  );

  // 3. Check if user still exists (in case they were deleted after token was issued)
  const currentUser = await prisma.user.findUnique({
    where: { id: decoded.id, deletedAt: null, status: "ACTIVE" },
  });

  if (!currentUser) {
    return res
      .status(401)
      .json({
        status: "error",
        message:
          "The user belonging to this token no longer exists or is inactive.",
      });
  }

  // 4. Grant access to protected route
  req.user = currentUser;
  next();
});
