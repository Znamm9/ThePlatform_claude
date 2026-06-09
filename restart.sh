#!/bin/bash

# Colors for output
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Restarting QA Automation Platform...${NC}"
echo ""

# Stop everything
./stop.sh

echo ""
echo -e "${BLUE}Waiting 2 seconds...${NC}"
sleep 2

echo ""
echo -e "${BLUE}Starting development servers...${NC}"
echo ""

# Start development servers
pnpm dev
