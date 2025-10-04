#!/bin/bash

# Local Development Startup Script
# This script helps you quickly start both frontend and backend

echo "🚀 Starting Founder CRM - Local Development"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}✗${NC} backend/.env not found"
    echo -e "${YELLOW}Creating from template...${NC}"
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✓${NC} Created backend/.env"
    echo -e "${YELLOW}⚠ Please edit backend/.env with your database credentials${NC}"
    echo ""
    read -p "Press Enter when you've updated backend/.env..."
fi

# Check if frontend .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${RED}✗${NC} frontend/.env.local not found"
    echo -e "${YELLOW}Creating...${NC}"
    echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env.local
    echo -e "${GREEN}✓${NC} Created frontend/.env.local"
fi

echo ""
echo "📦 Checking dependencies..."
echo ""

# Check backend dependencies
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${GREEN}✓${NC} Backend dependencies exist"
fi

# Check frontend dependencies
if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${GREEN}✓${NC} Frontend dependencies exist"
fi

echo ""
echo "=========================================="
echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo "Starting servers..."
echo ""
echo -e "${BLUE}Backend:${NC}  http://localhost:5000"
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""
echo "=========================================="
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo ""
    echo "Stopping servers..."
    kill 0
}

trap cleanup EXIT

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait
