import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { authMiddleware } from '../lib/auth';
import crypto from 'crypto';

// In-memory stores for endpoint management
const registeredEndpoints = new Map<string, EndpointDevice[]>();
const endpointEvents = new Map<string, EndpointEvent[]>();
const threatDetections = new Map<string, ThreatDetection[]>();
const endpointPolicies = new Map<string, EndpointPolicy[]>();
const quarantinedFiles = new Map<string, QuarantinedFile[]>();

interface EndpointDevice {
  id: string;
  organizationId: string;
  hostname: string;
  platform: 'windows' | 'macos' | 'linux' | 'ios' | 'android';
  osVersion: string;
  agentVersion: string;
  lastSeen: Date;
  status: 'online' | 'offline' | 'compromised' | 'isolated';
  ipAddress: string;
  macAddress: string;
  serialNumber?: string;
  enrolledAt: Date;
  enrolledBy: string;
  tags: string[];
  riskScore: number;
  complianceStatus: 'compliant' | 'non-compliant' | 'unknown';
  protectionStatus: {
    realTimeProtection: boolean;
    firewallEnabled: boolean;
    encryptionEnabled: boolean;
    antivirusUpdated: boolean;
    osPatched: boolean;
  };
  hardware: {
    cpu: string;
    memory: string;
    storage: string;
    model: string;
    manufacturer: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    department: string;
  };
}

interface EndpointEvent {
  id: string;
  endpointId: string;
  timestamp: Date;
  type: 'process' | 'network' | 'file' | 'registry' | 'login' | 'threat' | 'policy';
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details: Record<string, unknown>;
  mitreTactic?: string;
  mitreTechnique?: string;
}

interface ThreatDetection {
  id: string;
  endpointId: string;
  detectedAt: Date;
  threatType: 'malware' | 'ransomware' | 'trojan' | 'worm' | 'spyware' | 'rootkit' | 'pup' | 'exploit' | 'fileless';
  threatName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'blocked' | 'quarantined' | 'removed' | 'ignored';
  filePath?: string;
  fileHash?: string;
  processName?: string;
  actionTaken: string;
  mitreTactic?: string;
  mitreTechnique?: string;
  iocIndicators: string[];
}

interface EndpointPolicy {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  type: 'protection' | 'firewall' | 'device-control' | 'application-control' | 'encryption';
  enabled: boolean;
  priority: number;
  targetPlatforms: string[];
  targetGroups: string[];
  settings: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

interface QuarantinedFile {
  id: string;
  endpointId: string;
  originalPath: string;
  fileName: string;
  fileHash: string;
  fileSize: number;
  threatName: string;
  quarantinedAt: Date;
  status: 'quarantined' | 'restored' | 'deleted';
}

// Helper to get org endpoints
function getOrgEndpoints(orgId: string): EndpointDevice[] {
  return registeredEndpoints.get(orgId) || [];
}

// Helper to calculate risk score
function calculateRiskScore(device: Partial<EndpointDevice>): number {
  let score = 0;
  
  if (!device.protectionStatus?.realTimeProtection) score += 25;
  if (!device.protectionStatus?.firewallEnabled) score += 15;
  if (!device.protectionStatus?.encryptionEnabled) score += 20;
  if (!device.protectionStatus?.antivirusUpdated) score += 20;
  if (!device.protectionStatus?.osPatched) score += 20;
  
  return Math.min(100, score);
}

// AI-powered threat analysis using Claude
async function analyzeEndpointThreat(event: EndpointEvent, device: EndpointDevice): Promise<{
  isThreat: boolean;
  confidence: number;
  threatType?: string;
  recommendation: string;
  mitreTactic?: string;
  mitreTechnique?: string;
}> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return {
      isThreat: event.severity === 'high' || event.severity === 'critical',
      confidence: 0.6,
      recommendation: 'Manual review recommended - AI analysis unavailable'
    };
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
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: `Analyze this endpoint security event for potential threats:

Device: ${device.hostname} (${device.platform} ${device.osVersion})
Event Type: ${event.type}
Description: ${event.description}
Details: ${JSON.stringify(event.details)}
Severity: ${event.severity}

Determine if this is a genuine threat. Respond in JSON format:
{
  "isThreat": boolean,
  "confidence": 0-1,
  "threatType": "malware|ransomware|trojan|exploit|fileless|lateral_movement|data_exfiltration|null",
  "recommendation": "action to take",
  "mitreTactic": "MITRE ATT&CK tactic if applicable",
  "mitreTechnique": "MITRE ATT&CK technique ID if applicable"
}`
        }]
      })
    });

    const data = await response.json() as { content?: Array<{ text?: string }> };
    const text = data.content?.[0]?.text || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('AI threat analysis failed:', error);
  }

  return {
    isThreat: event.severity === 'high' || event.severity === 'critical',
    confidence: 0.5,
    recommendation: 'Manual review recommended'
  };
}

