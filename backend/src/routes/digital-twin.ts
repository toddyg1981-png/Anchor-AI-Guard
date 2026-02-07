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

// Digital Twin types
interface DigitalTwinAsset {
  id: string;
  name: string;
  type: 'server' | 'workstation' | 'network' | 'database' | 'application' | 'cloud' | 'iot';
  properties: Record<string, unknown>;
  connections: string[];
  vulnerabilities: string[];
  controls: string[];
  riskScore: number;
}

interface DigitalTwinEnvironment {
  id: string;
  name: string;
  assets: DigitalTwinAsset[];
  networkTopology: NetworkConnection[];
  securityZones: SecurityZone[];
  createdAt: Date;
  lastSimulation?: Date;
  orgId: string;
}

interface NetworkConnection {
  source: string;
  target: string;
  protocol: string;
  port: number;
  encrypted: boolean;
}

interface SecurityZone {
  id: string;
  name: string;
  assets: string[];
  trustLevel: 'untrusted' | 'dmz' | 'internal' | 'trusted' | 'highly-trusted';
}

interface SimulationResult {
  id: string;
  environmentId: string;
  attackType: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed';
  attackPath: string[];
  compromisedAssets: string[];
  mitigationsTriggered: string[];
  riskScore: number;
  findings: SimulationFinding[];
  orgId: string;
}

interface SimulationFinding {
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedAsset: string;
  recommendation: string;
}

// In-memory stores
const environmentStore: Map<string, DigitalTwinEnvironment> = new Map();
const simulationStore: Map<string, SimulationResult> = new Map();

// Attack scenarios
const ATTACK_SCENARIOS: Record<string, { name: string; phases: string[]; ttps: string[] }> = {
  'ransomware': {
    name: 'Ransomware Attack',
    phases: ['initial-access', 'execution', 'persistence', 'privilege-escalation', 'lateral-movement', 'impact'],
    ttps: ['T1566', 'T1059', 'T1053', 'T1068', 'T1021', 'T1486'],
  },
  'apt': {
    name: 'Advanced Persistent Threat',
    phases: ['reconnaissance', 'initial-access', 'execution', 'persistence', 'defense-evasion', 'credential-access', 'discovery', 'lateral-movement', 'collection', 'exfiltration'],
    ttps: ['T1595', 'T1190', 'T1059', 'T1547', 'T1070', 'T1003', 'T1083', 'T1021', 'T1560', 'T1048'],
  },
  'insider-threat': {
    name: 'Insider Threat',
    phases: ['access', 'discovery', 'collection', 'exfiltration'],
    ttps: ['T1078', 'T1083', 'T1005', 'T1048'],
  },
  'supply-chain': {
    name: 'Supply Chain Attack',
    phases: ['supply-chain-compromise', 'execution', 'persistence', 'command-and-control'],
    ttps: ['T1195', 'T1059', 'T1547', 'T1071'],
  },
  'phishing': {
    name: 'Phishing Campaign',
    phases: ['initial-access', 'execution', 'credential-access', 'lateral-movement'],
    ttps: ['T1566', 'T1059', 'T1539', 'T1021'],
  },
};

// Schemas
const createEnvironmentSchema = z.object({
  name: z.string(),
  assets: z.array(z.object({
    name: z.string(),
    type: z.enum(['server', 'workstation', 'network', 'database', 'application', 'cloud', 'iot']),
    properties: z.record(z.unknown()).optional(),
    vulnerabilities: z.array(z.string()).optional(),
    controls: z.array(z.string()).optional(),
  })),
  connections: z.array(z.object({
    source: z.string(),
    target: z.string(),
    protocol: z.string(),
    port: z.number(),
    encrypted: z.boolean().optional(),
  })).optional(),
});

const runSimulationSchema = z.object({
  environmentId: z.string(),
  attackType: z.enum(['ransomware', 'apt', 'insider-threat', 'supply-chain', 'phishing']),
  targetAsset: z.string().optional(),
  startingPoint: z.string().optional(),
});

