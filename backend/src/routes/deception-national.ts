import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authMiddleware } from '../lib/auth';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';

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

// === Deception Technology ===

interface Honeypot {
  id: string;
  name: string;
  type: 'ssh' | 'http' | 'database' | 'smb' | 'rdp' | 'api' | 'dns' | 'ftp';
  status: 'active' | 'inactive' | 'compromised';
  ip: string;
  port: number;
  interactions: number;
  lastInteraction?: Date;
  orgId: string;
}

interface DecoyFile {
  id: string;
  name: string;
  type: 'document' | 'credential' | 'config' | 'database' | 'certificate';
  location: string;
  accessCount: number;
  lastAccess?: Date;
  alertOnAccess: boolean;
  orgId: string;
}

interface BreadcrumbTrail {
  id: string;
  crumbs: Array<{ type: string; value: string; location: string }>;
  targetsHoneypot: string;
  triggered: boolean;
  orgId: string;
}

const honeypotStore: Map<string, Honeypot> = new Map();
const decoyStore: Map<string, DecoyFile> = new Map();
const breadcrumbStore: Map<string, BreadcrumbTrail> = new Map();
const deceptionAlerts: Array<{ id: string; honeypotId: string; sourceIp: string; action: string; timestamp: Date; severity: string; orgId: string }> = [];

export async function deceptionRoutes(app: FastifyInstance): Promise<void> {

  // Dashboard
  app.get('/deception/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const honeypots = Array.from(honeypotStore.values()).filter(h => h.orgId === user.orgId);
    const decoys = Array.from(decoyStore.values()).filter(d => d.orgId === user.orgId);
    const breadcrumbs = Array.from(breadcrumbStore.values()).filter(b => b.orgId === user.orgId);
    const alerts = deceptionAlerts.filter(a => a.orgId === user.orgId);

    return reply.send({
      stats: {
        activeHoneypots: honeypots.filter(h => h.status === 'active').length,
        totalDecoys: decoys.length,
        breadcrumbTrails: breadcrumbs.length,
        totalInteractions: honeypots.reduce((s, h) => s + h.interactions, 0),
        attackersTrapped: new Set(alerts.map(a => a.sourceIp)).size,
        alertsToday: alerts.filter(a => a.timestamp > new Date(Date.now() - 86400000)).length,
      },
      honeypots: honeypots.map(h => ({ id: h.id, name: h.name, type: h.type, status: h.status, interactions: h.interactions, lastInteraction: h.lastInteraction })),
      recentAlerts: alerts.slice(-10).reverse(),
      decoyFiles: decoys.map(d => ({ id: d.id, name: d.name, type: d.type, accessCount: d.accessCount, lastAccess: d.lastAccess })),
    });
  });

  // Deploy honeypot
  app.post('/deception/honeypots', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { name: string; type: string; port?: number };

    const portMap: Record<string, number> = { ssh: 22, http: 8080, database: 3306, smb: 445, rdp: 3389, api: 443, dns: 53, ftp: 21 };
    const honeypot: Honeypot = {
      id: `hp-${Date.now()}`, name: body.name, type: body.type as Honeypot['type'],
      status: 'active', ip: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      port: body.port || portMap[body.type] || 8080, interactions: 0, orgId: user.orgId,
    };
    honeypotStore.set(honeypot.id, honeypot);
    return reply.status(201).send({ honeypot });
  });

  // Simulate honeypot interaction (for testing)
  app.post('/deception/honeypots/:id/interact', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };
    const body = request.body as { sourceIp?: string; action?: string };

    const honeypot = honeypotStore.get(id);
    if (!honeypot || honeypot.orgId !== user.orgId) return reply.status(404).send({ error: 'Honeypot not found' });

    honeypot.interactions++;
    honeypot.lastInteraction = new Date();

    const alert = {
      id: `da-${Date.now()}`, honeypotId: id, sourceIp: body.sourceIp || '192.168.1.' + Math.floor(Math.random() * 255),
      action: body.action || 'connection_attempt', timestamp: new Date(), severity: 'high', orgId: user.orgId,
    };
    deceptionAlerts.push(alert);

    return reply.send({ alert, message: 'Interaction recorded, alert generated' });
  });

  // Deploy decoy files
  app.post('/deception/decoys', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { name: string; type: string; location: string };

    const decoy: DecoyFile = {
      id: `decoy-${Date.now()}`, name: body.name, type: body.type as DecoyFile['type'],
      location: body.location, accessCount: 0, alertOnAccess: true, orgId: user.orgId,
    };
    decoyStore.set(decoy.id, decoy);
    return reply.status(201).send({ decoy });
  });

  // Create breadcrumb trail
  app.post('/deception/breadcrumbs', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { targetHoneypot: string; crumbs: Array<{ type: string; value: string; location: string }> };

    const trail: BreadcrumbTrail = {
      id: `bc-${Date.now()}`, crumbs: body.crumbs || [
        { type: 'credential', value: 'admin:P@ssw0rd_backup', location: '/var/log/debug.log' },
        { type: 'ssh_key', value: 'id_rsa_backup', location: '~/.ssh/' },
        { type: 'config', value: 'db_connection_string', location: '/tmp/.env.bak' },
      ],
      targetsHoneypot: body.targetHoneypot, triggered: false, orgId: user.orgId,
    };
    breadcrumbStore.set(trail.id, trail);
    return reply.status(201).send({ trail });
  });

  // AI attacker behavior analysis
  app.post('/deception/analyze-attacker', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const alerts = deceptionAlerts.filter(a => a.orgId === user.orgId);

    const alertSummary = alerts.slice(-20).map(a => `${a.sourceIp} -> ${a.honeypotId} (${a.action}) at ${a.timestamp.toISOString()}`).join('\n');

    const result = await callClaude(`You are a threat intelligence analyst specializing in deception technology. Analyze these honeypot interactions:

${alertSummary || 'No interactions yet. Provide general deception technology best practices.'}

Return JSON:
{"attackerProfiles":[{"ip":"string","classification":"string","sophistication":"low|medium|high","likelyMotivation":"string","ttps":["string"]}],"patterns":["string"],"recommendations":[{"priority":"critical|high|medium","action":"string"}],"riskAssessment":"string"}

Only return valid JSON.`);

    if (result) {
      try { return reply.send({ source: 'ai-analysis', ...JSON.parse(result), model: 'claude-3-haiku' }); } catch { /* fall through */ }
    }

    return reply.send({ source: 'heuristic', attackerProfiles: [], patterns: ['No significant patterns detected yet'],
      recommendations: [{ priority: 'high', action: 'Deploy honeypots across network segments' }] });
  });
}

