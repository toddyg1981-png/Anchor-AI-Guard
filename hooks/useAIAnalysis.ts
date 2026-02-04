/**
 * AI Security Analysis Hooks
 * React hooks for intelligent security analysis and threat assessment
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Finding, Severity } from '../types';
import {
  analyzeSecurityFinding,
  analyzeBulkFindings,
  generateSecurityReport,
  getThreatIntelligence,
  AIAnalysis,
  BulkAnalysisResult,
} from '../utils/aiService';

/**
 * Hook for AI analysis of a single security finding
 */
export function useAIFindingAnalysis(finding: Finding | null) {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!finding) {
      setAnalysis(null);
      return;
    }

    const analyze = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await analyzeSecurityFinding(finding);
        setAnalysis(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
    };

    // Debounce analysis to avoid too many API calls
    const timer = setTimeout(analyze, 500);
    return () => clearTimeout(timer);
  }, [finding?.id]);

  return { analysis, loading, error };
}

/**
 * Hook for bulk AI analysis of multiple findings
 */
export function useAIBulkAnalysis(findings: Finding[]) {
  const [analysis, setAnalysis] = useState<BulkAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeFindings = useCallback(async () => {
    if (findings.length === 0) {
      setAnalysis(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await analyzeBulkFindings(findings);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [findings]);

  // Auto-analyze when findings change
  useEffect(() => {
    const timer = setTimeout(analyzeFindings, 1000);
    return () => clearTimeout(timer);
  }, [findings, analyzeFindings]);

  return { analysis, loading, error, refetch: analyzeFindings };
}

/**
 * Hook for AI security report generation
 */
export function useSecurityReport(findings: Finding[], projectName: string) {
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateSecurityReport(findings, projectName);
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report generation failed');
    } finally {
      setLoading(false);
    }
  }, [findings, projectName]);

  return { report, loading, error, generateReport };
}

/**
 * Hook for threat intelligence on vulnerability types
 */
export function useThreatIntelligence(vulnerabilityType: string | null) {
  const [threatIntel, setThreatIntel] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vulnerabilityType) {
      setThreatIntel(null);
      return;
    }

    const fetchIntel = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getThreatIntelligence(vulnerabilityType);
        setThreatIntel(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch threat intelligence');
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchIntel, 500);
    return () => clearTimeout(timer);
  }, [vulnerabilityType]);

  return { threatIntel, loading, error };
}

/**
 * Hook for smart finding prioritization based on AI analysis
 */
export function usePrioritizedFindings(findings: Finding[]) {
  const { analysis } = useAIBulkAnalysis(findings);

  return useMemo(() => {
    if (!findings) return { prioritized: [], criticalCount: 0 };

    const prioritized = [...findings].sort((a, b) => {
      // Sort by severity level
      const severityOrder: Record<Severity, number> = {
        [Severity.Critical]: 0,
        [Severity.High]: 1,
        [Severity.Medium]: 2,
        [Severity.Low]: 3,
        [Severity.Informational]: 4,
        [Severity.Resolved]: 5,
      };

      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    const criticalCount = findings.filter(f => f.severity === Severity.Critical).length;

    return { prioritized, criticalCount, analysis };
  }, [findings, analysis]);
}

/**
 * Hook for real-time security posture calculation
 */
export function useSecurityPosture(findings: Finding[]) {
  const criticalCount = findings.filter(f => f.severity === Severity.Critical).length;
  const highCount = findings.filter(f => f.severity === Severity.High).length;
  const mediumCount = findings.filter(f => f.severity === Severity.Medium).length;
  const lowCount = findings.filter(f => f.severity === Severity.Low).length;

  // Calculate security score: 100 - (critical*20 + high*10 + medium*5 + low*1)
  const securityScore = Math.max(
    0,
    100 - (criticalCount * 20 + highCount * 10 + mediumCount * 5 + lowCount * 1)
  );

  const rating =
    securityScore >= 80
      ? 'Excellent'
      : securityScore >= 60
        ? 'Good'
        : securityScore >= 40
          ? 'Fair'
          : 'Poor';

  const recommendations =
    criticalCount > 0
      ? ['Fix all critical findings immediately', 'Enable continuous monitoring', 'Increase security testing']
      : highCount > 0
        ? ['Address high-priority findings within 48 hours', 'Implement security headers', 'Set up alerting']
        : ['Maintain current security posture', 'Conduct regular security reviews', 'Keep dependencies updated'];

  return {
    securityScore,
    rating,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    recommendations,
    isHealthy: securityScore >= 70,
  };
}

/**
 * Hook for automated remediation suggestions
 */
export function useAutoRemediationSuggestions(findings: Finding[]) {
  const { analysis: bulkAnalysis } = useAIBulkAnalysis(findings);

  return useMemo(() => {
    if (!bulkAnalysis) {
      return {
        automationActions: [],
        estimatedTimeToFix: 'Unknown',
        canAutomate: false,
      };
    }

    return {
      automationActions: bulkAnalysis.automationRecommendations || [],
      estimatedTimeToFix: bulkAnalysis.estimatedTotalFixTime,
      canAutomate: bulkAnalysis.automationRecommendations.length > 0,
    };
  }, [bulkAnalysis]);
}
