import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';
import { env } from '../config/env';
import * as dns from 'dns';
import { promisify } from 'util';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const resolveDns = promisify(dns.resolve);
const lookupDns = promisify(dns.lookup);

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

// Asset types for attack surface
type AssetType = 'domain' | 'subdomain' | 'ip' | 'port' | 'service' | 'certificate' | 'technology' | 'endpoint';

// In-memory asset store
interface Asset {
  id: string;
  type: AssetType;
  value: string;
  discoveredAt: Date;
  lastSeen: Date;
  riskScore: number;
  status: 'active' | 'inactive' | 'unknown';
  metadata: Record<string, unknown>;
  vulnerabilities: string[];
  orgId: string;
}

const assetStore: Map<string, Asset> = new Map();

// Schemas
const addAssetSchema = z.object({
  type: z.enum(['domain', 'subdomain', 'ip', 'port', 'service', 'certificate', 'technology', 'endpoint']),
  value: z.string(),
  metadata: z.record(z.unknown()).optional(),
});

const discoverSchema = z.object({
  domain: z.string(),
  depth: z.enum(['quick', 'standard', 'deep']).optional(),
});

const analyzeSchema = z.object({
  assetIds: z.array(z.string()).optional(),
  includeVulnerabilities: z.boolean().optional(),
});

