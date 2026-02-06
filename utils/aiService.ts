/**
 * AI Security Service - Backend Integration
 * Provides intelligent security analysis, threat assessment, and remediation guidance
 * Routes AI calls through the backend for security (API keys stay server-side)
 */

import { Finding, Severity } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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
  try {
    const response = await fetch(`${API_BASE_URL}/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ finding }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('AI analysis error:', response.statusText);
      return getDefaultAnalysis(finding);
    }

    return await response.json();
  } catch (error) {
    console.error('AI analysis error:', error);
    return getDefaultAnalysis(finding);
  }
}

/**
 * Analyze multiple findings and provide prioritized recommendations
 */
export async function analyzeBulkFindings(findings: Finding[]): Promise<BulkAnalysisResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/analyze-bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ findings }),
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      console.error('Bulk AI analysis error:', response.statusText);
      return getDefaultBulkAnalysis(findings);
    }

    return await response.json();
  } catch (error) {
    console.error('Bulk AI analysis error:', error);
    return getDefaultBulkAnalysis(findings);
  }
}

/**
 * Generate a security assessment report
 */
export async function generateSecurityReport(findings: Finding[], projectName: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/ai/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ findings, projectName }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('Report generation error:', response.statusText);
      return getDefaultReport(findings, projectName);
    }

    const data = await response.json();
    return data.report;
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
  try {
    const response = await fetch(`${API_BASE_URL}/ai/threat-intel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ vulnerabilityType }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error('Threat intelligence error:', response.statusText);
      return getDefaultThreatIntel(vulnerabilityType);
    }

    return await response.json();
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
