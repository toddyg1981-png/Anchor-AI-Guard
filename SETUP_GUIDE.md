# 🚀 Anchor Security - Setup Guide

This guide will help you set up Anchor Security from scratch to production.

## Prerequisites

- **Node.js** 18.x or higher
- **PostgreSQL** 14.x or higher
- **npm** 9.x or higher

## 📋 Quick Start (5 minutes)

### 1. Clone & Install

```bash
git clone https://github.com/your-org/anchor.git
cd anchor

# Install all dependencies
npm install
cd backend && npm install
cd ../cli && npm install
cd ..
```

### 2. Set Up Database

```bash
# Option A: Local PostgreSQL
createdb anchor_security

# Option B: Use Docker
docker run -d --name anchor-db \
  -e POSTGRES_USER=anchor \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=anchor_security \
  -p 5432:5432 \
  postgres:15

# Option C: Use Supabase/Railway/Neon (see .env.example)
```

### 3. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp .env.example .env.local
# Edit .env.local with your values
```

### 4. Initialize Database

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### 5. Start Development

```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend
npm run dev
```

Visit `http://localhost:3000` 🎉

---

## 🔑 Required External Services

### 1. Stripe (Billing) - REQUIRED

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Create account or log in
3. Get API keys from **Developers → API keys**
4. Create webhook at **Developers → Webhooks**
   - Endpoint URL: `https://your-domain.com/api/billing/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_failed`
5. Copy webhook secret

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. GitHub OAuth - REQUIRED

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Application name: `Anchor Security`
   - Homepage URL: `https://your-domain.com`
   - Callback URL: `https://your-domain.com/api/auth/github/callback`
4. Copy Client ID and generate Client Secret

```env
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### 3. Google OAuth - RECOMMENDED

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Go to **APIs & Services → Credentials**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URI: `https://your-domain.com/api/auth/google/callback`
6. Copy Client ID and Secret

```env
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### 4. Resend (Email) - REQUIRED

1. Go to [Resend](https://resend.com)
2. Create account
3. Add and verify your domain
4. Get API key from **API Keys**

```env
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com
```

### 5. Gemini AI - REQUIRED

1. Go to [Google AI Studio](https://makersuite.google.com)
2. Click **Get API Key**
3. Create new API key

```env
GEMINI_API_KEY=...
```

### 6. Sentry (Error Monitoring) - OPTIONAL

1. Go to [Sentry](https://sentry.io)
2. Create new project (Node.js)
3. Copy DSN from project settings

```env
SENTRY_DSN=https://...@sentry.io/...
```

---

## 🚀 Production Deployment

### Option A: Vercel + Railway

**Frontend (Vercel):**
```bash
npm i -g vercel
vercel
```

**Backend (Railway):**
1. Push to GitHub
2. Connect Railway to your repo
3. Add environment variables
4. Railway auto-deploys

### Option B: Docker

```bash
# Build images
docker build -t anchor-frontend .
docker build -t anchor-backend ./backend

# Run with docker-compose
docker-compose up -d
```

### Option C: VPS (Ubuntu)

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Clone and setup
git clone https://github.com/your-org/anchor.git
cd anchor
npm install
cd backend && npm install && npx prisma migrate deploy

# Use PM2 for process management
npm i -g pm2
pm2 start backend/dist/server.js --name anchor-api
pm2 start "npm run preview" --name anchor-web
```

---

## 🔒 Security Checklist

Before going live:

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Enable HTTPS (use Cloudflare, Let's Encrypt, etc.)
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS to only allow your domain
- [ ] Set up rate limiting
- [ ] Enable Sentry for error monitoring
- [ ] Configure WAF (Cloudflare, AWS WAF)
- [ ] Set up database backups
- [ ] Enable 2FA for admin accounts

---

## 📁 Project Structure

```
anchor/
├── components/          # React components
│   ├── AIDashboard.tsx
│   ├── AdminDashboard.tsx
│   ├── BillingDashboard.tsx
│   ├── MarketingLanding.tsx
│   ├── OnboardingWizard.tsx
│   └── PricingPage.tsx
├── backend/
│   ├── src/
│   │   ├── routes/      # API routes
│   │   │   ├── auth.ts
│   │   │   ├── billing.ts
│   │   │   ├── oauth.ts
│   │   │   └── email.ts
│   │   ├── lib/         # Shared utilities
│   │   └── services/    # Business logic
│   └── prisma/          # Database schema
├── cli/                 # CLI scanner tool
└── hooks/               # React hooks
```

---

## 🆘 Troubleshooting

### "Database connection failed"
- Check PostgreSQL is running
- Verify DATABASE_URL format
- Ensure database exists

### "OAuth redirect mismatch"
- Callback URLs must match EXACTLY
- Include trailing slashes if configured
- Check http vs https

### "Stripe webhook failing"
- Verify webhook secret
- Check endpoint is accessible
- Ensure raw body is preserved

### "Emails not sending"
- Verify domain in Resend
- Check FROM_EMAIL matches verified domain
- Test with Resend's test endpoint

---

## 📞 Support

- **Documentation**: https://docs.anchorsecurity.io
- **Discord**: https://discord.gg/anchor
- **Email**: support@anchorsecurity.io

---

Made with ❤️ by the Anchor Security Team
