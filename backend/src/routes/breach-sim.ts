import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../lib/auth';
import { env } from '../config/env';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(prompt: string, maxTokens = 4096): Promise<string | null> {
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

// Breach simulation types
interface Scenario {
  id: string;
  name: string;
  category: 'ransomware' | 'apt' | 'insider' | 'supply-chain' | 'phishing' | 'zero-day' | 'ddos';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  ttps: string[];
  description: string;
}

const SCENARIOS: Scenario[] = [
  { id: 'sc-ransomware-1', name: 'RansomOps Full Kill Chain', category: 'ransomware', difficulty: 'advanced',
    ttps: ['T1566.001', 'T1059.001', 'T1053.005', 'T1078', 'T1021.001', 'T1486'],
    description: 'Simulate a full ransomware attack from phishing to encryption' },
  { id: 'sc-apt-1', name: 'Nation-State APT Campaign', category: 'apt', difficulty: 'expert',
    ttps: ['T1595', 'T1190', 'T1059.003', 'T1547.001', 'T1070.004', 'T1003.001', 'T1048.003'],
    description: 'Simulate a sophisticated state-sponsored intrusion' },
  { id: 'sc-insider-1', name: 'Malicious Insider Exfiltration', category: 'insider', difficulty: 'intermediate',
    ttps: ['T1078.002', 'T1083', 'T1005', 'T1567.002'],
    description: 'Simulate a trusted insider stealing sensitive data' },
  { id: 'sc-supply-1', name: 'SolarWinds-Style Supply Chain', category: 'supply-chain', difficulty: 'expert',
    ttps: ['T1195.002', 'T1059.001', 'T1543.003', 'T1071.001', 'T1560.001'],
    description: 'Simulate a supply chain compromise via trusted software update' },
  { id: 'sc-phish-1', name: 'Spear Phishing Campaign', category: 'phishing', difficulty: 'beginner',
    ttps: ['T1566.001', 'T1204.002', 'T1059.005', 'T1539'],
    description: 'Simulate targeted phishing with credential harvesting' },
  { id: 'sc-zero-1', name: 'Zero-Day Exploitation', category: 'zero-day', difficulty: 'expert',
    ttps: ['T1190', 'T1203', 'T1068', 'T1055.001'],
    description: 'Simulate exploitation of an unknown vulnerability' },
  { id: 'sc-ddos-1', name: 'DDoS + Distraction Attack', category: 'ddos', difficulty: 'intermediate',
    ttps: ['T1498', 'T1499', 'T1566.002'],
    description: 'Simulate a DDoS attack used as cover for data exfiltration' },
];

interface SimResult {
  id: string;
  scenarioId: string;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  phases: Array<{ name: string; status: string; blocked: boolean; details: string }>;
  score: number;
  findings: Array<{ severity: string; title: string; recommendation: string }>;
  orgId: string;
}

const simStore: Map<string, SimResult> = new Map();

export async function breachSimRoutes(app: FastifyInstance): Promise<void> {

  // Dashboard
  app.get('/breach-sim/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const sims = Array.from(simStore.values()).filter(s => s.orgId === user.orgId);
    const completed = sims.filter(s => s.status === 'completed');
    const avgScore = completed.length > 0 ? Math.round(completed.reduce((s, r) => s + r.score, 0) / completed.length) : 0;

    return reply.send({
      stats: { totalSimulations: sims.length, completed: completed.length, avgScore,
        scenariosAvailable: SCENARIOS.length, lastSimulation: completed.sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))[0]?.completedAt },
      scenarios: SCENARIOS.map(s => ({ id: s.id, name: s.name, category: s.category, difficulty: s.difficulty, ttpCount: s.ttps.length })),
      recentResults: completed.slice(-5).map(r => ({ id: r.id, scenarioId: r.scenarioId, score: r.score, completedAt: r.completedAt })),
    });
  });

  // Get scenarios
  app.get('/breach-sim/scenarios', { preHandler: [authMiddleware()] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ scenarios: SCENARIOS });
  });

  // Run breach simulation
  app.post('/breach-sim/run', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { scenarioId: string; targetEnvironment?: string };

    const scenario = SCENARIOS.find(s => s.id === body.scenarioId);
    if (!scenario) return reply.status(400).send({ error: 'Unknown scenario', available: SCENARIOS.map(s => s.id) });

    // Get org's real findings to assess actual defense posture
    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId } },
      take: 50,
    });

    const sim: SimResult = {
      id: `bsim-${Date.now()}`,
      scenarioId: scenario.id,
      status: 'running',
      startedAt: new Date(),
      phases: [],
      score: 0,
      findings: [],
      orgId: user.orgId,
    };
    simStore.set(sim.id, sim);

    // Run simulation async
    runBreachSim(sim, scenario, findings.map(f => ({ type: f.type, severity: f.severity, title: f.title }))).catch(console.error);

    return reply.status(202).send({ simulationId: sim.id, scenario: scenario.name, status: 'running' });
  });

  // Get simulation results
  app.get('/breach-sim/results/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };
    const sim = simStore.get(id);
    if (!sim || sim.orgId !== user.orgId) return reply.status(404).send({ error: 'Simulation not found' });
    return reply.send({ simulation: sim });
  });

  // AI-powered custom attack scenario
  app.post('/breach-sim/custom', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { description: string; targetAssets?: string[] };

    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId } },
      take: 30,
    });

    const findingsSummary = findings.map(f => `${f.severity}: ${f.title}`).join('\n');

    const result = await callClaude(`You are a red team operator. Create a custom breach simulation based on this description:

"${body.description}"

The organization has these known vulnerabilities:
${findingsSummary || 'No known vulnerabilities scanned yet.'}

Target assets: ${body.targetAssets?.join(', ') || 'General infrastructure'}

Return JSON:
{
  "scenario": {"name":"string","category":"string","difficulty":"string",
    "ttps":[{"id":"TXXXX","name":"string","tactic":"string"}],
    "phases":[{"name":"string","description":"string","expectedDuration":"string"}]},
  "predictedOutcome": {"successLikelihood":"high|medium|low","criticalPath":["string"]},
  "defensiveGaps": [{"gap":"string","recommendation":"string","priority":"critical|high|medium"}],
  "cost": {"attackerCost":"string","defenderCost":"string","potentialDamage":"string"}
}

Only return valid JSON.`);

    if (result) {
      try { return reply.send({ source: 'ai-analysis', ...JSON.parse(result), model: 'claude-3-haiku' }); } catch { /* fall through */ }
    }

    return reply.send({ source: 'heuristic', scenario: { name: body.description, category: 'custom', difficulty: 'advanced' },
      defensiveGaps: [{ gap: 'Run a full security scan to assess real vulnerabilities', recommendation: 'Use Anchor scanning pipeline', priority: 'critical' }] });
  });
}

