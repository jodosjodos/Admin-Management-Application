# Credit Jambo Admin Backend

Admin API for Credit Jambo - Digital Credit & Savings Platform management.

## Features

- 🔐 Admin authentication with JWT
- 👥 User management (activate/deactivate accounts)
- 📱 Device approval system
- 💳 Credit request monitoring & approval
- 💰 Transaction monitoring
- 📊 Analytics dashboard
- 🔒 Role-based access control (Super Admin, Admin, Support)
- 📝 Comprehensive API documentation with Swagger

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 13+
- **ORM**: TypeORM
- **Authentication**: JWT
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest
- **Logging**: Winston

## Prerequisites

- Node.js v18 or higher
- PostgreSQL 13 or higher
- npm or yarn

## Installation

1. **Clone the repository** (if not already done)

   ```bash
   git clone <repository-url>
   cd creditjambo/admin-app/backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment configuration**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:

   - Database credentials
   - JWT secrets
   - CORS origin
   - Port settings

4. **Database setup**

   Create PostgreSQL database:

   ```bash
   createdb credit_jambo_admin
   ```

5. **Run migrations**
   ```bash
   npm run migration:run
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Run Tests

```bash
npm test
```

### Run Linter

```bash
npm run lint
```

## API Documentation

Once the server is running, access the interactive API documentation at:

```
http://localhost:3001/api-docs
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new admin (Super Admin only)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout admin
- `GET /api/auth/me` - Get admin profile
- `PUT /api/auth/change-password` - Change password

### User Management

- `GET /api/users` - Get all client users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/activate` - Activate/deactivate user
- `PUT /api/users/:id/devices/:deviceId/approve` - Approve/reject device

### Transactions

- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/:id` - Get transaction details
- `GET /api/transactions/user/:userId` - Get user transactions

### Dashboard & Analytics

- `GET /api/dashboard/stats` - Platform statistics
- `GET /api/dashboard/credit-requests` - Pending credit requests
- `GET /api/dashboard/recent-activity` - Recent platform activity
- `GET /api/dashboard/analytics` - Detailed analytics

## Admin Roles

1. **SUPER_ADMIN**

   - Full system access
   - Can create/manage other admins
   - All permissions

2. **ADMIN**

   - User management
   - Credit approval
   - Device approval
   - View analytics

3. **SUPPORT**
   - View-only access
   - User support functions
   - Transaction monitoring

## Database Schema

### Admin Entity

- `id` - UUID (Primary Key)
- `email` - Unique email address
- `password` - Bcrypt hashed password
- `firstName` - First name
- `lastName` - Last name
- `phone` - Phone number
- `role` - Admin role (SUPER_ADMIN, ADMIN, SUPPORT)
- `status` - Account status (ACTIVE, SUSPENDED, INACTIVE)
- `loginAttempts` - Failed login counter
- `lockedUntil` - Account lock timestamp
- `lastLoginAt` - Last successful login
- `lastLoginIp` - Last login IP address
- `refreshToken` - JWT refresh token
- `createdAt` - Created timestamp
- `updatedAt` - Updated timestamp

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Account lockout after 5 failed login attempts
- Role-based authorization
- Refresh token rotation
- CORS protection
- Helmet security headers
- Request validation

## Environment Variables

| Variable                 | Description          | Default               |
| ------------------------ | -------------------- | --------------------- |
| `NODE_ENV`               | Environment mode     | development           |
| `PORT`                   | Server port          | 3001                  |
| `DB_HOST`                | Database host        | localhost             |
| `DB_PORT`                | Database port        | 5432                  |
| `DB_USERNAME`            | Database user        | postgres              |
| `DB_PASSWORD`            | Database password    | postgres              |
| `DB_DATABASE`            | Database name        | credit_jambo_admin    |
| `JWT_SECRET`             | JWT secret key       | -                     |
| `JWT_EXPIRES_IN`         | Access token expiry  | 1h                    |
| `JWT_REFRESH_SECRET`     | Refresh token secret | -                     |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | 7d                    |
| `CORS_ORIGIN`            | Allowed CORS origin  | http://localhost:3000 |

## Project Structure

```
admin-app/backend/
├── src/
│   ├── common/
│   │   └── exceptions.ts           # Custom exception classes
│   ├── config/
│   │   └── database.ts            # TypeORM configuration
│   ├── middleware/
│   │   ├── auth.middleware.ts     # JWT authentication
│   │   └── error.middleware.ts    # Error handling
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── admin.entity.ts    # Admin entity
│   │   │   ├── auth.controller.ts # Auth endpoints
│   │   │   ├── auth.service.ts    # Auth business logic
│   │   │   └── auth.dto.ts        # Data transfer objects
│   │   ├── users/
│   │   │   └── users.controller.ts # User management
│   │   ├── transactions/
│   │   │   └── transactions.controller.ts # Transaction monitoring
│   │   └── dashboard/
│   │       └── dashboard.controller.ts # Analytics
│   ├── migrations/                # Database migrations
│   └── main.ts                    # Application entry point
├── .env.example                   # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

## Development Workflow

1. Create a feature branch
2. Make changes
3. Run tests: `npm test`
4. Run linter: `npm run lint`
5. Commit changes
6. Create pull request

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Migration Management

```bash
# Generate migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert migration
npm run migration:revert
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set strong JWT secrets
4. Build application: `npm run build`
5. Run migrations: `npm run migration:run`
6. Start server: `npm start`

## Docker Support

```bash
# Build image
docker build -t creditjambo-admin .

# Run container
docker run -p 3001:3001 --env-file .env creditjambo-admin
```

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check database credentials in `.env`
- Ensure database exists

### Authentication Errors

- Verify JWT secrets are set
- Check token expiry settings
- Ensure admin account exists

### Port Conflicts

- Change PORT in `.env`
- Check if port is already in use

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create pull request

## License

Proprietary - Credit Jambo Ltd

## Support

For support, email: admin@creditjambo.com