export async function attackSurfaceRoutes(app: FastifyInstance): Promise<void> {
  // Get attack surface dashboard
  app.get('/attack-surface/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    const assets = Array.from(assetStore.values()).filter(a => a.orgId === user.orgId);

    // Get findings for vulnerability correlation
    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId } },
    });

    // Calculate stats
    const assetsByType = assets.reduce((acc, a) => {
      acc[a.type] = (acc[a.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const highRiskAssets = assets.filter(a => a.riskScore >= 70);
    const externalAssets = assets.filter(a => ['domain', 'subdomain', 'ip', 'endpoint'].includes(a.type));

    return reply.send({
      stats: {
        totalAssets: assets.length,
        highRiskAssets: highRiskAssets.length,
        externalAssets: externalAssets.length,
        vulnerableAssets: assets.filter(a => a.vulnerabilities.length > 0).length,
        avgRiskScore: assets.length > 0 
          ? Math.round(assets.reduce((sum, a) => sum + a.riskScore, 0) / assets.length)
          : 0,
      },
      assetsByType,
      highRiskAssets: highRiskAssets.slice(0, 10).map(a => ({
        id: a.id,
        type: a.type,
        value: a.value,
        riskScore: a.riskScore,
        vulnerabilities: a.vulnerabilities.length,
      })),
      recentDiscoveries: assets
        .sort((a, b) => b.discoveredAt.getTime() - a.discoveredAt.getTime())
        .slice(0, 10)
        .map(a => ({
          id: a.id,
          type: a.type,
          value: a.value,
          discoveredAt: a.discoveredAt,
        })),
      relatedFindings: findings.length,
    });
  });

  // Add asset manually
  app.post('/attack-surface/assets', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const parsed = addAssetSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const asset: Asset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: parsed.data.type,
      value: parsed.data.value,
      discoveredAt: new Date(),
      lastSeen: new Date(),
      riskScore: 50,
      status: 'active',
      metadata: parsed.data.metadata || {},
      vulnerabilities: [],
      orgId: user.orgId,
    };

    assetStore.set(asset.id, asset);
    return reply.status(201).send({ asset });
  });

  // Get all assets
  app.get('/attack-surface/assets', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const query = request.query as { type?: string; minRisk?: string };

    let assets = Array.from(assetStore.values()).filter(a => a.orgId === user.orgId);

    if (query.type) {
      assets = assets.filter(a => a.type === query.type);
    }
    if (query.minRisk) {
      const minRisk = parseInt(query.minRisk);
      assets = assets.filter(a => a.riskScore >= minRisk);
    }

    return reply.send({ assets, total: assets.length });
  });

  // Get asset details
  app.get('/attack-surface/assets/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };

    const asset = assetStore.get(id);
    if (!asset || asset.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Asset not found' });
    }

    return reply.send({ asset });
  });

  // Delete asset
  app.delete('/attack-surface/assets/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };

    const asset = assetStore.get(id);
    if (!asset || asset.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Asset not found' });
    }

    assetStore.delete(id);
    return reply.send({ success: true });
  });

  // Discover assets for a domain (WORLD-FIRST: Automated Attack Surface Discovery)
  app.post('/attack-surface/discover', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const parsed = discoverSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { domain, depth = 'standard' } = parsed.data;
    const discoveredAssets: Asset[] = [];

    // 1. Add the main domain
    const mainDomainAsset: Asset = {
      id: `asset-${Date.now()}-main`,
      type: 'domain',
      value: domain,
      discoveredAt: new Date(),
      lastSeen: new Date(),
      riskScore: 30,
      status: 'active',
      metadata: { primary: true },
      vulnerabilities: [],
      orgId: user.orgId,
    };
    assetStore.set(mainDomainAsset.id, mainDomainAsset);
    discoveredAssets.push(mainDomainAsset);

    // 2. DNS lookups
    try {
      const aRecords = await resolveDns(domain, 'A').catch(() => []);
      for (const ip of aRecords as string[]) {
        const ipAsset: Asset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'ip',
          value: ip,
          discoveredAt: new Date(),
          lastSeen: new Date(),
          riskScore: 40,
          status: 'active',
          metadata: { source: domain, recordType: 'A' },
          vulnerabilities: [],
          orgId: user.orgId,
        };
        assetStore.set(ipAsset.id, ipAsset);
        discoveredAssets.push(ipAsset);
      }

      const mxRecords = await resolveDns(domain, 'MX').catch(() => []);
      for (const mx of mxRecords as { exchange: string; priority: number }[]) {
        const mxAsset: Asset = {
          id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          type: 'service',
          value: `MX: ${mx.exchange} (priority: ${mx.priority})`,
          discoveredAt: new Date(),
          lastSeen: new Date(),
          riskScore: 35,
          status: 'active',
          metadata: { source: domain, recordType: 'MX', priority: mx.priority },
          vulnerabilities: [],
          orgId: user.orgId,
        };
        assetStore.set(mxAsset.id, mxAsset);
        discoveredAssets.push(mxAsset);
      }
    } catch (dnsError) {
      console.log('DNS discovery partial failure:', dnsError);
    }

    // 3. Common subdomain enumeration
    if (depth !== 'quick') {
      const commonSubdomains = ['www', 'mail', 'api', 'app', 'dev', 'staging', 'admin', 'portal', 'cdn', 'static'];
      
      for (const sub of commonSubdomains) {
        const subdomain = `${sub}.${domain}`;
        try {
          await lookupDns(subdomain);
          const subAsset: Asset = {
            id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            type: 'subdomain',
            value: subdomain,
            discoveredAt: new Date(),
            lastSeen: new Date(),
            riskScore: 45,
            status: 'active',
            metadata: { source: domain, discovered: 'enumeration' },
            vulnerabilities: [],
            orgId: user.orgId,
          };
          assetStore.set(subAsset.id, subAsset);
          discoveredAssets.push(subAsset);
        } catch {
          // Subdomain doesn't exist
        }
      }
    }

    // 4. Add common endpoints
    const endpoints = [`https://${domain}`, `https://${domain}/api`, `https://${domain}/admin`];
    for (const endpoint of endpoints.slice(0, depth === 'deep' ? 3 : 1)) {
      const endpointAsset: Asset = {
        id: `asset-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type: 'endpoint',
        value: endpoint,
        discoveredAt: new Date(),
        lastSeen: new Date(),
        riskScore: 50,
        status: 'unknown',
        metadata: { needsVerification: true },
        vulnerabilities: [],
        orgId: user.orgId,
      };
      assetStore.set(endpointAsset.id, endpointAsset);
      discoveredAssets.push(endpointAsset);
    }

    return reply.send({
      domain,
      depth,
      discovered: discoveredAssets.length,
      assets: discoveredAssets,
      discoveredAt: new Date().toISOString(),
    });
  });

  // AI-powered attack surface analysis
  app.post('/attack-surface/analyze', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    // Track AI query usage
    const { trackAIQuery } = await import('./billing');
    trackAIQuery(user.orgId).catch(() => {});

    const parsed = analyzeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    let assets = Array.from(assetStore.values()).filter(a => a.orgId === user.orgId);
    
    if (parsed.data.assetIds && parsed.data.assetIds.length > 0) {
      assets = assets.filter(a => parsed.data.assetIds!.includes(a.id));
    }

    if (assets.length === 0) {
      return reply.status(400).send({ error: 'No assets to analyze' });
    }

    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId } },
      orderBy: { severity: 'asc' },
      take: 50,
    });

    const assetSummary = assets.map(a => `- ${a.type}: ${a.value} (risk: ${a.riskScore})`).join('\n');
    const findingSummary = findings.slice(0, 10).map(f => `- [${f.severity}] ${f.title}`).join('\n');

    const result = await callClaude(`Analyze this organization's attack surface and provide security recommendations.

Assets discovered:
${assetSummary}

Related security findings:
${findingSummary}

Provide analysis in JSON format:
{
  "overallRiskLevel": "critical|high|medium|low",
  "confidence": 0-100,
  "summary": "Executive summary of attack surface exposure",
  "criticalExposures": ["exposure1", "exposure2"],
  "attackVectors": [
    {"vector": "attack vector", "likelihood": "high|medium|low", "impact": "high|medium|low"}
  ],
  "recommendations": [
    {"priority": 1-5, "action": "recommended action", "effort": "low|medium|high"}
  ]
}

Only return valid JSON.`);

    if (!result) {
      const riskCategories = {
        high: assets.filter(a => a.riskScore >= 70).length,
        medium: assets.filter(a => a.riskScore >= 40 && a.riskScore < 70).length,
        low: assets.filter(a => a.riskScore < 40).length,
      };

      return reply.send({
        summary: {
          totalAssets: assets.length,
          riskCategories,
          overallRisk: riskCategories.high > 0 ? 'HIGH' : riskCategories.medium > 0 ? 'MEDIUM' : 'LOW',
        },
        recommendations: [
          'Review high-risk assets for immediate action',
          'Implement continuous monitoring',
          'Document all external-facing services',
        ],
        source: 'heuristic',
      });
    }

    try {
      const analysis = JSON.parse(result);
      return reply.send({
        analysis,
        assetCount: assets.length,
        source: 'ai-analysis',
        model: 'claude-3-haiku',
      });
    } catch {
      return reply.status(500).send({ error: 'Analysis parse failed' });
    }
  });

  // Calculate risk score for asset
  app.post('/attack-surface/assets/:id/calculate-risk', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };

    const asset = assetStore.get(id);
    if (!asset || asset.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Asset not found' });
    }

    let riskScore = 30;

    if (asset.type === 'endpoint') riskScore += 20;
    if (asset.type === 'ip') riskScore += 15;
    if (asset.type === 'subdomain') riskScore += 10;
    if (asset.metadata.external) riskScore += 15;
    riskScore += asset.vulnerabilities.length * 10;
    riskScore = Math.min(100, riskScore);

    asset.riskScore = riskScore;
    assetStore.set(id, asset);

    return reply.send({
      asset,
      riskBreakdown: {
        baseScore: 30,
        typeModifier: asset.type === 'endpoint' ? 20 : asset.type === 'ip' ? 15 : 10,
        vulnerabilities: asset.vulnerabilities.length * 10,
        total: riskScore,
      },
    });
  });
}
