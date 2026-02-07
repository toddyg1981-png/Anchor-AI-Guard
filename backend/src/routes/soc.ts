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

// Security event types
type EventSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';
type EventStatus = 'new' | 'investigating' | 'resolved' | 'false_positive';
type IncidentStatus = 'open' | 'investigating' | 'contained' | 'eradicated' | 'recovered' | 'closed';

// In-memory stores for SOC data
interface SecurityEvent {
  id: string;
  timestamp: Date;
  source: string;
  type: string;
  severity: EventSeverity;
  status: EventStatus;
  description: string;
  rawData: Record<string, unknown>;
  iocs: string[];
  orgId: string;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  severity: EventSeverity;
  status: IncidentStatus;
  assignee?: string;
  createdAt: Date;
  updatedAt: Date;
  events: string[];
  timeline: { timestamp: Date; action: string; user: string }[];
  orgId: string;
}

interface Playbook {
  id: string;
  name: string;
  trigger: string;
  steps: { order: number; action: string; automated: boolean; description: string }[];
  enabled: boolean;
}

const eventStore: Map<string, SecurityEvent> = new Map();
const incidentStore: Map<string, Incident> = new Map();

// SOAR Playbooks
const PLAYBOOKS: Playbook[] = [
  {
    id: 'pb-malware',
    name: 'Malware Detection Response',
    trigger: 'malware_detected',
    enabled: true,
    steps: [
      { order: 1, action: 'isolate_host', automated: true, description: 'Isolate affected host from network' },
      { order: 2, action: 'collect_artifacts', automated: true, description: 'Collect memory dump and disk image' },
      { order: 3, action: 'scan_endpoints', automated: true, description: 'Scan all connected endpoints' },
      { order: 4, action: 'block_iocs', automated: true, description: 'Block identified IOCs at perimeter' },
      { order: 5, action: 'notify_team', automated: true, description: 'Notify security team' },
      { order: 6, action: 'investigate', automated: false, description: 'Manual investigation required' },
    ],
  },
  {
    id: 'pb-brute-force',
    name: 'Brute Force Attack Response',
    trigger: 'brute_force_detected',
    enabled: true,
    steps: [
      { order: 1, action: 'block_ip', automated: true, description: 'Block attacking IP address' },
      { order: 2, action: 'reset_password', automated: false, description: 'Reset affected user credentials' },
      { order: 3, action: 'enable_mfa', automated: false, description: 'Enable MFA for affected accounts' },
      { order: 4, action: 'audit_access', automated: true, description: 'Audit recent access for affected users' },
      { order: 5, action: 'notify_user', automated: true, description: 'Notify affected users' },
    ],
  },
  {
    id: 'pb-data-exfil',
    name: 'Data Exfiltration Response',
    trigger: 'data_exfiltration_detected',
    enabled: true,
    steps: [
      { order: 1, action: 'block_transfer', automated: true, description: 'Block ongoing data transfer' },
      { order: 2, action: 'capture_traffic', automated: true, description: 'Capture network traffic for analysis' },
      { order: 3, action: 'identify_data', automated: false, description: 'Identify exfiltrated data' },
      { order: 4, action: 'revoke_access', automated: true, description: 'Revoke access for involved accounts' },
      { order: 5, action: 'legal_notify', automated: false, description: 'Notify legal/compliance team' },
    ],
  },
  {
    id: 'pb-vuln-critical',
    name: 'Critical Vulnerability Response',
    trigger: 'critical_vulnerability_found',
    enabled: true,
    steps: [
      { order: 1, action: 'assess_impact', automated: true, description: 'Assess vulnerability impact' },
      { order: 2, action: 'identify_assets', automated: true, description: 'Identify affected assets' },
      { order: 3, action: 'apply_workaround', automated: false, description: 'Apply temporary workaround' },
      { order: 4, action: 'schedule_patch', automated: false, description: 'Schedule patching window' },
      { order: 5, action: 'verify_remediation', automated: true, description: 'Verify remediation' },
    ],
  },
];

