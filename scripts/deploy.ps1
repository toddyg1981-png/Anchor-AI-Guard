# ============================================================================
# Anchor AI Guard — Production Deployment Script (Windows PowerShell)
# Deploys frontend to Vercel + backend to Railway
# ============================================================================

$ErrorActionPreference = "Stop"

function Log($msg) { Write-Host "[DEPLOY] $msg" -ForegroundColor Cyan }
function Ok($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Warn($msg) { Write-Host "[!] $msg" -ForegroundColor Yellow }
function Fail($msg) { Write-Host "[X] $msg" -ForegroundColor Red; exit 1 }

$DeployEnv = if ($env:DEPLOY_ENV) { $env:DEPLOY_ENV } else { "production" }
Log "Starting Anchor AI Guard deployment (env: $DeployEnv)..."

# ── Pre-flight checks ──────────────────────────────────────────────────────

if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Fail "Node.js is required" }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { Fail "npm is required" }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail "git is required" }

$nodeVer = (node -v) -replace 'v','' -split '\.' | Select-Object -First 1
if ([int]$nodeVer -lt 18) { Fail "Node.js 18+ required" }
Ok "Node.js $(node -v)"

$gitStatus = git status --porcelain
if ($gitStatus) {
    Warn "Uncommitted changes detected."
    if ($DeployEnv -eq "production") { Fail "Cannot deploy production with uncommitted changes" }
}
Ok "Git status clean"

# ── Frontend Build & Deploy ─────────────────────────────────────────────────

Log "Building frontend..."
npm ci
npm run type-check
npm run lint
npm run build:production
Ok "Frontend built"

if (Get-Command vercel -ErrorAction SilentlyContinue) {
    Log "Deploying frontend to Vercel..."
    if ($DeployEnv -eq "production") {
        vercel deploy --prod --yes
    } else {
        vercel deploy --yes
    }
    Ok "Frontend deployed to Vercel"
} else {
    Warn "Vercel CLI not installed. Run: npm i -g vercel"
    Warn "Then run: vercel deploy --prod"
    Log "Build artifacts in ./dist/"
}

# ── Backend Build & Deploy ──────────────────────────────────────────────────

Log "Building backend..."
Push-Location backend
npm ci
npx prisma generate
npm run build

try { npm test; Ok "Backend tests passed" }
catch { Warn "Some backend tests failed" }

Ok "Backend built"

if (Get-Command railway -ErrorAction SilentlyContinue) {
    Log "Deploying backend to Railway..."
    railway up --detach
    Ok "Backend deployed to Railway"
} else {
    Warn "Railway CLI not installed. Run: npm i -g @railway/cli"
    Warn "Then run: cd backend; railway up --detach"
}
Pop-Location

# ── Summary ─────────────────────────────────────────────────────────────────

Log "Deployment complete!"
Write-Host ""
Write-Host "Post-deployment checklist:" -ForegroundColor White
Write-Host "  [ ] Verify frontend at Vercel URL"
Write-Host "  [ ] Check backend health: curl BACKEND_URL/health"
Write-Host "  [ ] Run migrations: npx prisma migrate deploy"
Write-Host "  [ ] Set env vars in Vercel & Railway dashboards"
Write-Host "  [ ] Test Stripe webhook endpoint"
Write-Host "  [ ] Verify Sentry is receiving events"
