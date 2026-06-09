#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║    QA Automation Platform - Start     ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

#===========================================
# 1. Check if setup has been run
#===========================================
if [ ! -f "apps/web/.env.local" ] || [ ! -f "apps/api/.env" ]; then
    echo -e "${YELLOW}! Environment files not found${NC}"
    echo -e "${YELLOW}! Running full setup first...${NC}"
    echo ""
    ./setup-and-run.sh
    exit 0
fi

#===========================================
# 2. Start PostgreSQL
#===========================================
echo -e "${BLUE}[1/2] Starting PostgreSQL...${NC}"

if command_exists docker && [ -f "docker-compose.yml" ]; then
    # Use Docker
    if docker ps | grep -q qa-platform-postgres; then
        echo -e "${GREEN}✓ PostgreSQL container already running${NC}"
    else
        docker-compose up -d postgres
        echo -e "${YELLOW}Waiting for PostgreSQL...${NC}"
        sleep 3
        echo -e "${GREEN}✓ PostgreSQL started${NC}"
    fi
else
    # Use local PostgreSQL
    if sudo service postgresql status >/dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is running${NC}"
    else
        sudo service postgresql start
        echo -e "${GREEN}✓ PostgreSQL started${NC}"
    fi
fi

echo ""

#===========================================
# 3. Start Development Servers
#===========================================
echo -e "${BLUE}[2/2] Starting development servers...${NC}"
echo ""
echo -e "${CYAN}Access Points:${NC}"
echo -e "  ${GREEN}Frontend:${NC}  http://localhost:3000"
echo -e "  ${GREEN}Backend:${NC}   http://localhost:3001"
echo -e "  ${GREEN}API Docs:${NC}  http://localhost:3001/api/docs"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all servers${NC}"
echo ""

pnpm dev