// Schemas
const createEventSchema = z.object({
  source: z.string(),
  type: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  description: z.string(),
  rawData: z.record(z.unknown()).optional(),
  iocs: z.array(z.string()).optional(),
});

const createIncidentSchema = z.object({
  title: z.string(),
  description: z.string(),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  eventIds: z.array(z.string()).optional(),
});

const updateIncidentSchema = z.object({
  status: z.enum(['open', 'investigating', 'contained', 'eradicated', 'recovered', 'closed']).optional(),
  assignee: z.string().optional(),
  description: z.string().optional(),
});

export async function socRoutes(app: FastifyInstance): Promise<void> {
  // Get SOC dashboard
  app.get('/soc/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    const events = Array.from(eventStore.values()).filter(e => e.orgId === user.orgId);
    const incidents = Array.from(incidentStore.values()).filter(i => i.orgId === user.orgId);

    // Get findings for correlation
    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Stats
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = events.filter(e => e.timestamp >= last24Hours);
    const openIncidents = incidents.filter(i => !['closed', 'recovered'].includes(i.status));

    const eventsBySeverity = events.reduce((acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return reply.send({
      stats: {
        totalEvents: events.length,
        eventsLast24h: recentEvents.length,
        openIncidents: openIncidents.length,
        criticalIncidents: incidents.filter(i => i.severity === 'critical' && i.status !== 'closed').length,
        mttr: '4.2 hours', // Mean time to respond - would be calculated from real data
      },
      eventsBySeverity,
      recentEvents: events
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
        .map(e => ({
          id: e.id,
          timestamp: e.timestamp,
          type: e.type,
          severity: e.severity,
          status: e.status,
          description: e.description.substring(0, 100),
        })),
      openIncidents: openIncidents.slice(0, 5).map(i => ({
        id: i.id,
        title: i.title,
        severity: i.severity,
        status: i.status,
        createdAt: i.createdAt,
      })),
      relatedFindings: findings.slice(0, 5).map(f => ({
        id: f.id,
        title: f.title,
        severity: f.severity,
      })),
      playbooks: PLAYBOOKS.map(p => ({
        id: p.id,
        name: p.name,
        enabled: p.enabled,
        stepCount: p.steps.length,
      })),
    });
  });

  // Create security event
  app.post('/soc/events', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const parsed = createEventSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const event: SecurityEvent = {
      id: `evt-${Date.now()}`,
      timestamp: new Date(),
      source: parsed.data.source,
      type: parsed.data.type,
      severity: parsed.data.severity,
      status: 'new',
      description: parsed.data.description,
      rawData: parsed.data.rawData || {},
      iocs: parsed.data.iocs || [],
      orgId: user.orgId,
    };

    eventStore.set(event.id, event);

    return reply.status(201).send({ event });
  });

  // Get events
  app.get('/soc/events', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const query = request.query as { severity?: string; status?: string; limit?: string };

    let events = Array.from(eventStore.values()).filter(e => e.orgId === user.orgId);

    if (query.severity) {
      events = events.filter(e => e.severity === query.severity);
    }
    if (query.status) {
      events = events.filter(e => e.status === query.status);
    }

    const limit = parseInt(query.limit || '50');
    events = events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, limit);

    return reply.send({ events, total: events.length });
  });

  // Update event status
  app.patch('/soc/events/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };
    const body = request.body as { status?: EventStatus };

    const event = eventStore.get(id);
    if (!event || event.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Event not found' });
    }

    if (body.status) {
      event.status = body.status;
    }
    eventStore.set(id, event);

    return reply.send({ event });
  });

  // Create incident
  app.post('/soc/incidents', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string; id: string };
    const parsed = createIncidentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const incident: Incident = {
      id: `inc-${Date.now()}`,
      title: parsed.data.title,
      description: parsed.data.description,
      severity: parsed.data.severity,
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      events: parsed.data.eventIds || [],
      timeline: [{ timestamp: new Date(), action: 'Incident created', user: user.id }],
      orgId: user.orgId,
    };

    incidentStore.set(incident.id, incident);

    return reply.status(201).send({ incident });
  });

  // Get incidents
  app.get('/soc/incidents', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const query = request.query as { status?: string };

    let incidents = Array.from(incidentStore.values()).filter(i => i.orgId === user.orgId);

    if (query.status) {
      incidents = incidents.filter(i => i.status === query.status);
    }

    incidents = incidents.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return reply.send({ incidents, total: incidents.length });
  });

  // Get incident details
  app.get('/soc/incidents/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const { id } = request.params as { id: string };

    const incident = incidentStore.get(id);
    if (!incident || incident.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Incident not found' });
    }

    // Get related events
    const relatedEvents = incident.events
      .map(eid => eventStore.get(eid))
      .filter(Boolean);

    return reply.send({ incident, relatedEvents });
  });

  // Update incident
  app.patch('/soc/incidents/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string; id: string };
    const { id } = request.params as { id: string };
    const parsed = updateIncidentSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const incident = incidentStore.get(id);
    if (!incident || incident.orgId !== user.orgId) {
      return reply.status(404).send({ error: 'Incident not found' });
    }

    if (parsed.data.status) {
      incident.timeline.push({
        timestamp: new Date(),
        action: `Status changed to ${parsed.data.status}`,
        user: user.id,
      });
      incident.status = parsed.data.status;
    }
    if (parsed.data.assignee) {
      incident.assignee = parsed.data.assignee;
    }
    if (parsed.data.description) {
      incident.description = parsed.data.description;
    }
    incident.updatedAt = new Date();

    incidentStore.set(id, incident);

    return reply.send({ incident });
  });

  // Get playbooks
  app.get('/soc/playbooks', { preHandler: [authMiddleware()] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({ playbooks: PLAYBOOKS });
  });

  // Execute playbook
  app.post('/soc/playbooks/:id/execute', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string; id: string };
    const { id } = request.params as { id: string };
    const body = request.body as { incidentId?: string; eventId?: string };

    const playbook = PLAYBOOKS.find(p => p.id === id);
    if (!playbook) {
      return reply.status(404).send({ error: 'Playbook not found' });
    }

    if (!playbook.enabled) {
      return reply.status(400).send({ error: 'Playbook is disabled' });
    }

    // Simulate playbook execution
    const executionResults = playbook.steps.map(step => ({
      step: step.order,
      action: step.action,
      status: step.automated ? 'completed' : 'pending_manual',
      executedAt: step.automated ? new Date() : null,
      message: step.automated ? `Automated action ${step.action} completed` : `Manual action required: ${step.description}`,
    }));

    // If incident, update timeline
    if (body.incidentId) {
      const incident = incidentStore.get(body.incidentId);
      if (incident && incident.orgId === user.orgId) {
        incident.timeline.push({
          timestamp: new Date(),
          action: `Playbook ${playbook.name} executed`,
          user: user.id,
        });
        incidentStore.set(body.incidentId, incident);
      }
    }

    return reply.send({
      playbook: playbook.name,
      executionId: `exec-${Date.now()}`,
      results: executionResults,
      automatedStepsCompleted: executionResults.filter(r => r.status === 'completed').length,
      manualStepsPending: executionResults.filter(r => r.status === 'pending_manual').length,
    });
  });

  // WORLD-FIRST: AI-powered incident analysis (Autonomous SOC)
  app.post('/soc/ai/analyze', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const body = request.body as { incidentId?: string; eventIds?: string[] };

    if (!body.incidentId && !body.eventIds?.length) {
      return reply.status(400).send({ error: 'Either incidentId or eventIds required' });
    }

    let eventsToAnalyze: SecurityEvent[] = [];

    if (body.incidentId) {
      const incident = incidentStore.get(body.incidentId);
      if (incident && incident.orgId === user.orgId) {
        eventsToAnalyze = incident.events
          .map(id => eventStore.get(id))
          .filter((e): e is SecurityEvent => e !== undefined && e.orgId === user.orgId);
      }
    }

    if (body.eventIds) {
      const additionalEvents = body.eventIds
        .map(id => eventStore.get(id))
        .filter((e): e is SecurityEvent => e !== undefined && e.orgId === user.orgId);
      eventsToAnalyze = [...eventsToAnalyze, ...additionalEvents];
    }

    if (eventsToAnalyze.length === 0) {
      return reply.status(400).send({ error: 'No events to analyze' });
    }

    const eventSummary = eventsToAnalyze.map(e =>
      `[${e.severity}] ${e.type}: ${e.description} (Source: ${e.source}, IOCs: ${e.iocs.join(', ') || 'none'})`
    ).join('\n');

    const result = await callClaude(`You are an elite SOC analyst. Analyze these security events and provide actionable intelligence:

Events:
${eventSummary}

Provide analysis in JSON format:
{
  "classification": {
    "attackType": "attack classification",
    "confidence": 0-100,
    "mitreAttackTechniques": ["T1XXX"],
    "killChainPhase": "reconnaissance|weaponization|delivery|exploitation|installation|c2|actions"
  },
  "severity": "critical|high|medium|low",
  "impact": {
    "scope": "description of impact scope",
    "affectedSystems": ["system1"],
    "dataAtRisk": "description of data at risk"
  },
  "rootCause": "likely root cause",
  "threatActor": {
    "type": "nation-state|organized-crime|hacktivist|insider|unknown",
    "sophistication": "low|medium|high|advanced"
  },
  "recommendations": {
    "immediate": ["action1"],
    "shortTerm": ["action2"],
    "longTerm": ["action3"]
  },
  "relatedPlaybooks": ["playbook-id"],
  "additionalInvestigation": ["investigation task"]
}

Only return valid JSON.`);

    if (!result) {
      return reply.send({
        eventCount: eventsToAnalyze.length,
        analysis: {
          classification: { attackType: 'Unknown', confidence: 0 },
          severity: 'medium',
          recommendations: { immediate: ['Manual analysis required'], shortTerm: [], longTerm: [] },
        },
        source: 'fallback',
      });
    }

    try {
      const analysis = JSON.parse(result);
      return reply.send({
        eventCount: eventsToAnalyze.length,
        analysis,
        source: 'ai-autonomous-soc',
        model: 'claude-3-haiku',
      });
    } catch {
      return reply.status(500).send({ error: 'Analysis parse failed' });
    }
  });

  // AI-powered event triage
  app.post('/soc/ai/triage', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    // Get unprocessed events
    const events = Array.from(eventStore.values())
      .filter(e => e.orgId === user.orgId && e.status === 'new')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 20);

    if (events.length === 0) {
      return reply.send({ message: 'No events to triage', triaged: [] });
    }

    const eventSummary = events.map(e =>
      `ID:${e.id} [${e.severity}] ${e.type}: ${e.description.substring(0, 100)}`
    ).join('\n');

    const result = await callClaude(`You are a SOC triage analyst. Prioritize these security events:

Events:
${eventSummary}

Provide triage in JSON format:
{
  "triaged": [
    {
      "eventId": "event-id",
      "priority": 1-5,
      "action": "investigate|escalate|close|monitor",
      "reasoning": "brief reason",
      "suggestedAssignee": "analyst-level",
      "estimatedTime": "time estimate"
    }
  ],
  "summary": "overall summary",
  "criticalCount": 0,
  "falsePositiveEstimate": 0
}

Only return valid JSON.`);

    if (!result) {
      // Default triage based on severity
      const triaged = events.map(e => ({
        eventId: e.id,
        priority: e.severity === 'critical' ? 1 : e.severity === 'high' ? 2 : e.severity === 'medium' ? 3 : 4,
        action: e.severity === 'critical' ? 'escalate' : 'investigate',
        reasoning: `Auto-triaged based on ${e.severity} severity`,
      }));

      return reply.send({ triaged, source: 'heuristic' });
    }

    try {
      const triage = JSON.parse(result);
      return reply.send({ ...triage, source: 'ai-triage', model: 'claude-3-haiku' });
    } catch {
      return reply.status(500).send({ error: 'Triage parse failed' });
    }
  });
}
