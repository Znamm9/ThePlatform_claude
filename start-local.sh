#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}QA Automation Platform - Local Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if PostgreSQL is running
echo -e "${YELLOW}Checking PostgreSQL...${NC}"
if sudo service postgresql status >/dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is running${NC}"
else
    echo -e "${YELLOW}Starting PostgreSQL...${NC}"
    sudo service postgresql start
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ PostgreSQL started${NC}"
    else
        echo -e "${RED}✗ Failed to start PostgreSQL${NC}"
        echo -e "${RED}Please install PostgreSQL first:${NC}"
        echo -e "${RED}  sudo apt-get update && sudo apt-get install postgresql${NC}"
        exit 1
    fi
fi

echo ""

# Navigate to project root
cd /home/vadym/projects/thePlatform

# Check if database is set up
echo -e "${YELLOW}Setting up database...${NC}"
cd apps/api

# Generate Prisma Client
echo -e "${YELLOW}Generating Prisma Client...${NC}"
pnpm prisma:generate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Prisma Client generated${NC}"
else
    echo -e "${RED}✗ Failed to generate Prisma Client${NC}"
    exit 1
fi

# Run migrations
echo -e "${YELLOW}Running database migrations...${NC}"
pnpm prisma:migrate
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database migrations complete${NC}"
else
    echo -e "${YELLOW}Note: Migrations may have already been applied${NC}"
fi

# Seed database
echo -e "${YELLOW}Seeding database with test data...${NC}"
pnpm prisma:seed
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Database seeded${NC}"
else
    echo -e "${YELLOW}Note: Database may already be seeded${NC}"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Starting Development Servers${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Go back to root
cd /home/vadym/projects/thePlatform

echo -e "${YELLOW}Starting Backend API on port 3001...${NC}"
echo -e "${YELLOW}Starting Frontend Web on port 3000...${NC}"
echo ""

# Start both servers using turbo
pnpm dev

