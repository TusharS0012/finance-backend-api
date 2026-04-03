const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class RecordService {
  /**
   * Fetch records with search, filtering, pagination, and soft-delete exclusion.
   */
  async getRecords(userId, queryParams) {
    const { page = 1, limit = 20, type, category, search } = queryParams;

    const skip = (page - 1) * limit;

    // Build dynamic query conditions
    const whereClause = {
      userId,
      deletedAt: null, // ALWAYS exclude soft-deleted records
    };

    if (type) whereClause.type = type.toUpperCase();
    if (category) whereClause.category = category;

    // Text search on description or category
    if (search) {
      whereClause.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    // Execute count and fetch in parallel for performance
    const [total, records] = await Promise.all([
      prisma.record.count({ where: whereClause }),
      prisma.record.findMany({
        where: whereClause,
        skip: parseInt(skip),
        take: parseInt(limit),
        orderBy: { date: "desc" }, // Newest first
      }),
    ]);

    return {
      metadata: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      data: records,
    };
  }

  /**
   * Create a new financial record.
   */
  async createRecord(userId, data) {
    return await prisma.record.create({
      data: {
        userId,
        amount: data.amount, // Prisma handles mapping to Decimal(19,4) based on schema
        type: data.type.toUpperCase(),
        category: data.category,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
      },
    });
  }

  /**
   * Soft delete a record by ID. Checks ownership to prevent IDOR attacks.
   */
  async deleteRecord(userId, recordId, userRole) {
    // 1. Verify the record exists and belongs to the user (unless Admin)
    const record = await prisma.record.findUnique({
      where: { id: recordId },
    });

    if (!record || record.deletedAt) {
      const error = new Error("Record not found");
      error.statusCode = 404;
      throw error;
    }

    if (record.userId !== userId && userRole !== "ADMIN") {
      const error = new Error(
        "You do not have permission to delete this record",
      );
      error.statusCode = 403;
      throw error;
    }

    // 2. Perform soft delete
    return await prisma.record.update({
      where: { id: recordId },
      data: { deletedAt: new Date() },
    });
  }
}

module.exports = new RecordService();
