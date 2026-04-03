const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserService {
  /**
   * Fetch all users with pagination and filtering.
   * STRICTLY omits password hashes.
   */
  async getAllUsers(queryParams) {
    const { page = 1, limit = 20, role, status } = queryParams;
    const skip = (page - 1) * limit;

    const whereClause = {
      deletedAt: null, // Ignore soft-deleted users
    };

    if (role) whereClause.role = role.toUpperCase();
    if (status) whereClause.status = status.toUpperCase();

    const [total, users] = await Promise.all([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
        select: {
          // NEVER return the password hash
          id: true,
          email: true,
          role: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      metadata: { total, page: parseInt(page), limit: parseInt(limit) },
      data: users,
    };
  }

  /**
   * Update a user's role or status (Admin Action)
   */
  async updateUserAccess(adminId, targetUserId, updateData) {
    // 1. Prevent Admins from accidentally downgrading or suspending themselves
    if (adminId === targetUserId) {
      const error = new Error(
        "You cannot modify your own access level from this endpoint.",
      );
      error.statusCode = 400;
      throw error;
    }

    // 2. Ensure target user exists
    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user || user.deletedAt) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    // 3. Use a database transaction to update the user AND log the audit event
    const result = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: targetUserId },
        data: {
          role: updateData.role ? updateData.role.toUpperCase() : undefined,
          status: updateData.status
            ? updateData.status.toUpperCase()
            : undefined,
        },
        select: { id: true, email: true, role: true, status: true },
      });

      // Write to the Audit Log
      await tx.auditLog.create({
        data: {
          userId: adminId,
          action: `UPDATED_USER_ACCESS: Role->${updatedUser.role}, Status->${updatedUser.status}`,
          entityId: targetUserId,
        },
      });

      return updatedUser;
    });

    return result;
  }

  /**
   * Soft delete a user (Admin Action)
   */
  async deleteUser(adminId, targetUserId) {
    if (adminId === targetUserId) {
      const error = new Error("You cannot delete your own account.");
      error.statusCode = 400;
      throw error;
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: {
        deletedAt: new Date(),
        status: "INACTIVE", // Automatically suspend them as well
      },
    });

    // Log the deletion
    await prisma.auditLog.create({
      data: {
        userId: adminId,
        action: "DELETED_USER",
        entityId: targetUserId,
      },
    });

    return true;
  }
}

module.exports = new UserService();
