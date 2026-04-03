const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class AnalyticsService {
  /**
   * Generates a complete dashboard summary for a specific user
   */
  async getDashboardSummary(userId) {
    // 1. Define the base filter to ensure we only look at active records for this user
    const baseWhere = {
      userId: userId,
      deletedAt: null,
    };

    // 2. Execute all queries concurrently for maximum performance
    const [totals, categoryTotals, recentActivity] = await Promise.all([
      // Query A: Total Income & Expenses
      prisma.record.groupBy({
        by: ["type"],
        where: baseWhere,
        _sum: {
          amount: true,
        },
      }),

      // Query B: Category-wise Expense breakdown
      prisma.record.groupBy({
        by: ["category"],
        where: {
          ...baseWhere,
          type: "EXPENSE", // Usually, users want to see where their money went
        },
        _sum: {
          amount: true,
        },
        orderBy: {
          _sum: {
            amount: "desc",
          },
        },
      }),

      // Query C: Top 5 Recent Transactions
      prisma.record.findMany({
        where: baseWhere,
        orderBy: { date: "desc" },
        take: 5,
        select: {
          // Only select what the dashboard needs
          id: true,
          amount: true,
          type: true,
          category: true,
          date: true,
          description: true,
        },
      }),
    ]);

    // 3. Format the raw totals
    let totalIncome = 0;
    let totalExpense = 0;

    totals.forEach((group) => {
      // Prisma returns Decimals, we cast to Numbers for the JSON response
      if (group.type === "INCOME") totalIncome = Number(group._sum.amount) || 0;
      if (group.type === "EXPENSE")
        totalExpense = Number(group._sum.amount) || 0;
    });

    // Format category breakdown
    const formattedCategories = categoryTotals.map((cat) => ({
      category: cat.category,
      total: Number(cat._sum.amount) || 0,
    }));

    return {
      overview: {
        totalIncome,
        totalExpense,
        netBalance: totalIncome - totalExpense,
      },
      expenseByCategory: formattedCategories,
      recentActivity,
    };
  }
}

module.exports = new AnalyticsService();
