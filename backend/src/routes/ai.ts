import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { env } from '../config/env';
import { authMiddleware } from '../lib/auth';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const findingSchema = z.object({
  id: z.string(),
  type: z.string(),
  severity: z.string(),
  description: z.string(),
  reproduction: z.string().optional().default(''),
  guidance: z.string().optional().default(''),
});

const analyzeSchema = z.object({
  finding: findingSchema,
});

const bulkAnalyzeSchema = z.object({
  findings: z.array(findingSchema),
});

const reportSchema = z.object({
  findings: z.array(findingSchema),
  projectName: z.string(),
});

const threatIntelSchema = z.object({
  vulnerabilityType: z.string(),
});

async function callClaude(prompt: string, maxTokens = 1024): Promise<string> {
  if (!env.anthropicApiKey) {
    throw new Error('AI service not configured');
  }

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
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Claude API error:', error);
    throw new Error('AI service unavailable');
  }

  const data = await response.json();
  return data.content?.[0]?.text || '';
}

function cleanJsonResponse(content: string): string {
  return content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
}

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  // Analyze single finding
  app.post('/ai/analyze', { preHandler: authMiddleware(), config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = analyzeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { finding } = parsed.data;

    if (!env.anthropicApiKey) {
      return reply.send(getDefaultAnalysis(finding));
    }

    try {
      const prompt = `You are a security expert analyzing a vulnerability finding. Provide a concise JSON response (no markdown formatting, just plain JSON).

Finding Type: ${finding.type}
Severity: ${finding.severity}
Description: ${finding.description}
Reproduction Steps: ${finding.reproduction}
Current Guidance: ${finding.guidance}

Respond ONLY with valid JSON (no code blocks, no markdown) in this exact format:
{
  "threatScore": <number 0-100>,
  "riskAssessment": "<brief risk explanation>",
  "automatedRemediationSteps": ["<step1>", "<step2>"],
  "estimatedFixTime": "<time estimate>",
  "relatedCVEs": ["<CVE-XXXX-XXXXX>"],
  "preventionStrategies": ["<strategy1>", "<strategy2>"],
  "priority": "critical|high|medium|low",
  "automationSuggestions": ["<automation idea 1>", "<automation idea 2>"]
}`;

      const content = await callClaude(prompt);
      const analysis = JSON.parse(cleanJsonResponse(content));
      return reply.send(analysis);
    } catch (error) {
      console.error('AI analysis error:', error);
      return reply.send(getDefaultAnalysis(finding));
    }
  });

  // Bulk analyze findings
  app.post('/ai/analyze-bulk', { preHandler: authMiddleware(), config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = bulkAnalyzeSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { findings } = parsed.data;

    if (!env.anthropicApiKey) {
      return reply.send(getDefaultBulkAnalysis(findings));
    }

    try {
      const findingsSummary = findings
        .map(f => `- ${f.severity}: ${f.type} (${f.description.substring(0, 100)}...)`)
        .join('\n');

      const criticalCount = findings.filter(f => f.severity.toLowerCase() === 'critical').length;
      const highCount = findings.filter(f => f.severity.toLowerCase() === 'high').length;
      const mediumCount = findings.filter(f => f.severity.toLowerCase() === 'medium').length;
      const lowCount = findings.filter(f => f.severity.toLowerCase() === 'low').length;

      const prompt = `You are a security expert. Analyze these ${findings.length} security findings and provide strategic recommendations. Respond ONLY with valid JSON (no markdown).

Findings:
${findingsSummary}

Total findings by severity:
- Critical: ${criticalCount}
- High: ${highCount}
- Medium: ${mediumCount}
- Low: ${lowCount}

Respond ONLY with valid JSON (no code blocks) in this exact format:
{
  "totalFindings": ${findings.length},
  "criticalCount": <number>,
  "averageThreatScore": <number 0-100>,
  "prioritizedActions": ["<action1>", "<action2>", "<action3>"],
  "automationRecommendations": ["<automation1>", "<automation2>"],
  "estimatedTotalFixTime": "<time estimate>"
}`;

      const content = await callClaude(prompt, 2048);
      const analysis = JSON.parse(cleanJsonResponse(content));
      return reply.send(analysis);
    } catch (error) {
      console.error('Bulk AI analysis error:', error);
      return reply.send(getDefaultBulkAnalysis(findings));
    }
  });

  // Generate security report
  app.post('/ai/report', { preHandler: authMiddleware(), config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = reportSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { findings, projectName } = parsed.data;

    if (!env.anthropicApiKey) {
      return reply.send({ report: getDefaultReport(findings, projectName) });
    }

    try {
      const criticalCount = findings.filter(f => f.severity.toLowerCase() === 'critical').length;
      const highCount = findings.filter(f => f.severity.toLowerCase() === 'high').length;
      const mediumCount = findings.filter(f => f.severity.toLowerCase() === 'medium').length;

      const prompt = `Generate a professional security assessment report for project "${projectName}".

Findings Summary:
- Critical: ${criticalCount}
- High: ${highCount}
- Medium: ${mediumCount}
- Total: ${findings.length}

Top 3 Issues:
${findings.slice(0, 3).map(f => `• ${f.type}: ${f.description}`).join('\n')}

Provide a 3-4 paragraph professional assessment including:
1. Executive summary of security posture
2. Key risks and immediate actions needed
3. Long-term security improvements

Keep it concise and actionable.`;

      const report = await callClaude(prompt);
      return reply.send({ report });
    } catch (error) {
      console.error('Report generation error:', error);
      return reply.send({ report: getDefaultReport(findings, projectName) });
    }
  });

  // Get threat intelligence
  app.post('/ai/threat-intel', { preHandler: authMiddleware(), config: { rateLimit: { max: 20, timeWindow: '1 minute' } } }, async (request, reply) => {
    const parsed = threatIntelSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({ error: 'Invalid payload', details: parsed.error.flatten() });
    }

    const { vulnerabilityType } = parsed.data;

    if (!env.anthropicApiKey) {
      return reply.send(getDefaultThreatIntel(vulnerabilityType));
    }

    try {
      const prompt = `Provide threat intelligence for "${vulnerabilityType}" vulnerability. Respond ONLY with valid JSON.

{
  "commonAttackPatterns": ["<pattern1>", "<pattern2>"],
  "realWorldExamples": ["<example1>", "<example2>"],
  "mitigation": ["<step1>", "<step2>"],
  "detectionMethods": ["<method1>", "<method2>"]
}`;

      const content = await callClaude(prompt);
      const intel = JSON.parse(cleanJsonResponse(content));
      return reply.send(intel);
    } catch (error) {
      console.error('Threat intelligence error:', error);
      return reply.send(getDefaultThreatIntel(vulnerabilityType));
    }
  });
}