// === Regulatory Intelligence ===

interface RegulatoryUpdate {
  id: string;
  title: string;
  jurisdiction: string;
  regulation: string;
  effectiveDate: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  summary: string;
  actionRequired: boolean;
}

const regulatoryUpdates: Map<string, RegulatoryUpdate[]> = new Map();

export async function regulatoryIntelRoutes(app: FastifyInstance): Promise<void> {

  // Dashboard
  app.get('/regulatory-intel/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const updates = regulatoryUpdates.get(user.orgId) || [];

    // Pull compliance-related findings
    const complianceFindings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId }, type: { contains: 'compliance' } },
      take: 20,
    });

    return reply.send({
      stats: {
        activeRegulations: 12,
        pendingChanges: updates.filter(u => u.actionRequired).length,
        jurisdictions: ['Australia', 'USA', 'EU', 'UK', 'APAC'],
        complianceGaps: complianceFindings.length,
      },
      upcomingChanges: [
        { regulation: 'Privacy Act 1988 (AU)', change: 'Mandatory data breach notification within 72 hours', effectiveDate: '2026-07-01', impact: 'high' },
        { regulation: 'DORA (EU)', change: 'Digital operational resilience testing requirements', effectiveDate: '2026-01-17', impact: 'critical' },
        { regulation: 'CIRCIA (US)', change: 'Cyber incident reporting for critical infrastructure', effectiveDate: '2026-04-01', impact: 'high' },
        { regulation: 'Critical Infrastructure Act (AU)', change: 'SOCI Act risk management program updates', effectiveDate: '2026-06-01', impact: 'critical' },
        { regulation: 'AI Act (EU)', change: 'High-risk AI system transparency requirements', effectiveDate: '2026-08-01', impact: 'medium' },
      ],
      recentUpdates: updates.slice(-5),
    });
  });

  // AI regulatory impact analysis
  app.post('/regulatory-intel/analyze-impact', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { regulation?: string; jurisdiction?: string; industry?: string };

    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId } }, take: 30,
    });

    const findingsSummary = findings.map(f => `${f.severity}: ${f.title}`).join('\n');

    const result = await callClaude(`You are a cybersecurity regulatory expert. Analyze regulatory impact for:
Regulation: ${body.regulation || 'General cybersecurity regulations'}
Jurisdiction: ${body.jurisdiction || 'Australia, USA, EU'}
Industry: ${body.industry || 'Technology'}

Organization's current security findings:
${findingsSummary || 'No findings available.'}

Return JSON:
{"applicableRegulations":[{"name":"string","jurisdiction":"string","status":"compliant|partial|non-compliant","deadlines":["string"],"requirements":["string"]}],"gaps":[{"regulation":"string","gap":"string","remediation":"string","priority":"critical|high|medium"}],"timeline":[{"date":"string","event":"string","action":"string"}],"riskScore":0-100}

Only return valid JSON.`);

    if (result) {
      try { return reply.send({ source: 'ai-analysis', ...JSON.parse(result), model: 'claude-3-haiku' }); } catch { /* fall through */ }
    }

    return reply.send({ source: 'heuristic', applicableRegulations: [
      { name: 'Privacy Act 1988', jurisdiction: 'Australia', status: 'partial', requirements: ['Breach notification', 'Data protection'] },
      { name: 'GDPR', jurisdiction: 'EU', status: 'partial', requirements: ['DPO appointment', 'DPIA', 'Cross-border transfers'] },
    ], riskScore: 45 });
  });

  // Search regulations
  app.get('/regulatory-intel/search', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as { q?: string; jurisdiction?: string };

    const regulations = [
      { id: 'r1', name: 'GDPR', jurisdiction: 'EU', category: 'Privacy', status: 'Active' },
      { id: 'r2', name: 'Privacy Act 1988', jurisdiction: 'Australia', category: 'Privacy', status: 'Active' },
      { id: 'r3', name: 'SOCI Act', jurisdiction: 'Australia', category: 'Critical Infrastructure', status: 'Active' },
      { id: 'r4', name: 'HIPAA', jurisdiction: 'USA', category: 'Healthcare', status: 'Active' },
      { id: 'r5', name: 'PCI DSS 4.0', jurisdiction: 'International', category: 'Payment', status: 'Active' },
      { id: 'r6', name: 'DORA', jurisdiction: 'EU', category: 'Financial', status: 'Active' },
      { id: 'r7', name: 'NIS2 Directive', jurisdiction: 'EU', category: 'Network Security', status: 'Active' },
      { id: 'r8', name: 'CPS 234', jurisdiction: 'Australia', category: 'APRA Standard', status: 'Active' },
      { id: 'r9', name: 'SOX Section 404', jurisdiction: 'USA', category: 'Financial', status: 'Active' },
      { id: 'r10', name: 'CIRCIA', jurisdiction: 'USA', category: 'Incident Reporting', status: 'Pending' },
      { id: 'r11', name: 'AI Act', jurisdiction: 'EU', category: 'Artificial Intelligence', status: 'Active' },
      { id: 'r12', name: 'Cyber Security Strategy', jurisdiction: 'Australia', category: 'National Strategy', status: 'Active' },
    ];

    let filtered = regulations;
    if (query.q) {
      const q = query.q.toLowerCase();
      filtered = filtered.filter(r => r.name.toLowerCase().includes(q) || r.category.toLowerCase().includes(q));
    }
    if (query.jurisdiction) {
      filtered = filtered.filter(r => r.jurisdiction.toLowerCase().includes(query.jurisdiction!.toLowerCase()));
    }

    return reply.send({ regulations: filtered, total: filtered.length });
  });
}

