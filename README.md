Finance Dashboard API
A Node.js backend for tracking financial records with Role-Based Access Control (RBAC). The system handles automated data aggregation for dashboard views and provides a searchable, paginated history of transactions.

⚙️ Setup & Installation
Install Dependencies

Bash
npm install
Environment Variables
Create a .env file in the root directory:

Plaintext
PORT=5000
NODE_ENV="development"
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_db?schema=public"
JWT_SECRET="your_secure_random_string"
Database Initialization
Run migrations and the seed script to populate ~550 test records and 3 default users:

Bash
npx prisma migrate dev --name init
npx prisma db seed
Start the Server

Bash
npm run dev
🧪 Testing the API
To test the protected routes, you must first authenticate to receive a Bearer Token.

1. Authentication
   Register: POST /api/v1/auth/register

Login: POST /api/v1/auth/login

Payload: {"email": "admin@sievecapital.com", "password": "TestPassword123!"}

Action: Copy the token from the response.

2. Accessing Protected Routes
   In your API client (Postman/Insomnia), go to the Auth tab, select Bearer Token, and paste your token.

Dashboard Analytics: GET /api/v1/analytics/dashboard

Returns total income, expenses, net balance, and category breakdown.

Manage Records: \* GET /api/v1/records (Supports ?page=1&limit=10&search=keyword)

POST /api/v1/records

Payload: {"amount": 1200, "type": "INCOME", "category": "Freelance", "description": "Project Alpha"}

DELETE /api/v1/records/:id (Admin/Owner only)

User Management (Admin Only):

GET /api/v1/users

PATCH /api/v1/users/:id (Update role/status)

🛠 Technical Implementation Notes
Precision: Uses PostgreSQL Decimal(19,4) for all currency fields to avoid floating-point math errors common in JavaScript.

Pagination: Implemented skip and take logic returning a metadata envelope (total, page, totalPages) for frontend ease-of-use.

Soft Deletes: Deleting a record sets a deletedAt timestamp. Records are automatically excluded from all standard fetch queries and totals.

RBAC: Middleware restricts specific actions (like role updates or cross-user deletions) based on the user's role and ownership status.

Seeding: The seed script uses createMany for high-performance bulk insertion of test data across a 6-month timeline.

📂 Database Visualization
If you want to view the raw data in a GUI, run:

Bash
npx prisma studio
