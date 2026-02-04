import { useState, useCallback } from 'react';
import { useAuthenticatedFetch } from './useAuth';
import { env } from '../config/env';

export type IntegrationType = 'jira' | 'slack' | 'github' | 'gitlab' | 'webhook';

interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface IntegrationConfig {
  // JIRA
  baseUrl?: string;
  email?: string;
  apiToken?: string;
  projectKey?: string;
  // Slack
  webhookUrl?: string;
  channel?: string;
  // GitHub/GitLab
  token?: string;
  owner?: string;
  repo?: string;
  // Webhook
  url?: string;
  secret?: string;
}

export function useIntegrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthenticatedFetch();

  const fetchIntegrations = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authFetch(`${env.apiBaseUrl}/integrations`);
      if (!response.ok) throw new Error('Failed to fetch integrations');

      const data = await response.json();
      setIntegrations(data.integrations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch integrations');
    } finally {
      setLoading(false);
    }
  }, [authFetch]);

  const createIntegration = useCallback(
    async (type: IntegrationType, name: string, config: IntegrationConfig) => {
      const response = await authFetch(`${env.apiBaseUrl}/integrations`, {
        method: 'POST',
        body: JSON.stringify({ type, name, config, enabled: true }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create integration');
      }

      await fetchIntegrations();
      return response.json();
    },
    [authFetch, fetchIntegrations]
  );

  const updateIntegration = useCallback(
    async (integrationId: string, updates: { name?: string; enabled?: boolean; config?: IntegrationConfig }) => {
      const response = await authFetch(`${env.apiBaseUrl}/integrations/${integrationId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update integration');
      }

      await fetchIntegrations();
    },
    [authFetch, fetchIntegrations]
  );

  const deleteIntegration = useCallback(
    async (integrationId: string) => {
      const response = await authFetch(`${env.apiBaseUrl}/integrations/${integrationId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete integration');
      }

      await fetchIntegrations();
    },
    [authFetch, fetchIntegrations]
  );

  const testIntegration = useCallback(
    async (integrationId: string) => {
      const response = await authFetch(`${env.apiBaseUrl}/integrations/${integrationId}/test`, {
        method: 'POST',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Integration test failed');
      }

      return data;
    },
    [authFetch]
  );

  return {
    integrations,
    loading,
    error,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
  };
}

// Hook for auto-fix functionality
export function useAutofix() {
  const [loading, setLoading] = useState(false);
  const authFetch = useAuthenticatedFetch();

  const createJiraTicket = useCallback(
    async (findingId: string, summary: string, description?: string, priority: string = 'medium') => {
      setLoading(true);
      try {
        const response = await authFetch(`${env.apiBaseUrl}/autofix/jira-ticket`, {
          method: 'POST',
          body: JSON.stringify({ findingId, summary, description, priority }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create JIRA ticket');
        }

        return response.json();
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  const generateFix = useCallback(
    async (findingId: string, targetBranch: string = 'main') => {
      setLoading(true);
      try {
        const response = await authFetch(`${env.apiBaseUrl}/autofix/generate-fix`, {
          method: 'POST',
          body: JSON.stringify({ findingId, targetBranch }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to generate fix');
        }

        return response.json();
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  return {
    loading,
    createJiraTicket,
    generateFix,
  };
}

// Hook for SBOM functionality
export function useSBOM() {
  const [loading, setLoading] = useState(false);
  const authFetch = useAuthenticatedFetch();

  const getSBOM = useCallback(
    async (projectId: string) => {
      const response = await authFetch(`${env.apiBaseUrl}/sbom/${projectId}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch SBOM');
      }
      return response.json();
    },
    [authFetch]
  );

  const scanSBOM = useCallback(
    async (projectId: string, targetPath: string) => {
      setLoading(true);
      try {
        const response = await authFetch(`${env.apiBaseUrl}/sbom/scan`, {
          method: 'POST',
          body: JSON.stringify({ projectId, targetPath }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'SBOM scan failed');
        }

        return response.json();
      } finally {
        setLoading(false);
      }
    },
    [authFetch]
  );

  const getVulnerabilities = useCallback(
    async (projectId: string) => {
      const response = await authFetch(`${env.apiBaseUrl}/sbom/${projectId}/vulnerabilities`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch vulnerabilities');
      }
      return response.json();
    },
    [authFetch]
  );

  const exportSBOM = useCallback(
    async (projectId: string, format: 'json' | 'xml' = 'json') => {
      const response = await authFetch(`${env.apiBaseUrl}/sbom/${projectId}/export?format=${format}`);
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export SBOM');
      }

      // Trigger download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sbom.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    },
    [authFetch]
  );

  return {
    loading,
    getSBOM,
    scanSBOM,
    getVulnerabilities,
    exportSBOM,
  };
}
