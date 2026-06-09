#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Stopping QA Automation Platform...${NC}"
echo ""

# Stop Docker containers if running
if command -v docker >/dev/null 2>&1; then
    if docker ps | grep -q qa-platform-postgres; then
        echo -e "${YELLOW}Stopping PostgreSQL container...${NC}"
        docker-compose down
        echo -e "${GREEN}✓ PostgreSQL container stopped${NC}"
    else
        echo -e "${YELLOW}! PostgreSQL container not running${NC}"
    fi
fi

# Kill any running Node processes on ports 3000 and 3001
echo -e "${YELLOW}Checking for running Node processes...${NC}"

# Check port 3000 (Frontend)
PID_3000=$(lsof -ti:3000 2>/dev/null || true)
if [ -n "$PID_3000" ]; then
    echo -e "${YELLOW}Stopping process on port 3000 (PID: $PID_3000)...${NC}"
    kill -9 $PID_3000 2>/dev/null || true
    echo -e "${GREEN}✓ Frontend stopped${NC}"
else
    echo -e "${YELLOW}! No process running on port 3000${NC}"
fi

# Check port 3001 (Backend)
PID_3001=$(lsof -ti:3001 2>/dev/null || true)
if [ -n "$PID_3001" ]; then
    echo -e "${YELLOW}Stopping process on port 3001 (PID: $PID_3001)...${NC}"
    kill -9 $PID_3001 2>/dev/null || true
    echo -e "${GREEN}✓ Backend stopped${NC}"
else
    echo -e "${YELLOW}! No process running on port 3001${NC}"
fi

echo ""
echo -e "${GREEN}All services stopped${NC}"
