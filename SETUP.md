# Setup Guide - QA Automation Platform

Phase 1 (Foundation) is complete! Here's how to get started.

## Prerequisites

Before running the application, ensure you have:

1. **Node.js** >= 18.0.0
2. **pnpm** >= 8.0.0
3. **PostgreSQL** database

## Installation Steps

### 1. Install pnpm

If you haven't installed pnpm yet:

```bash
# Using npm
npm install -g pnpm

# Or using standalone script
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### 2. Install Dependencies

```bash
# From project root
pnpm install
```

### 3. Set Up Database

Create a PostgreSQL database:

```bash
createdb qa_platform
```

### 4. Configure Environment Variables

#### Frontend (.env.local)

Copy the example file and configure:

```bash
cd apps/web
cp .env.local.example .env.local
```

Edit `.env.local` with your values:
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `DATABASE_URL` - Your PostgreSQL connection string
- Google/Facebook OAuth credentials (optional for now)

#### Backend (.env)

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` with your values:
- `DATABASE_URL` - Your PostgreSQL connection string
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- AWS credentials (can configure later)
- Stripe keys (can configure later)

### 5. Set Up Prisma Database

```bash
cd apps/api

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database with initial data
pnpm prisma:seed
```

This will create:
- Database tables
- 3 test users:
  - Admin: `admin@qa-platform.com` / `admin123`
  - Instructor: `instructor@qa-platform.com` / `instructor123`
  - Student: `student@qa-platform.com` / `student123`
- 10 course categories
- Sample milestones

### 6. Run Development Servers

From the project root:

```bash
# Run both frontend and backend
pnpm dev
```

Or run individually:

```bash
# Frontend only (http://localhost:3000)
cd apps/web
pnpm dev

# Backend only (http://localhost:3001)
cd apps/api
pnpm dev
```

## Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation** (Swagger): http://localhost:3001/api/docs
- **Prisma Studio**: Run `cd apps/api && pnpm prisma:studio`

## Project Structure

```
qa-automation-platform/
├── apps/
│   ├── web/                    # Next.js frontend (Port 3000)
│   │   ├── src/app/           # App Router pages
│   │   ├── src/components/    # React components
│   │   ├── src/lib/           # Utilities (auth, API client)
│   │   └── tailwind.config.ts # Green/blue theme
│   └── api/                    # NestJS backend (Port 3001)
│       ├── src/modules/       # Feature modules
│       ├── src/prisma/        # Prisma setup
│       └── prisma/schema.prisma # Database schema
├── packages/
│   ├── shared/                # Shared types & constants
│   │   ├── src/types/        # TypeScript interfaces
│   │   └── src/constants/    # Shared constants
│   └── ui/                    # Shared UI components (future)
├── package.json               # Root workspace config
├── turbo.json                 # Turborepo config
└── pnpm-workspace.yaml        # pnpm workspace config
```

## Useful Commands

```bash
# Install dependencies
pnpm install

# Run development
pnpm dev

# Build all apps
pnpm build

# Lint all code
pnpm lint

# Run tests
pnpm test

# Clean all builds
pnpm clean

# Prisma commands (from apps/api)
pnpm prisma:generate    # Generate Prisma client
pnpm prisma:migrate     # Run migrations
pnpm prisma:seed        # Seed database
pnpm prisma:studio      # Open Prisma Studio GUI
```

## Database Schema

The database includes:

### Core Tables
- **users** - User accounts with roles (STUDENT, INSTRUCTOR, ADMIN)
- **accounts** - OAuth provider accounts
- **sessions** - User sessions

### Course Content
- **course_categories** - 10 QA automation categories
- **courses** - Course metadata
- **lessons** - Individual lessons
- **videos** - Video content metadata
- **exercises** - Coding challenges
- **quizzes** - Assessments

### Progress Tracking
- **enrollments** - Course enrollments
- **lesson_progress** - Lesson completion
- **video_progress** - Video watch progress
- **exercise_submissions** - Code submissions
- **quiz_attempts** - Quiz results

### Payments & Achievements
- **payments** - Stripe payment records
- **milestones** - Achievement definitions
- **user_milestones** - User achievements

## Next Steps (Phase 2)

Phase 1 is complete! The next phase focuses on authentication:

1. Implement NextAuth.js with email/password
2. Add Google & Facebook OAuth providers
3. Create login/register pages
4. Implement JWT strategy in NestJS
5. Build role-based access control
6. Create user profile page

## Troubleshooting

### pnpm not found
```bash
npm install -g pnpm
```

### Database connection error
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env files
- Verify database exists: `psql -l`

### Port already in use
- Frontend: Change port in package.json dev script
- Backend: Change PORT in apps/api/.env

### Prisma errors
```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:migrate
```

## Support

For issues or questions:
- Check the implementation plan: `.claude/plans/snappy-shimmying-castle.md`
- Review the project requirements: `project-requirements.md`

---

**Status**: Phase 1 Complete ✅
**Next**: Phase 2 - Authentication
