# Local Development Setup Guide

This guide will help you set up and run the QA Automation Teaching Platform locally for testing.

## Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0 ✅ (Already installed)
- PostgreSQL 15+ (Needs to be installed)

## Step 1: Install PostgreSQL

### Option A: Install PostgreSQL in WSL (Recommended)

```bash
# Update package list
sudo apt-get update

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib

# Start PostgreSQL service
sudo service postgresql start

# Create database user and database
sudo -u postgres psql << PSQL
CREATE USER "user" WITH PASSWORD 'password';
CREATE DATABASE qa_platform;
GRANT ALL PRIVILEGES ON DATABASE qa_platform TO "user";
ALTER USER "user" CREATEDB;
\q
PSQL
```

### Option B: Use Docker (if Docker Desktop is available)

```bash
# Start PostgreSQL container
docker-compose up -d

# Wait for PostgreSQL to be ready
docker-compose logs -f postgres
# Press Ctrl+C once you see "database system is ready to accept connections"
```

### Option C: Install PostgreSQL on Windows

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with these settings:
   - Port: 5432
   - Username: user
   - Password: password
   - Database: qa_platform

## Step 2: Verify PostgreSQL is Running

```bash
# Check if PostgreSQL is accepting connections
psql -h localhost -U user -d qa_platform -c "SELECT version();"
# Enter password: password
```

## Step 3: Install Dependencies (if needed)

```bash
cd /home/vadym/projects/thePlatform

# Install all dependencies
pnpm install
```

## Step 4: Set Up Database Schema

```bash
# Navigate to API directory
cd apps/api

# Generate Prisma Client
pnpm prisma generate

# Run migrations
pnpm prisma migrate dev

# Seed the database with test data
pnpm prisma db seed
```

## Step 5: Start the Development Servers

### Terminal 1 - Backend API

```bash
cd /home/vadym/projects/thePlatform/apps/api
pnpm dev
```

The API will start on http://localhost:3001
Swagger docs will be available at http://localhost:3001/api/docs

### Terminal 2 - Frontend Web App

```bash
cd /home/vadym/projects/thePlatform/apps/web
pnpm dev
```

The web app will start on http://localhost:3000

## Step 6: Test the Application

### Test Accounts (after seeding)

The seed script creates these test accounts:

1. **Admin Account**
   - Email: admin@qa-platform.com
   - Password: admin123
   - Access: Full platform administration

2. **Instructor Account**
   - Email: instructor@qa-platform.com
   - Password: instructor123
   - Access: Create and manage courses

3. **Student Account**
   - Email: student@qa-platform.com
   - Password: student123
   - Access: Enroll in courses and learn

### What to Test

1. **Authentication**
   - Visit http://localhost:3000/login
   - Try logging in with each test account
   - Test registration with a new account

2. **Student Experience**
   - Login as student@qa-platform.com
   - Browse available courses
   - Enroll in a course (free course for testing)
   - View course content, videos, exercises
   - Complete lessons and track progress

3. **Instructor Experience**
   - Login as instructor@qa-platform.com
   - Access instructor dashboard at /instructor/courses
   - Create a new course
   - Add lessons with markdown content
   - Upload videos (requires AWS S3 configuration)
   - Create coding exercises
   - Create quizzes

4. **Admin Experience**
   - Login as admin@qa-platform.com
   - Access admin dashboard at /admin/dashboard
   - View platform statistics
   - Manage users at /admin/users
   - Manage categories at /admin/categories
   - Change user roles
   - Verify user emails

## Environment Configuration

### Backend (.env) ✅ Configured

Located at: `apps/api/.env`

```env
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/qa_platform
JWT_SECRET=dev-jwt-secret-change-in-production
JWT_EXPIRATION=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local) ✅ Configured

Located at: `apps/web/.env.local`

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-nextauth-secret-change-in-production-min-32-chars
DATABASE_URL=postgresql://user:password@localhost:5432/qa_platform
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Start PostgreSQL if not running
sudo service postgresql start

# Check if you can connect
psql -h localhost -U user -d qa_platform
```

### Port Already in Use

```bash
# Check what's using port 3000 or 3001
lsof -i :3000
lsof -i :3001

# Kill the process if needed
kill -9 <PID>
```

### Prisma Migration Issues

```bash
# Reset database (WARNING: This deletes all data)
cd apps/api
pnpm prisma migrate reset

# Re-run migrations
pnpm prisma migrate dev

# Re-seed data
pnpm prisma db seed
```

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules apps/*/node_modules
pnpm install

# Regenerate Prisma Client
cd apps/api
pnpm prisma generate
```

## Quick Start Script

Once PostgreSQL is installed and running, you can use this quick start:

```bash
#!/bin/bash
cd /home/vadym/projects/thePlatform

# Ensure PostgreSQL is running
sudo service postgresql start

# Set up database (first time only)
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
cd ../..

# Start both servers in background
cd apps/api && pnpm dev &
API_PID=$!

cd ../web && pnpm dev &
WEB_PID=$!

echo "Backend API: http://localhost:3001"
echo "Frontend Web: http://localhost:3000"
echo "API Docs: http://localhost:3001/api/docs"
echo ""
echo "To stop servers:"
echo "kill $API_PID $WEB_PID"
```

## Features to Test

### Phase 11: Polish & UX
- Toast notifications appear correctly
- Skeleton loaders show during data fetching
- Smooth animations and transitions

### Phase 12: Admin Dashboard
- Statistics display correctly
- Recent activity feeds work
- Navigation to management pages

### Phase 13: Advanced Admin Features
- User management: search, filter, edit roles
- Category management: CRUD operations, reordering
- Proper authorization (only admins can access)

## Notes

- AWS S3 is not configured, so video uploads won't work unless you add AWS credentials
- Stripe is not configured, so payment processing won't work unless you add Stripe keys
- OAuth (Google/Facebook) is not configured, so social login won't work
- All other features should work fully with the local setup

## Support

If you encounter issues:
1. Check the console logs in both terminals
2. Check browser console for frontend errors
3. Verify PostgreSQL is running
4. Ensure all environment variables are set correctly
5. Try the troubleshooting steps above

Enjoy testing the platform! 🚀
