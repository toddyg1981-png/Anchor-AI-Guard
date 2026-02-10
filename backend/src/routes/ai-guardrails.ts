import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from '../lib/auth';
import { env } from '../config/env';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Helper to call Claude
async function callClaude(prompt: string, maxTokens = 1024): Promise<string | null> {
  if (!env.anthropicApiKey) {
    return null;
  }

  try {
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
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      console.error('Claude API error:', await response.text());
      return null;
    }

    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch (error) {
    console.error('Claude call failed:', error);
    return null;
  }
}

// AI/LLM Security patterns and threats
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above|prior)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(previous|all|your)\s+(instructions?|rules?)/i,
  /you\s+are\s+now\s+(a|an)\s+/i,
  /pretend\s+(you|to\s+be)\s+(are|a|an)\s+/i,
  /act\s+as\s+(if|a|an)\s+/i,
  /forget\s+(everything|all|your)\s+(you|know|instructions?)/i,
  /new\s+instructions?[:]/i,
  /system\s*prompt[:]/i,
  /\[\[\[.*\]\]\]/,
  /<!--.*-->/s,
  /base64\s*decode/i,
  /eval\s*\(/i,
];

const DATA_EXFILTRATION_PATTERNS = [
  /send\s+(to|email|http|ftp|the\s+following)/i,
  /upload\s+(to|this|data)/i,
  /leak\s+(this|data|information)/i,
  /exfiltrate/i,
  /webhook.*url/i,
  /curl\s+.*http/i,
];

const JAILBREAK_PATTERNS = [
  /DAN\s+mode/i,
  /developer\s+mode/i,
  /unrestricted\s+mode/i,
  /bypass\s+(safety|filter|restriction)/i,
  /without\s+(restrictions?|limitations?|filters?)/i,
  /hypothetically/i,
  /for\s+educational\s+purposes?\s+only/i,
  /roleplay\s+as/i,
];

// Guardrail configuration
interface GuardrailConfig {
  id: string;
  name: string;
  enabled: boolean;
  threshold: number;
  action: 'block' | 'warn' | 'log';
  orgId: string;
}

// Audit log for AI interactions
interface AIAuditEntry {
  id: string;
  timestamp: Date;
  inputText: string;
  blocked: boolean;
  threats: string[];
  riskScore: number;
  model: string;
  orgId: string;
  userId: string;
}

const guardrailStore: Map<string, GuardrailConfig> = new Map();
const auditLog: AIAuditEntry[] = [];

// Schemas
const analyzeInputSchema = z.object({
  text: z.string(),
  context: z.string().optional(),
  model: z.string().optional(),
});

const configureGuardrailSchema = z.object({
  name: z.string(),
  enabled: z.boolean(),
  threshold: z.number().min(0).max(100),
  action: z.enum(['block', 'warn', 'log']),
});

const sanitizeInputSchema = z.object({
  text: z.string(),
  preserveFormatting: z.boolean().optional(),
});

