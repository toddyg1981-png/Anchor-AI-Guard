/**
 * AI Security Service - Gemini Integration
 * Provides intelligent security analysis, threat assessment, and remediation guidance
 */

import { Finding, Severity } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface AIAnalysis {
  threatScore: number; // 0-100
  riskAssessment: string;
  automatedRemediationSteps: string[];
  estimatedFixTime: string;
  relatedCVEs: string[];
  preventionStrategies: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
  automationSuggestions: string[];
}

export interface BulkAnalysisResult {
  totalFindings: number;
  criticalCount: number;
  averageThreatScore: number;
  prioritizedActions: string[];
  automationRecommendations: string[];
  estimatedTotalFixTime: string;
}

/**
 * Get AI-powered analysis for a single security finding
 */
export async function analyzeSecurityFinding(finding: Finding): Promise<AIAnalysis> {
  if (!GEMINI_API_KEY) {
    return getDefaultAnalysis(finding);
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

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1024,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.statusText);
      return getDefaultAnalysis(finding);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up the response - remove markdown code blocks if present
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const analysis = JSON.parse(cleanedContent) as AIAnalysis;
    return analysis;
  } catch (error) {
    console.error('AI analysis error:', error);
    return getDefaultAnalysis(finding);
  }
}

/**
 * Analyze multiple findings and provide prioritized recommendations
 */
export async function analyzeBulkFindings(findings: Finding[]): Promise<BulkAnalysisResult> {
  if (!GEMINI_API_KEY) {
    return getDefaultBulkAnalysis(findings);
  }

  try {
    const findingsSummary = findings
      .map(f => `- ${f.severity}: ${f.type} (${f.description.substring(0, 100)}...)`)
      .join('\n');

    const prompt = `You are a security expert. Analyze these ${findings.length} security findings and provide strategic recommendations. Respond ONLY with valid JSON (no markdown).

Findings:
${findingsSummary}

Total findings by severity:
- Critical: ${findings.filter(f => f.severity === Severity.Critical).length}
- High: ${findings.filter(f => f.severity === Severity.High).length}
- Medium: ${findings.filter(f => f.severity === Severity.Medium).length}
- Low: ${findings.filter(f => f.severity === Severity.Low).length}

Respond ONLY with valid JSON (no code blocks) in this exact format:
{
  "totalFindings": ${findings.length},
  "criticalCount": <number>,
  "averageThreatScore": <number 0-100>,
  "prioritizedActions": ["<action1>", "<action2>", "<action3>"],
  "automationRecommendations": ["<automation1>", "<automation2>"],
  "estimatedTotalFixTime": "<time estimate>"
}`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        },
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.statusText);
      return getDefaultBulkAnalysis(findings);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Clean up the response
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const analysis = JSON.parse(cleanedContent) as BulkAnalysisResult;
    return analysis;
  } catch (error) {
    console.error('Bulk AI analysis error:', error);
    return getDefaultBulkAnalysis(findings);
  }
}

/**
 * Generate a security assessment report
 */
export async function generateSecurityReport(findings: Finding[], projectName: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    return getDefaultReport(findings, projectName);
  }

  try {
    const criticalCount = findings.filter(f => f.severity === Severity.Critical).length;
    const highCount = findings.filter(f => f.severity === Severity.High).length;
    const mediumCount = findings.filter(f => f.severity === Severity.Medium).length;

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

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1024,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.statusText);
      return getDefaultReport(findings, projectName);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || getDefaultReport(findings, projectName);
  } catch (error) {
    console.error('Report generation error:', error);
    return getDefaultReport(findings, projectName);
  }
}

/**
 * Get AI threat intelligence for a vulnerability type
 */
export async function getThreatIntelligence(vulnerabilityType: string): Promise<{
  commonAttackPatterns: string[];
  realWorldExamples: string[];
  mitigation: string[];
  detectionMethods: string[];
}> {
  if (!GEMINI_API_KEY) {
    return getDefaultThreatIntel(vulnerabilityType);
  }

  try {
    const prompt = `Provide threat intelligence for "${vulnerabilityType}" vulnerability. Respond ONLY with valid JSON.

{
  "commonAttackPatterns": ["<pattern1>", "<pattern2>"],
  "realWorldExamples": ["<example1>", "<example2>"],
  "mitigation": ["<step1>", "<step2>"],
  "detectionMethods": ["<method1>", "<method2>"]
}`;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
        },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.statusText);
      return getDefaultThreatIntel(vulnerabilityType);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleanedContent);
  } catch (error) {
    console.error('Threat intelligence error:', error);
    return getDefaultThreatIntel(vulnerabilityType);
  }
}

// ============ Default Fallback Functions ============

function getDefaultAnalysis(finding: Finding): AIAnalysis {
  const threatScore = finding.severity === Severity.Critical ? 95 : 
                     finding.severity === Severity.High ? 75 :
                     finding.severity === Severity.Medium ? 50 : 30;

  return {
    threatScore,
    riskAssessment: `This ${finding.severity.toLowerCase()} severity ${finding.type} poses a significant security risk if not addressed.`,
    automatedRemediationSteps: [
      'Review current implementation',
      'Implement recommended fixes',
      'Test changes thoroughly',
      'Deploy to production',
    ],
    estimatedFixTime: finding.severity === Severity.Critical ? '1-2 hours' : '4-8 hours',
    relatedCVEs: [],
    preventionStrategies: [
      'Implement security best practices',
      'Regular security audits',
      'Developer security training',
    ],
    priority: finding.severity === Severity.Critical ? 'critical' : 'high',
    automationSuggestions: [
      'Add SAST scanning to CI/CD',
      'Implement automated testing',
      'Enable continuous monitoring',
    ],
  };
}

function getDefaultBulkAnalysis(findings: Finding[]): BulkAnalysisResult {
  const criticalCount = findings.filter(f => f.severity === Severity.Critical).length;
  const highCount = findings.filter(f => f.severity === Severity.High).length;
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

function getDefaultReport(findings: Finding[], projectName: string): string {
  return `Security Assessment Report - ${projectName}\n\n` +
    `Total Findings: ${findings.length}\n` +
    `Critical: ${findings.filter(f => f.severity === Severity.Critical).length}\n` +
    `High: ${findings.filter(f => f.severity === Severity.High).length}\n\n` +
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
