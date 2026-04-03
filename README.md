# Finance Dashboard API 🚀

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5+-blue.svg)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A robust Node.js backend API for tracking financial transactions with built-in Role-Based Access Control (RBAC) and automated dashboard analytics.

## ✨ Features

- **Financial Precision**: Uses PostgreSQL `Decimal(19,4)` to prevent floating-point math errors
- **Role-Based Access Control**: Custom middleware enforces RBAC (Admin/Analyst/Viewer) and prevents IDOR
- **Soft Deletes**: Records utilize `deletedAt` timestamp; never permanently deleted but excluded from calculations
- **Smart Pagination**: Returns metadata envelope (total, page, totalPages) for frontend ease
- **Automated Analytics**: Dashboard with total income, expenses, net balance, and category-wise breakdown
- **Database Visualization**: Run `npx prisma studio` to view all data in a GUI

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Custom middleware
- **Environment**: dotenv for configuration

## 📦 Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 13+
- npm or yarn

### Install Dependencies

```bash
npm install
```

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV="development"
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/finance_db?schema=public"
JWT_SECRET="your_secure_random_string"
```

## 🗄️ Database Setup

### Initialize Database

Run migrations and seed the database (populates ~550 records and 3 default users):

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### Database Visualization

View your data in a GUI:

```bash
npx prisma studio
```

## 🚀 Usage

### Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Authentication

| Action | Endpoint | Method | Payload Example |
|--------|----------|--------|-----------------|
| Register | `/api/v1/auth/register` | POST | `{"email": "user@test.com", "password": "..."}` |
| Login | `/api/v1/auth/login` | POST | `{"email": "admin@sievecapital.com", "password": "TestPassword123!"}` |

**Note**: For all protected routes below, include the token in headers as: `Authorization: Bearer <your_token>`

### Dashboard & Analytics

- **GET** `/api/v1/analytics/dashboard`: Returns total income, expenses, net balance, and category-wise breakdown.

### Financial Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/records` | Fetch records. Supports `?page=1&limit=10&search=keyword` |
| POST | `/api/v1/records` | Add entry. Body: `{"amount": 100, "type": "INCOME", ...}` |
| DELETE | `/api/v1/records/:id` | Soft-delete record (Admin or Owner only) |

### Admin Management

- **GET** `/api/v1/users`: List all users.
- **PATCH** `/api/v1/users/:id`: Update user roles or status (Active/Inactive).

## 🧪 Testing Credentials

The seed script creates these test accounts:

- **Admin**: `admin@sievecapital.com` / `TestPassword123!`
- **Analyst**: `analyst@sievecapital.com` / `TestPassword123!`
- **Viewer**: `viewer@sievecapital.com` / `TestPassword123!`

## 📜 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or issues, please open an issue on GitHub.
