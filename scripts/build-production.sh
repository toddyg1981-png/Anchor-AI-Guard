#!/bin/bash

# Production Build Script
# Runs all necessary checks before building for production

set -e  # Exit on any error

echo "🔍 Starting production build process..."

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Clean
echo -e "${YELLOW}📦 Cleaning build artifacts...${NC}"
npm run clean || true

# Step 2: Install dependencies
echo -e "${YELLOW}📥 Installing dependencies...${NC}"
npm ci

# Step 3: Type check
echo -e "${YELLOW}🔍 Running TypeScript type check...${NC}"
npm run type-check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Type check passed${NC}"
else
    echo -e "${RED}✗ Type check failed${NC}"
    exit 1
fi

# Step 4: Lint
echo -e "${YELLOW}🧹 Running ESLint...${NC}"
npm run lint
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Linting passed${NC}"
else
    echo -e "${RED}✗ Linting failed${NC}"
    exit 1
fi

# Step 5: Format check
echo -e "${YELLOW}💅 Checking code formatting...${NC}"
npm run format:check
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Format check passed${NC}"
else
    echo -e "${RED}✗ Format check failed${NC}"
    exit 1
fi

# Step 6: Tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test:coverage
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Tests passed${NC}"
else
    echo -e "${RED}✗ Tests failed${NC}"
    exit 1
fi

# Step 7: Security audit
echo -e "${YELLOW}🔒 Running security audit...${NC}"
npm audit --audit-level=moderate || echo -e "${YELLOW}⚠️  Security warnings found (continuing)${NC}"

# Step 8: Build
echo -e "${YELLOW}🏗️  Building for production...${NC}"
npm run build:production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}"
else
    echo -e "${RED}✗ Build failed${NC}"
    exit 1
fi

# Step 9: Check build size
echo -e "${YELLOW}📊 Checking build size...${NC}"
du -sh dist
find dist -name "*.js" -exec du -h {} \; | sort -hr | head -10

echo ""
echo -e "${GREEN}✅ Production build completed successfully!${NC}"
echo -e "${GREEN}📦 Build artifacts are in ./dist${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Preview: npm run preview"
echo "  2. Deploy: Follow deployment guide in docs/DEPLOYMENT.md"
echo ""
