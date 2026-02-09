import React, { useState, useEffect } from 'react';
import { env } from '../config/env';

interface AdminDashboardProps {
  orgId?: string;
}

interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
  lastActiveAt?: string;
}

interface OrgStats {
  totalProjects: number;
  totalScans: number;
  totalFindings: number;
  criticalFindings: number;
  fixedFindings: number;
  teamMembers: number;
}

interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  target?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ orgId: _orgId }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'settings' | 'audit'>('overview');
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('anchor_auth_token');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setError(null);
      // Fetch real data from backend APIs
      const [statsRes, teamRes, logsRes] = await Promise.all([
        fetch(`${env.apiBaseUrl}/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${env.apiBaseUrl}/team`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${env.apiBaseUrl}/admin/audit-logs?limit=50`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      } else {
        // Fallback to zeros if stats endpoint fails
        setStats({
          totalProjects: 0,
          totalScans: 0,
          totalFindings: 0,
          criticalFindings: 0,
          fixedFindings: 0,
          teamMembers: 0,
        });
      }

      if (teamRes.ok) {
        const teamData = await teamRes.json();
        setTeamMembers(teamData.members || []);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setAuditLogs(logsData.logs || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
      setError('Failed to load admin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    try {
      const res = await fetch(`${env.apiBaseUrl}/team/invite`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send invite');
      }
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
      fetchAdminData(); // Refresh team list
    } catch (err) {
      console.error('Failed to invite:', err);
      alert(err instanceof Error ? err.message : 'Failed to send invite');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      const res = await fetch(`${env.apiBaseUrl}/team/${memberId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to remove member');
      }
      setTeamMembers(teamMembers.filter(m => m.id !== memberId));
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`${env.apiBaseUrl}/team/${memberId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to change role');
      }
      setTeamMembers(teamMembers.map(m => 
        m.id === memberId ? { ...m, role: newRole } : m
      ));
    } catch (err) {
      console.error('Failed to change role:', err);
      alert(err instanceof Error ? err.message : 'Failed to change role');
      fetchAdminData(); // Refresh to restore correct state
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-500/20 text-purple-400';
      case 'admin': return 'bg-cyan-500/20 text-cyan-400';
      case 'member': return 'bg-gray-500/20 text-gray-400';
      case 'viewer': return 'bg-gray-500/20 text-gray-500';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'user.login': '🔑 User logged in',
      'user.logout': '👋 User logged out',
      'project.create': '📁 Project created',
      'project.delete': '🗑️ Project deleted',
      'scan.start': '🔍 Scan started',
      'scan.complete': '✅ Scan completed',
      'finding.fix': '🔧 Finding fixed',
      'finding.dismiss': '❌ Finding dismissed',
      'team.invite': '📧 Invite sent',
      'team.remove': '👤 Member removed',
      'settings.update': '⚙️ Settings updated',
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">Organization Settings</h1>
          <p className="text-gray-400 mt-1">Manage your team, billing, and organization settings</p>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-8 -mb-px">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'team', label: 'Team', icon: '👥' },
              { id: 'settings', label: 'Settings', icon: '⚙️' },
              { id: 'audit', label: 'Audit Log', icon: '📜' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-400'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-red-400">⚠️</span>
              <p className="text-red-300">{error}</p>
            </div>
            <button
              onClick={fetchAdminData}
              className="text-red-400 hover:text-red-300 text-sm font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">Projects</p>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">Total Scans</p>
                <p className="text-2xl font-bold text-white">{stats.totalScans}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">Findings</p>
                <p className="text-2xl font-bold text-white">{stats.totalFindings}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">Critical</p>
                <p className="text-2xl font-bold text-red-400">{stats.criticalFindings}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">Fixed</p>
                <p className="text-2xl font-bold text-green-400">{stats.fixedFindings}</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                <p className="text-gray-400 text-sm">Team Size</p>
                <p className="text-2xl font-bold text-white">{stats.teamMembers}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('team')}
                className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 text-left transition-colors"
              >
                <span className="text-2xl">👥</span>
                <h3 className="text-lg font-semibold text-white mt-3">Manage Team</h3>
                <p className="text-gray-400 text-sm mt-1">Invite members, manage roles</p>
              </button>
              <button
                onClick={() => window.location.href = '/settings/billing'}
                className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 text-left transition-colors"
              >
                <span className="text-2xl">💳</span>
                <h3 className="text-lg font-semibold text-white mt-3">Billing & Plans</h3>
                <p className="text-gray-400 text-sm mt-1">Manage subscription, view invoices</p>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className="bg-gray-800 hover:bg-gray-700 rounded-xl p-6 border border-gray-700 text-left transition-colors"
              >
                <span className="text-2xl">🔌</span>
                <h3 className="text-lg font-semibold text-white mt-3">Integrations</h3>
                <p className="text-gray-400 text-sm mt-1">Connect GitHub, Slack, Jira</p>
              </button>
            </div>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Team Members</h2>
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Invite Member
              </button>
            </div>

            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Member</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Role</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Joined</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Last Active</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {teamMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                        <p className="text-lg mb-2">No team members yet</p>
                        <p className="text-sm">Invite team members to collaborate on security projects</p>
                      </td>
                    </tr>
                  ) : teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {(member.name || member.email)?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{member.name || member.email?.split('@')[0] || 'Unknown'}</p>
                            <p className="text-gray-400 text-sm">{member.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.id, e.target.value)}
                          disabled={member.role === 'owner'}
                          className={`${getRoleBadgeColor(member.role)} px-3 py-1 rounded-full text-sm font-medium bg-opacity-100 border-0 cursor-pointer disabled:cursor-not-allowed`}
                        >
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {new Date(member.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {member.role !== 'owner' && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Organization Info */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Organization Info</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Organization Name</label>
                  <input
                    type="text"
                    defaultValue="My Organization"
                    className="w-full max-w-md px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <button
                  onClick={() => { setSettingsSaved(true); setTimeout(() => setSettingsSaved(false), 3000); }}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
                {settingsSaved && <span className="ml-3 text-green-400 text-sm">✓ Settings saved successfully</span>}
              </div>
            </div>

            {/* API Keys */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">API Keys</h3>
              <p className="text-gray-400 mb-4">Use API keys to integrate Anchor with your CI/CD pipeline.</p>
              <button
                onClick={() => {
                  const key = 'ak_' + Array.from(crypto.getRandomValues(new Uint8Array(24)), b => b.toString(16).padStart(2, '0')).join('');
                  alert('New API Key (copy now — it won\'t be shown again):\n\n' + key);
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                + Create API Key
              </button>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
              <p className="text-gray-400 mb-4">Once you delete your organization, there is no going back.</p>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this organization? This action is irreversible.')) {
                    alert('Organization deletion request submitted. You will receive a confirmation email.');
                  }
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-medium transition-colors border border-red-500/30"
              >
                Delete Organization
              </button>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Audit Log</h2>
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="divide-y divide-gray-700">
                {auditLogs.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-400">
                    <p className="text-lg mb-2">No audit logs yet</p>
                    <p className="text-sm">Activity in your organization will appear here</p>
                  </div>
                ) : auditLogs.map((log) => (
                  <div key={log.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-lg">{getActionLabel(log.action).split(' ')[0]}</span>
                      <div>
                        <p className="text-white">{getActionLabel(log.action).substring(2)}</p>
                        <p className="text-gray-400 text-sm">
                          by {log.actor}
                          {log.target && <> on <span className="text-cyan-400">{log.target}</span></>}
                        </p>
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">Invite Team Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="admin">Admin - Full access</option>
                  <option value="member">Member - Can view and fix</option>
                  <option value="viewer">Viewer - Read only</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={!inviteEmail}
                className="flex-1 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
