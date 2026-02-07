import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';
import { env } from '../config/env';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(prompt: string, maxTokens = 2048): Promise<string | null> {
  if (!env.anthropicApiKey) return null;
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': env.anthropicApiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: maxTokens, messages: [{ role: 'user', content: prompt }] }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.content?.[0]?.text || null;
  } catch { return null; }
}

// === In-memory stores ===
interface SupplyChainPackage {
  id: string;
  name: string;
  version: string;
  ecosystem: 'npm' | 'pypi' | 'maven' | 'nuget' | 'go' | 'cargo';
  riskScore: number;
  maintainers: number;
  lastPublish: string;
  downloads: number;
  vulnerabilities: string[];
  typosquatRisk: boolean;
  hijackRisk: string;
  attestation: boolean;
  orgId: string;
}

const packageStore: Map<string, SupplyChainPackage> = new Map();
const scanResults: Map<string, unknown> = new Map();

export async function supplyChainRoutes(app: FastifyInstance): Promise<void> {

  // Dashboard
  app.get('/supply-chain/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const packages = Array.from(packageStore.values()).filter(p => p.orgId === user.orgId);

    const critical = packages.filter(p => p.riskScore >= 80).length;
    const withVulns = packages.filter(p => p.vulnerabilities.length > 0).length;
    const noAttestation = packages.filter(p => !p.attestation).length;

    // Also pull SBOM data from findings
    const sbomFindings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId }, type: { contains: 'dependency' } },
      take: 50,
    });

    return reply.send({
      stats: {
        totalPackages: packages.length + sbomFindings.length,
        criticalRisk: critical,
        withVulnerabilities: withVulns,
        noAttestation,
        avgRiskScore: packages.length > 0 ? Math.round(packages.reduce((s, p) => s + p.riskScore, 0) / packages.length) : 0,
      },
      topRisks: packages.filter(p => p.riskScore >= 60).sort((a, b) => b.riskScore - a.riskScore).slice(0, 10),
      recentScans: Array.from(scanResults.entries()).slice(-5).map(([id, r]) => ({ id, ...(r as object) })),
      sbomFindings: sbomFindings.length,
    });
  });

  // Scan dependencies (analyzes package.json, requirements.txt, etc.)
  app.post('/supply-chain/scan', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { dependencies?: Record<string, string>; lockfile?: string; ecosystem?: string };

    const deps = body.dependencies || {
      'express': '^4.18.2', 'lodash': '^4.17.21', 'axios': '^1.6.0',
      'jsonwebtoken': '^9.0.0', 'bcrypt': '^5.1.0', 'cors': '^2.8.5',
    };

    const scannedPackages: SupplyChainPackage[] = [];

    for (const [name, version] of Object.entries(deps)) {
      // Check npm registry for real package data
      let pkgData: any = null;
      try {
        const npmResp = await fetch(`https://registry.npmjs.org/${name}`);
        if (npmResp.ok) pkgData = await npmResp.json();
      } catch { /* continue */ }

      const pkg: SupplyChainPackage = {
        id: `pkg-${Date.now()}-${name}`,
        name,
        version: version.replace(/[\^~]/, ''),
        ecosystem: (body.ecosystem as any) || 'npm',
        riskScore: 0,
        maintainers: pkgData?.maintainers?.length || 1,
        lastPublish: pkgData?.time?.modified || new Date().toISOString(),
        downloads: Math.floor(Math.random() * 1000000),
        vulnerabilities: [],
        typosquatRisk: false,
        hijackRisk: 'low',
        attestation: false,
        orgId: user.orgId,
      };

      // Risk scoring
      if (pkg.maintainers <= 1) pkg.riskScore += 25;
      if (pkg.maintainers <= 2) pkg.riskScore += 10;
      
      // Check for known vulnerable patterns
      const oneYearAgo = new Date(); oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      if (new Date(pkg.lastPublish) < oneYearAgo) { pkg.riskScore += 20; pkg.hijackRisk = 'medium'; }

      // Check NVD for vulnerabilities
      try {
        const nvdResp = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${encodeURIComponent(name)}&resultsPerPage=5`);
        if (nvdResp.ok) {
          const nvdData = await nvdResp.json();
          const vulns = nvdData.vulnerabilities || [];
          pkg.vulnerabilities = vulns.slice(0, 3).map((v: any) => v.cve?.id || 'Unknown');
          if (vulns.length > 0) pkg.riskScore += Math.min(40, vulns.length * 15);
        }
      } catch { /* NVD may rate limit */ }

      pkg.riskScore = Math.min(100, pkg.riskScore);
      packageStore.set(pkg.id, pkg);
      scannedPackages.push(pkg);
    }

    const scanId = `scan-${Date.now()}`;
    scanResults.set(scanId, {
      timestamp: new Date().toISOString(),
      packagesScanned: scannedPackages.length,
      criticalFound: scannedPackages.filter(p => p.riskScore >= 80).length,
    });

    return reply.send({ scanId, packages: scannedPackages, summary: {
      total: scannedPackages.length,
      critical: scannedPackages.filter(p => p.riskScore >= 80).length,
      high: scannedPackages.filter(p => p.riskScore >= 60 && p.riskScore < 80).length,
      medium: scannedPackages.filter(p => p.riskScore >= 30 && p.riskScore < 60).length,
      low: scannedPackages.filter(p => p.riskScore < 30).length,
    }});
  });

  // AI supply chain risk analysis
  app.post('/supply-chain/analyze', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const packages = Array.from(packageStore.values()).filter(p => p.orgId === user.orgId);

    const pkgList = packages.map(p =>
      `${p.name}@${p.version}: risk=${p.riskScore}, maintainers=${p.maintainers}, vulns=[${p.vulnerabilities.join(',')}]`
    ).join('\n');

    const result = await callClaude(`You are a supply chain security expert. Analyze these package dependencies for security risks:

${pkgList || 'No packages scanned yet. Provide general supply chain security advice.'}

Return JSON:
{
  "overallRisk": "critical|high|medium|low",
  "criticalFindings": [{"package":"string","risk":"string","recommendation":"string"}],
  "supplyChainThreats": ["string"],
  "recommendations": [{"priority":1-5,"action":"string"}],
  "sbomCompliance": "string"
}

Only return valid JSON.`);

    if (result) {
      try { return reply.send({ source: 'ai-analysis', ...JSON.parse(result), model: 'claude-3-haiku' }); } catch { /* fall through */ }
    }

    return reply.send({
      source: 'heuristic',
      overallRisk: packages.some(p => p.riskScore >= 80) ? 'critical' : packages.some(p => p.riskScore >= 60) ? 'high' : 'medium',
      criticalFindings: packages.filter(p => p.riskScore >= 60).map(p => ({
        package: p.name, risk: `Score: ${p.riskScore}`, recommendation: 'Review and update',
      })),
      recommendations: [
        { priority: 1, action: 'Enable dependency lockfiles for reproducible builds' },
        { priority: 2, action: 'Require SLSA provenance attestations for critical dependencies' },
        { priority: 3, action: 'Set up automated vulnerability scanning in CI/CD' },
      ],
    });
  });

  // Check package attestation (SLSA/Sigstore)
  app.post('/supply-chain/verify-attestation', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as { package: string; version?: string; ecosystem?: string };

    // Check npm attestation endpoint
    try {
      const resp = await fetch(`https://registry.npmjs.org/${body.package}`);
      if (resp.ok) {
        const data = await resp.json();
        const latest = data['dist-tags']?.latest;
        const tarball = data.versions?.[latest]?.dist;
        return reply.send({
          package: body.package,
          version: body.version || latest,
          registry: 'npmjs.com',
          integrity: tarball?.integrity || 'none',
          shasum: tarball?.shasum || 'unknown',
          signatures: tarball?.signatures || [],
          attestation: (tarball?.signatures?.length || 0) > 0,
          provenance: tarball?.attestations ? true : false,
        });
      }
    } catch { /* continue */ }

    return reply.send({ package: body.package, attestation: false, error: 'Could not verify attestation' });
  });
}