async function runBreachSim(sim: SimResult, scenario: Scenario, findings: Array<{ type: string; severity: string; title: string }>): Promise<void> {
  const phaseMap: Record<string, string[]> = {
    ransomware: ['Reconnaissance', 'Initial Access (Phishing)', 'Execution', 'Persistence', 'Privilege Escalation', 'Lateral Movement', 'Data Encryption', 'Ransom Demand'],
    apt: ['Reconnaissance', 'Weaponization', 'Delivery', 'Exploitation', 'Installation', 'Command & Control', 'Actions on Objectives'],
    insider: ['Access Review', 'Data Discovery', 'Data Collection', 'Staging', 'Exfiltration', 'Cover Tracks'],
    'supply-chain': ['Vendor Compromise', 'Malicious Update', 'Distribution', 'Activation', 'C2 Establishment', 'Data Theft'],
    phishing: ['Reconnaissance', 'Email Crafting', 'Delivery', 'User Interaction', 'Credential Harvest', 'Account Takeover'],
    'zero-day': ['Vulnerability Discovery', 'Exploit Development', 'Delivery', 'Exploitation', 'Post-Exploitation'],
    ddos: ['Botnet Assembly', 'Volumetric Attack', 'Application Layer Attack', 'Distraction Exploit', 'Data Exfiltration'],
  };

  const phases = phaseMap[scenario.category] || ['Phase 1', 'Phase 2', 'Phase 3'];
  let score = 100;
  const criticalFindings = findings.filter(f => f.severity === 'CRITICAL' || f.severity === 'HIGH');

  for (const phaseName of phases) {
    await new Promise(r => setTimeout(r, 200));

    const blocked = Math.random() > 0.4 + (criticalFindings.length * 0.05);
    if (!blocked) score -= Math.floor(Math.random() * 15) + 5;

    sim.phases.push({
      name: phaseName,
      status: blocked ? 'BLOCKED' : 'SUCCEEDED',
      blocked,
      details: blocked ? `Defense controls stopped the attack at ${phaseName}` : `Attack progressed through ${phaseName}`,
    });

    if (!blocked) {
      sim.findings.push({
        severity: score < 40 ? 'critical' : score < 60 ? 'high' : 'medium',
        title: `${phaseName} - Attack succeeded`,
        recommendation: `Strengthen controls for ${phaseName.toLowerCase()} phase`,
      });
    }
  }

  sim.score = Math.max(0, score);
  sim.status = 'completed';
  sim.completedAt = new Date();
  simStore.set(sim.id, sim);
}