export async function digitalTwinRoutes(app: FastifyInstance): Promise<void> {
  // Dashboard for digital twin
  app.get('/digital-twin/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    const environments = Array.from(environmentStore.values()).filter(e => e.orgId === user.orgId);
    const simulations = Array.from(simulationStore.values()).filter(s => s.orgId === user.orgId);

    const completedSims = simulations.filter(s => s.status === 'completed');
    const avgRisk = completedSims.length > 0
      ? Math.round(completedSims.reduce((sum, s) => sum + s.riskScore, 0) / completedSims.length)
      : 0;

    return reply.send({
      stats: {
        totalEnvironments: environments.length,
        totalAssets: environments.reduce((sum, e) => sum + e.assets.length, 0),
        totalSimulations: simulations.length,
        completedSimulations: completedSims.length,
        avgRiskScore: avgRisk,
      },
      environments: environments.map(e => ({
        id: e.id,
        name: e.name,
        assetCount: e.assets.length,
        lastSimulation: e.lastSimulation,
      })),
      recentSimulations: simulations
        .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
        .slice(0, 5)
        .map(s => ({
          id: s.id,
          attackType: s.attackType,
          status: s.status,
          riskScore: s.riskScore,
          startTime: s.startTime,
        })),
      attackScenarios: Object.entries(ATTACK_SCENARIOS).map(([key, value]) => ({
        id: key,
        name: value.name,
        phases: value.phases.length,
      })),
    });
  });

  // Create digital twin environment
  app.post('/digital-twin/environments', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const parsed = createEnvironmentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { name, assets, connections } = parsed.data;

    const twinAssets: DigitalTwinAsset[] = assets.map((a, idx) => ({
      id: `asset-${Date.now()}-${idx}`,
      name: a.name,
      type: a.type,
      properties: a.properties || {},
      connections: [],
      vulnerabilities: a.vulnerabilities || [],
      controls: a.controls || [],
      riskScore: 50,
    }));

    const networkConnections: NetworkConnection[] = (connections || []).map(c => ({
      source: twinAssets.find(a => a.name === c.source)?.id || c.source,
      target: twinAssets.find(a => a.name === c.target)?.id || c.target,
      protocol: c.protocol,
      port: c.port,
      encrypted: c.encrypted || false,
    }));

    for (const conn of networkConnections) {
      const sourceAsset = twinAssets.find(a => a.id === conn.source);
      if (sourceAsset) {
        sourceAsset.connections.push(conn.target);
      }
    }

    const zones: SecurityZone[] = [
      {
        id: 'zone-external',
        name: 'External',
        assets: twinAssets.filter(a => a.type === 'cloud' || a.properties.external).map(a => a.id),
        trustLevel: 'untrusted',
      },
      {
        id: 'zone-dmz',
        name: 'DMZ',
        assets: twinAssets.filter(a => a.properties.dmz).map(a => a.id),
        trustLevel: 'dmz',
      },
      {
        id: 'zone-internal',
        name: 'Internal',
        assets: twinAssets.filter(a => !a.properties.external && !a.properties.dmz).map(a => a.id),
        trustLevel: 'internal',
      },
    ];

    const environment: DigitalTwinEnvironment = {
      id: `env-${Date.now()}`,
      name,
      assets: twinAssets,
      networkTopology: networkConnections,
      securityZones: zones,
      createdAt: new Date(),
      orgId: user.orgId,
    };

    environmentStore.set(environment.id, environment);

    return reply.status(201).send({ environment });
  });

  // Get environments
  app.get('/digital-twin/environments', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const environments = Array.from(environmentStore.values())
      .filter(e => e.orgId === user.orgId)
      .map(e => ({
        id: e.id,
        name: e.name,
        assetCount: e.assets.length,
        createdAt: e.createdAt,
        lastSimulation: e.lastSimulation,
      }));

    return reply.send({ environments });
  });

  // Get environment details
  app.get('/digital-twin/environments/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };

    const environment = environmentStore.get(id);
    if (!environment || environment.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Environment not found' });
    }

    return reply.send({ environment });
  });

  // Delete environment
  app.delete('/digital-twin/environments/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };

    const environment = environmentStore.get(id);
    if (!environment || environment.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Environment not found' });
    }

    environmentStore.delete(id);
    return reply.send({ success: true });
  });

  // WORLD-FIRST: Run attack simulation on digital twin
  app.post('/digital-twin/simulate', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const parsed = runSimulationSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { environmentId, attackType, targetAsset, startingPoint } = parsed.data;

    const environment = environmentStore.get(environmentId);
    if (!environment || environment.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Environment not found' });
    }

    const scenario = ATTACK_SCENARIOS[attackType];
    const simulation: SimulationResult = {
      id: `sim-${Date.now()}`,
      environmentId,
      attackType,
      startTime: new Date(),
      status: 'running',
      attackPath: [],
      compromisedAssets: [],
      mitigationsTriggered: [],
      riskScore: 0,
      findings: [],
      orgId: user.orgId,
    };

    simulationStore.set(simulation.id, simulation);

    // Run simulation asynchronously
    runAttackSimulation(simulation, environment, scenario, targetAsset, startingPoint).catch(console.error);

    return reply.status(202).send({
      simulationId: simulation.id,
      status: 'running',
      message: `${scenario.name} simulation started`,
    });
  });

  // Get simulation status/results
  app.get('/digital-twin/simulations/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };

    const simulation = simulationStore.get(id);
    if (!simulation || simulation.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Simulation not found' });
    }

    return reply.send({ simulation });
  });

  // Get all simulations
  app.get('/digital-twin/simulations', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const query = request.query as { environmentId?: string };

    let simulations = Array.from(simulationStore.values()).filter(s => s.orgId === user.orgId);

    if (query.environmentId) {
      simulations = simulations.filter(s => s.environmentId === query.environmentId);
    }

    return reply.send({
      simulations: simulations.map(s => ({
        id: s.id,
        environmentId: s.environmentId,
        attackType: s.attackType,
        status: s.status,
        riskScore: s.riskScore,
        startTime: s.startTime,
        endTime: s.endTime,
        compromisedAssets: s.compromisedAssets.length,
        findingsCount: s.findings.length,
      })),
    });
  });

  // AI-powered attack path analysis
  app.post('/digital-twin/analyze-attack-path', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { environmentId: string; targetAsset: string };

    if (!body.environmentId || !body.targetAsset) {
      return reply.status(400).send({ error: 'environmentId and targetAsset required' });
    }

    const environment = environmentStore.get(body.environmentId);
    if (!environment || environment.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Environment not found' });
    }

    const targetAsset = environment.assets.find(a => a.id === body.targetAsset || a.name === body.targetAsset);
    if (!targetAsset) {
      return reply.status(404).send({ error: 'Target asset not found' });
    }

    const assetSummary = environment.assets.map(a =>
      `${a.name} (${a.type}): vulnerabilities=[${a.vulnerabilities.join(',')}], controls=[${a.controls.join(',')}]`
    ).join('\n');

    const topologySummary = environment.networkTopology.map(c =>
      `${c.source} -> ${c.target} (${c.protocol}:${c.port}, encrypted:${c.encrypted})`
    ).join('\n');

    const result = await callClaude(`You are a red team expert. Analyze attack paths to reach the target asset.

Target: ${targetAsset.name} (${targetAsset.type})

Environment assets:
${assetSummary}

Network topology:
${topologySummary}

Provide analysis in JSON format:
{
  "attackPaths": [
    {
      "name": "path name",
      "likelihood": "high|medium|low",
      "steps": ["step1", "step2"],
      "mitigations": ["mitigation1"]
    }
  ],
  "criticalWeaknesses": ["weakness1"],
  "recommendations": [
    {"priority": 1-5, "action": "action"}
  ],
  "overallRisk": "critical|high|medium|low"
}

Only return valid JSON.`);

    if (!result) {
      const paths = findAttackPaths(environment, targetAsset);
      return reply.send({
        source: 'heuristic',
        targetAsset: targetAsset.name,
        attackPaths: paths,
        recommendations: [
          'Implement network segmentation',
          'Enable MFA for all access paths',
          'Monitor for lateral movement',
        ],
      });
    }

    try {
      const analysis = JSON.parse(result);
      return reply.send({
        source: 'ai-analysis',
        targetAsset: targetAsset.name,
        ...analysis,
        model: 'claude-3-haiku',
      });
    } catch {
      return reply.status(500).send({ error: 'Analysis parse failed' });
    }
  });

  // Generate environment from findings
  app.post('/digital-twin/generate-from-findings', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { projectId?: string };

    const where = body.projectId
      ? { projectId: body.projectId }
      : { project: { orgId: user.orgId } };

    const findings = await prisma.finding.findMany({
      where,
      include: { project: true },
      take: 100,
    });

    if (findings.length === 0) {
      return reply.status(400).send({ error: 'No findings to generate from' });
    }

    const assetMap = new Map<string, DigitalTwinAsset>();
    
    for (const finding of findings) {
      let assetName = finding.filePath?.split('/')[0] || 'unknown';
      assetName = assetName.replace(/\.[^.]+$/, '');

      if (!assetMap.has(assetName)) {
        assetMap.set(assetName, {
          id: `asset-${Date.now()}-${assetMap.size}`,
          name: assetName,
          type: 'application',
          properties: { source: 'findings' },
          connections: [],
          vulnerabilities: [],
          controls: [],
          riskScore: 50,
        });
      }

      const asset = assetMap.get(assetName)!;
      // Use the finding title as a vulnerability reference since there's no cveId field
      asset.vulnerabilities.push(finding.title);
    }

    const environment: DigitalTwinEnvironment = {
      id: `env-${Date.now()}`,
      name: `Generated from ${findings.length} findings`,
      assets: Array.from(assetMap.values()),
      networkTopology: [],
      securityZones: [
        {
          id: 'zone-internal',
          name: 'Internal',
          assets: Array.from(assetMap.values()).map(a => a.id),
          trustLevel: 'internal',
        },
      ],
      createdAt: new Date(),
      orgId: user.orgId,
    };

    environmentStore.set(environment.id, environment);

    return reply.status(201).send({ environment, findingsUsed: findings.length });
  });
}

