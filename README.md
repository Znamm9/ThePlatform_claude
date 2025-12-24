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
- pnpm >= 8.0.0
- PostgreSQL

### Install pnpm

If you don't have pnpm installed:

```bash
npm install -g pnpm
```

Or using standalone script:

```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
```

### Installation

```bash
# Install dependencies
pnpm install

# Run development servers
pnpm dev
```

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

## License

MIT
