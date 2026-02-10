import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Base fetch wrapper with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('anchor_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Send httpOnly cookies
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new ApiError(response.status, error.error || 'Request failed', error);
  }

  return response.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ─── Query Keys ───
export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
    findings: (id: string) => ['projects', id, 'findings'] as const,
    scans: (id: string) => ['projects', id, 'scans'] as const,
  },
  team: {
    members: ['team', 'members'] as const,
    invites: ['team', 'invites'] as const,
  },
  billing: {
    subscription: ['billing', 'subscription'] as const,
    usage: ['billing', 'usage'] as const,
    plans: ['billing', 'plans'] as const,
  },
  analytics: {
    overview: ['analytics', 'overview'] as const,
    trends: ['analytics', 'trends'] as const,
  },
  mfa: {
    status: ['mfa', 'status'] as const,
  },
};

// ─── Auth Hooks ───
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: () => apiFetch<{ user: any; organization: any }>('/auth/me'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ─── Project Hooks ───
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => apiFetch<{ projects: any[] }>('/projects'),
    staleTime: 2 * 60 * 1000,
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => apiFetch<{ project: any }>(`/projects/${id}`),
    enabled: !!id,
  });
}

export function useProjectFindings(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.findings(projectId),
    queryFn: () => apiFetch<{ findings: any[] }>(`/projects/${projectId}/findings`),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiFetch<{ project: any }>('/projects', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
  });
}

// ─── Scan Hooks ───
export function useStartScan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId: string) =>
      apiFetch<{ scan: any }>(`/projects/${projectId}/scan`, { method: 'POST' }),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.scans(projectId) });
    },
  });
}

// ─── Team Hooks ───
export function useTeamMembers() {
  return useQuery({
    queryKey: queryKeys.team.members,
    queryFn: () => apiFetch<{ members: any[] }>('/team/members'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; name: string; role: string }) =>
      apiFetch<{ invite: any }>('/auth/invite', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.team.members }),
  });
}

// ─── Billing Hooks ───
export function useSubscription() {
  return useQuery({
    queryKey: queryKeys.billing.subscription,
    queryFn: () => apiFetch<{ subscription: any }>('/billing/subscription'),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePlans() {
  return useQuery({
    queryKey: queryKeys.billing.plans,
    queryFn: () => apiFetch<{ plans: any[] }>('/billing/plans'),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// ─── MFA Hooks ───
export function useMFAStatus() {
  return useQuery({
    queryKey: queryKeys.mfa.status,
    queryFn: () => apiFetch<{ enabled: boolean; configured: boolean }>('/mfa/status'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useSetupMFA() {
  return useMutation({
    mutationFn: () => apiFetch<{ secret: string; otpauthUrl: string }>('/mfa/setup', { method: 'POST' }),
  });
}

export function useVerifyMFA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) =>
      apiFetch<{ success: boolean }>('/mfa/verify', { method: 'POST', body: JSON.stringify({ code }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.mfa.status }),
  });
}

// ─── Generic hooks for custom endpoints ───
export function useApiQuery<T>(
  key: readonly string[],
  endpoint: string,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => apiFetch<T>(endpoint),
    ...options,
  });
}

export function useApiMutation<TData, TVariables>(
  endpoint: string,
  method: string = 'POST',
  options?: Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: (variables) =>
      apiFetch<TData>(endpoint, {
        method,
        body: variables ? JSON.stringify(variables) : undefined,
      }),
    ...options,
  });
}

// Re-export for direct use
export { apiFetch };
