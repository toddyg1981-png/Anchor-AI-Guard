# 🏗️ Anchor Security Platform - Architecture

Comprehensive system architecture documentation for Anchor AI Guard.

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ANCHOR AI GUARD PLATFORM                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │   Web App   │  │    CLI      │  │  REST API   │  │   SSE/WS    │   │
│  │  (React)    │  │  (Node.js)  │  │  (Fastify)  │  │  Streaming  │   │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │
│         │                │                │                │           │
│         └────────────────┴────────────────┴────────────────┘           │
│                                    │                                    │
│                          ┌─────────▼─────────┐                         │
│                          │   Backend API     │                         │
│                          │   (Fastify/TS)    │                         │
│                          └─────────┬─────────┘                         │
│                                    │                                    │
│         ┌──────────────────────────┼──────────────────────────┐        │
│         │                          │                          │        │
│  ┌──────▼──────┐  ┌────────────────▼────────────────┐  ┌──────▼──────┐│
│  │  PostgreSQL │  │        TITAN ENGINE             │  │   Redis     ││
│  │  (Prisma)   │  │   (AI Evolution Core)           │  │   Cache     ││
│  └─────────────┘  └────────────────┬────────────────┘  └─────────────┘│
│                                    │                                    │
│                   ┌────────────────┼────────────────┐                  │
│                   │                │                │                  │
│            ┌──────▼──────┐  ┌──────▼──────┐  ┌──────▼──────┐          │
│            │   Claude    │  │  Threat     │  │  Security   │          │
│            │   (AI/LLM)  │  │  Intel Feeds│  │  Scanners   │          │
│            └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18 | UI rendering |
| Build Tool | Vite 6 | Fast development & builds |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| State Management | React Query | Server state |
| Routing | React Router 7 | Client-side routing |
| Charts | Custom Canvas API | Real-time visualizations |

### Backend
| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js 20+ | JavaScript runtime |
| Framework | Fastify 5 | High-performance HTTP |
| ORM | Prisma | Database access |
| Auth | JWT + OAuth 2.0 | Authentication |
| Payments | Stripe | Billing & subscriptions |
| Email | Resend | Transactional email |

### Infrastructure
| Component | Technology | Purpose |
|-----------|------------|---------|
| Database | PostgreSQL 15 | Primary data store |
| Cache | Redis | Session & rate limiting |
| AI/LLM | Claude (Anthropic) | AI analysis & generation |
| Monitoring | Sentry | Error tracking |
| Hosting | Vercel/Railway | Deployment |

---

## Core Components

### 1. TITAN Engine (AI Evolution Core)

The heart of Anchor's autonomous security capabilities.

```
┌─────────────────────────────────────────────────────────────────┐
│                        TITAN ENGINE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐                    │
│  │  Threat Intel   │───▶│  AI Analysis    │                    │
│  │  Ingestion      │    │  (Claude API)   │                    │
│  └─────────────────┘    └────────┬────────┘                    │
│                                  │                              │
│                         ┌────────▼────────┐                     │
│                         │  Rule Generator │                     │
│                         └────────┬────────┘                     │
│                                  │                              │
│  ┌─────────────────┐    ┌────────▼────────┐                    │
│  │  SSE Stream     │◀───│  Detection      │                    │
│  │  (Real-time)    │    │  Engine         │                    │
│  └─────────────────┘    └─────────────────┘                    │
│                                                                 │
│  Metrics:                                                       │
│  • Threats Processed: Real-time counter                         │
│  • Rules Generated: Auto-created detection rules                │
│  • AI Analyses: Claude API calls for deep analysis              │
│  • Competitive Score: Platform intelligence rating              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features:**
- Real-time SSE streaming for live updates
- Autonomous rule generation without human intervention
- Continuous learning from threat intelligence feeds
- Self-healing and self-updating capabilities

### 2. Security Scanner Pipeline

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Source     │────▶│   Scanner    │────▶│   Results    │
│   Input      │     │   Pipeline   │     │   Storage    │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │              ┌─────┴─────┐              │
       │              │           │              │
       ▼              ▼           ▼              ▼
   • GitHub       • Secrets   • SAST         • Prisma DB
   • Upload       • Deps      • Auth         • Findings
   • Snippet      • XSS       • Injection    • Reports
   • Local        • SBOM      • Config       • Metrics
```

**Scanner Types:**
1. **Secrets Scanner** - Detects exposed credentials
2. **Dependency Scanner** - Identifies vulnerable packages
3. **Auth Scanner** - Checks authentication issues
4. **Injection Scanner** - SQL/NoSQL/XSS detection
5. **XSS Scanner** - Cross-site scripting vulnerabilities

### 3. Authentication Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  User   │────▶│ OAuth   │────▶│ Backend │────▶│ Session │
│         │     │ Provider│     │ Verify  │     │ Create  │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
                     │
              ┌──────┴──────┐
              │             │
              ▼             ▼
          GitHub        Google
          OAuth         OAuth
```

**Supported Methods:**
- Email/Password with MFA
- GitHub OAuth
- Google OAuth
- SAML SSO (Enterprise)
- API Key authentication

### 4. Billing Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     STRIPE INTEGRATION                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Checkout ────▶ Subscription ────▶ Usage ────▶ Invoice     │
│                                                             │
│  Plans:                                                     │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐  │
│  │ Starter   │ │ Pro       │ │Enterprise │ │Enterprise+│  │
│  │ $49/mo    │ │ $149/mo   │ │ $299/mo   │ │ $449/mo   │  │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘  │
│                                                             │
│  Webhooks: checkout.session.completed                       │
│            customer.subscription.*                          │
│            invoice.*                                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Scan Request Flow

```
1. User submits scan request (GitHub URL / Upload / Snippet)
                    │
                    ▼