// Helper function to run attack simulation
async function runAttackSimulation(
  simulation: SimulationResult,
  environment: DigitalTwinEnvironment,
  scenario: { name: string; phases: string[]; ttps: string[] },
  targetAsset?: string,
  startingPoint?: string
): Promise<void> {
  try {
    const startAsset = startingPoint
      ? environment.assets.find(a => a.name === startingPoint || a.id === startingPoint)
      : environment.assets.find(a => a.type === 'network' || a.properties.external);

    if (!startAsset) {
      simulation.status = 'failed';
      simulation.findings.push({
        severity: 'low',
        title: 'No entry point found',
        description: 'Could not identify a suitable entry point for the attack simulation',
        affectedAsset: 'none',
        recommendation: 'Define external-facing assets or specify a starting point',
      });
      simulationStore.set(simulation.id, simulation);
      return;
    }

    simulation.attackPath.push(startAsset.id);
    let currentAsset = startAsset;
    let riskScore = 20;

    for (const phase of scenario.phases) {
      await new Promise(resolve => setTimeout(resolve, 100));

      const blocked = currentAsset.controls.some(c =>
        c.toLowerCase().includes('edr') ||
        c.toLowerCase().includes('ids') ||
        (phase === 'execution' && c.toLowerCase().includes('whitelist')) ||
        (phase === 'credential-access' && c.toLowerCase().includes('mfa'))
      );

      if (blocked) {
        simulation.mitigationsTriggered.push(`${currentAsset.name}:${currentAsset.controls.join(',')}`);
        continue;
      }

      if (currentAsset.vulnerabilities.length > 0) {
        simulation.compromisedAssets.push(currentAsset.id);
        riskScore += 10;

        simulation.findings.push({
          severity: 'high',
          title: `${phase}: ${currentAsset.name} compromised`,
          description: `Asset ${currentAsset.name} was compromised during ${phase} phase using vulnerabilities`,
          affectedAsset: currentAsset.id,
          recommendation: 'Patch identified vulnerabilities and implement additional controls',
        });
      }

      if (currentAsset.connections.length > 0 && phase.includes('lateral')) {
        const nextAssetId = currentAsset.connections[Math.floor(Math.random() * currentAsset.connections.length)];
        const nextAsset = environment.assets.find(a => a.id === nextAssetId);
        if (nextAsset) {
          simulation.attackPath.push(nextAsset.id);
          currentAsset = nextAsset;
          riskScore += 15;
        }
      }

      if (targetAsset && currentAsset.name === targetAsset) {
        simulation.findings.push({
          severity: 'critical',
          title: 'Target asset reached',
          description: `Attacker successfully reached target asset: ${targetAsset}`,
          affectedAsset: currentAsset.id,
          recommendation: 'Implement additional barriers and monitoring for critical assets',
        });
        riskScore += 30;
        break;
      }
    }

    simulation.riskScore = Math.min(100, riskScore);
    simulation.status = 'completed';
    simulation.endTime = new Date();

    environment.lastSimulation = new Date();
    environmentStore.set(environment.id, environment);
    simulationStore.set(simulation.id, simulation);
  } catch (error) {
    console.error('Simulation error:', error);
    simulation.status = 'failed';
    simulationStore.set(simulation.id, simulation);
  }
}

// Helper function to find attack paths
function findAttackPaths(environment: DigitalTwinEnvironment, targetAsset: DigitalTwinAsset): Array<{ path: string[]; risk: string }> {
  const paths: Array<{ path: string[]; risk: string }> = [];

  const entryPoints = environment.assets.filter(a =>
    a.properties.external || a.type === 'cloud' || a.vulnerabilities.length > 0
  );

  for (const entry of entryPoints) {
    const visited = new Set<string>();
    const queue: Array<{ asset: DigitalTwinAsset; path: string[] }> = [{ asset: entry, path: [entry.name] }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.asset.id)) continue;
      visited.add(current.asset.id);

      if (current.asset.id === targetAsset.id) {
        const riskLevel = current.path.length <= 2 ? 'high' : current.path.length <= 4 ? 'medium' : 'low';
        paths.push({ path: current.path, risk: riskLevel });
        break;
      }

      for (const connId of current.asset.connections) {
        const connAsset = environment.assets.find(a => a.id === connId);
        if (connAsset && !visited.has(connAsset.id)) {
          queue.push({ asset: connAsset, path: [...current.path, connAsset.name] });
        }
      }
    }
  }

  return paths.slice(0, 5);
}
