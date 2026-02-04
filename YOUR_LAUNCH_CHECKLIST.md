# 🚀 Anchor Launch Checklist

## What's Done (Code Complete ✅)

All the code work is finished. The following is fully implemented and compiling:

### Backend
- ✅ Stripe billing integration (subscriptions, checkout, webhooks, customer portal)
- ✅ GitHub OAuth login
- ✅ Google OAuth login
- ✅ Email system with Resend (welcome, password reset, team invites, digests)
- ✅ Prisma database schema (users, orgs, projects, scans, subscriptions, API keys, audit logs)
- ✅ Usage tracking and limits
- ✅ Admin routes

### Frontend
- ✅ Marketing landing page with all features
- ✅ Pricing page with 4 tiers ($49-$449/dev/month)
- ✅ Billing dashboard (subscription management)
- ✅ Onboarding wizard (4-step flow)
- ✅ Admin dashboard (team, settings, audit log)
- ✅ All dashboard screens (overview, projects, findings, collaboration)

### CLI
- ✅ 5 security scanners (dependency, secrets, auth, injection, xss)
- ✅ AI-powered analysis with Claude

---

## 🔧 What YOU Need To Do (Physical Setup)

### Priority 1: Essential Services (~30 min)

#### 1. Database (PostgreSQL)
**Choose ONE:**
- **Supabase** (Recommended - Free tier): https://supabase.com
  - Create project → Settings → Database → Connection string
  - Copy the connection string → Add to `.env` as `DATABASE_URL`
  
- **Railway**: https://railway.app
  - New Project → PostgreSQL → Get connection URL
  
- **Neon**: https://neon.tech
  - Free serverless Postgres

#### 2. Stripe Account
1. Go to https://dashboard.stripe.com
2. Create account / Sign in
3. Get your keys from Developers → API keys:
   - `STRIPE_SECRET_KEY` (starts with `sk_test_` or `sk_live_`)
   - `STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_` or `pk_live_`)
4. Set up Webhook:
   - Developers → Webhooks → Add endpoint
   - URL: `https://your-domain.com/api/billing/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
   - Copy `STRIPE_WEBHOOK_SECRET`
5. Create Products in Stripe:
   - Products → Add product
   - Create 4 products: Starter ($49), Professional ($149), Enterprise ($299), Enterprise+ ($449)

#### 3. Email Service (Resend)
1. Go to https://resend.com
2. Create account → Get API key
3. Add `RESEND_API_KEY` to `.env`
4. Verify your domain (DNS records they provide)

---

### Priority 2: Authentication (~20 min)

#### 4. GitHub OAuth App
1. Go to https://github.com/settings/developers
2. OAuth Apps → New OAuth App
3. Fill in:
   - Name: "Anchor Security"
   - Homepage URL: `https://your-domain.com`
   - Callback URL: `https://your-domain.com/api/auth/github/callback`
4. Get `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`

#### 5. Google OAuth
1. Go to https://console.cloud.google.com
2. Create project → APIs & Services → Credentials
3. Create OAuth 2.0 Client ID (Web application)
4. Authorized redirect: `https://your-domain.com/api/auth/google/callback`
5. Get `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

### Priority 3: AI Features (~10 min)

#### 6. Anthropic API (for CLI)
1. Go to https://console.anthropic.com
2. Get API key
3. Add `ANTHROPIC_API_KEY` to CLI config

---

### Priority 4: Deployment (~20 min)

#### 7. Choose Hosting

**Frontend (Vercel - Recommended)**
1. https://vercel.com → Import Git Repository
2. Framework: Vite
3. Add environment variables
4. Deploy

**Backend (Railway - Recommended)**
1. https://railway.app → New Project → Deploy from GitHub
2. Select backend folder
3. Add environment variables
4. Railway provides HTTPS URL automatically

**Alternative: Render.com**
- Free tier available
- Deploy both frontend and backend

---

### 📝 Complete .env File (Backend)

Copy this to `backend/.env` and fill in your values:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/anchor?schema=public"

# JWT
JWT_SECRET="generate-a-64-character-random-string-here"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# OAuth
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Email
RESEND_API_KEY="re_your_api_key"
EMAIL_FROM="Anchor Security <noreply@yourdomain.com>"

# App
FRONTEND_URL="https://your-domain.com"
CORS_ORIGINS="https://your-domain.com"

# Optional
SENTRY_DSN=""
```

---

### ⏱️ Time Estimate

| Task | Time |
|------|------|
| Database setup | 5 min |
| Stripe setup | 15 min |
| Email setup | 5 min |
| GitHub OAuth | 10 min |
| Google OAuth | 10 min |
| Anthropic API | 5 min |
| Deployment | 20 min |
| **Total** | **~70 min** |

---

### 🚀 Launch Commands

After setting up services:

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push  # Creates tables
npm run build
npm start

# Frontend (separate terminal)
npm install
npm run build
npm run preview  # Or deploy to Vercel
```

---

### 📊 Post-Launch Checklist

- [ ] Test Stripe checkout flow with test card (4242 4242 4242 4242)
- [ ] Test GitHub login
- [ ] Test Google login
- [ ] Verify emails are being sent
- [ ] Run a test scan with CLI
- [ ] Verify webhook is receiving Stripe events

---

## 💰 Revenue Projections (As Discussed)

| Year | Conservative | Moderate | Aggressive |
|------|--------------|----------|------------|
| Year 1 | $447K | $671K | $1.07M |
| Year 2 | $2.23M | $3.5M | $5.6M |
| Year 3 | $6.7M | $11.2M | $17.9M |
| Year 4 | $17.9M | $28M | $44.8M |
| Year 5 | $44.7M | $67M | $107M |

**You're ready to launch! 🎉**
