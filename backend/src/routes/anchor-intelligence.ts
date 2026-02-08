import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';
import crypto from 'crypto';
import { getEvolutionThreats, getEvolutionRules, getEvolutionStatus } from './ai-evolution';

// ==========================================
// ANCHOR INTELLIGENCE — B2B AI-AS-A-SERVICE
// Self-Evolving Security AI for Other Companies
// ==========================================

// In-memory stores
const apiKeys = new Map<string, APIKeyRecord>();
const apiUsage = new Map<string, UsageRecord[]>();
const generatedRules = new Map<string, GeneratedRule[]>();
const threatAnalysisCache = new Map<string, ThreatAnalysis>();
const customerWebhooks = new Map<string, WebhookConfig[]>();
const rateLimitTracker = new Map<string, { count: number; resetAt: number }>();

interface APIKeyRecord {
  id: string;
  key: string;
  hashedKey: string;
  organizationId: string;
  name: string;
  plan: 'starter' | 'professional' | 'enterprise' | 'unlimited';
  createdAt: Date;
  lastUsed: Date;
  enabled: boolean;
  rateLimit: number; // requests per minute
  monthlyQuota: number;
  monthlyUsed: number;
  quotaResetAt: Date;
  permissions: string[];
  ipWhitelist: string[];
}

interface UsageRecord {
  timestamp: Date;
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  tokensUsed: number;
}

interface GeneratedRule {
  id: string;
  customerId: string;
  format: 'sigma' | 'yara' | 'snort' | 'suricata' | 'kql' | 'spl' | 'custom';
  rule: string;
  threat: string;
  severity: string;
  confidence: number;
  mitreTactic: string;
  mitreTechnique: string;
  createdAt: Date;
  validated: boolean;
}

interface ThreatAnalysis {
  id: string;
  input: string;
  analysis: string;
  severity: string;
  indicators: string[];
  recommendations: string[];
  timestamp: Date;
}

interface WebhookConfig {
  id: string;
  url: string;
  events: string[];
  secret: string;
  enabled: boolean;
}

// B2B Plan configurations
const B2B_PLANS = {
  starter: {
    name: 'Starter API',
    monthlyPrice: 499900, // $4,999/mo
    yearlyPrice: 4799000, // $47,990/yr
    rateLimit: 60,      // 60 req/min
    monthlyQuota: 10000, // 10K requests/mo
    permissions: ['threat-intel', 'rule-generation'],
    description: 'Basic threat intelligence and rule generation',
  },
  professional: {
    name: 'Professional API',
    monthlyPrice: 2499900, // $24,999/mo
    yearlyPrice: 23999000, // $239,990/yr
    rateLimit: 300,       // 300 req/min
    monthlyQuota: 100000, // 100K requests/mo
    permissions: ['threat-intel', 'rule-generation', 'ai-analysis', 'predictive', 'competitive-intel'],
    description: 'Full AI analysis, prediction, and competitive intelligence',
  },
  enterprise: {
    name: 'Enterprise API',
    monthlyPrice: 9999900, // $99,999/mo
    yearlyPrice: 95999000, // $959,990/yr
    rateLimit: 1000,      // 1K req/min
    monthlyQuota: 1000000, // 1M requests/mo
    permissions: ['threat-intel', 'rule-generation', 'ai-analysis', 'predictive', 'competitive-intel', 'white-label', 'custom-models', 'webhooks'],
    description: 'White-label AI, custom models, and unlimited capabilities',
  },
  unlimited: {
    name: 'Unlimited / OEM',
    monthlyPrice: 0, // Custom pricing
    yearlyPrice: 0,
    rateLimit: 5000,
    monthlyQuota: -1, // Unlimited
    permissions: ['*'],
    description: 'Custom pricing, unlimited usage, full OEM licensing',
  },
};