// Default fallback functions
function getDefaultAnalysis(finding: { severity: string; type: string }) {
  const threatScore = finding.severity.toLowerCase() === 'critical' ? 95 :
    finding.severity.toLowerCase() === 'high' ? 75 :
    finding.severity.toLowerCase() === 'medium' ? 50 : 30;

  return {
    threatScore,
    riskAssessment: `This ${finding.severity.toLowerCase()} severity ${finding.type} poses a significant security risk if not addressed.`,
    automatedRemediationSteps: [
      'Review current implementation',
      'Implement recommended fixes',
      'Test changes thoroughly',
      'Deploy to production',
    ],
    estimatedFixTime: finding.severity.toLowerCase() === 'critical' ? '1-2 hours' : '4-8 hours',
    relatedCVEs: [],
    preventionStrategies: [
      'Implement security best practices',
      'Regular security audits',
      'Developer security training',
    ],
    priority: finding.severity.toLowerCase() === 'critical' ? 'critical' : 'high',
    automationSuggestions: [
      'Add SAST scanning to CI/CD',
      'Implement automated testing',
      'Enable continuous monitoring',
    ],
  };
}

function getDefaultBulkAnalysis(findings: Array<{ severity: string }>) {
  const criticalCount = findings.filter(f => f.severity.toLowerCase() === 'critical').length;
  const highCount = findings.filter(f => f.severity.toLowerCase() === 'high').length;
  const averageThreatScore = (criticalCount * 90 + highCount * 70) / Math.max(findings.length, 1);

  return {
    totalFindings: findings.length,
    criticalCount,
    averageThreatScore,
    prioritizedActions: [
      `Fix ${criticalCount} critical findings immediately`,
      `Address ${highCount} high-priority findings within 48 hours`,
      'Implement security headers and protections',
      'Set up continuous monitoring',
    ],
    automationRecommendations: [
      'Enable SAST/DAST in CI/CD pipeline',
      'Automate dependency vulnerability scanning',
      'Implement automated security testing',
      'Set up real-time alerting',
    ],
    estimatedTotalFixTime: criticalCount > 0 ? '2-3 days' : '1-2 weeks',
  };
}

function getDefaultReport(findings: Array<{ severity: string }>, projectName: string): string {
  const criticalCount = findings.filter(f => f.severity.toLowerCase() === 'critical').length;
  const highCount = findings.filter(f => f.severity.toLowerCase() === 'high').length;
  
  return `Security Assessment Report - ${projectName}\n\n` +
    `Total Findings: ${findings.length}\n` +
    `Critical: ${criticalCount}\n` +
    `High: ${highCount}\n\n` +
    `Summary: This project requires immediate security attention. ` +
    `Please address all critical findings within 24 hours and high-priority findings within 48 hours.`;
}

function getDefaultThreatIntel(vulnerabilityType: string) {
  return {
    commonAttackPatterns: [
      `Standard ${vulnerabilityType} exploitation techniques`,
      'Automated scanning and exploitation',
    ],
    realWorldExamples: [
      'Similar vulnerabilities found in production systems',
      'Publicly disclosed exploits available',
    ],
    mitigation: [
      'Apply security patches and updates',
      'Implement input validation and sanitization',
      'Use security headers and protections',
    ],
    detectionMethods: [
      'Enable comprehensive logging and monitoring',
      'Use intrusion detection systems',
      'Implement behavior-based analysis',
    ],
  };
}