// === National Security & Critical Infrastructure ===

export async function nationalSecurityRoutes(app: FastifyInstance): Promise<void> {

  // Dashboard
  app.get('/national-security/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId }, severity: { in: ['CRITICAL', 'HIGH'] } },
      take: 20,
    });

    return reply.send({
      classificationLevel: 'UNCLASSIFIED',
      threatLevel: findings.length > 10 ? 'HIGH' : findings.length > 5 ? 'ELEVATED' : 'GUARDED',
      stats: {
        activeThreatActors: 7,
        criticalVulnerabilities: findings.filter(f => f.severity === 'CRITICAL').length,
        protectedAssets: 0,
        incidentsLast24h: 0,
      },
      threatActors: [
        { name: 'APT28 (Fancy Bear)', origin: 'Russia', targeting: ['Government', 'Defense'], activity: 'Active', risk: 'critical' },
        { name: 'APT41 (Winnti)', origin: 'China', targeting: ['Technology', 'Healthcare'], activity: 'Active', risk: 'high' },
        { name: 'Lazarus Group', origin: 'North Korea', targeting: ['Finance', 'Crypto'], activity: 'Active', risk: 'high' },
        { name: 'Volt Typhoon', origin: 'China', targeting: ['Critical Infrastructure'], activity: 'Active', risk: 'critical' },
        { name: 'Sandworm', origin: 'Russia', targeting: ['Energy', 'Government'], activity: 'Moderate', risk: 'high' },
        { name: 'MuddyWater', origin: 'Iran', targeting: ['Government', 'Telecom'], activity: 'Moderate', risk: 'medium' },
        { name: 'Kimsuky', origin: 'North Korea', targeting: ['Research', 'Government'], activity: 'Active', risk: 'medium' },
      ],
      advisories: [
        { source: 'ACSC', title: 'Critical infrastructure targeting by state actors', date: '2026-02-01', severity: 'critical' },
        { source: 'CISA', title: 'Volt Typhoon activity update', date: '2026-01-28', severity: 'high' },
        { source: 'Five Eyes', title: 'Joint advisory on Chinese state-sponsored cyber activity', date: '2026-01-15', severity: 'critical' },
      ],
      criticalInfrastructureSectors: [
        { name: 'Energy', riskLevel: 'high', assets: 0, alerts: 0 },
        { name: 'Healthcare', riskLevel: 'medium', assets: 0, alerts: 0 },
        { name: 'Finance', riskLevel: 'medium', assets: 0, alerts: 0 },
        { name: 'Transport', riskLevel: 'low', assets: 0, alerts: 0 },
        { name: 'Water', riskLevel: 'medium', assets: 0, alerts: 0 },
        { name: 'Telecommunications', riskLevel: 'high', assets: 0, alerts: 0 },
      ],
    });
  });

  // AI threat briefing
  app.post('/national-security/threat-briefing', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { sector?: string; threatActor?: string };

    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId } }, take: 20,
    });

    const result = await callClaude(`You are a national security cyber intelligence analyst. Create a threat briefing:

Sector focus: ${body.sector || 'General'}
Threat actor focus: ${body.threatActor || 'All state-sponsored actors'}
Organization vulnerabilities: ${findings.map(f => f.title).slice(0, 10).join(', ') || 'None assessed'}

Return JSON:
{"classification":"UNCLASSIFIED","date":"string","summary":"string","threatActors":[{"name":"string","capability":"string","intent":"string","activity":"string"}],"keyIntelligence":[{"finding":"string","confidence":"high|medium|low","source":"string"}],"recommendations":[{"priority":"immediate|short-term|long-term","action":"string"}],"riskLevel":"critical|high|medium|low"}

Only return valid JSON.`);

    if (result) {
      try { return reply.send({ source: 'ai-analysis', ...JSON.parse(result), model: 'claude-3-haiku' }); } catch { /* fall through */ }
    }

    return reply.send({
      source: 'heuristic', classification: 'UNCLASSIFIED', riskLevel: 'high',
      summary: 'Multiple state-sponsored threat actors actively targeting critical infrastructure and technology sectors.',
      recommendations: [{ priority: 'immediate', action: 'Review and patch all critical vulnerabilities' }],
    });
  });

  // Critical infrastructure assessment
  app.post('/critical-infra/assess', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { sector: string; assets?: string[] };

    const result = await callClaude(`You are a critical infrastructure security expert. Assess security posture for:
Sector: ${body.sector}
Assets: ${body.assets?.join(', ') || 'General assessment'}

Return JSON:
{"sector":"string","complianceScore":0-100,"frameworks":[{"name":"string","compliance":"compliant|partial|non-compliant"}],"risks":[{"risk":"string","likelihood":"high|medium|low","impact":"string","mitigation":"string"}],"essentialServices":["string"],"recommendations":[{"priority":1-5,"action":"string","timeline":"string"}]}

Only return valid JSON.`);

    if (result) {
      try { return reply.send({ source: 'ai-analysis', ...JSON.parse(result), model: 'claude-3-haiku' }); } catch { /* fall through */ }
    }

    return reply.send({
      source: 'heuristic', sector: body.sector, complianceScore: 60,
      frameworks: [{ name: 'SOCI Act', compliance: 'partial' }, { name: 'Essential Eight', compliance: 'partial' }],
      risks: [{ risk: 'Legacy OT systems', likelihood: 'high', impact: 'Severe', mitigation: 'Network segmentation and monitoring' }],
    });
  });
}
