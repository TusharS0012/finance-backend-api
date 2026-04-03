const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// Setup configuration for diverse data
const RECORD_COUNT = 550;
const CATEGORIES = {
  INCOME: [
    "Salary",
    "Freelance",
    "Trading Profit",
    "Dividends",
    "Rental Income",
    "Gifts",
  ],
  EXPENSE: [
    "Rent",
    "Groceries",
    "Software",
    "Dining Out",
    "Travel",
    "Utilities",
    "Taxes",
    "Marketing",
    "Education",
    "Health",
  ],
};

const DESCRIPTIONS = [
  "Monthly payment from client",
  "Weekly grocery run",
  "Bloomberg Terminal subscription",
  "Dinner with investors",
  "Flight tickets for business",
  "Quarterly tax payment",
  "AWS infrastructure costs",
  "Marketing campaign",
  "New office hardware",
  "Dividends from AAPL",
  "Freelance project",
  "Gym membership renewal",
];

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Setup Base Password for all test users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("TestPassword123!", salt);

  // 2. Create standard roles for testing RBAC
  console.log("Creating users...");
  const admin = await prisma.user.upsert({
    where: { email: "admin@sievecapital.com" },
    update: {},
    create: {
      email: "admin@sievecapital.com",
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  await prisma.user.upsert({
    where: { email: "analyst@sievecapital.com" },
    update: {},
    create: {
      email: "analyst@sievecapital.com",
      passwordHash,
      role: "ANALYST",
    },
  });

  await prisma.user.upsert({
    where: { email: "viewer@sievecapital.com" },
    update: {},
    create: { email: "viewer@sievecapital.com", passwordHash, role: "VIEWER" },
  });

  // 3. Cleanup existing records to avoid primary key conflicts on re-run
  await prisma.record.deleteMany({});
  await prisma.auditLog.deleteMany({});
  console.log("🧹 Cleaned up old records.");

  // 4. Generate 550+ Diverse Records for the Admin
  const recordsToCreate = [];
  const now = new Date();

  for (let i = 0; i < RECORD_COUNT; i++) {
    const type = Math.random() > 0.7 ? "INCOME" : "EXPENSE";
    const categoryList = CATEGORIES[type];
    const category =
      categoryList[Math.floor(Math.random() * categoryList.length)];
    const description =
      DESCRIPTIONS[Math.floor(Math.random() * DESCRIPTIONS.length)];

    // Random amounts: Incomes (1000-6000), Expenses (10-810)
    const amount =
      type === "INCOME"
        ? (Math.random() * 5000 + 1000).toFixed(2)
        : (Math.random() * 800 + 10).toFixed(2);

    // Stagger dates over the last 6 months for sorting/analytics testing
    const recordDate = new Date();
    recordDate.setDate(now.getDate() - Math.floor(Math.random() * 180));

    recordsToCreate.push({
      userId: admin.id,
      amount: parseFloat(amount),
      type,
      category,
      description: `${description} #${i + 1}`,
      date: recordDate,
    });
  }

  // Bulk insert for performance
  await prisma.record.createMany({ data: recordsToCreate });

  // 5. Add a specific soft-deleted record to test logic filters
  await prisma.record.create({
    data: {
      userId: admin.id,
      amount: 99999.99,
      type: "EXPENSE",
      category: "HIDDEN",
      description: "Test: Should not appear in dashboard totals",
      deletedAt: new Date(),
    },
  });

  console.log(`✅ Seeded ${RECORD_COUNT} records and 3 users.`);
  console.log("🚀 Ready for testing.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
