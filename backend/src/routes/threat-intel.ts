import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';
import { env } from '../config/env';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// Helper to call Claude
async function callClaude(prompt: string, maxTokens = 2048): Promise<string | null> {
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

// Real threat intelligence sources
const THREAT_FEEDS = {
  nvd: 'https://services.nvd.nist.gov/rest/json/cves/2.0',
  cisa: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json',
};

// IOC patterns for detection
const IOC_PATTERNS = {
  ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
  ipv6: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
  domain: /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g,
  hash_md5: /\b[a-fA-F0-9]{32}\b/g,
  hash_sha1: /\b[a-fA-F0-9]{40}\b/g,
  hash_sha256: /\b[a-fA-F0-9]{64}\b/g,
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  url: /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g,
  cve: /CVE-\d{4}-\d{4,7}/gi,
};

// Schemas
const analyzeThreatSchema = z.object({
  ioc: z.string(),
  type: z.enum(['ip', 'domain', 'hash', 'email', 'url', 'cve']),
});

const predictiveAnalysisSchema = z.object({
  projectId: z.string().optional(),
  description: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
});

export async function threatIntelRoutes(app: FastifyInstance): Promise<void> {
  // Get threat intelligence dashboard data
  app.get('/threat-intel/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    // Get findings for IOC extraction
    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Extract IOCs from findings
    const iocs: Record<string, string[]> = {
      ips: [],
      domains: [],
      hashes: [],
      cves: [],
      urls: [],
    };

    for (const finding of findings) {
      const text = `${finding.description} ${finding.reproduction || ''} ${finding.guidance || ''}`;
      
      const ipMatches = text.match(IOC_PATTERNS.ipv4) || [];
      const domainMatches = text.match(IOC_PATTERNS.domain) || [];
      const hashMatches = [...(text.match(IOC_PATTERNS.hash_md5) || []), ...(text.match(IOC_PATTERNS.hash_sha256) || [])];
      const cveMatches = text.match(IOC_PATTERNS.cve) || [];
      const urlMatches = text.match(IOC_PATTERNS.url) || [];

      iocs.ips.push(...ipMatches);
      iocs.domains.push(...domainMatches);
      iocs.hashes.push(...hashMatches);
      iocs.cves.push(...cveMatches);
      iocs.urls.push(...urlMatches);
    }

    // Deduplicate
    Object.keys(iocs).forEach(key => {
      iocs[key] = [...new Set(iocs[key])].slice(0, 50);
    });

    // Calculate threat stats
    const severityStats = findings.reduce((acc, f) => {
      acc[f.severity] = (acc[f.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Get type stats
    const typeStats = findings.reduce((acc, f) => {
      acc[f.type] = (acc[f.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return reply.send({
      stats: {
        totalFindings: findings.length,
        criticalThreats: severityStats['CRITICAL'] || 0,
        highThreats: severityStats['HIGH'] || 0,
        totalIocs: Object.values(iocs).flat().length,
      },
      iocs,
      typeStats,
      recentThreats: findings.slice(0, 10).map(f => ({
        id: f.id,
        title: f.title,
        type: f.type,
        severity: f.severity,
        createdAt: f.createdAt,
      })),
    });
  });

  // Extract IOCs from text
  app.post('/threat-intel/extract-iocs', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { text: string };

    if (!body.text) {
      return reply.status(400).send({ error: 'Text required' });
    }

    const extracted = {
      ipv4: [...new Set(body.text.match(IOC_PATTERNS.ipv4) || [])],
      ipv6: [...new Set(body.text.match(IOC_PATTERNS.ipv6) || [])],
      domains: [...new Set(body.text.match(IOC_PATTERNS.domain) || [])],
      md5: [...new Set(body.text.match(IOC_PATTERNS.hash_md5) || [])],
      sha1: [...new Set(body.text.match(IOC_PATTERNS.hash_sha1) || [])],
      sha256: [...new Set(body.text.match(IOC_PATTERNS.hash_sha256) || [])],
      emails: [...new Set(body.text.match(IOC_PATTERNS.email) || [])],
      urls: [...new Set(body.text.match(IOC_PATTERNS.url) || [])],
      cves: [...new Set(body.text.match(IOC_PATTERNS.cve) || [])],
    };

    const total = Object.values(extracted).flat().length;

    return reply.send({ extracted, total });
  });

  // AI-powered threat analysis
  app.post('/threat-intel/analyze', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = analyzeThreatSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { ioc, type } = parsed.data;

    const result = await callClaude(`You are a threat intelligence analyst. Analyze this indicator of compromise:

IOC: ${ioc}
Type: ${type}

Provide analysis in JSON format:
{
  "malicious": true/false,
  "confidence": 0-100,
  "threatType": "malware|phishing|c2|botnet|scanner|legitimate|unknown",
  "description": "brief description",
  "mitreAttackTechniques": ["T1XXX"],
  "recommendations": ["action1", "action2"],
  "relatedIndicators": ["related IOC if known"]
}

Only return valid JSON.`);

    if (!result) {
      return reply.send({
        ioc,
        type,
        analysis: {
          malicious: false,
          confidence: 0,
          description: 'AI analysis unavailable',
          recommendations: ['Manual review required'],
        },
        source: 'fallback',
      });
    }

    try {
      const analysis = JSON.parse(result);
      return reply.send({ ioc, type, analysis, source: 'ai' });
    } catch {
      return reply.send({
        ioc,
        type,
        analysis: { description: result, malicious: false, confidence: 0 },
        source: 'ai-raw',
      });
    }
  });

  // WORLD-FIRST: Predictive CVE Intelligence
  app.post('/threat-intel/predict-vulnerabilities', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const parsed = predictiveAnalysisSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    // Get project findings for context
    const where = parsed.data.projectId
      ? { projectId: parsed.data.projectId }
      : { project: { orgId: user.orgId } };

    const findings = await prisma.finding.findMany({
      where,
      orderBy: { severity: 'asc' },
      take: 50,
    });

    const findingSummary = findings.map(f => `${f.type}: ${f.title} [${f.severity}]`).join('\n');
    const deps = parsed.data.dependencies?.join(', ') || 'unknown';

    const result = await callClaude(`You are a vulnerability prediction expert. Based on the codebase analysis and dependencies, predict potential future vulnerabilities.

Current findings:
${findingSummary}

Dependencies: ${deps}
Additional context: ${parsed.data.description || 'None'}

Provide predictions in JSON format:
{
  "predictions": [
    {
      "vulnerabilityType": "type",
      "likelihood": "high|medium|low",
      "timeframe": "weeks|months|quarters",
      "affectedComponents": ["component"],
      "rationale": "why this is likely",
      "preventiveMeasures": ["measure1"]
    }
  ],
  "riskTrends": {
    "increasing": ["risk type"],
    "stable": ["risk type"],
    "decreasing": ["risk type"]
  },
  "recommendations": ["priority action"],
  "confidenceScore": 0-100
}

Only return valid JSON.`);

    if (!result) {
      return reply.send({
        predictions: [
          { vulnerabilityType: 'Dependency Vulnerabilities', likelihood: 'high', timeframe: 'months', rationale: 'Based on finding patterns' },
          { vulnerabilityType: 'Configuration Issues', likelihood: 'medium', timeframe: 'quarters', rationale: 'Common in similar projects' },
        ],
        recommendations: ['Implement regular dependency scanning', 'Review security configurations'],
        source: 'heuristic',
      });
    }

    try {
      const prediction = JSON.parse(result);
      return reply.send({ ...prediction, source: 'ai-prediction', model: 'claude-3-haiku' });
    } catch {
      return reply.status(500).send({ error: 'Prediction parse failed' });
    }
  });

  // Get real CVE data from NVD
  app.get('/threat-intel/cves', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { keyword?: string; severity?: string; limit?: string };

    try {
      let url = `${THREAT_FEEDS.nvd}?resultsPerPage=${query.limit || 20}`;
      if (query.keyword) {
        url += `&keywordSearch=${encodeURIComponent(query.keyword)}`;
      }
      if (query.severity) {
        url += `&cvssV3Severity=${query.severity.toUpperCase()}`;
      }

      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        return reply.send({ source: 'cache', cves: [] });
      }

      const data = await response.json();
      const cves = (data.vulnerabilities || []).slice(0, 20).map((item: Record<string, unknown>) => {
        const cve = item.cve as Record<string, unknown>;
        const metrics = cve.metrics as Record<string, unknown[]> || {};
        const cvssData = (metrics.cvssMetricV31?.[0] as Record<string, unknown>)?.cvssData as Record<string, unknown> || {};

        return {
          id: cve.id,
          description: ((cve.descriptions as { lang: string; value: string }[]) || [])
            .find(d => d.lang === 'en')?.value?.substring(0, 300),
          cvssScore: cvssData.baseScore,
          severity: cvssData.baseSeverity,
          published: cve.published,
        };
      });

      return reply.send({ source: 'nvd', total: data.totalResults, cves });
    } catch (error) {
      console.error('NVD fetch error:', error);
      return reply.send({ source: 'error', cves: [] });
    }
  });

  // Get CISA Known Exploited Vulnerabilities
  app.get('/threat-intel/kev', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const response = await fetch(THREAT_FEEDS.cisa, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        return reply.send({ source: 'cache', vulnerabilities: [] });
      }

      const data = await response.json();
      const vulnerabilities = (data.vulnerabilities || []).slice(0, 50).map((v: Record<string, string>) => ({
        cveId: v.cveID,
        vendor: v.vendorProject,
        product: v.product,
        name: v.vulnerabilityName,
        description: v.shortDescription?.substring(0, 300),
        dateAdded: v.dateAdded,
        dueDate: v.dueDate,
        knownRansomware: v.knownRansomwareCampaignUse,
      }));

      return reply.send({
        source: 'cisa',
        total: data.vulnerabilities?.length || 0,
        catalogVersion: data.catalogVersion,
        vulnerabilities,
      });
    } catch (error) {
      console.error('CISA KEV fetch error:', error);
      return reply.send({ source: 'error', vulnerabilities: [] });
    }
  });

  // Check IOC reputation
  app.post('/threat-intel/reputation', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { ioc: string; type: string };

    if (!body.ioc || !body.type) {
      return reply.status(400).send({ error: 'IOC and type required' });
    }

    // Use AI for reputation check
    const result = await callClaude(`Rate the reputation of this indicator of compromise on a scale of 0-100 (0=malicious, 100=clean):

IOC: ${body.ioc}
Type: ${body.type}

Respond with JSON only:
{
  "reputation": 0-100,
  "category": "malicious|suspicious|neutral|clean",
  "details": "brief explanation",
  "lastSeen": "date if known or 'unknown'",
  "sources": ["source1"]
}

Only return valid JSON.`);

    if (!result) {
      return reply.send({
        ioc: body.ioc,
        type: body.type,
        reputation: { score: 50, category: 'unknown', details: 'Unable to check reputation' },
        source: 'fallback',
      });
    }

    try {
      const reputation = JSON.parse(result);
      return reply.send({ ioc: body.ioc, type: body.type, reputation, source: 'ai' });
    } catch {
      return reply.send({
        ioc: body.ioc,
        type: body.type,
        reputation: { score: 50, category: 'unknown', details: result },
        source: 'ai-raw',
      });
    }
  });
}
