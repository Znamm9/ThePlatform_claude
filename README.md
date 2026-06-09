# QA Automation Teaching Platform

A comprehensive learning platform for teaching QA Automation topics built with Next.js, NestJS, and PostgreSQL.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + React + Tailwind CSS
- **Backend:** NestJS + PostgreSQL
- **Auth:** NextAuth.js (Email/Password + Google/Facebook OAuth)
- **Payments:** Stripe
- **Video:** AWS S3 + CloudFront
- **Database:** PostgreSQL with Prisma ORM

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm >= 8.0.0 (will be auto-installed if missing)
- Docker (recommended) OR PostgreSQL

### Quick Setup (Recommended)

**First time setup:**

```bash
./setup-and-run.sh
```

This single command will:
- Install all dependencies
- Set up PostgreSQL (Docker or local)
- Create environment files with auto-generated secrets
- Set up and seed the database
- Start all development servers

**Daily development:**

```bash
./quick-start.sh
```

**Stop everything:**

```bash
./stop.sh
```

See [QUICK-START.md](QUICK-START.md) for detailed usage of all helper scripts.

### Manual Installation

If you prefer manual setup, see [SETUP.md](SETUP.md) for step-by-step instructions.

## Project Structure

```
qa-automation-platform/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── shared/       # Shared types, DTOs, constants
│   └── ui/           # Shared React components
└── ...
```

## Access Points

After starting the servers:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation** (Swagger): http://localhost:3001/api/docs

## Test Users

The database is seeded with these test accounts:

| Role       | Email                           | Password       |
|------------|---------------------------------|----------------|
| Admin      | admin@qa-platform.com           | admin123       |
| Instructor | instructor@qa-platform.com      | instructor123  |
| Student    | student@qa-platform.com         | student123     |

## Development

```bash
# Run all apps in development mode
pnpm dev

# Build all apps
pnpm build

# Lint all apps
pnpm lint

# Run tests
pnpm test
```

## Useful Scripts

```bash
./setup-and-run.sh    # First-time setup + start servers
./quick-start.sh      # Quick start (after initial setup)
./restart.sh          # Restart all services
./stop.sh             # Stop all services
```

## License

MIT
