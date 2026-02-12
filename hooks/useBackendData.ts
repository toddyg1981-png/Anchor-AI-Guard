import { useEffect, useState, useCallback } from 'react';
import { Project, Finding, ActiveScan } from '../types';
import { backendApi } from '../utils/backendApi';
import { env } from '../config/env';
import { mockProjects, mockFindings, mockActiveScans } from '../constants';
import { errorHandler } from '../utils/errorHandler';

const DEMO_KEY = 'anchor_demo_mode';

/** Richer demo data for screen-recording / demo mode */
const demoProjects: Project[] = [
  ...mockProjects,
  {
    id: 'p4',
    name: 'Aurora Financial Platform',
    owner: 'Demo Admin',
    totalScans: 67,
    activeScans: 1,
    findingsCount: 9,
    scope: {
      domains: ['aurora-finance.com', 'api.aurora-finance.com'],
      apis: ['REST v3', 'GraphQL v2'],
      mobileBuilds: ['iOS v2.4', 'Android v2.5'],
    },
    runHistory: [
      { id: 'r6', date: '2024-01-15 09:30', result: '9 Findings', findings: 9, status: 'Completed' },
      { id: 'r7', date: '2024-01-14 14:00', result: '11 Findings', findings: 11, status: 'Completed' },
      { id: 'r8', date: '2024-01-13 08:00', result: '14 Findings', findings: 14, status: 'Completed' },
    ],
  },
  {
    id: 'p5',
    name: 'Sentinel Healthcare Portal',
    owner: 'Demo Admin',
    totalScans: 34,
    activeScans: 0,
    findingsCount: 4,
    scope: {
      domains: ['portal.sentinel-health.io'],
      apis: ['FHIR R4'],
      mobileBuilds: [],
    },
    runHistory: [
      { id: 'r9', date: '2024-01-16 11:15', result: '4 Findings', findings: 4, status: 'Completed' },
    ],
  },
];

const demoActiveScans: ActiveScan[] = [
  ...mockActiveScans,
  { id: 's4', projectName: 'Aurora Financial Platform', progress: 62 },
];

const demoFindings: Finding[] = [...mockFindings];

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

export function useBackendData(isAuthenticated = false, authLoading = false): BackendDataState {
  const [state, setState] = useState<Omit<BackendDataState, 'refetch'>>(initialState);
  const [refetchTrigger, setRefetchTrigger] = useState(0);
  const isDemo = localStorage.getItem(DEMO_KEY) === 'true';

  const refetch = useCallback(() => {
    setRefetchTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    // Demo mode: skip backend, return sample data — but only if user is authenticated
    if (isDemo && isAuthenticated) {
      setState({
        projects: demoProjects,
        findings: demoFindings,
        activeScans: demoActiveScans,
        loading: false,
        error: null,
      });
      return;
    }

    // Don't fetch if auth is still loading (verifying token) or user is not authenticated
    if (authLoading || !isAuthenticated) {
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

        if (env.useMockData && env.appEnv === 'development') {
          // Only use mock data fallback in development — never in production/staging
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
  }, [refetchTrigger, isAuthenticated, authLoading]);

  return { ...state, refetch };
}
