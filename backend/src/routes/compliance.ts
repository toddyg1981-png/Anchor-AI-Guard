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

// Compliance frameworks with their controls
const COMPLIANCE_FRAMEWORKS: Record<string, { name: string; controls: { id: string; name: string; category: string; description: string }[] }> = {
  'soc2': {
    name: 'SOC 2 Type II',
    controls: [
      { id: 'CC1.1', name: 'COSO Principle 1', category: 'Control Environment', description: 'Demonstrates commitment to integrity and ethical values' },
      { id: 'CC2.1', name: 'COSO Principle 6', category: 'Risk Assessment', description: 'Specifies objectives with sufficient clarity' },
      { id: 'CC3.1', name: 'COSO Principle 6', category: 'Risk Assessment', description: 'Identifies and analyzes risks' },
      { id: 'CC4.1', name: 'COSO Principle 16', category: 'Control Activities', description: 'Selects and develops control activities' },
      { id: 'CC5.1', name: 'COSO Principle 13', category: 'Communication', description: 'Uses relevant quality information' },
      { id: 'CC6.1', name: 'Logical Access', category: 'Logical and Physical Access', description: 'Implements logical access security software' },
      { id: 'CC6.6', name: 'System Boundaries', category: 'Logical and Physical Access', description: 'Restricts transmission to authorized users' },
      { id: 'CC7.1', name: 'System Monitoring', category: 'System Operations', description: 'Detects and monitors security events' },
      { id: 'CC7.2', name: 'Incident Response', category: 'System Operations', description: 'Responds to identified security incidents' },
      { id: 'CC8.1', name: 'Change Management', category: 'Change Management', description: 'Authorizes, designs, develops changes' },
    ],
  },
  'iso27001': {
    name: 'ISO 27001:2022',
    controls: [
      { id: 'A.5.1', name: 'Policies for information security', category: 'Organizational', description: 'Information security policy and topic-specific policies' },
      { id: 'A.5.7', name: 'Threat intelligence', category: 'Organizational', description: 'Information about security threats shall be collected' },
      { id: 'A.6.1', name: 'Screening', category: 'People', description: 'Background verification checks on personnel' },
      { id: 'A.7.1', name: 'Physical security perimeters', category: 'Physical', description: 'Security perimeters shall be defined' },
      { id: 'A.8.1', name: 'User endpoint devices', category: 'Technological', description: 'Information on endpoint devices shall be protected' },
      { id: 'A.8.9', name: 'Configuration management', category: 'Technological', description: 'Configurations shall be established and managed' },
      { id: 'A.8.12', name: 'Data leakage prevention', category: 'Technological', description: 'Measures to detect and prevent data leakage' },
      { id: 'A.8.16', name: 'Monitoring activities', category: 'Technological', description: 'Networks, systems and applications shall be monitored' },
      { id: 'A.8.28', name: 'Secure coding', category: 'Technological', description: 'Secure coding principles shall be applied' },
    ],
  },
  'pci-dss': {
    name: 'PCI DSS 4.0',
    controls: [
      { id: '1.1', name: 'Network Security Controls', category: 'Network Security', description: 'Install and maintain network security controls' },
      { id: '2.1', name: 'Secure Configurations', category: 'Secure Configuration', description: 'Apply secure configurations to all system components' },
      { id: '3.1', name: 'Data Protection', category: 'Account Data Protection', description: 'Protect stored account data' },
      { id: '4.1', name: 'Transmission Security', category: 'Transmission Security', description: 'Protect cardholder data with strong cryptography' },
      { id: '5.1', name: 'Anti-Malware', category: 'Malware Protection', description: 'Protect systems against malware' },
      { id: '6.1', name: 'Secure Development', category: 'Secure Development', description: 'Develop and maintain secure systems and software' },
      { id: '7.1', name: 'Access Control', category: 'Access Control', description: 'Restrict access to system components' },
      { id: '8.1', name: 'User Identification', category: 'User Management', description: 'Identify users and authenticate access' },
      { id: '10.1', name: 'Logging and Monitoring', category: 'Logging', description: 'Log and monitor all access to system components' },
      { id: '11.1', name: 'Security Testing', category: 'Testing', description: 'Test security of systems and networks regularly' },
    ],
  },
  'hipaa': {
    name: 'HIPAA Security Rule',
    controls: [
      { id: '164.308(a)(1)', name: 'Security Management', category: 'Administrative', description: 'Implement policies to prevent security violations' },
      { id: '164.308(a)(3)', name: 'Workforce Security', category: 'Administrative', description: 'Implement procedures for workforce access' },
      { id: '164.308(a)(4)', name: 'Information Access', category: 'Administrative', description: 'Implement policies for access authorization' },
      { id: '164.308(a)(5)', name: 'Security Awareness', category: 'Administrative', description: 'Implement security awareness training' },
      { id: '164.308(a)(6)', name: 'Incident Procedures', category: 'Administrative', description: 'Implement incident response procedures' },
      { id: '164.310(a)(1)', name: 'Facility Access', category: 'Physical', description: 'Limit physical access to information systems' },
      { id: '164.310(d)(1)', name: 'Device Security', category: 'Physical', description: 'Implement policies for device and media controls' },
      { id: '164.312(a)(1)', name: 'Access Control', category: 'Technical', description: 'Implement technical access controls' },
      { id: '164.312(b)', name: 'Audit Controls', category: 'Technical', description: 'Implement audit controls' },
      { id: '164.312(e)(1)', name: 'Transmission Security', category: 'Technical', description: 'Implement transmission security measures' },
    ],
  },
  'gdpr': {
    name: 'GDPR',
    controls: [
      { id: 'Art.5', name: 'Data Processing Principles', category: 'Principles', description: 'Lawfulness, fairness, transparency, purpose limitation' },
      { id: 'Art.6', name: 'Lawfulness of Processing', category: 'Legal Basis', description: 'Ensure lawful basis for processing' },
      { id: 'Art.17', name: 'Right to Erasure', category: 'Data Subject Rights', description: 'Enable data deletion requests' },
      { id: 'Art.25', name: 'Data Protection by Design', category: 'Design', description: 'Implement data protection by design and default' },
      { id: 'Art.32', name: 'Security of Processing', category: 'Security', description: 'Implement appropriate security measures' },
      { id: 'Art.33', name: 'Breach Notification', category: 'Breach', description: 'Notify authorities of breaches within 72 hours' },
      { id: 'Art.35', name: 'DPIA', category: 'Assessment', description: 'Conduct data protection impact assessments' },
      { id: 'Art.37', name: 'DPO Designation', category: 'Governance', description: 'Designate a Data Protection Officer where required' },
    ],
  },
  'nist-csf': {
    name: 'NIST Cybersecurity Framework 2.0',
    controls: [
      { id: 'ID.AM', name: 'Asset Management', category: 'Identify', description: 'Identify and manage assets' },
      { id: 'ID.RA', name: 'Risk Assessment', category: 'Identify', description: 'Understand cybersecurity risks' },
      { id: 'PR.AC', name: 'Identity Management', category: 'Protect', description: 'Manage identities and access' },
      { id: 'PR.DS', name: 'Data Security', category: 'Protect', description: 'Protect data' },
      { id: 'PR.IP', name: 'Information Protection', category: 'Protect', description: 'Maintain security policies' },
      { id: 'DE.AE', name: 'Anomalies Detection', category: 'Detect', description: 'Detect anomalies and events' },
      { id: 'DE.CM', name: 'Continuous Monitoring', category: 'Detect', description: 'Monitor for cybersecurity events' },
      { id: 'RS.AN', name: 'Analysis', category: 'Respond', description: 'Analyze detected events' },
      { id: 'RS.MI', name: 'Mitigation', category: 'Respond', description: 'Mitigate cybersecurity events' },
      { id: 'RC.RP', name: 'Recovery Planning', category: 'Recover', description: 'Execute recovery processes' },
    ],
  },
};

