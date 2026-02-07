import { useEffect, useState, useCallback } from 'react';
import { Project, Finding, ActiveScan } from '../types';
import { backendApi } from '../utils/backendApi';
import { env } from '../config/env';
import { mockProjects, mockFindings, mockActiveScans } from '../constants';
import { errorHandler } from '../utils/errorHandler';

interface BackendDataState {
  projects: Project[];
  findings: Finding[];
  activeScans: ActiveScan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const initialState: Omit<BackendDataState, 'refetch'> = {
  projects: [],
  findings: [],
  activeScans: [],
  loading: true,
  error: null,
};

export function useBackendData(isAuthenticated = false): BackendDataState {
  const [state, setState] = useState<Omit<BackendDataState, 'refetch'>>(initialState);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Don't fetch if user is not authenticated — avoids 401 errors on mount
    if (!isAuthenticated) {
      setState({ ...initialState, loading: false });
      return;
    }

    let isMounted = true;

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [projects, findings, activeScans] = await Promise.all([
          backendApi.getProjects(),
          backendApi.getFindings(),
          backendApi.getActiveScans(),
        ]);

        if (!isMounted) return;

        setState({
          projects,
          findings,
          activeScans,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (!isMounted) return;

        const message = err instanceof Error ? err.message : 'Failed to load data';
        errorHandler.handle(err as Error);

        if (env.useMockData) {
          setState({
            projects: mockProjects,
            findings: mockFindings,
            activeScans: mockActiveScans,
            loading: false,
            error: null,
          });
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: message,
          }));
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [refetchTrigger, isAuthenticated]);

  return { ...state, refetch };
}
