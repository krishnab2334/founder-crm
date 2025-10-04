#!/bin/bash

# Deployment Checklist Script
# Run this before deploying to catch common issues

echo "🚀 Founder CRM - Pre-Deployment Checklist"
echo "=========================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Check Node version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 18 ]; then
    echo -e "${GREEN}✓${NC} Node.js version: $(node -v)"
else
    echo -e "${RED}✗${NC} Node.js version too old. Need 18+, found: $(node -v)"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check if required files exist
echo "📁 Checking required configuration files..."

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
    else
        echo -e "${RED}✗${NC} $1 missing"
        ERRORS=$((ERRORS + 1))
    fi
}

check_file "frontend/vercel.json"
check_file "frontend/.env.example"
check_file "backend/render.yaml"
check_file "backend/.env.example"
check_file "backend/src/config/database.sql"
check_file "backend/src/config/add_beautified_status.sql"
echo ""

# Check package.json files
echo "📦 Checking package.json files..."
check_file "frontend/package.json"
check_file "backend/package.json"
echo ""

# Check for .env files (should NOT be in git)
echo "🔒 Checking for sensitive files..."
if [ -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠${NC} backend/.env exists - ensure it's in .gitignore"
    WARNINGS=$((WARNINGS + 1))
fi
if [ -f "frontend/.env" ]; then
    echo -e "${YELLOW}⚠${NC} frontend/.env exists - ensure it's in .gitignore"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check for node_modules in git
echo "📦 Checking node_modules..."
if [ -d "frontend/node_modules" ] && git check-ignore frontend/node_modules > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} frontend/node_modules properly ignored"
else
    echo -e "${YELLOW}⚠${NC} Check frontend/node_modules in .gitignore"
    WARNINGS=$((WARNINGS + 1))
fi

if [ -d "backend/node_modules" ] && git check-ignore backend/node_modules > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} backend/node_modules properly ignored"
else
    echo -e "${YELLOW}⚠${NC} Check backend/node_modules in .gitignore"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check git status
echo "🔍 Checking git status..."
if [ -d ".git" ]; then
    UNCOMMITTED=$(git status --porcelain | wc -l)
    if [ "$UNCOMMITTED" -eq 0 ]; then
        echo -e "${GREEN}✓${NC} No uncommitted changes"
    else
        echo -e "${YELLOW}⚠${NC} You have $UNCOMMITTED uncommitted change(s)"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    BRANCH=$(git branch --show-current)
    echo -e "Current branch: ${YELLOW}$BRANCH${NC}"
else
    echo -e "${RED}✗${NC} Not a git repository"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check documentation
echo "📚 Checking documentation..."
check_file "DEPLOYMENT_GUIDE.md"
check_file "QUICK_DEPLOY.md"
check_file "README_DEPLOYMENT.md"
echo ""

# Summary
echo "=========================================="
echo "Summary:"
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Read QUICK_DEPLOY.md for deployment instructions"
    echo "2. Set up your database (Railway recommended)"
    echo "3. Deploy backend to Render"
    echo "4. Deploy frontend to Vercel"
    echo "5. Test your application"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ $WARNINGS warning(s) found. Review before deploying.${NC}"
    echo ""
    echo "You can proceed, but address warnings if possible."
else
    echo -e "${RED}✗ $ERRORS error(s) found. Fix before deploying.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ Also found $WARNINGS warning(s).${NC}"
    fi
    echo ""
    echo "Fix errors above before deploying."
    exit 1
fi

echo ""
echo "🚀 Good luck with your deployment!"
