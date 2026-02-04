#!/usr/bin/env pwsh

# Production Build Script for Windows PowerShell
# Runs all necessary checks before building for production

$ErrorActionPreference = "Stop"

Write-Host "🔍 Starting production build process..." -ForegroundColor Cyan

function Write-Success {
    param($Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param($Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

function Write-Step {
    param($Message)
    Write-Host "`n$Message" -ForegroundColor Yellow
}

try {
    # Step 1: Clean
    Write-Step "📦 Cleaning build artifacts..."
    try { npm run clean } catch { }

    # Step 2: Install dependencies
    Write-Step "📥 Installing dependencies..."
    npm ci
    if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed" }

    # Step 3: Type check
    Write-Step "🔍 Running TypeScript type check..."
    npm run type-check
    if ($LASTEXITCODE -ne 0) { throw "Type check failed" }
    Write-Success "Type check passed"

    # Step 4: Lint
    Write-Step "🧹 Running ESLint..."
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "Linting failed" }
    Write-Success "Linting passed"

    # Step 5: Format check
    Write-Step "💅 Checking code formatting..."
    npm run format:check
    if ($LASTEXITCODE -ne 0) { throw "Format check failed" }
    Write-Success "Format check passed"

    # Step 6: Tests
    Write-Step "🧪 Running tests..."
    npm run test:coverage
    if ($LASTEXITCODE -ne 0) { throw "Tests failed" }
    Write-Success "Tests passed"

    # Step 7: Security audit
    Write-Step "🔒 Running security audit..."
    npm audit --audit-level=moderate
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Security warnings found (continuing)" -ForegroundColor Yellow
    }

    # Step 8: Build
    Write-Step "🏗️  Building for production..."
    npm run build:production
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }
    Write-Success "Build successful"

    # Step 9: Check build size
    Write-Step "📊 Checking build size..."
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Total size: $([math]::Round($distSize, 2)) MB"

    Write-Host "`n✅ Production build completed successfully!" -ForegroundColor Green
    Write-Host "📦 Build artifacts are in ./dist" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "  1. Preview: npm run preview"
    Write-Host "  2. Deploy: Follow deployment guide in docs/DEPLOYMENT.md"
    Write-Host ""

} catch {
    Write-Host "`n❌ Build failed: $_" -ForegroundColor Red
    exit 1
}