export async function aiGuardrailsRoutes(app: FastifyInstance): Promise<void> {
  // Dashboard for AI/LLM security
  app.get('/ai-guardrails/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    const orgAudit = auditLog.filter(e => e.orgId === user.orgId);
    const guardrails = Array.from(guardrailStore.values()).filter(g => g.orgId === user.orgId);

    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEntries = orgAudit.filter(e => e.timestamp >= last24Hours);
    const blockedCount = recentEntries.filter(e => e.blocked).length;
    const threatsByType = recentEntries.reduce((acc, e) => {
      e.threats.forEach(t => {
        acc[t] = (acc[t] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return reply.send({
      stats: {
        totalAnalyzed: orgAudit.length,
        last24Hours: recentEntries.length,
        blocked: blockedCount,
        avgRiskScore: recentEntries.length > 0
          ? Math.round(recentEntries.reduce((sum, e) => sum + e.riskScore, 0) / recentEntries.length)
          : 0,
      },
      threatsByType,
      guardrails: guardrails.map(g => ({
        id: g.id,
        name: g.name,
        enabled: g.enabled,
        action: g.action,
        threshold: g.threshold,
      })),
      recentThreats: recentEntries
        .filter(e => e.blocked || e.riskScore > 50)
        .slice(0, 10)
        .map(e => ({
          id: e.id,
          timestamp: e.timestamp,
          threats: e.threats,
          riskScore: e.riskScore,
          blocked: e.blocked,
        })),
    });
  });

  // Analyze input for threats (WORLD-FIRST: AI/LLM Guardrails)
  app.post('/ai-guardrails/analyze', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { id: string; orgId: string };
    const parsed = analyzeInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { text, model = 'unknown' } = parsed.data;
    const threats: string[] = [];
    let riskScore = 0;

    // Check for prompt injection
    for (const pattern of PROMPT_INJECTION_PATTERNS) {
      if (pattern.test(text)) {
        threats.push('prompt-injection');
        riskScore += 40;
        break;
      }
    }

    // Check for data exfiltration attempts
    for (const pattern of DATA_EXFILTRATION_PATTERNS) {
      if (pattern.test(text)) {
        threats.push('data-exfiltration');
        riskScore += 30;
        break;
      }
    }

    // Check for jailbreak attempts
    for (const pattern of JAILBREAK_PATTERNS) {
      if (pattern.test(text)) {
        threats.push('jailbreak-attempt');
        riskScore += 35;
        break;
      }
    }

    // Check for sensitive data
    const sensitivePatterns = [
      { pattern: /\b\d{3}-\d{2}-\d{4}\b/, type: 'ssn' },
      { pattern: /\b\d{16}\b/, type: 'credit-card' },
      { pattern: /api[_-]?key/i, type: 'api-key' },
      { pattern: /password\s*[=:]/i, type: 'password' },
      { pattern: /bearer\s+[a-zA-Z0-9._-]+/i, type: 'bearer-token' },
    ];

    for (const { pattern, type } of sensitivePatterns) {
      if (pattern.test(text)) {
        threats.push(`sensitive-data-${type}`);
        riskScore += 25;
      }
    }

    riskScore = Math.min(100, riskScore);

    // Determine action based on guardrails
    const guardrails = Array.from(guardrailStore.values()).filter(g => g.orgId === user.orgId && g.enabled);
    let blocked = false;
    let action: 'allow' | 'warn' | 'block' = 'allow';

    for (const guardrail of guardrails) {
      if (riskScore >= guardrail.threshold) {
        if (guardrail.action === 'block') {
          blocked = true;
          action = 'block';
        } else if (guardrail.action === 'warn' && action !== 'block') {
          action = 'warn';
        }
      }
    }

    // Default behavior if no guardrails
    if (guardrails.length === 0) {
      if (riskScore >= 70) {
        blocked = true;
        action = 'block';
      } else if (riskScore >= 40) {
        action = 'warn';
      }
    }

    // Log the analysis
    const auditEntry: AIAuditEntry = {
      id: `audit-${Date.now()}`,
      timestamp: new Date(),
      inputText: text.substring(0, 500),
      blocked,
      threats,
      riskScore,
      model,
      orgId: user.orgId,
      userId: user.id,
    };
    auditLog.push(auditEntry);

    return reply.send({
      safe: !blocked,
      action,
      riskScore,
      threats,
      analysis: {
        promptInjection: threats.includes('prompt-injection'),
        dataExfiltration: threats.includes('data-exfiltration'),
        jailbreakAttempt: threats.includes('jailbreak-attempt'),
        sensitiveData: threats.some(t => t.startsWith('sensitive-data')),
      },
      recommendation: blocked
        ? 'Input blocked due to security threats'
        : riskScore > 40
          ? 'Proceed with caution - potential risks detected'
          : 'Input appears safe',
      auditId: auditEntry.id,
    });
  });

  // Sanitize input before sending to LLM
  app.post('/ai-guardrails/sanitize', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = sanitizeInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    let { text, preserveFormatting } = parsed.data;
    const removedPatterns: string[] = [];

    const sanitizationPatterns = [
      { pattern: /<!--[\s\S]*?-->/g, name: 'html-comments' },
      { pattern: /\[\[\[[\s\S]*?\]\]\]/g, name: 'hidden-instructions' },
      { pattern: /```[\s\S]*?```/g, name: 'code-blocks', preserve: preserveFormatting },
      { pattern: /\{system:[\s\S]*?\}/gi, name: 'system-injection' },
      { pattern: /\\u[\da-fA-F]{4}/g, name: 'unicode-escape' },
    ];

    for (const { pattern, name, preserve } of sanitizationPatterns) {
      if (preserve && preserveFormatting) continue;
      if (pattern.test(text)) {
        removedPatterns.push(name);
        text = text.replace(pattern, '');
      }
    }

    text = text.replace(/\s+/g, ' ').trim();

    const maxLength = 10000;
    const truncated = text.length > maxLength;
    if (truncated) {
      text = text.substring(0, maxLength);
    }

    return reply.send({
      sanitized: text,
      modifications: {
        removedPatterns,
        truncated,
        originalLength: parsed.data.text.length,
        sanitizedLength: text.length,
      },
    });
  });

  // Configure guardrails
  app.post('/ai-guardrails/configure', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const parsed = configureGuardrailSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const guardrail: GuardrailConfig = {
      id: `guardrail-${Date.now()}`,
      name: parsed.data.name,
      enabled: parsed.data.enabled,
      threshold: parsed.data.threshold,
      action: parsed.data.action,
      orgId: user.orgId,
    };

    guardrailStore.set(guardrail.id, guardrail);

    return reply.send({
      guardrail: {
        id: guardrail.id,
        name: guardrail.name,
        enabled: guardrail.enabled,
        threshold: guardrail.threshold,
        action: guardrail.action,
      },
    });
  });

  // Get guardrails
  app.get('/ai-guardrails/config', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const guardrails = Array.from(guardrailStore.values())
      .filter(g => g.orgId === user.orgId)
      .map(g => ({
        id: g.id,
        name: g.name,
        enabled: g.enabled,
        threshold: g.threshold,
        action: g.action,
      }));

    return reply.send({
      guardrails,
      defaults: {
        promptInjectionThreshold: 40,
        dataExfiltrationThreshold: 50,
        jailbreakThreshold: 45,
      },
    });
  });

  // Delete guardrail
  app.delete('/ai-guardrails/config/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };

    const guardrail = guardrailStore.get(id);
    if (!guardrail || guardrail.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Guardrail not found' });
    }

    guardrailStore.delete(id);
    return reply.send({ success: true });
  });

  // AI-powered threat intelligence for LLM attacks
  app.post('/ai-guardrails/threat-intel', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    // Track AI query usage
    const { trackAIQuery } = await import('./billing');
    trackAIQuery(user.orgId).catch(() => {});

    const orgAudit = auditLog.filter(e => e.orgId === user.orgId).slice(-100);
    const threatSummary = orgAudit.length > 0
      ? `Recent threats detected: ${orgAudit.filter(e => e.threats.length > 0).length} incidents`
      : 'No recent threat data available.';

    const result = await callClaude(`You are an AI security expert. Based on current threat landscape, provide threat intelligence for AI/LLM security.

Organization context: ${threatSummary}

Provide response in JSON format:
{
  "emergingThreats": [
    {"name": "threat name", "severity": "critical|high|medium|low", "description": "brief description", "mitigations": ["mitigation1"]}
  ],
  "recommendations": [
    {"priority": 1-5, "action": "action to take", "rationale": "why"}
  ],
  "riskAssessment": {
    "overallRisk": "critical|high|medium|low",
    "confidence": 0-100
  }
}

Only return valid JSON.`);

    if (!result) {
      return reply.send({
        threats: [
          { name: 'Prompt Injection', severity: 'high', trend: 'increasing', description: 'Attempts to manipulate AI behavior' },
          { name: 'Data Exfiltration', severity: 'high', trend: 'stable', description: 'Attempts to extract sensitive data' },
          { name: 'Jailbreaking', severity: 'medium', trend: 'increasing', description: 'Attempts to bypass safety measures' },
        ],
        recommendations: [
          'Enable input validation for all AI endpoints',
          'Implement output filtering for sensitive data',
          'Rate limit AI API calls',
        ],
        source: 'fallback',
      });
    }

    try {
      const intel = JSON.parse(result);
      return reply.send({ ...intel, source: 'ai-intel', model: 'claude-3-haiku' });
    } catch {
      return reply.status(500).send({ error: 'Intel parse failed' });
    }
  });

  // Get audit log
  app.get('/ai-guardrails/audit', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const query = request.query as { limit?: string; blocked?: string };

    let entries = auditLog.filter(e => e.orgId === user.orgId);

    if (query.blocked === 'true') {
      entries = entries.filter(e => e.blocked);
    }

    const limit = parseInt(query.limit || '50');
    entries = entries.slice(-limit).reverse();

    return reply.send({
      entries: entries.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        threats: e.threats,
        riskScore: e.riskScore,
        blocked: e.blocked,
        model: e.model,
      })),
      total: entries.length,
    });
  });
}
