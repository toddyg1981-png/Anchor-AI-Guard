import React, { useEffect, useState } from 'react';
import { useIntegrations, IntegrationType } from '../hooks/useIntegrations';

interface IntegrationsSettingsProps {
  onBack: () => void;
}

const INTEGRATION_CONFIGS: Record<IntegrationType, { name: string; icon: string; description: string; fields: { key: string; label: string; type: string; placeholder: string; required: boolean }[] }> = {
  jira: {
    name: 'JIRA',
    icon: '🎫',
    description: 'Create tickets for security findings automatically',
    fields: [
      { key: 'baseUrl', label: 'JIRA URL', type: 'url', placeholder: 'https://yourcompany.atlassian.net', required: true },
      { key: 'email', label: 'Email', type: 'email', placeholder: 'you@company.com', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', placeholder: 'Your JIRA API token', required: true },
      { key: 'projectKey', label: 'Project Key', type: 'text', placeholder: 'SEC', required: true },
    ],
  },
  slack: {
    name: 'Slack',
    icon: '💬',
    description: 'Send notifications to Slack channels',
    fields: [
      { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://hooks.slack.com/services/...', required: true },
      { key: 'channel', label: 'Channel', type: 'text', placeholder: '#security-alerts', required: false },
    ],
  },
  github: {
    name: 'GitHub',
    icon: '🐙',
    description: 'Create auto-fix pull requests',
    fields: [
      { key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'ghp_...', required: true },
      { key: 'owner', label: 'Organization/Owner', type: 'text', placeholder: 'your-org', required: false },
      { key: 'repo', label: 'Repository', type: 'text', placeholder: 'your-repo', required: false },
    ],
  },
  gitlab: {
    name: 'GitLab',
    icon: '🦊',
    description: 'Create auto-fix merge requests',
    fields: [
      { key: 'token', label: 'Personal Access Token', type: 'password', placeholder: 'glpat-...', required: true },
      { key: 'projectId', label: 'Project ID', type: 'text', placeholder: '12345', required: false },
    ],
  },
  webhook: {
    name: 'Custom Webhook',
    icon: '🔗',
    description: 'Send events to any HTTP endpoint',
    fields: [
      { key: 'url', label: 'Webhook URL', type: 'url', placeholder: 'https://your-server.com/webhook', required: true },
      { key: 'secret', label: 'Signing Secret', type: 'password', placeholder: 'Optional secret for HMAC signing', required: false },
    ],
  },
};

export const IntegrationsSettings: React.FC<IntegrationsSettingsProps> = ({ onBack }) => {
  const {
    integrations,
    loading,
    error,
    fetchIntegrations,
    createIntegration,
    updateIntegration,
    deleteIntegration,
    testIntegration,
  } = useIntegrations();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState<IntegrationType | null>(null);
  const [configValues, setConfigValues] = useState<Record<string, string>>({});
  const [integrationName, setIntegrationName] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const handleAddIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType) return;

    setAddLoading(true);
    setAddError(null);

    try {
      await createIntegration(selectedType, integrationName, configValues);
      setShowAddModal(false);
      setSelectedType(null);
      setConfigValues({});
      setIntegrationName('');
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Failed to add integration');
    } finally {
      setAddLoading(false);
    }
  };

  const handleTest = async (integrationId: string) => {
    try {
      const result = await testIntegration(integrationId);
      setTestResults((prev) => ({
        ...prev,
        [integrationId]: { success: true, message: result.result },
      }));
    } catch (err) {
      setTestResults((prev) => ({
        ...prev,
        [integrationId]: { success: false, message: err instanceof Error ? err.message : 'Test failed' },
      }));
    }
  };

  const handleToggle = async (integrationId: string, enabled: boolean) => {
    await updateIntegration(integrationId, { enabled: !enabled });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            aria-label="Go back"
            title="Go back"
            className="p-2 rounded-xl bg-linear-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border border-cyan-500/30 hover:border-pink-500/50 text-slate-400 hover:text-white transition-all hover:shadow-lg hover:shadow-pink-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Integrations</h1>
            <p className="text-slate-400">Connect your favorite tools</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Integration
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <svg className="animate-spin h-8 w-8 text-cyan-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : integrations.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-800/50 flex items-center justify-center">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No integrations configured</h3>
          <p className="text-slate-400 mb-4">Connect tools like JIRA, Slack, and GitHub to streamline your workflow.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
          >
            Add your first integration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((integration) => {
            const config = INTEGRATION_CONFIGS[integration.type as IntegrationType];
            const testResult = testResults[integration.id];

            return (
              <div
                key={integration.id}
                className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 hover:border-slate-600/50 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{config?.icon || '🔌'}</span>
                    <div>
                      <h3 className="text-white font-medium">{integration.name}</h3>
                      <p className="text-slate-400 text-sm">{config?.name || integration.type}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(integration.id, integration.enabled)}
                    className={`relative w-12 h-6 rounded-full transition-all ${
                      integration.enabled ? 'bg-cyan-500' : 'bg-slate-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                        integration.enabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`mb-3 p-2 rounded-lg text-sm ${
                      testResult.success
                        ? 'bg-green-500/10 text-green-300 border border-green-500/30'
                        : 'bg-red-500/10 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {testResult.message}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTest(integration.id)}
                    className="flex-1 py-2 px-3 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 text-sm transition-all"
                  >
                    Test Connection
                  </button>
                  <button
                    onClick={() => deleteIntegration(integration.id)}
                    className="py-2 px-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-800 rounded-2xl p-6 border border-slate-700/50 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">Add Integration</h2>

            {!selectedType ? (
              <div className="grid grid-cols-2 gap-3">
                {(Object.keys(INTEGRATION_CONFIGS) as IntegrationType[]).map((type) => {
                  const config = INTEGRATION_CONFIGS[type];
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(type);
                        setIntegrationName(config.name);
                      }}
                      className="p-4 rounded-xl bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 hover:border-cyan-500/30 transition-all text-left"
                    >
                      <span className="text-2xl block mb-2">{config.icon}</span>
                      <h3 className="text-white font-medium">{config.name}</h3>
                      <p className="text-slate-400 text-sm">{config.description}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <form onSubmit={handleAddIntegration} className="space-y-4">
                {addError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                    {addError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Integration Name</label>
                  <input
                    type="text"
                    value={integrationName}
                    onChange={(e) => setIntegrationName(e.target.value)}
                    required
                    placeholder="Enter integration name"
                    className="w-full px-4 py-3 rounded-xl bg-linear-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border border-cyan-500/30 hover:border-pink-500/50 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-pink-500/30 transition-all"
                  />
                </div>

                {INTEGRATION_CONFIGS[selectedType].fields.map((field) => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-400 ml-1">*</span>}
                    </label>
                    <input
                      type={field.type}
                      value={configValues[field.key] || ''}
                      onChange={(e) => setConfigValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                      required={field.required}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                ))}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setSelectedType(null);
                      setConfigValues({});
                    }}
                    className="flex-1 py-3 px-4 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 py-3 px-4 rounded-lg bg-linear-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all"
                  >
                    {addLoading ? 'Adding...' : 'Add Integration'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IntegrationsSettings;
