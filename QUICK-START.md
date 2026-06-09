# Quick Start Guide

This guide shows you how to quickly set up and run the QA Automation Platform.

## Available Scripts

We've created several helper scripts to make your life easier:

### 🚀 First Time Setup

```bash
./setup-and-run.sh
```

**Use this for first-time setup.** This script will:
- ✅ Check prerequisites (Node.js, pnpm, Docker/PostgreSQL)
- ✅ Install all dependencies
- ✅ Create environment files with auto-generated secrets
- ✅ Start PostgreSQL (Docker or local)
- ✅ Set up database (migrations + seed data)
- ✅ Build the project
- ✅ Start both frontend and backend servers

**First time? This is the only command you need!**

---

### ⚡ Quick Start (After Initial Setup)

```bash
./quick-start.sh
```

**Use this to start the project after you've already run setup.** This script will:
- ✅ Start PostgreSQL
- ✅ Start development servers

**Already set up? Use this for daily development!**

---

### 🔄 Restart Servers

```bash
./restart.sh
```

Stops all running services and starts them again. Useful when you need a clean restart.

---

### 🛑 Stop Everything

```bash
./stop.sh
```

Stops all running services:
- Stops PostgreSQL Docker container (if using Docker)
- Kills processes on ports 3000 and 3001
- Cleans up all running services

---

## Manual Commands

If you prefer to run commands manually:

### Start Development Servers

```bash
pnpm dev
```

This starts both frontend (port 3000) and backend (port 3001).

### Start Individual Services

```bash
# Frontend only
cd apps/web
pnpm dev

# Backend only
cd apps/api
pnpm dev
```

### Database Commands

```bash
cd apps/api

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database
pnpm prisma:seed

# Open Prisma Studio (database GUI)
pnpm prisma:studio
```

### Docker Commands

```bash
# Start PostgreSQL
docker-compose up -d postgres

# Stop PostgreSQL
docker-compose down

# View logs
docker-compose logs -f postgres
```

---

## Access Points

After starting the servers:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation** (Swagger): http://localhost:3001/api/docs

---

## Test Users

The database is seeded with these test accounts:

| Role       | Email                           | Password       |
|------------|---------------------------------|----------------|
| Admin      | admin@qa-platform.com           | admin123       |
| Instructor | instructor@qa-platform.com      | instructor123  |
| Student    | student@qa-platform.com         | student123     |

---

## Troubleshooting

### Port Already in Use

If you get an error about ports being in use:

```bash
# Stop everything first
./stop.sh

# Then start again
./quick-start.sh
```

### Database Connection Error

Make sure PostgreSQL is running:

```bash
# If using Docker
docker-compose up -d postgres

# If using local PostgreSQL
sudo service postgresql start
```

### Environment Files Missing

Run the full setup again:

```bash
./setup-and-run.sh
```

### Clean Restart

```bash
# Stop everything
./stop.sh

# Wait a moment
sleep 2

# Start development servers
pnpm dev
```

---

## Workflow Examples

### First Day

```bash
# Clone the repo (already done)
# cd into project directory

# Run full setup (only once)
./setup-and-run.sh
```

### Daily Development

```bash
# Start your work day
./quick-start.sh

# Make changes, test, code...

# End of day
./stop.sh
```

### Something's Not Working

```bash
# Clean restart
./restart.sh

# Or nuclear option - full setup again
./setup-and-run.sh
```

---

## What Gets Created

The setup scripts create:

### Environment Files
- `apps/web/.env.local` - Frontend configuration
- `apps/api/.env` - Backend configuration

### Database
- PostgreSQL database: `qa_platform`
- User: `user` / Password: `password`
- Seeded with test data and users

### Docker Container
- Container name: `qa-platform-postgres`
- Port: 5432
- Volume: `postgres_data` (persistent storage)

---

## Tips

1. **Always use `./quick-start.sh`** for daily development after initial setup
2. **Use `./stop.sh`** before closing your computer to clean up processes
3. **Use `./restart.sh`** if things feel broken
4. **Only use `./setup-and-run.sh`** for first-time setup or when starting fresh

---

## Need More Help?

- Check `SETUP.md` for detailed setup instructions
- Check `README.md` for project overview
- Check `LOCAL-SETUP-GUIDE.md` for local development guide
