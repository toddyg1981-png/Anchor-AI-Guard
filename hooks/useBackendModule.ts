import { useState, useEffect, useCallback } from 'react';
import { backendApi } from '../utils/backendApi';

interface ModuleState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Generic hook for connecting any security module to its backend.
 * Fetches dashboard data on mount, provides loading/error states.
 */
export function useModuleDashboard<T = any>(
  fetchFn: () => Promise<unknown>,
  fallback?: T
): ModuleState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result as T);
    } catch (err: any) {
      console.error('Module dashboard fetch failed:', err);
      setError(err.message || 'Failed to load');
      if (fallback) setData(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}

/**
 * Hook for generic security modules that use the /modules/:name/ endpoints
 */
export function useGenericModule(moduleName: string) {
  const [dashboard, setDashboard] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await backendApi.modules.getDashboard(moduleName);
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load module');
    } finally {
      setLoading(false);
    }
  }, [moduleName]);

  const analyze = useCallback(async (context?: string, question?: string) => {
    setAnalyzing(true);
    try {
      const result = await backendApi.modules.analyze(moduleName, context, question);
      setAnalysis(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }, [moduleName]);

  const createItem = useCallback(async (data: Record<string, unknown>) => {
    try {
      const result = await backendApi.modules.createItem(moduleName, data);
      await loadDashboard(); // refresh
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [moduleName, loadDashboard]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return { dashboard, analysis, loading, analyzing, error, analyze, createItem, refresh: loadDashboard };
}
