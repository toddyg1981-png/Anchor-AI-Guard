import { useState, useCallback } from 'react';
import { useAuthenticatedFetch } from './useAuth';
import { env } from '../config/env';

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
  expiresAt: string;
}

interface Organization {
  id: string;
  name: string;
  createdAt: string;
  memberCount: number;
  projectCount: number;
}

export function useTeam() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthenticatedFetch();

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${env.apiBaseUrl}/team`);
      if (!response.ok) throw new Error('Failed to fetch team');
      
      const data = await response.json();
      setMembers(data.members);
      setInvites(data.invites);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const fetchOrganization = useCallback(async () => {
    try {
      const response = await authFetch(`${env.apiBaseUrl}/organization`);
      if (!response.ok) throw new Error('Failed to fetch organization');
      
      const data = await response.json();
      setOrganization(data.organization);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch organization');
    }
  }, [authFetch]);

  const inviteMember = useCallback(
    async (email: string, name: string, role: 'admin' | 'member' | 'viewer') => {
      const response = await authFetch(`${env.apiBaseUrl}/auth/invite`, {
        method: 'POST',
        body: JSON.stringify({ email, name, role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send invite');
      }

      await fetchTeam();
      return response.json();
    },
    [authFetch, fetchTeam]
  );

  const updateMemberRole = useCallback(
    async (userId: string, role: 'admin' | 'member' | 'viewer') => {
      const response = await authFetch(`${env.apiBaseUrl}/team/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      await fetchTeam();
    },
    [authFetch, fetchTeam]
  );

  const removeMember = useCallback(
    async (userId: string) => {
      const response = await authFetch(`${env.apiBaseUrl}/team/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to remove member');
      }

      await fetchTeam();
    },
    [authFetch, fetchTeam]
  );

  const cancelInvite = useCallback(
    async (inviteId: string) => {
      const response = await authFetch(`${env.apiBaseUrl}/team/invite/${inviteId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to cancel invite');
      }

      await fetchTeam();
    },
    [authFetch, fetchTeam]
  );

  const updateOrganization = useCallback(
    async (name: string) => {
      const response = await authFetch(`${env.apiBaseUrl}/organization`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update organization');
      }

      await fetchOrganization();
    },
    [authFetch, fetchOrganization]
  );

  return {
    members,
    invites,
    organization,
    loading,
    error,
    fetchTeam,
    fetchOrganization,
    inviteMember,
    updateMemberRole,
    removeMember,
    cancelInvite,
    updateOrganization,
  };
}