// Map finding types to control categories
const FINDING_TO_CONTROL_MAP: Record<string, string[]> = {
  'SQL Injection': ['CC6.1', 'A.8.28', '6.1', '164.312(a)(1)', 'Art.32', 'PR.DS'],
  'XSS': ['CC6.1', 'A.8.28', '6.1', '164.312(a)(1)', 'Art.32', 'PR.DS'],
  'Authentication': ['CC6.1', 'A.8.1', '8.1', '164.312(a)(1)', 'Art.32', 'PR.AC'],
  'Authorization': ['CC6.1', 'A.8.1', '7.1', '164.308(a)(4)', 'Art.32', 'PR.AC'],
  'Cryptography': ['CC6.6', 'A.8.12', '4.1', '164.312(e)(1)', 'Art.32', 'PR.DS'],
  'Configuration': ['CC4.1', 'A.8.9', '2.1', '164.308(a)(1)', 'Art.25', 'PR.IP'],
  'Logging': ['CC7.1', 'A.8.16', '10.1', '164.312(b)', 'Art.32', 'DE.CM'],
  'Vulnerability': ['CC7.2', 'A.5.7', '11.1', '164.308(a)(6)', 'Art.32', 'DE.AE'],
};

// Schemas
const assessSchema = z.object({
  frameworks: z.array(z.enum(['soc2', 'iso27001', 'pci-dss', 'hipaa', 'gdpr', 'nist-csf'])),
  projectId: z.string().optional(),
});