2. Backend validates request & creates scan record
                    │
                    ▼
3. Scanner pipeline processes source code
                    │
                    ▼
4. Findings stored in database
                    │
                    ▼
5. AI analysis enriches findings (Claude)
                    │
                    ▼
6. Real-time updates via SSE stream
                    │
                    ▼
7. User views results in dashboard
```

### TITAN Engine Data Flow

```
External Threat Feeds ──┐
                        │
CVE Databases ──────────┼───▶ TITAN Ingestion ───▶ AI Processing
                        │           │                    │
Dark Web Intel ─────────┘           │                    ▼
                                    │            Rule Generation
                                    │                    │
                                    ▼                    ▼
                              Database Storage ◀── Detection Engine
                                    │
                                    ▼
                              SSE Broadcast ───▶ Dashboard Updates
```

---

## Database Schema (Key Tables)

```sql
-- Organizations
Organization
├── id (UUID)
├── name
├── plan (starter/professional/enterprise)
├── stripeCustomerId
└── settings (JSON)

-- Users
User
├── id (UUID)
├── email
├── name
├── orgId (FK)
├── role (owner/admin/member/viewer)
└── mfaEnabled

-- Projects
Project
├── id (UUID)
├── name
├── orgId (FK)
├── scope (JSON: domains, apis, mobileBuilds)
└── settings

-- Scans
Scan
├── id (UUID)
├── projectId (FK)
├── status (queued/running/completed/failed)
├── progress (0-100)
└── results (JSON)

-- Findings
Finding
├── id (UUID)
├── scanId (FK)
├── severity (critical/high/medium/low)
├── type
├── description
├── guidance
├── reproduction
└── aiAnalysis

-- API Keys
ApiKey
├── id (UUID)
├── orgId (FK)
├── name
├── keyHash (bcrypt)
├── tier
├── rateLimit
└── lastUsedAt
```

---

## Security Architecture

### Defense Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Edge Security                                       │
│ • WAF (Cloudflare/similar)                                   │
│ • DDoS Protection                                            │
│ • Rate Limiting                                              │
├─────────────────────────────────────────────────────────────┤
│ Layer 2: Application Security                                │
│ • JWT/OAuth Authentication                                   │
│ • RBAC Authorization                                         │
│ • Input Validation (Zod schemas)                             │
│ • CSRF Protection                                            │
├─────────────────────────────────────────────────────────────┤
│ Layer 3: Data Security                                       │
│ • AES-256 Encryption at rest                                 │
│ • TLS 1.3 in transit                                         │
│ • Secrets encrypted with per-org keys                        │
│ • API keys stored as bcrypt hashes                           │
├─────────────────────────────────────────────────────────────┤
│ Layer 4: Infrastructure Security                             │
│ • Private VPC networking                                     │
│ • Database access via connection pooling                     │
│ • Immutable deployments                                      │
│ • Automated security scanning                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Production Setup

```
                    ┌─────────────┐
                    │   CDN       │
                    │ (Cloudflare)│
                    └──────┬──────┘
                           │
          ┌────────────────┴────────────────┐
          │                                 │
   ┌──────▼──────┐                   ┌──────▼──────┐
   │  Frontend   │                   │   Backend   │
   │  (Vercel)   │                   │  (Railway)  │
   └─────────────┘                   └──────┬──────┘
                                            │
                          ┌─────────────────┼─────────────────┐
                          │                 │                 │
                   ┌──────▼──────┐   ┌──────▼──────┐   ┌──────▼──────┐
                   │ PostgreSQL  │   │   Redis     │   │   Claude    │
                   │ (Supabase)  │   │ (Upstash)   │   │ (Anthropic) │
                   └─────────────┘   └─────────────┘   └─────────────┘
```

---

## File Structure

```
anchor-ai-guard/
├── components/           # React components (80+ security modules)
│   ├── DashboardLayout.tsx
│   ├── AIEvolutionDashboard.tsx  # TITAN Engine UI
│   ├── AutonomousSOC.tsx
│   └── ...
├── backend/
│   ├── src/
│   │   ├── routes/       # API endpoints (37 route files)
│   │   ├── middleware/   # Auth, rate limiting
│   │   ├── services/     # Business logic
│   │   └── lib/          # Shared utilities
│   └── prisma/           # Database schema & migrations
├── utils/                # Frontend utilities
│   ├── backendApi.ts     # API client (1400+ lines)
│   ├── apiClient.ts      # HTTP client with caching
│   └── logger.ts         # Structured logging
├── config/               # Configuration management
├── tests/                # Unit & integration tests
├── e2e/                  # Playwright E2E tests
└── docs/                 # Documentation
```

---

## Performance Considerations

### Frontend
- Code splitting via React.lazy()
- Memoization with useMemo/useCallback
- Virtual scrolling for large lists
- Canvas-based real-time charts (no DOM overhead)

### Backend
- Connection pooling (Prisma)
- Redis caching for expensive queries
- Streaming responses (SSE) for real-time data
- Horizontal scaling ready

### Database
- Indexed queries on common access patterns
- Soft deletes for audit compliance
- JSON columns for flexible schemas
- Read replicas for reporting (Enterprise)

---

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────┐
│                     OBSERVABILITY STACK                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Errors ──────────────▶ Sentry                              │
│                                                             │
│  Performance ─────────▶ Custom metrics → Dashboard          │
│                                                             │
│  Logs ────────────────▶ Structured JSON → Aggregator        │
│                                                             │
│  Uptime ──────────────▶ Health checks → Alerting            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

Last Updated: February 2026  
Version: 1.0.0