// API Key authentication middleware
function apiKeyAuth() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers['x-api-key'] || request.headers['authorization'];
    
    if (!authHeader) {
      return reply.status(401).send({ error: 'API key required. Set x-api-key header.' });
    }

    const key = typeof authHeader === 'string' 
      ? authHeader.replace('Bearer ', '').trim() 
      : '';

    // Find the API key
    let foundKey: APIKeyRecord | undefined;
    for (const record of apiKeys.values()) {
      if (record.key === key && record.enabled) {
        foundKey = record;
        break;
      }
    }

    if (!foundKey) {
      return reply.status(401).send({ error: 'Invalid or disabled API key' });
    }

    // Check IP whitelist
    if (foundKey.ipWhitelist.length > 0) {
      const clientIP = request.ip;
      if (!foundKey.ipWhitelist.includes(clientIP) && !foundKey.ipWhitelist.includes('*')) {
        return reply.status(403).send({ error: 'IP address not whitelisted' });
      }
    }

    // Check rate limit
    const rateLimitKey = `${foundKey.id}:${Math.floor(Date.now() / 60000)}`;
    const rateLimit = rateLimitTracker.get(rateLimitKey);
    if (rateLimit && rateLimit.count >= foundKey.rateLimit) {
      return reply.status(429).send({
        error: 'Rate limit exceeded',
        limit: foundKey.rateLimit,
        resetAt: new Date(rateLimit.resetAt).toISOString()
      });
    }
    rateLimitTracker.set(rateLimitKey, {
      count: (rateLimit?.count || 0) + 1,
      resetAt: Date.now() + 60000
    });

    // Check monthly quota
    if (foundKey.monthlyQuota > 0 && foundKey.monthlyUsed >= foundKey.monthlyQuota) {
      return reply.status(429).send({
        error: 'Monthly quota exceeded',
        used: foundKey.monthlyUsed,
        quota: foundKey.monthlyQuota,
        resetAt: foundKey.quotaResetAt.toISOString()
      });
    }

    // Update usage
    foundKey.lastUsed = new Date();
    foundKey.monthlyUsed += 1;

    // Attach to request
    (request as any).apiCustomer = foundKey;
  };
}

// Check if customer has permission
function hasPermission(customer: APIKeyRecord, permission: string): boolean {
  return customer.permissions.includes('*') || customer.permissions.includes(permission);
}

// Call Claude for AI analysis
async function callClaude(prompt: string, maxTokens: number = 2048): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return JSON.stringify({ error: 'AI service unavailable' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json() as { content?: Array<{ text?: string }> };
    return data.content?.[0]?.text || '{}';
  } catch (error) {
    console.error('Claude API error:', error);
    return JSON.stringify({ error: 'AI analysis failed' });
  }
}

