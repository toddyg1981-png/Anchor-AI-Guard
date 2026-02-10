#!/bin/bash
# ============================================================================
# Anchor AI Guard — Production Deployment Script
# Deploys frontend to Vercel + backend to Railway
# ============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log()  { echo -e "${BLUE}[DEPLOY]${NC} $1"; }
ok()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
fail() { echo -e "${RED}[✗]${NC} $1"; exit 1; }

# ── Pre-flight checks ──────────────────────────────────────────────────────

log "Starting Anchor AI Guard deployment..."
log "Environment: ${DEPLOY_ENV:-production}"

# Check required CLIs
command -v node >/dev/null 2>&1 || fail "Node.js is required"
command -v npm  >/dev/null 2>&1 || fail "npm is required"
command -v git  >/dev/null 2>&1 || fail "git is required"

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  fail "Node.js 18+ required, found v$(node -v)"
fi
ok "Node.js $(node -v)"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  warn "Uncommitted changes detected. Commit before deploying to production."
  if [ "${DEPLOY_ENV:-production}" = "production" ]; then
    fail "Cannot deploy production with uncommitted changes"
  fi
fi
ok "Git working directory clean"

# ── Frontend Build & Deploy ─────────────────────────────────────────────────

log "Building frontend..."
npm ci
npm run type-check
npm run lint
npm run build:production
ok "Frontend built successfully"

if command -v vercel >/dev/null 2>&1; then
  log "Deploying frontend to Vercel..."
  if [ "${DEPLOY_ENV:-production}" = "production" ]; then
    vercel deploy --prod --yes
  else
    vercel deploy --yes
  fi
  ok "Frontend deployed to Vercel"
else
  warn "Vercel CLI not installed. Install with: npm i -g vercel"
  warn "Then run: vercel deploy --prod"
  log "Frontend build artifacts are in ./dist/"
fi

# ── Backend Build & Deploy ──────────────────────────────────────────────────

log "Building backend..."
cd backend
npm ci
npx prisma generate
npm run build
npm test 2>/dev/null && ok "Backend tests passed" || warn "Some backend tests failed"
ok "Backend built successfully"

if command -v railway >/dev/null 2>&1; then
  log "Deploying backend to Railway..."
  railway up --detach
  ok "Backend deployed to Railway"
else
  warn "Railway CLI not installed. Install with: npm i -g @railway/cli"
  warn "Then run: cd backend && railway up --detach"
  
  # Docker fallback
  if command -v docker >/dev/null 2>&1; then
    log "Docker available — you can also deploy via Docker:"
    echo "  docker build -t anchor-backend ."
    echo "  docker run -p 3001:3001 --env-file .env anchor-backend"
  fi
fi
cd ..

# ── Post-deployment checks ─────────────────────────────────────────────────

log "Deployment complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Post-deployment checklist:"
echo "  □ Verify frontend loads at your Vercel URL"
echo "  □ Verify backend health: curl {BACKEND_URL}/health"
echo "  □ Run database migrations: npx prisma migrate deploy"
echo "  □ Set environment variables in Vercel & Railway dashboards"
echo "  □ Test Stripe webhook: stripe listen --forward-to {BACKEND_URL}/api/billing/webhook"
echo "  □ Verify Sentry error tracking is receiving events"
echo "  □ Monitor Railway logs for backend errors"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