export default async function endpointProtectionRoutes(fastify: FastifyInstance) {
  
  // ==================== DEVICE MANAGEMENT ====================
  
  // Register new endpoint/device
  fastify.post('/endpoint/devices/register', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { userId, organizationId } = request.user as { userId: string; organizationId: string };
    const body = request.body as {
      hostname: string;
      platform: string;
      osVersion: string;
      agentVersion: string;
      ipAddress: string;
      macAddress: string;
      serialNumber?: string;
      hardware?: Record<string, string>;
      userEmail?: string;
    };

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const device: EndpointDevice = {
      id: crypto.randomUUID(),
      organizationId,
      hostname: body.hostname,
      platform: body.platform as EndpointDevice['platform'],
      osVersion: body.osVersion,
      agentVersion: body.agentVersion,
      lastSeen: new Date(),
      status: 'online',
      ipAddress: body.ipAddress,
      macAddress: body.macAddress,
      serialNumber: body.serialNumber,
      enrolledAt: new Date(),
      enrolledBy: userId,
      tags: [],
      riskScore: 0,
      complianceStatus: 'unknown',
      protectionStatus: {
        realTimeProtection: true,
        firewallEnabled: true,
        encryptionEnabled: false,
        antivirusUpdated: true,
        osPatched: false
      },
      hardware: {
        cpu: body.hardware?.cpu || 'Unknown',
        memory: body.hardware?.memory || 'Unknown',
        storage: body.hardware?.storage || 'Unknown',
        model: body.hardware?.model || 'Unknown',
        manufacturer: body.hardware?.manufacturer || 'Unknown'
      },
      user: body.userEmail ? {
        id: userId,
        email: body.userEmail,
        name: user?.name || 'Unknown',
        department: 'Unknown'
      } : undefined
    };

    device.riskScore = calculateRiskScore(device);

    const orgDevices = registeredEndpoints.get(organizationId) || [];
    orgDevices.push(device);
    registeredEndpoints.set(organizationId, orgDevices);

    return reply.send({
      success: true,
      device,
      agentConfig: {
        heartbeatInterval: 60000,
        eventReportingInterval: 30000,
        scanSchedule: '0 2 * * *',
        protectionLevel: 'maximum',
        cloudLookupEnabled: true
      }
    });
  });

  // List all endpoints
  fastify.get('/endpoint/devices', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const query = request.query as { status?: string; platform?: string };

    let devices = getOrgEndpoints(organizationId);

    // Apply filters
    if (query.status) {
      devices = devices.filter(d => d.status === query.status);
    }
    if (query.platform) {
      devices = devices.filter(d => d.platform === query.platform);
    }

    // Calculate summary stats
    const stats = {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      compromised: devices.filter(d => d.status === 'compromised').length,
      isolated: devices.filter(d => d.status === 'isolated').length,
      compliant: devices.filter(d => d.complianceStatus === 'compliant').length,
      nonCompliant: devices.filter(d => d.complianceStatus === 'non-compliant').length,
      avgRiskScore: devices.length > 0 
        ? Math.round(devices.reduce((sum, d) => sum + d.riskScore, 0) / devices.length)
        : 0,
      byPlatform: {
        windows: devices.filter(d => d.platform === 'windows').length,
        macos: devices.filter(d => d.platform === 'macos').length,
        linux: devices.filter(d => d.platform === 'linux').length,
        ios: devices.filter(d => d.platform === 'ios').length,
        android: devices.filter(d => d.platform === 'android').length
      }
    };

    return reply.send({ devices, stats });
  });

  // Get device details
  fastify.get('/endpoint/devices/:deviceId', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const { deviceId } = request.params as { deviceId: string };

    const devices = getOrgEndpoints(organizationId);
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
      return reply.status(404).send({ error: 'Device not found' });
    }

    // Get device events
    const allEvents = endpointEvents.get(organizationId) || [];
    const deviceEvents = allEvents.filter(e => e.endpointId === deviceId).slice(-100);

    // Get device threats
    const allThreats = threatDetections.get(organizationId) || [];
    const deviceThreats = allThreats.filter(t => t.endpointId === deviceId);

    return reply.send({
      device,
      recentEvents: deviceEvents,
      threats: deviceThreats,
      timeline: deviceEvents.map(e => ({
        timestamp: e.timestamp,
        type: e.type,
        description: e.description,
        severity: e.severity
      }))
    });
  });

  // Isolate device (network quarantine)
  fastify.post('/endpoint/devices/:deviceId/isolate', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId, userId } = request.user as { organizationId: string; userId: string };
    const { deviceId } = request.params as { deviceId: string };
    const body = request.body as { reason?: string };

    const devices = getOrgEndpoints(organizationId);
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
      return reply.status(404).send({ error: 'Device not found' });
    }

    device.status = 'isolated';

    // Log isolation event
    const events = endpointEvents.get(organizationId) || [];
    events.push({
      id: crypto.randomUUID(),
      endpointId: deviceId,
      timestamp: new Date(),
      type: 'policy',
      severity: 'high',
      description: `Device isolated by ${userId}. Reason: ${body.reason || 'Manual isolation'}`,
      details: { action: 'isolate', initiatedBy: userId, reason: body.reason }
    });
    endpointEvents.set(organizationId, events);

    return reply.send({
      success: true,
      message: 'Device isolated from network',
      device
    });
  });

  // Restore device from isolation
  fastify.post('/endpoint/devices/:deviceId/restore', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId, userId } = request.user as { organizationId: string; userId: string };
    const { deviceId } = request.params as { deviceId: string };

    const devices = getOrgEndpoints(organizationId);
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
      return reply.status(404).send({ error: 'Device not found' });
    }

    device.status = 'online';

    // Log restoration event
    const events = endpointEvents.get(organizationId) || [];
    events.push({
      id: crypto.randomUUID(),
      endpointId: deviceId,
      timestamp: new Date(),
      type: 'policy',
      severity: 'info',
      description: `Device restored from isolation by ${userId}`,
      details: { action: 'restore', initiatedBy: userId }
    });
    endpointEvents.set(organizationId, events);

    return reply.send({
      success: true,
      message: 'Device restored to network',
      device
    });
  });

  // Remote scan device
  fastify.post('/endpoint/devices/:deviceId/scan', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const { deviceId } = request.params as { deviceId: string };
    const body = request.body as { scanType?: 'quick' | 'full' | 'custom'; targets?: string[] };

    const devices = getOrgEndpoints(organizationId);
    const device = devices.find(d => d.id === deviceId);

    if (!device) {
      return reply.status(404).send({ error: 'Device not found' });
    }

    const scanId = crypto.randomUUID();
    const scanType = body.scanType || 'quick';

    // Log scan initiation
    const events = endpointEvents.get(organizationId) || [];
    events.push({
      id: crypto.randomUUID(),
      endpointId: deviceId,
      timestamp: new Date(),
      type: 'policy',
      severity: 'info',
      description: `Remote ${scanType} scan initiated`,
      details: { scanId, scanType, targets: body.targets }
    });
    endpointEvents.set(organizationId, events);

    return reply.send({
      success: true,
      scanId,
      message: `${scanType.charAt(0).toUpperCase() + scanType.slice(1)} scan initiated on ${device.hostname}`,
      estimatedDuration: scanType === 'full' ? '30-60 minutes' : '5-10 minutes'
    });
  });

  // ==================== THREAT DETECTION ====================

  // Report threat from endpoint agent
  fastify.post('/endpoint/threats/report', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const body = request.body as {
      endpointId: string;
      threatType: string;
      threatName: string;
      severity: string;
      filePath?: string;
      fileHash?: string;
      processName?: string;
      iocIndicators?: string[];
    };

    const devices = getOrgEndpoints(organizationId);
    const device = devices.find(d => d.id === body.endpointId);

    if (!device) {
      return reply.status(404).send({ error: 'Device not found' });
    }

    const threat: ThreatDetection = {
      id: crypto.randomUUID(),
      endpointId: body.endpointId,
      detectedAt: new Date(),
      threatType: body.threatType as ThreatDetection['threatType'],
      threatName: body.threatName,
      severity: body.severity as ThreatDetection['severity'],
      status: 'detected',
      filePath: body.filePath,
      fileHash: body.fileHash,
      processName: body.processName,
      actionTaken: 'Pending analysis',
      iocIndicators: body.iocIndicators || []
    };

    // Run AI analysis
    const event: EndpointEvent = {
      id: crypto.randomUUID(),
      endpointId: body.endpointId,
      timestamp: new Date(),
      type: 'threat',
      severity: body.severity as EndpointEvent['severity'],
      description: `${body.threatType} detected: ${body.threatName}`,
      details: { filePath: body.filePath, fileHash: body.fileHash, processName: body.processName }
    };

    const analysis = await analyzeEndpointThreat(event, device);
    
    if (analysis.mitreTactic) threat.mitreTactic = analysis.mitreTactic;
    if (analysis.mitreTechnique) threat.mitreTechnique = analysis.mitreTechnique;

    // Auto-respond based on severity and AI confidence
    if (analysis.isThreat && analysis.confidence > 0.8) {
      if (threat.severity === 'critical' || threat.severity === 'high') {
        threat.status = 'quarantined';
        threat.actionTaken = 'Auto-quarantined based on AI analysis';
        
        // Add to quarantine
        if (body.filePath && body.fileHash) {
          const quarantine = quarantinedFiles.get(organizationId) || [];
          quarantine.push({
            id: crypto.randomUUID(),
            endpointId: body.endpointId,
            originalPath: body.filePath,
            fileName: body.filePath.split(/[/\\]/).pop() || 'unknown',
            fileHash: body.fileHash,
            fileSize: 0,
            threatName: body.threatName,
            quarantinedAt: new Date(),
            status: 'quarantined'
          });
          quarantinedFiles.set(organizationId, quarantine);
        }

        // Mark device as potentially compromised if critical
        if (threat.severity === 'critical') {
          device.status = 'compromised';
        }
      } else {
        threat.status = 'blocked';
        threat.actionTaken = 'Blocked by real-time protection';
      }
    }

    const threats = threatDetections.get(organizationId) || [];
    threats.push(threat);
    threatDetections.set(organizationId, threats);

    // Log event
    const events = endpointEvents.get(organizationId) || [];
    events.push(event);
    endpointEvents.set(organizationId, events);

    // Recalculate device risk score
    device.riskScore = Math.min(100, device.riskScore + (threat.severity === 'critical' ? 30 : threat.severity === 'high' ? 20 : 10));

    return reply.send({
      success: true,
      threat,
      aiAnalysis: analysis,
      actionTaken: threat.actionTaken
    });
  });

  // Get all threats
  fastify.get('/endpoint/threats', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const query = request.query as { severity?: string; status?: string; days?: string };

    let threats = threatDetections.get(organizationId) || [];

    // Filter by severity
    if (query.severity) {
      threats = threats.filter(t => t.severity === query.severity);
    }

    // Filter by status
    if (query.status) {
      threats = threats.filter(t => t.status === query.status);
    }

    // Filter by time
    if (query.days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - parseInt(query.days));
      threats = threats.filter(t => t.detectedAt >= cutoff);
    }

    const stats = {
      total: threats.length,
      critical: threats.filter(t => t.severity === 'critical').length,
      high: threats.filter(t => t.severity === 'high').length,
      medium: threats.filter(t => t.severity === 'medium').length,
      low: threats.filter(t => t.severity === 'low').length,
      quarantined: threats.filter(t => t.status === 'quarantined').length,
      blocked: threats.filter(t => t.status === 'blocked').length,
      removed: threats.filter(t => t.status === 'removed').length,
      byType: {
        malware: threats.filter(t => t.threatType === 'malware').length,
        ransomware: threats.filter(t => t.threatType === 'ransomware').length,
        trojan: threats.filter(t => t.threatType === 'trojan').length,
        exploit: threats.filter(t => t.threatType === 'exploit').length,
        fileless: threats.filter(t => t.threatType === 'fileless').length
      }
    };

    return reply.send({ threats, stats });
  });

  // ==================== POLICIES ====================

  // Create protection policy
  fastify.post('/endpoint/policies', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const body = request.body as {
      name: string;
      description: string;
      type: string;
      targetPlatforms: string[];
      targetGroups?: string[];
      settings: Record<string, unknown>;
    };

    const policy: EndpointPolicy = {
      id: crypto.randomUUID(),
      organizationId,
      name: body.name,
      description: body.description,
      type: body.type as EndpointPolicy['type'],
      enabled: true,
      priority: 100,
      targetPlatforms: body.targetPlatforms,
      targetGroups: body.targetGroups || ['all'],
      settings: body.settings,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const policies = endpointPolicies.get(organizationId) || [];
    policies.push(policy);
    endpointPolicies.set(organizationId, policies);

    return reply.send({ success: true, policy });
  });

  // List policies
  fastify.get('/endpoint/policies', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    
    const policies = endpointPolicies.get(organizationId) || [];
    
    return reply.send({ policies });
  });

  // Toggle policy
  fastify.patch('/endpoint/policies/:policyId', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const { policyId } = request.params as { policyId: string };
    const body = request.body as { enabled?: boolean; settings?: Record<string, unknown> };

    const policies = endpointPolicies.get(organizationId) || [];
    const policy = policies.find(p => p.id === policyId);

    if (!policy) {
      return reply.status(404).send({ error: 'Policy not found' });
    }

    if (body.enabled !== undefined) policy.enabled = body.enabled;
    if (body.settings) policy.settings = { ...policy.settings, ...body.settings };
    policy.updatedAt = new Date();

    return reply.send({ success: true, policy });
  });

  // ==================== QUARANTINE ====================

  // Get quarantined files
  fastify.get('/endpoint/quarantine', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    
    const files = quarantinedFiles.get(organizationId) || [];
    
    return reply.send({
      files: files.filter(f => f.status === 'quarantined'),
      stats: {
        total: files.length,
        quarantined: files.filter(f => f.status === 'quarantined').length,
        restored: files.filter(f => f.status === 'restored').length,
        deleted: files.filter(f => f.status === 'deleted').length
      }
    });
  });

  // Delete quarantined file permanently
  fastify.delete('/endpoint/quarantine/:fileId', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const { fileId } = request.params as { fileId: string };

    const files = quarantinedFiles.get(organizationId) || [];
    const file = files.find(f => f.id === fileId);

    if (!file) {
      return reply.status(404).send({ error: 'File not found' });
    }

    file.status = 'deleted';

    return reply.send({ success: true, message: 'File permanently deleted' });
  });

  // ==================== EVENTS & TELEMETRY ====================

  // Report events from endpoint agent
  fastify.post('/endpoint/events', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const body = request.body as {
      endpointId: string;
      events: Array<{
        type: string;
        description: string;
        severity: string;
        details: Record<string, unknown>;
      }>;
    };

    const devices = getOrgEndpoints(organizationId);
    const device = devices.find(d => d.id === body.endpointId);

    if (!device) {
      return reply.status(404).send({ error: 'Device not found' });
    }

    // Update last seen
    device.lastSeen = new Date();
    if (device.status === 'offline') {
      device.status = 'online';
    }

    const allEvents = endpointEvents.get(organizationId) || [];
    
    for (const evt of body.events) {
      const event: EndpointEvent = {
        id: crypto.randomUUID(),
        endpointId: body.endpointId,
        timestamp: new Date(),
        type: evt.type as EndpointEvent['type'],
        severity: evt.severity as EndpointEvent['severity'],
        description: evt.description,
        details: evt.details
      };

      // Check for suspicious activity using AI
      if (evt.severity === 'high' || evt.severity === 'critical') {
        const analysis = await analyzeEndpointThreat(event, device);
        if (analysis.isThreat && analysis.confidence > 0.7) {
          event.mitreTactic = analysis.mitreTactic;
          event.mitreTechnique = analysis.mitreTechnique;
          
          // Create threat detection
          const threats = threatDetections.get(organizationId) || [];
          threats.push({
            id: crypto.randomUUID(),
            endpointId: body.endpointId,
            detectedAt: new Date(),
            threatType: (analysis.threatType as ThreatDetection['threatType']) || 'malware',
            threatName: `AI-detected: ${evt.description}`,
            severity: evt.severity as ThreatDetection['severity'],
            status: 'detected',
            actionTaken: analysis.recommendation,
            mitreTactic: analysis.mitreTactic,
            mitreTechnique: analysis.mitreTechnique,
            iocIndicators: []
          });
          threatDetections.set(organizationId, threats);
        }
      }

      allEvents.push(event);
    }

    // Keep only last 10000 events per org
    if (allEvents.length > 10000) {
      allEvents.splice(0, allEvents.length - 10000);
    }
    endpointEvents.set(organizationId, allEvents);

    return reply.send({ success: true, processed: body.events.length });
  });

  // Get events timeline
  fastify.get('/endpoint/events', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };
    const query = request.query as { endpointId?: string; type?: string; limit?: string };

    let events = endpointEvents.get(organizationId) || [];

    if (query.endpointId) {
      events = events.filter(e => e.endpointId === query.endpointId);
    }
    if (query.type) {
      events = events.filter(e => e.type === query.type);
    }

    const limit = parseInt(query.limit || '100');
    events = events.slice(-limit).reverse();

    return reply.send({ events });
  });

  // ==================== DASHBOARD STATS ====================

  // Get overall endpoint protection stats
  fastify.get('/endpoint/stats', {
    preHandler: authMiddleware()
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { organizationId } = request.user as { organizationId: string };

    const devices = getOrgEndpoints(organizationId);
    const threats = threatDetections.get(organizationId) || [];
    const events = endpointEvents.get(organizationId) || [];
    const policies = endpointPolicies.get(organizationId) || [];

    // Calculate 24h stats
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const threats24h = threats.filter(t => t.detectedAt >= last24h);
    const events24h = events.filter(e => e.timestamp >= last24h);

    return reply.send({
      devices: {
        total: devices.length,
        online: devices.filter(d => d.status === 'online').length,
        offline: devices.filter(d => d.status === 'offline').length,
        compromised: devices.filter(d => d.status === 'compromised').length,
        isolated: devices.filter(d => d.status === 'isolated').length,
        compliant: devices.filter(d => d.complianceStatus === 'compliant').length,
        avgRiskScore: devices.length > 0 
          ? Math.round(devices.reduce((sum, d) => sum + d.riskScore, 0) / devices.length)
          : 0
      },
      threats: {
        total: threats.length,
        last24h: threats24h.length,
        critical: threats.filter(t => t.severity === 'critical').length,
        active: threats.filter(t => t.status === 'detected').length,
        blocked: threats.filter(t => t.status === 'blocked').length,
        quarantined: threats.filter(t => t.status === 'quarantined').length
      },
      events: {
        total: events.length,
        last24h: events24h.length,
        byType: {
          process: events.filter(e => e.type === 'process').length,
          network: events.filter(e => e.type === 'network').length,
          file: events.filter(e => e.type === 'file').length,
          threat: events.filter(e => e.type === 'threat').length
        }
      },
      policies: {
        total: policies.length,
        enabled: policies.filter(p => p.enabled).length
      },
      protectionScore: calculateOverallProtectionScore(devices, threats, policies)
    });
  });
}

// Calculate overall protection score
function calculateOverallProtectionScore(
  devices: EndpointDevice[],
  threats: ThreatDetection[],
  policies: EndpointPolicy[]
): number {
  if (devices.length === 0) return 100;

  let score = 100;

  // Deduct for unprotected devices
  const unprotectedRatio = devices.filter(d => 
    !d.protectionStatus.realTimeProtection || 
    !d.protectionStatus.firewallEnabled
  ).length / devices.length;
  score -= unprotectedRatio * 30;

  // Deduct for active threats
  const activeThreats = threats.filter(t => t.status === 'detected').length;
  score -= Math.min(30, activeThreats * 5);

  // Deduct for compromised devices
  const compromisedRatio = devices.filter(d => d.status === 'compromised').length / devices.length;
  score -= compromisedRatio * 40;

  // Bonus for policies
  if (policies.length > 0) {
    score += Math.min(10, policies.filter(p => p.enabled).length * 2);
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
