# Branch Protection Guide

This document outlines the recommended branch protection settings for the Anchor AI Guard repository.

## Recommended Branch Protection Rules for `main`

Apply these settings in **Settings → Branches → Branch protection rules → Add rule** for the `main` branch:

### Required Reviews
- **Require a pull request before merging**: ✅ Enabled
- **Required approving reviews**: 1 (minimum)
- **Dismiss stale pull request approvals when new commits are pushed**: ✅ Enabled
- **Require review from Code Owners**: ✅ Enabled (uses `.github/CODEOWNERS`)

### Required Status Checks
- **Require status checks to pass before merging**: ✅ Enabled
- **Required checks**:
  - `Code Quality` (lint, format, type-check)
  - `Test` (unit tests with coverage)
  - `Build` (production build)
  - `Security Audit` (npm audit, Snyk)
  - `Backend CI` (backend build and type-check)
  - `Anchor Security Scan` (security scanning)

### Additional Protections
- **Require signed commits**: ✅ Recommended
- **Require linear history**: ✅ Recommended (enforces squash or rebase merges)
- **Include administrators**: ✅ Enabled (rules apply to admins too)
- **Restrict who can push to matching branches**: ✅ Enabled
- **Allow force pushes**: ❌ Disabled
- **Allow deletions**: ❌ Disabled

## Recommended Branch Protection Rules for `develop`

Apply similar settings with relaxed requirements:

### Required Reviews
- **Require a pull request before merging**: ✅ Enabled
- **Required approving reviews**: 1

### Required Status Checks
- **Require status checks to pass before merging**: ✅ Enabled
- **Required checks**:
  - `Code Quality`
  - `Test`

## How to Apply These Settings

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add branch protection rule**
4. Enter `main` as the branch name pattern
5. Configure the settings listed above
6. Click **Create** or **Save changes**
7. Repeat for the `develop` branch with relaxed settings

## CODEOWNERS

The `.github/CODEOWNERS` file automatically assigns reviewers based on file paths. When a pull request modifies files matching a pattern in CODEOWNERS, the listed owners are automatically requested for review.

See [`.github/CODEOWNERS`](.github/CODEOWNERS) for the current configuration.

## CI/CD Pipeline Protection

The CI/CD pipeline (`.github/workflows/ci-cd.yml`) enforces:

- **Code Quality**: ESLint, Prettier formatting, TypeScript type checking
- **Testing**: Unit tests with coverage reporting
- **Security**: npm audit, Snyk scanning, Anchor Security Scanner
- **Build Verification**: Staging and production builds must succeed
- **Deployment Gates**: Production deployments only from `main` branch

## Security Scanning

The Anchor Security Scanner (`.github/workflows/anchor-security.yml`) runs:
- On every push to `main` and `develop`
- On every pull request targeting `main` and `develop`
- Weekly scheduled scans (Monday at 6 AM UTC)