const reportSchema = z.object({
  framework: z.enum(['soc2', 'iso27001', 'pci-dss', 'hipaa', 'gdpr', 'nist-csf']),
  projectId: z.string().optional(),
  includeEvidence: z.boolean().optional(),
});

export async function complianceRoutes(app: FastifyInstance): Promise<void> {
  // Get compliance dashboard
  app.get('/compliance/dashboard', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };

    // Get all findings
    const findings = await prisma.finding.findMany({
      where: { project: { orgId: user.orgId } },
    });

    // Calculate compliance scores for each framework
    const scores: Record<string, { score: number; passing: number; failing: number; total: number }> = {};

    for (const [fwKey, framework] of Object.entries(COMPLIANCE_FRAMEWORKS)) {
      const controlResults = framework.controls.map(control => {
        // Check if any finding violates this control
        const violations = findings.filter(f => {
          const mappedControls = FINDING_TO_CONTROL_MAP[f.type] || [];
          return mappedControls.includes(control.id);
        });
        return { control, violations, pass: violations.length === 0 };
      });

      const passing = controlResults.filter(r => r.pass).length;
      const total = framework.controls.length;
      const score = Math.round((passing / total) * 100);

      scores[fwKey] = { score, passing, failing: total - passing, total };
    }

    return reply.send({
      scores,
      overallScore: Math.round(Object.values(scores).reduce((sum, s) => sum + s.score, 0) / Object.keys(scores).length),
      totalFindings: findings.length,
      criticalFindings: findings.filter(f => f.severity === 'CRITICAL').length,
      frameworks: Object.entries(COMPLIANCE_FRAMEWORKS).map(([key, fw]) => ({
        id: key,
        name: fw.name,
        controlCount: fw.controls.length,
      })),
    });
  });

  // Run compliance assessment
  app.post('/compliance/assess', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const parsed = assessSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const where = parsed.data.projectId
      ? { projectId: parsed.data.projectId }
      : { project: { orgId: user.orgId } };

    const findings = await prisma.finding.findMany({ where });

    const results: Record<string, {
      framework: string;
      score: number;
      controls: { id: string; name: string; category: string; status: 'pass' | 'fail' | 'partial'; violations: { id: string; title: string; severity: string }[]; evidence: string[] }[];
    }> = {};

    for (const fwKey of parsed.data.frameworks) {
      const framework = COMPLIANCE_FRAMEWORKS[fwKey];
      if (!framework) continue;

      const controlResults = framework.controls.map(control => {
        const violations = findings.filter(f => {
          const mappedControls = FINDING_TO_CONTROL_MAP[f.type] || [];
          return mappedControls.includes(control.id);
        });

        const status: 'pass' | 'fail' | 'partial' = violations.length === 0 ? 'pass' : violations.some(v => v.severity === 'CRITICAL') ? 'fail' : 'partial';

        return {
          id: control.id,
          name: control.name,
          category: control.category,
          status,
          violations: violations.map(v => ({ id: v.id, title: v.title, severity: v.severity })),
          evidence: violations.length === 0 ? ['No violations detected'] : [],
        };
      });

      const passing = controlResults.filter(r => r.status === 'pass').length;
      const score = Math.round((passing / controlResults.length) * 100);

      results[fwKey] = {
        framework: framework.name,
        score,
        controls: controlResults,
      };
    }

    return reply.send({ results, assessedAt: new Date().toISOString() });
  });

  // Generate compliance report
  app.post('/compliance/report', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user as { orgId: string };
    const parsed = reportSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const framework = COMPLIANCE_FRAMEWORKS[parsed.data.framework];
    if (!framework) {
      return reply.status(400).send({ error: 'Invalid framework' });
    }

    const where = parsed.data.projectId
      ? { projectId: parsed.data.projectId }
      : { project: { orgId: user.orgId } };

    const findings = await prisma.finding.findMany({
      where,
      include: { project: true },
    });

    // Generate control assessment
    const controlResults = framework.controls.map(control => {
      const violations = findings.filter(f => {
        const mappedControls = FINDING_TO_CONTROL_MAP[f.type] || [];
        return mappedControls.includes(control.id);
      });

      return {
        controlId: control.id,
        controlName: control.name,
        category: control.category,
        status: violations.length === 0 ? 'COMPLIANT' : 'NON-COMPLIANT',
        violationCount: violations.length,
        criticalViolations: violations.filter(v => v.severity === 'CRITICAL').length,
      };
    });

    const compliant = controlResults.filter(c => c.status === 'COMPLIANT').length;
    const score = Math.round((compliant / controlResults.length) * 100);

    // Generate AI executive summary
    const summary = await callClaude(`Generate a brief executive summary for a compliance report:

Framework: ${framework.name}
Compliance Score: ${score}%
Controls Assessed: ${controlResults.length}
Compliant: ${compliant}
Non-Compliant: ${controlResults.length - compliant}
Critical Findings: ${findings.filter(f => f.severity === 'CRITICAL').length}

Provide a 2-3 paragraph executive summary suitable for senior leadership.`);

    return reply.send({
      framework: framework.name,
      frameworkId: parsed.data.framework,
      generatedAt: new Date().toISOString(),
      score,
      summary: summary || `The organization achieved a ${score}% compliance score for ${framework.name}. ${compliant} of ${controlResults.length} controls are compliant.`,
      controlResults,
      recommendations: [
        'Address critical findings immediately',
        'Review non-compliant controls',
        'Implement remediation plan',
        'Schedule follow-up assessment',
      ],
    });
  });

  // Get available frameworks
  app.get('/compliance/frameworks', { preHandler: [authMiddleware()] }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const frameworks = Object.entries(COMPLIANCE_FRAMEWORKS).map(([key, fw]) => ({
      id: key,
      name: fw.name,
      controlCount: fw.controls.length,
      categories: [...new Set(fw.controls.map(c => c.category))],
    }));

    return reply.send({ frameworks });
  });

  // Get framework details
  app.get('/compliance/frameworks/:id', { preHandler: [authMiddleware()] }, async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const framework = COMPLIANCE_FRAMEWORKS[id];

    if (!framework) {
      return reply.status(404).send({ error: 'Framework not found' });
    }

    return reply.send({
      id,
      name: framework.name,
      controls: framework.controls,
    });
  });
}
