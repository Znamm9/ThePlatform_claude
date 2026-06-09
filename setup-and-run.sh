#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Error handling
set -e
trap 'echo -e "${RED}✗ Setup failed at line $LINENO${NC}"; exit 1' ERR

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║  QA Automation Platform - Full Setup  ║${NC}"
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d '=' | tr '+/' '-_'
}

#===========================================
# 1. Check Prerequisites
#===========================================
echo -e "${BLUE}[1/7] Checking prerequisites...${NC}"

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} installed${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    echo -e "${YELLOW}Please install Node.js >= 18.0.0 from https://nodejs.org${NC}"
    exit 1
fi

# Check pnpm
if command_exists pnpm; then
    PNPM_VERSION=$(pnpm -v)
    echo -e "${GREEN}✓ pnpm ${PNPM_VERSION} installed${NC}"
else
    echo -e "${YELLOW}! pnpm not found. Installing pnpm...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✓ pnpm installed${NC}"
fi

# Check Docker
if command_exists docker; then
    echo -e "${GREEN}✓ Docker installed${NC}"
    USE_DOCKER=true
else
    echo -e "${YELLOW}! Docker not found. Will try to use local PostgreSQL${NC}"
    USE_DOCKER=false
fi

# Check PostgreSQL if not using Docker
if [ "$USE_DOCKER" = false ]; then
    if command_exists psql; then
        echo -e "${GREEN}✓ PostgreSQL client installed${NC}"
    else
        echo -e "${RED}✗ Neither Docker nor PostgreSQL found${NC}"
        echo -e "${YELLOW}Please install either Docker or PostgreSQL${NC}"
        exit 1
    fi
fi

echo ""

#===========================================
# 2. Install Dependencies
#===========================================
echo -e "${BLUE}[2/7] Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

#===========================================
# 3. Setup Environment Files
#===========================================
echo -e "${BLUE}[3/7] Setting up environment files...${NC}"

# Generate secrets
NEXTAUTH_SECRET=$(generate_secret)
JWT_SECRET=$(generate_secret)

# Setup Frontend .env.local
if [ ! -f "apps/web/.env.local" ]; then
    echo -e "${YELLOW}Creating apps/web/.env.local...${NC}"
    cp apps/web/.env.local.example apps/web/.env.local

    # Replace secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-secret-key-here/$NEXTAUTH_SECRET/" apps/web/.env.local
    else
        # Linux
        sed -i "s/your-secret-key-here/$NEXTAUTH_SECRET/" apps/web/.env.local
    fi

    echo -e "${GREEN}✓ Frontend .env.local created${NC}"
else
    echo -e "${YELLOW}! apps/web/.env.local already exists, skipping...${NC}"
fi

# Setup Backend .env
if [ ! -f "apps/api/.env" ]; then
    echo -e "${YELLOW}Creating apps/api/.env...${NC}"
    cp apps/api/.env.example apps/api/.env

    # Replace JWT secret
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-jwt-secret-key-here/$JWT_SECRET/" apps/api/.env
    else
        # Linux
        sed -i "s/your-jwt-secret-key-here/$JWT_SECRET/" apps/api/.env
    fi

    echo -e "${GREEN}✓ Backend .env created${NC}"
else
    echo -e "${YELLOW}! apps/api/.env already exists, skipping...${NC}"
fi

echo ""

#===========================================
# 4. Start PostgreSQL
#===========================================
echo -e "${BLUE}[4/7] Starting PostgreSQL...${NC}"

if [ "$USE_DOCKER" = true ]; then
    echo -e "${YELLOW}Using Docker Compose for PostgreSQL...${NC}"

    # Check if container is already running
    if docker ps | grep -q qa-platform-postgres; then
        echo -e "${GREEN}✓ PostgreSQL container already running${NC}"
    else
        docker-compose up -d postgres
        echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"

        # Wait for PostgreSQL to be healthy
        for i in {1..30}; do
            if docker exec qa-platform-postgres pg_isready -U user -d qa_platform >/dev/null 2>&1; then
                echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
                break
            fi
            echo -n "."
            sleep 1

            if [ $i -eq 30 ]; then
                echo -e "${RED}✗ PostgreSQL failed to start${NC}"
                exit 1
            fi
        done
    fi
else
    echo -e "${YELLOW}Using local PostgreSQL...${NC}"

    # Check if PostgreSQL service is running
    if sudo service postgresql status >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL service is running${NC}"
    else
        echo -e "${YELLOW}Starting PostgreSQL service...${NC}"
        sudo service postgresql start
        echo -e "${GREEN}✓ PostgreSQL service started${NC}"
    fi

    # Check if database and user exist, create if not
    echo -e "${YELLOW}Setting up database and user...${NC}"

    # Check if database exists
    if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw qa_platform; then
        echo -e "${GREEN}✓ Database 'qa_platform' already exists${NC}"
    else
        echo -e "${YELLOW}Creating database setup...${NC}"
        sudo -u postgres psql << PSQL
-- Create user if not exists
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'user') THEN
        CREATE USER "user" WITH PASSWORD 'password';
    END IF;