// Send webhook notification
async function sendWebhook(customerId: string, event: string, payload: unknown) {
  const hooks = customerWebhooks.get(customerId) || [];
  for (const hook of hooks) {
    if (!hook.enabled || !hook.events.includes(event)) continue;
    
    try {
      const signature = crypto
        .createHmac('sha256', hook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');

      await fetch(hook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Anchor-Signature': signature,
          'X-Anchor-Event': event
        },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.error(`Webhook delivery failed for ${hook.url}:`, error);
    }
  }
}

export default async function anchorIntelligenceRoutes(fastify: FastifyInstance) {

  // ==================== API KEY MANAGEMENT ====================
  // (Uses regular auth - for managing API keys via dashboard)
  
  // Get B2B plans
  fastify.get('/intelligence/plans', async (_request: FastifyRequest, reply: FastifyReply) => {
    const plans = Object.entries(B2B_PLANS).map(([tier, config]) => ({
      tier,
      name: config.name,
      monthlyPrice: config.monthlyPrice / 100,
      monthlyPriceFormatted: config.monthlyPrice > 0 ? `$${(config.monthlyPrice / 100).toLocaleString()}` : 'Custom',
      yearlyPrice: config.yearlyPrice / 100,
      yearlyPriceFormatted: config.yearlyPrice > 0 ? `$${(config.yearlyPrice / 100).toLocaleString()}` : 'Custom',
      rateLimit: `${config.rateLimit} req/min`,
      monthlyQuota: config.monthlyQuota > 0 ? config.monthlyQuota.toLocaleString() : 'Unlimited',
      permissions: config.permissions,
      description: config.description,
    }));

    return reply.send({ plans });
  });

  // Create API key
  fastify.post('/intelligence/keys', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const body = request.body as { name: string; plan: string; ipWhitelist?: string[] };

    const plan = B2B_PLANS[body.plan as keyof typeof B2B_PLANS];
    if (!plan) {
      return reply.status(400).send({ error: 'Invalid plan. Options: starter, professional, enterprise, unlimited' });
    }

    // Generate API key
    const keyId = crypto.randomUUID();
    const rawKey = `anc_${crypto.randomBytes(32).toString('hex')}`;
    const hashedKey = crypto.createHash('sha256').update(rawKey).digest('hex');

    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);

    const record: APIKeyRecord = {
      id: keyId,
      key: rawKey,
      hashedKey,
      organizationId,
      name: body.name,
      plan: body.plan as APIKeyRecord['plan'],
      createdAt: new Date(),
      lastUsed: new Date(),
      enabled: true,
      rateLimit: plan.rateLimit,
      monthlyQuota: plan.monthlyQuota,
      monthlyUsed: 0,
      quotaResetAt: resetDate,
      permissions: plan.permissions,
      ipWhitelist: body.ipWhitelist || [],
    };

    apiKeys.set(keyId, record);

    return reply.send({
      success: true,
      apiKey: {
        id: keyId,
        key: rawKey, // Only shown ONCE at creation
        name: body.name,
        plan: body.plan,
        rateLimit: plan.rateLimit,
        monthlyQuota: plan.monthlyQuota,
        permissions: plan.permissions,
      },
      warning: 'Save this API key now. It will not be shown again.'
    });
  });

  // List API keys
  fastify.get('/intelligence/keys', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };

    const keys: Array<Omit<APIKeyRecord, 'key' | 'hashedKey'> & { keyPreview: string }> = [];
    for (const record of apiKeys.values()) {
      if (record.organizationId === organizationId) {
        const { key, hashedKey, ...safe } = record;
        keys.push({ ...safe, keyPreview: `anc_...${key.slice(-8)}` });
      }
    }

    return reply.send({ keys });
  });

  // Revoke API key
  fastify.delete('/intelligence/keys/:keyId', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const { keyId } = request.params as { keyId: string };

    const record = apiKeys.get(keyId);
    if (!record || record.organizationId !== organizationId) {
      return reply.status(404).send({ error: 'API key not found' });
    }

    record.enabled = false;

    return reply.send({ success: true, message: 'API key revoked' });
  });

  // Get usage stats
  fastify.get('/intelligence/usage', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };

    const orgKeys = Array.from(apiKeys.values()).filter(k => k.organizationId === organizationId);
    
    const totalUsage = orgKeys.reduce((acc, k) => acc + k.monthlyUsed, 0);
    const totalQuota = orgKeys.reduce((acc, k) => acc + (k.monthlyQuota > 0 ? k.monthlyQuota : 0), 0);

    const usageByKey = orgKeys.map(k => ({
      keyId: k.id,
      name: k.name,
      plan: k.plan,
      used: k.monthlyUsed,
      quota: k.monthlyQuota,
      percentage: k.monthlyQuota > 0 ? Math.round((k.monthlyUsed / k.monthlyQuota) * 100) : 0,
      lastUsed: k.lastUsed,
    }));

    // Get usage history
    const allUsage: UsageRecord[] = [];
    for (const key of orgKeys) {
      const records = apiUsage.get(key.id) || [];
      allUsage.push(...records);
    }

    // Aggregate by day
    const dailyUsage = new Map<string, number>();
    for (const record of allUsage) {
      const day = record.timestamp.toISOString().split('T')[0];
      dailyUsage.set(day, (dailyUsage.get(day) || 0) + 1);
    }

    return reply.send({
      summary: {
        totalRequests: totalUsage,
        totalQuota: totalQuota > 0 ? totalQuota : 'Unlimited',
        activeKeys: orgKeys.filter(k => k.enabled).length,
        totalKeys: orgKeys.length,
      },
      byKey: usageByKey,
      dailyUsage: Object.fromEntries(dailyUsage),
    });
  });

  // ==================== PUBLIC B2B API ENDPOINTS ====================
  // (Uses API key auth - for external companies consuming the API)

  // API Status / Health
  fastify.get('/intelligence/v1/status', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;

    return reply.send({
      status: 'operational',
      version: 'v1',
      plan: customer.plan,
      usage: {
        used: customer.monthlyUsed,
        quota: customer.monthlyQuota > 0 ? customer.monthlyQuota : 'unlimited',
        rateLimit: `${customer.rateLimit} req/min`,
      },
      capabilities: customer.permissions,
      timestamp: new Date().toISOString(),
    });
  });

  // ---- THREAT INTELLIGENCE FEED ----
  
  fastify.get('/intelligence/v1/threats', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    if (!hasPermission(customer, 'threat-intel')) {
      return reply.status(403).send({ error: 'This endpoint requires threat-intel permission. Upgrade your plan.' });
    }

    const query = request.query as { severity?: string; type?: string; since?: string; limit?: string; source?: string };
    
    // Pull threats from the AI Evolution Engine's live data store
    const evolutionThreats = getEvolutionThreats();
    const evolutionRules = getEvolutionRules();
    const evolutionStatus = getEvolutionStatus();
    
    // Transform evolution threats into API response format
    const threats = evolutionThreats.map(t => ({
      id: t.id,
      source: t.source,
      title: t.title,
      severity: t.severity,
      type: t.type,
      published: t.timestamp.toISOString(),
      indicators: t.iocs || t.cveIds || [],
      mitreTactics: t.mitreId ? [t.mitreId] : [],
      description: t.description,
      aiAnalysis: t.aiAnalysis || null,
      processed: t.processed || false,
      affectedProducts: t.affectedProducts || [],
    }));

    // Apply filters
    let filtered = threats;
    if (query.severity) {
      filtered = filtered.filter(t => t.severity === query.severity);
    }
    if (query.type) {
      filtered = filtered.filter(t => t.type === query.type);
    }
    if (query.source) {
      filtered = filtered.filter(t => t.source.toLowerCase().includes(query.source!.toLowerCase()));
    }
    if (query.since) {
      const sinceDate = new Date(query.since);
      filtered = filtered.filter(t => new Date(t.published) >= sinceDate);
    }
    
    // Sort by most recent first
    filtered.sort((a, b) => new Date(b.published).getTime() - new Date(a.published).getTime());
    
    const limit = parseInt(query.limit || '50');
    filtered = filtered.slice(0, limit);

    // Track usage
    const usage = apiUsage.get(customer.id) || [];
    usage.push({ timestamp: new Date(), endpoint: '/v1/threats', method: 'GET', responseTime: 0, statusCode: 200, tokensUsed: 0 });
    apiUsage.set(customer.id, usage);

    return reply.send({
      threats: filtered,
      total: filtered.length,
      totalAvailable: evolutionThreats.length,
      sources: ['NVD', 'CISA-KEV', 'Abuse.ch', 'MITRE ATT&CK', 'FIRST EPSS', 'AlienVault OTX'],
      detectionRulesAvailable: evolutionRules.length,
      evolutionEngine: {
        lastUpdate: evolutionStatus.lastUpdate,
        threatsProcessed: evolutionStatus.threatsProcessed,
        rulesGenerated: evolutionStatus.rulesGenerated,
        competitiveScore: evolutionStatus.competitiveScore,
      },
      timestamp: new Date().toISOString(),
      poweredBy: 'Anchor Intelligence — Self-Evolving AI',
    });
  });

  // ---- DETECTION RULE GENERATION ----

  fastify.post('/intelligence/v1/rules/generate', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    if (!hasPermission(customer, 'rule-generation')) {
      return reply.status(403).send({ error: 'This endpoint requires rule-generation permission.' });
    }

    const body = request.body as {
      threat: string;
      format: string;
      context?: string;
      severity?: string;
    };

    if (!body.threat || !body.format) {
      return reply.status(400).send({ error: 'threat and format are required fields' });
    }

    const validFormats = ['sigma', 'yara', 'snort', 'suricata', 'kql', 'spl'];
    if (!validFormats.includes(body.format)) {
      return reply.status(400).send({ error: `Invalid format. Options: ${validFormats.join(', ')}` });
    }

    const prompt = `You are an expert security engineer. Generate a production-ready ${body.format.toUpperCase()} detection rule for the following threat:

Threat: ${body.threat}
${body.context ? `Context: ${body.context}` : ''}
${body.severity ? `Severity: ${body.severity}` : ''}

Requirements:
1. The rule must be valid ${body.format.toUpperCase()} syntax
2. Include appropriate metadata (author: Anchor Intelligence, date, references)
3. Minimize false positives
4. Include MITRE ATT&CK mapping

Respond in JSON:
{
  "rule": "the complete rule in proper syntax",
  "description": "what the rule detects",
  "mitreTactic": "primary MITRE ATT&CK tactic",
  "mitreTechnique": "MITRE technique ID (e.g. T1059)",
  "severity": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "falsePositiveRate": "low|medium|high",
  "references": ["URLs"],
  "testCases": ["description of how to test"]
}`;

    const aiResult = await callClaude(prompt, 3000);
    
    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      parsed = { rule: aiResult, description: 'AI-generated rule', confidence: 0.7 };
    }

    const rule: GeneratedRule = {
      id: crypto.randomUUID(),
      customerId: customer.id,
      format: body.format as GeneratedRule['format'],
      rule: (parsed.rule as string) || '',
      threat: body.threat,
      severity: (parsed.severity as string) || body.severity || 'medium',
      confidence: (parsed.confidence as number) || 0.7,
      mitreTactic: (parsed.mitreTactic as string) || '',
      mitreTechnique: (parsed.mitreTechnique as string) || '',
      createdAt: new Date(),
      validated: true,
    };

    const rules = generatedRules.get(customer.id) || [];
    rules.push(rule);
    generatedRules.set(customer.id, rules);

    // Send webhook if configured
    await sendWebhook(customer.id, 'rule.generated', { rule });

    return reply.send({
      success: true,
      rule: {
        id: rule.id,
        format: rule.format,
        content: rule.rule,
        threat: rule.threat,
        severity: rule.severity,
        confidence: rule.confidence,
        mitre: {
          tactic: rule.mitreTactic,
          technique: rule.mitreTechnique,
        },
        description: parsed.description,
        falsePositiveRate: parsed.falsePositiveRate,
        references: parsed.references,
        testCases: parsed.testCases,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Bulk rule generation
  fastify.post('/intelligence/v1/rules/bulk', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    if (!hasPermission(customer, 'rule-generation')) {
      return reply.status(403).send({ error: 'Requires rule-generation permission.' });
    }

    const body = request.body as {
      threats: Array<{ threat: string; format: string; severity?: string }>;
    };

    if (!body.threats || body.threats.length === 0) {
      return reply.status(400).send({ error: 'threats array is required' });
    }

    if (body.threats.length > 25) {
      return reply.status(400).send({ error: 'Maximum 25 threats per bulk request' });
    }

    const results = [];
    for (const item of body.threats) {
      const prompt = `Generate a ${item.format.toUpperCase()} detection rule for: ${item.threat}. Severity: ${item.severity || 'medium'}. 
Respond in JSON: {"rule": "complete rule syntax", "confidence": 0.0-1.0, "mitreTactic": "", "mitreTechnique": ""}`;

      const aiResult = await callClaude(prompt, 1500);
      let parsed: Record<string, unknown> = {};
      try {
        const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        parsed = { rule: aiResult, confidence: 0.6 };
      }

      results.push({
        threat: item.threat,
        format: item.format,
        rule: parsed.rule,
        confidence: parsed.confidence || 0.6,
        mitreTactic: parsed.mitreTactic || '',
        mitreTechnique: parsed.mitreTechnique || '',
      });
    }

    return reply.send({
      success: true,
      rules: results,
      generated: results.length,
      timestamp: new Date().toISOString(),
    });
  });

  // ---- AI THREAT ANALYSIS ----

  fastify.post('/intelligence/v1/analyze', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    if (!hasPermission(customer, 'ai-analysis')) {
      return reply.status(403).send({ error: 'Requires ai-analysis permission. Upgrade to Professional or higher.' });
    }

    const body = request.body as {
      type: 'malware' | 'network' | 'log' | 'incident' | 'vulnerability' | 'ioc';
      data: string;
      context?: string;
    };

    if (!body.type || !body.data) {
      return reply.status(400).send({ error: 'type and data are required fields' });
    }

    const prompt = `You are a world-class security analyst. Analyze the following ${body.type} data:

${body.data}

${body.context ? `Additional context: ${body.context}` : ''}

Provide a comprehensive analysis in JSON:
{
  "verdict": "malicious|suspicious|benign",
  "confidence": 0.0-1.0,
  "severity": "critical|high|medium|low|info",
  "summary": "brief summary",
  "detailedAnalysis": "detailed technical analysis",
  "indicators": ["list of IOCs found"],
  "mitreTactics": ["relevant MITRE ATT&CK tactics"],
  "mitreTechniques": ["relevant technique IDs"],
  "recommendations": ["actionable recommendations"],
  "relatedThreats": ["known related threats or malware families"],
  "timelineSuggestion": "suggested investigation timeline"
}`;

    const aiResult = await callClaude(prompt, 4000);
    
    let analysis: Record<string, unknown> = {};
    try {
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) analysis = JSON.parse(jsonMatch[0]);
    } catch (e) {
      analysis = { verdict: 'unknown', summary: aiResult, confidence: 0.5 };
    }

    const analysisId = crypto.randomUUID();
    threatAnalysisCache.set(analysisId, {
      id: analysisId,
      input: body.data.substring(0, 500),
      analysis: JSON.stringify(analysis),
      severity: (analysis.severity as string) || 'medium',
      indicators: (analysis.indicators as string[]) || [],
      recommendations: (analysis.recommendations as string[]) || [],
      timestamp: new Date(),
    });

    await sendWebhook(customer.id, 'analysis.complete', { analysisId, verdict: analysis.verdict });

    return reply.send({
      id: analysisId,
      ...analysis,
      timestamp: new Date().toISOString(),
      poweredBy: 'Anchor Intelligence AI',
    });
  });

  // ---- PREDICTIVE THREAT MODELING ----

  fastify.post('/intelligence/v1/predict', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    if (!hasPermission(customer, 'predictive')) {
      return reply.status(403).send({ error: 'Requires predictive permission. Upgrade to Professional or higher.' });
    }

    const body = request.body as {
      industry?: string;
      technologies?: string[];
      assets?: string[];
      threatActors?: string[];
      timeframe?: string;
    };

    const prompt = `You are a predictive threat intelligence analyst. Based on current global threat landscape and trends, predict upcoming threats for:

Industry: ${body.industry || 'Technology'}
Technologies: ${body.technologies?.join(', ') || 'General'}
Assets: ${body.assets?.join(', ') || 'Web applications, cloud infrastructure'}
Known threat actors of concern: ${body.threatActors?.join(', ') || 'General'}
Timeframe: ${body.timeframe || '90 days'}

Provide predictions in JSON:
{
  "predictions": [
    {
      "threat": "threat description",
      "likelihood": "high|medium|low",
      "expectedTimeframe": "when this might occur",
      "targetedAssets": ["what will be targeted"],
      "attackVector": "how the attack would happen",
      "mitreTechniques": ["relevant technique IDs"],
      "mitigation": "how to prepare"
    }
  ],
  "emergingTrends": ["new attack patterns to watch"],
  "recommendedActions": ["immediate steps to take"],
  "overallRiskScore": 0-100,
  "confidence": 0.0-1.0
}`;

    const aiResult = await callClaude(prompt, 4000);
    
    let predictions: Record<string, unknown> = {};
    try {
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) predictions = JSON.parse(jsonMatch[0]);
    } catch (e) {
      predictions = { predictions: [], confidence: 0.5 };
    }

    return reply.send({
      ...predictions,
      timestamp: new Date().toISOString(),
      poweredBy: 'Anchor Intelligence Predictive AI',
    });
  });

  // ---- COMPETITIVE INTELLIGENCE ----

  fastify.post('/intelligence/v1/competitive', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    if (!hasPermission(customer, 'competitive-intel')) {
      return reply.status(403).send({ error: 'Requires competitive-intel permission.' });
    }

    const body = request.body as {
      competitors?: string[];
      focus?: string;
    };

    const prompt = `Analyze the current cybersecurity competitive landscape for:
Competitors to analyze: ${body.competitors?.join(', ') || 'CrowdStrike, Palo Alto Networks, SentinelOne, Wiz, Snyk'}
Focus area: ${body.focus || 'Product capabilities and market positioning'}

Provide analysis in JSON:
{
  "competitors": [
    {
      "name": "company name",
      "recentUpdates": ["recent product updates or announcements"],
      "strengths": ["key strengths"],
      "weaknesses": ["key weaknesses"],
      "pricingTrend": "description of pricing changes"
    }
  ],
  "marketTrends": ["key trends in cybersecurity"],
  "opportunities": ["gaps in the market"],
  "threats": ["competitive threats to watch"],
  "recommendations": ["strategic recommendations"]
}`;

    const aiResult = await callClaude(prompt, 4000);
    
    let intel: Record<string, unknown> = {};
    try {
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) intel = JSON.parse(jsonMatch[0]);
    } catch (e) {
      intel = { competitors: [], recommendations: [] };
    }

    return reply.send({
      ...intel,
      timestamp: new Date().toISOString(),
    });
  });

  // ---- WEBHOOK MANAGEMENT ----

  fastify.post('/intelligence/v1/webhooks', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    if (!hasPermission(customer, 'webhooks')) {
      return reply.status(403).send({ error: 'Requires webhooks permission. Available on Enterprise plan.' });
    }

    const body = request.body as {
      url: string;
      events: string[];
    };

    const validEvents = ['threat.new', 'rule.generated', 'analysis.complete', 'prediction.alert'];

    if (!body.url || !body.events?.length) {
      return reply.status(400).send({ error: 'url and events are required', validEvents });
    }

    const webhook: WebhookConfig = {
      id: crypto.randomUUID(),
      url: body.url,
      events: body.events.filter(e => validEvents.includes(e)),
      secret: crypto.randomBytes(32).toString('hex'),
      enabled: true,
    };

    const hooks = customerWebhooks.get(customer.id) || [];
    hooks.push(webhook);
    customerWebhooks.set(customer.id, hooks);

    return reply.send({
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        secret: webhook.secret,
      },
      warning: 'Save the webhook secret. It will not be shown again.',
    });
  });

  // List webhooks
  fastify.get('/intelligence/v1/webhooks', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    const hooks = customerWebhooks.get(customer.id) || [];

    return reply.send({
      webhooks: hooks.map(h => ({
        id: h.id,
        url: h.url,
        events: h.events,
        enabled: h.enabled,
      })),
    });
  });

  // ---- IOC ENRICHMENT ----

  fastify.post('/intelligence/v1/enrich', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    if (!hasPermission(customer, 'threat-intel')) {
      return reply.status(403).send({ error: 'Requires threat-intel permission.' });
    }

    const body = request.body as {
      type: 'ip' | 'domain' | 'hash' | 'url' | 'email';
      value: string;
    };

    if (!body.type || !body.value) {
      return reply.status(400).send({ error: 'type and value are required' });
    }

    // Check AlienVault OTX
    let otxData: Record<string, unknown> = {};
    try {
      const otxUrl = body.type === 'ip' 
        ? `https://otx.alienvault.com/api/v1/indicators/IPv4/${body.value}/general`
        : body.type === 'domain'
        ? `https://otx.alienvault.com/api/v1/indicators/domain/${body.value}/general`
        : body.type === 'hash'
        ? `https://otx.alienvault.com/api/v1/indicators/file/${body.value}/general`
        : null;

      if (otxUrl) {
        const otxRes = await fetch(otxUrl);
        if (otxRes.ok) {
          otxData = await otxRes.json() as Record<string, unknown>;
        }
      }
    } catch (e) { /* OTX unavailable */ }

    // AI enrichment
    const prompt = `Enrich this ${body.type} indicator of compromise: ${body.value}

Available OTX data: ${JSON.stringify(otxData).substring(0, 500)}

Respond in JSON:
{
  "reputation": "malicious|suspicious|clean|unknown",
  "confidence": 0.0-1.0,
  "associatedThreats": ["known threats"],
  "firstSeen": "approximate date",
  "lastSeen": "approximate date",
  "geolocation": "if applicable",
  "relatedIndicators": ["related IOCs"],
  "tags": ["descriptive tags"],
  "recommendations": ["what to do"]
}`;

    const aiResult = await callClaude(prompt, 2000);
    
    let enrichment: Record<string, unknown> = {};
    try {
      const jsonMatch = aiResult.match(/\{[\s\S]*\}/);
      if (jsonMatch) enrichment = JSON.parse(jsonMatch[0]);
    } catch (e) {
      enrichment = { reputation: 'unknown', confidence: 0.3 };
    }

    return reply.send({
      indicator: { type: body.type, value: body.value },
      enrichment,
      sources: ['AlienVault OTX', 'Anchor AI'],
      timestamp: new Date().toISOString(),
    });
  });

  // ---- API DOCUMENTATION ENDPOINT ----

  fastify.get('/intelligence/v1/docs', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      name: 'Anchor Intelligence API',
      version: 'v1',
      description: 'Self-Evolving Security AI — Threat Intelligence, Rule Generation, and Predictive Analysis as a Service',
      baseUrl: '/api/intelligence/v1',
      authentication: 'API Key via x-api-key header',
      endpoints: [
        { method: 'GET', path: '/status', description: 'API status and usage', permission: 'any' },
        { method: 'GET', path: '/threats', description: 'Real-time threat intelligence feed', permission: 'threat-intel' },
        { method: 'POST', path: '/rules/generate', description: 'Generate detection rules (Sigma, YARA, Snort, etc.)', permission: 'rule-generation' },
        { method: 'POST', path: '/rules/bulk', description: 'Bulk rule generation (up to 25)', permission: 'rule-generation' },
        { method: 'POST', path: '/analyze', description: 'AI-powered threat analysis', permission: 'ai-analysis' },
        { method: 'POST', path: '/predict', description: 'Predictive threat modeling', permission: 'predictive' },
        { method: 'POST', path: '/competitive', description: 'Competitive intelligence analysis', permission: 'competitive-intel' },
        { method: 'POST', path: '/enrich', description: 'IOC enrichment (IP, domain, hash, URL, email)', permission: 'threat-intel' },
        { method: 'POST', path: '/webhooks', description: 'Configure webhook notifications', permission: 'webhooks' },
        { method: 'GET', path: '/webhooks', description: 'List configured webhooks', permission: 'webhooks' },
        { method: 'GET', path: '/evolution', description: 'AI evolution engine status and stats', permission: 'any' },
      ],
      dataSources: [
        'NVD (National Vulnerability Database) — Real-time CVE feed',
        'CISA KEV — Known Exploited Vulnerabilities (actively attacked)',
        'Abuse.ch URLhaus — Malware URL intelligence',
        'MITRE ATT&CK — Enterprise technique framework',
        'FIRST EPSS — Exploit Prediction Scoring System',
        'AlienVault OTX — Open Threat Exchange IOC feeds',
        'Anchor AI — Claude-powered analysis and rule generation',
      ],
      plans: Object.entries(B2B_PLANS).map(([tier, config]) => ({
        tier,
        name: config.name,
        price: config.monthlyPrice > 0 ? `$${(config.monthlyPrice / 100).toLocaleString()}/mo` : 'Custom',
        rateLimit: `${config.rateLimit} req/min`,
        quota: config.monthlyQuota > 0 ? config.monthlyQuota.toLocaleString() + ' req/mo' : 'Unlimited',
        permissions: config.permissions,
      })),
      ruleFormats: ['sigma', 'yara', 'snort', 'suricata', 'kql', 'spl'],
      analysisTypes: ['malware', 'network', 'log', 'incident', 'vulnerability', 'ioc'],
      webhookEvents: ['threat.new', 'rule.generated', 'analysis.complete', 'prediction.alert'],
      contact: 'api@anchoraiguard.com',
    });
  });

  // ---- EVOLUTION ENGINE STATUS (for B2B customers) ----
  
  fastify.get('/intelligence/v1/evolution', {
    preHandler: apiKeyAuth()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const customer = (request as any).apiCustomer as APIKeyRecord;
    
    const status = getEvolutionStatus();
    const threats = getEvolutionThreats();
    const rules = getEvolutionRules();
    
    // Track usage
    const usage = apiUsage.get(customer.id) || [];
    usage.push({ timestamp: new Date(), endpoint: '/v1/evolution', method: 'GET', responseTime: 0, statusCode: 200, tokensUsed: 0 });
    apiUsage.set(customer.id, usage);
    
    return reply.send({
      engine: {
        lastUpdate: status.lastUpdate,
        nextScheduledUpdate: status.nextScheduledUpdate,
        threatsProcessed: status.threatsProcessed,
        rulesGenerated: status.rulesGenerated,
        aiAnalysisCount: status.aiAnalysisCount,
        competitiveScore: status.competitiveScore,
      },
      dataStore: {
        totalThreats: threats.length,
        totalRules: rules.length,
        enabledRules: rules.filter(r => r.enabled).length,
        autoGeneratedRules: rules.filter(r => r.autoGenerated).length,
        threatsBySeverity: {
          critical: threats.filter(t => t.severity === 'critical').length,
          high: threats.filter(t => t.severity === 'high').length,
          medium: threats.filter(t => t.severity === 'medium').length,
          low: threats.filter(t => t.severity === 'low').length,
        },
        threatsBySource: Object.entries(
          threats.reduce((acc, t) => { acc[t.source] = (acc[t.source] || 0) + 1; return acc; }, {} as Record<string, number>)
        ).map(([source, count]) => ({ source, count })),
      },
      activeSources: ['NVD', 'CISA KEV', 'Abuse.ch', 'MITRE ATT&CK', 'FIRST EPSS', 'AlienVault OTX'],
      timestamp: new Date().toISOString(),
      poweredBy: 'Anchor Intelligence — Self-Evolving AI',
    });
  });
}
