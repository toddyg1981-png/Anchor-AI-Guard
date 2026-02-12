import { useState, useEffect, useCallback } from 'react';
import { backendApi } from '../utils/backendApi';
import { useAuth } from './useAuth';

/**
 * Unified hook for all security module components.
 * 
 * - In DEMO MODE: Returns demoData immediately, no API calls
 * - In PRODUCTION: Fetches real data from backendApi.modules.getDashboard(moduleName)
 * - Provides AI analysis via backendApi.modules.analyze(moduleName)
 * - Handles loading/error states automatically
 * 
 * Usage:
 *   const { data, loading, analyzing, analysisResult, runAnalysis } = useSecurityModule('edr', {
 *     detections: [...demoDetections],
 *     endpoints: [...demoEndpoints],
 *   });
 */
export function useSecurityModule<T extends Record<string, unknown>>(
  moduleName: string,
  demoData: T
): {
  data: T;
  loading: boolean;
  error: string | null;
  analyzing: boolean;
  analysisResult: string | null;
  runAnalysis: (context?: string) => Promise<void>;
  refresh: () => Promise<void>;
  isDemoMode: boolean;
} {
  const auth = useAuth();
  const isDemoMode = auth?.isDemoMode ?? true;

  const [data, setData] = useState<T>(demoData);
  const [loading, setLoading] = useState(!isDemoMode);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (isDemoMode) {
      setData(demoData);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await backendApi.modules.getDashboard(moduleName);
      if (result && typeof result === 'object') {
        setData(result as T);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load module data';
      setError(message);
      // In production, don't fall back to demo data — show error state
    } finally {
      setLoading(false);
    }
  }, [moduleName, isDemoMode, demoData]);

  const runAnalysis = useCallback(async (context?: string) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const res = await backendApi.modules.analyze(
        moduleName,
        context || `Analyze ${moduleName} security posture and provide actionable recommendations`
      );
      setAnalysisResult(typeof res === 'string' ? res : JSON.stringify(res, null, 2));
    } catch {
      setAnalysisResult(
        isDemoMode
          ? `AI Analysis (Demo): ${moduleName} module is operating within normal parameters. In production, this provides live AI-powered security analysis with specific findings, risk scores, and remediation steps.`
          : 'Analysis unavailable — connect to backend for live AI analysis.'
      );
    }
    setAnalyzing(false);
  }, [moduleName, isDemoMode]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, analyzing, analysisResult, runAnalysis, refresh, isDemoMode };
}
