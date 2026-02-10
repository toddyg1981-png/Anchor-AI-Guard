import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env';
import { authMiddleware } from '../lib/auth';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const messageSchema = z.object({
  message: z.string().min(1).max(4000),
  conversationId: z.string().optional(),
});

async function callClaude(prompt: string, systemPrompt: string, maxTokens = 1024): Promise<string> {
  if (!env.anthropicApiKey) {
    throw new Error('AI service not configured');
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.anthropicApiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error('AI service unavailable');
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

const SECURITY_CHAT_SYSTEM_PROMPT = `You are Anchor AI, the security assistant for the Anchor Security Platform — a world-first AI-powered cybersecurity platform.

Your capabilities:
- Explain vulnerabilities and security concepts clearly
- Provide remediation guidance for security findings
- Help users understand their security posture
- Offer best practices for secure coding
- Help with compliance questions (OWASP, PCI-DSS, SOC2, ISO 27001, GDPR)
- Provide threat intelligence context
- Help users navigate the Anchor platform features

Always be helpful, precise, and security-focused. Format responses with markdown when useful. If unsure, say so rather than guessing.`;

const HELPDESK_SYSTEM_PROMPT = `You are Anchor AI Help Desk, the support assistant for the Anchor Security Platform.

Your role is to help users with:
- Getting started with Anchor (creating projects, running scans)
- Understanding the dashboard, findings, and security scores
- Team management (inviting members, roles, permissions)
- Integrations (GitHub, Slack, Jira, CI/CD)
- Billing and subscription management
- Using security modules (Threat Hunting, SOC, Incident Response, etc.)
- API usage and CI/CD pipeline integration
- Troubleshooting common issues

Be friendly, clear, and step-by-step. If you don't know something specific about the platform, provide general guidance and suggest the user contact support.`;

export async function aiChatRoutes(app: FastifyInstance): Promise<void> {
  // NOTE: POST /ai-chat/message is registered in security-modules.ts with full org-aware context

  // AI Help Desk - guided support assistant
  app.post('/ai/helpdesk', {
    preHandler: authMiddleware(),
    config: { rateLimit: { max: 30, timeWindow: '1 minute' } },
  }, async (request, reply) => {
    // Track AI query usage
    try { const u = (request as any).user; if (u?.orgId) { const { trackAIQuery } = await import('./billing'); trackAIQuery(u.orgId).catch(() => {}); } } catch {}

    const parsed = z.object({ question: z.string().min(1).max(4000) }).safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { question } = parsed.data;

    if (!env.anthropicApiKey) {
      return reply.send({ answer: getFallbackHelpdeskResponse(question) });
    }

    try {
      const answer = await callClaude(question, HELPDESK_SYSTEM_PROMPT, 1500);
      return reply.send({ answer });
    } catch (error) {
      console.error('AI Helpdesk error:', error);
      return reply.send({ answer: getFallbackHelpdeskResponse(question) });
    }
  });
}

function getFallbackChatResponse(message: string): string {
  const q = message.toLowerCase();

  if (q.includes('sql injection') || q.includes('sqli')) {
    return `**SQL Injection (SQLi)**

SQL injection occurs when untrusted data is sent to a database interpreter as part of a command or query.

**How to fix it:**
1. **Use parameterized queries / prepared statements** — never concatenate user input into SQL
2. **Use an ORM** — ORMs like Prisma, Sequelize, or TypeORM handle parameterization automatically
3. **Validate and sanitize input** — whitelist expected patterns
4. **Apply least privilege** — database accounts should have minimal permissions
5. **Enable WAF rules** — Web Application Firewalls can block common SQLi patterns

Anchor can detect SQLi vulnerabilities in your code via SAST scanning and in running applications via DAST scanning.`;
  }

  if (q.includes('xss') || q.includes('cross-site scripting')) {
    return `**Cross-Site Scripting (XSS)**

XSS allows attackers to inject malicious scripts into web pages viewed by other users.

**Types:** Stored, Reflected, DOM-based

**Prevention:**
1. **Escape output** — HTML-encode all dynamic content before rendering
2. **Use Content Security Policy (CSP)** headers
3. **Sanitize HTML input** — use libraries like DOMPurify
4. **Use frameworks with auto-escaping** — React, Vue, Angular escape by default
5. **Set HttpOnly flag** on cookies to prevent JavaScript access`;
  }

  if (q.includes('critical') || q.includes('vulnerability') || q.includes('finding')) {
    return `I can help you understand your security findings. From the Anchor dashboard:

1. Navigate to your **Project** and view the **Findings** tab
2. Findings are sorted by severity: **Critical > High > Medium > Low > Info**
3. Click any finding for detailed analysis, remediation guidance, and affected code
4. Use the **AI Analysis** button on any finding for an AI-powered deep dive

Critical findings should be addressed within **24 hours**, high within **48 hours**.`;
  }

  return `I'm your Anchor AI Security Assistant. I can help with:

- 🔍 **Vulnerability explanations** — Ask about any security issue (SQLi, XSS, CSRF, etc.)
- 🔧 **Remediation guidance** — How to fix security findings
- 📊 **Security posture** — Understanding your scores and metrics
- 📋 **Compliance** — OWASP Top 10, PCI-DSS, SOC2, ISO 27001
- 🎯 **Threat intelligence** — Understanding attack patterns

Try asking me something specific like "How do I fix SQL injection?" or "Show me critical vulnerabilities"!`;
}

function getFallbackHelpdeskResponse(question: string): string {
  const q = question.toLowerCase();

  if (q.includes('get started') || q.includes('start') || q.includes('begin') || q.includes('first')) {
    return `**Getting Started with Anchor Security**

1. **Create a Project** — Click "Add Project" on the Dashboard and enter a name
2. **Run a Scan** — Select your project, click "New Scan", choose scan type (SAST/DAST)
3. **Review Findings** — View results sorted by severity with AI-powered analysis
4. **Fix Issues** — Follow remediation guidance and use AI suggestions
5. **Monitor** — Set up continuous scanning and real-time alerts

💡 **Pro Tip:** Set up GitHub integration for automated scanning on every pull request!`;
  }

  if (q.includes('team') || q.includes('invite') || q.includes('member') || q.includes('role')) {
    return `**Team Management**

1. Go to **Manage > Team** in the sidebar
2. Click **"Invite Member"** and enter their email
3. Assign a role: **Owner**, **Admin**, **Member**, or **Viewer**
4. They'll receive an email invitation to join

**Roles:**
- **Owner** — Full access, billing, and team management
- **Admin** — Manage projects, scans, and team members
- **Member** — Run scans and view findings
- **Viewer** — Read-only access to dashboards and reports`;
  }

  if (q.includes('scan') || q.includes('scanning')) {
    return `**Running Security Scans**

1. Select a project from the Dashboard
2. Click **"New Scan"**
3. Choose scan type:
   - **SAST** — Static analysis of source code
   - **DAST** — Dynamic testing of running applications
   - **Full Audit** — Comprehensive SAST + DAST
4. Configure target (URL, repository, or upload code)
5. Click **"Start Scan"**

Scans run in the background and you'll be notified when complete. View progress in the Active Scans section.`;
  }

  if (q.includes('billing') || q.includes('plan') || q.includes('subscription') || q.includes('payment')) {
    return `**Billing & Plans**

Manage your subscription from **Manage > Billing** in the sidebar.

**Plans:**
- **Free** — 1 project, basic scanning
- **Pro** — Unlimited projects, AI analysis, team features
- **Enterprise** — Custom limits, SLA support, dedicated environment

You can upgrade, downgrade, or manage payment methods from the Billing page. Contact support for enterprise pricing.`;
  }

  if (q.includes('integration') || q.includes('github') || q.includes('slack') || q.includes('jira')) {
    return `**Integrations**

Set up integrations from **Manage > Integrations**:

- **GitHub** — Automatic scanning on pull requests, issue creation for findings
- **Slack** — Real-time alerts for new findings and scan completions
- **Jira** — Create tickets from security findings with full context
- **CI/CD** — Use the Anchor CLI or API in your pipeline

Each integration has a guided setup wizard. Click "Connect" next to the integration you want.`;
  }

  return `Thanks for reaching out! I can help with:

- 🚀 **Getting Started** — Setting up projects and running scans
- 📊 **Dashboard** — Understanding your security metrics
- 👥 **Team** — Inviting members and managing roles
- 🔗 **Integrations** — Connecting GitHub, Slack, Jira
- 💳 **Billing** — Managing plans and subscriptions
- 🔌 **API** — CI/CD pipeline integration
- 🔧 **Troubleshooting** — Fixing common issues

What would you like help with? You can also browse the **How-To Guide** for step-by-step tutorials.`;
}