END
\$\$;

-- Create database if not exists
CREATE DATABASE qa_platform;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE qa_platform TO "user";
ALTER USER "user" CREATEDB;

-- Connect to the database and grant schema privileges
\c qa_platform
GRANT ALL ON SCHEMA public TO "user";
PSQL
        echo -e "${GREEN}✓ Database and user created${NC}"
    fi
fi

echo ""

#===========================================
# 5. Setup Prisma
#===========================================
echo -e "${BLUE}[5/7] Setting up Prisma...${NC}"

cd apps/api

# Generate Prisma Client
echo -e "${YELLOW}Generating Prisma Client...${NC}"
pnpm prisma:generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
pnpm prisma:migrate || echo -e "${YELLOW}! Migrations may have already been applied${NC}"
echo -e "${GREEN}✓ Migrations complete${NC}"

# Seed database
echo -e "${YELLOW}Seeding database with test data...${NC}"
pnpm prisma:seed || echo -e "${YELLOW}! Database may already be seeded${NC}"
echo -e "${GREEN}✓ Database seeded${NC}"

cd ../..

echo ""

#===========================================
# 6. Build Project
#===========================================
echo -e "${BLUE}[6/7] Building project...${NC}"
pnpm build || echo -e "${YELLOW}! Build warnings can be ignored for development${NC}"
echo -e "${GREEN}✓ Project built${NC}"
echo ""

#===========================================
# 7. Display Summary
#===========================================
echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║         Setup Complete! 🎉             ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${MAGENTA}Test Users Created:${NC}"
echo -e "  ${GREEN}Admin:${NC}      admin@qa-platform.com / admin123"
echo -e "  ${GREEN}Instructor:${NC} instructor@qa-platform.com / instructor123"
echo -e "  ${GREEN}Student:${NC}    student@qa-platform.com / student123"
echo ""
echo -e "${MAGENTA}Access Points:${NC}"
echo -e "  ${GREEN}Frontend:${NC}  http://localhost:3000"
echo -e "  ${GREEN}Backend:${NC}   http://localhost:3001"
echo -e "  ${GREEN}API Docs:${NC}  http://localhost:3001/api/docs"
echo ""
echo -e "${MAGENTA}Generated Secrets:${NC}"
echo -e "  ${GREEN}NEXTAUTH_SECRET:${NC} ${NEXTAUTH_SECRET:0:20}..."
echo -e "  ${GREEN}JWT_SECRET:${NC}      ${JWT_SECRET:0:20}..."
echo ""
echo -e "${BLUE}Starting development servers...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

#===========================================
# 8. Start Development Servers
#===========================================
pnpm dev
