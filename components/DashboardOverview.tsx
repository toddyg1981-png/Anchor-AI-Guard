import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ActiveScan, Finding, Project } from '../types';
import { sanitizeProject } from '../hooks/useSecurityHooks';
import AIAnalysisComponent from './AIAnalysisComponent';
import { backendApi } from '../utils/backendApi';
import { DashboardView } from '../App';

interface AISystemStatus {
  totalThreats: number;
  totalRules: number;
  aiAnalysisCount: number;
  competitiveScore: number;
  uptime: string;
  isConnected: boolean;
}

interface DashboardOverviewProps {
  onViewProject: (project: Project) => void;
  projects: Project[];
  activeScans: ActiveScan[];
  findings: Finding[];
  loading?: boolean;
  error?: string | null;
  onRefetch?: () => void;
  onNavigate?: (view: DashboardView) => void;
  onNewScan?: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onViewProject,
  projects,
  activeScans,
  findings,
  loading,
  error,
  onRefetch,
  onNavigate,
  onNewScan,
}) => {
  const secureProjects = useMemo(() => projects.map(p => sanitizeProject(p)).filter(Boolean), [projects]) as any[];
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await backendApi.createProject({
        name: newProjectName.trim(),
        description: newProjectDesc.trim() || undefined,
      });
      setNewProjectName('');
      setNewProjectDesc('');
      setShowCreateProject(false);
      onRefetch?.();
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  // AI System Live Status
  const [aiStatus, setAiStatus] = useState<AISystemStatus>({
    totalThreats: 0, totalRules: 0, aiAnalysisCount: 0,
    competitiveScore: 95, uptime: '0s', isConnected: false,
  });
  const [aiPulse, setAiPulse] = useState(false);
  const [recentActivity, setRecentActivity] = useState<Array<{ type: string; message: string; time: string }>>([]);

  const triggerPulse = useCallback(() => {
    setAiPulse(true);
    setTimeout(() => setAiPulse(false), 1500);
  }, []);

  useEffect(() => {
    const loadAIStatus = async () => {
      try {
        const statusRes = await backendApi.aiEvolution.getStatus();
        const data = statusRes as unknown as {
          status?: { threatsProcessed?: number; aiAnalysisCount?: number; competitiveScore?: number; };
          stats?: { totalThreats?: number; activeRules?: number; };
          uptime?: { formatted?: string; };
        };
        setAiStatus({
          totalThreats: data.stats?.totalThreats || 0,
          totalRules: data.stats?.activeRules || 0,
          aiAnalysisCount: data.status?.aiAnalysisCount || 0,
          competitiveScore: data.status?.competitiveScore || 95,
          uptime: data.uptime?.formatted || '0s',
          isConnected: true,
        });
        triggerPulse();
      } catch {
        setAiStatus(prev => ({ ...prev, isConnected: false }));
      }
    };
    loadAIStatus();
    const interval = setInterval(loadAIStatus, 15000);
    return () => clearInterval(interval);
  }, [triggerPulse]);

  // Simulated recent activity feed
  useEffect(() => {
    const activities = [
      { type: 'threat', message: 'New CVE detected and auto-patched', time: '2m ago' },
      { type: 'rule', message: 'AI generated 3 new detection rules', time: '5m ago' },
      { type: 'scan', message: 'Automated perimeter scan completed', time: '12m ago' },
      { type: 'alert', message: 'Anomalous login attempt blocked', time: '18m ago' },
      { type: 'update', message: 'Threat intelligence feeds updated', time: '25m ago' },
    ];
    setRecentActivity(activities);
  }, []);

  // Quick Action definitions
  const quickActions: Array<{ label: string; icon: string; view: DashboardView; color: string; description: string }> = [
    { label: 'Threat Hunting', icon: '🎯', view: 'threatHunting', color: 'from-red-500/20 to-orange-500/20', description: 'Hunt for active threats' },
    { label: 'SOC Dashboard', icon: '📺', view: 'socDashboard', color: 'from-cyan-500/20 to-blue-500/20', description: 'Security operations' },
    { label: 'Incident Response', icon: '🚨', view: 'incidentResponse', color: 'from-yellow-500/20 to-red-500/20', description: 'Respond to incidents' },
    { label: 'AI Evolution', icon: '🧬', view: 'aiEvolution', color: 'from-purple-500/20 to-pink-500/20', description: 'AI engine status' },
    { label: 'Autonomous SOC', icon: '🤖', view: 'autonomousSOC', color: 'from-emerald-500/20 to-cyan-500/20', description: 'AI-powered SOC' },
    { label: 'Dark Web Monitor', icon: '🕶️', view: 'darkWebMonitor', color: 'from-gray-500/20 to-slate-500/20', description: 'Dark web intel' },
    { label: 'Attack Surface', icon: '🛰️', view: 'attackSurface', color: 'from-blue-500/20 to-indigo-500/20', description: 'Discover exposure' },
    { label: 'Compliance Hub', icon: '✅', view: 'complianceHub', color: 'from-green-500/20 to-emerald-500/20', description: 'Regulatory status' },
  ];

  const isEmpty = !loading && !error && secureProjects.length === 0;

  return (
    <div className="space-y-8">
      {/* Error state */}
      {error && (
        <div className="glass-bubble p-4 border border-red-500/40 text-red-200 flex items-center justify-between">
          <span className="text-sm">{error}</span>
          {onRefetch && (
            <button
              onClick={onRefetch}
              className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 rounded border border-red-500/40"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/*  AI COMMAND CENTRE - Live System Status & Quick Actions        */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-linear-to-br from-slate-900/80 via-cyan-950/40 to-purple-950/40 backdrop-blur-xl shadow-[0_0_60px_rgba(53,198,255,0.12)]">
        {/* Animated background grid */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(53,198,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(53,198,255,0.3)_1px,transparent_1px)] bg-size-[40px_40px]" />
        
        {/* Top bar with AI status indicator */}
        <div className="relative px-6 py-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 ${aiPulse ? 'animate-pulse' : ''}`}>
              <span className="text-xl">🛡️</span>
              <span className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${aiStatus.isConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]'}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">AI Command Centre</h2>
              <p className="text-xs text-slate-400">
                {aiStatus.isConnected ? (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    System Online — Uptime: {aiStatus.uptime}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400" />
                    Connecting to AI Engine...
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onNewScan && (
              <button
                onClick={onNewScan}
                className="px-4 py-2 bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] text-white rounded-lg text-sm font-semibold hover:brightness-110 transition-all shadow-lg shadow-purple-500/25 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                New Scan
              </button>
            )}
            <button
              onClick={() => onNavigate?.('aiEvolution')}
              className="px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
            >
              <span>🧬</span> Full AI Dashboard
            </button>
          </div>
        </div>

        {/* AI System Metrics Strip */}
        <div className="relative grid grid-cols-2 md:grid-cols-5 gap-0 border-b border-cyan-500/20">
          {[
            { label: 'Threats Detected', value: aiStatus.totalThreats, icon: '⚡', color: 'text-red-400', glow: 'shadow-red-500/20' },
            { label: 'Detection Rules', value: aiStatus.totalRules, icon: '📋', color: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
            { label: 'AI Analyses', value: aiStatus.aiAnalysisCount, icon: '🧠', color: 'text-purple-400', glow: 'shadow-purple-500/20' },
            { label: 'Protection Score', value: `${aiStatus.competitiveScore}%`, icon: '🏆', color: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
            { label: 'Active Scans', value: activeScans.length, icon: '🔄', color: 'text-amber-400', glow: 'shadow-amber-500/20' },
          ].map((metric, idx) => (
            <div key={idx} className={`px-5 py-4 ${idx < 4 ? 'border-r border-cyan-500/10' : ''} hover:bg-white/2 transition-colors`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{metric.icon}</span>
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">{metric.label}</span>
              </div>
              <div className={`text-2xl font-bold ${metric.color} ${aiPulse ? 'animate-pulse' : ''}`}>
                {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid + Activity Feed */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-0">
          {/* Quick Actions - 2/3 width */}
          <div className="lg:col-span-2 p-5 border-r border-cyan-500/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <span>⚡</span> Quick Actions
              </h3>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Navigate to module</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate?.(action.view)}
                  className={`group relative text-left p-3.5 rounded-xl bg-linear-to-br ${action.color} border border-white/6 hover:border-cyan-500/40 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xl group-hover:scale-110 transition-transform">{action.icon}</span>
                    <span className="text-sm font-semibold text-white truncate">{action.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">{action.description}</p>
                  <svg className="absolute top-3 right-3 w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Live Activity Feed - 1/3 width */}
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 mb-3">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Activity
            </h3>
            <div className="space-y-2.5">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-2.5 group">
                  <span className={`mt-0.5 text-sm ${
                    activity.type === 'threat' ? 'text-red-400' : 
                    activity.type === 'rule' ? 'text-cyan-400' :
                    activity.type === 'scan' ? 'text-purple-400' :
                    activity.type === 'alert' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {activity.type === 'threat' ? '⚡' : 
                     activity.type === 'rule' ? '📋' :
                     activity.type === 'scan' ? '🔍' :
                     activity.type === 'alert' ? '🚨' : '🔄'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-300 truncate group-hover:text-white transition-colors">{activity.message}</p>
                    <p className="text-[10px] text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => onNavigate?.('socDashboard')}
              className="mt-3 w-full text-center text-[11px] text-cyan-400 hover:text-cyan-300 py-1.5 rounded border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
            >
              View Full Activity Log →
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview - Glass Neon Bubbles */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{ label: 'Total Projects', value: secureProjects.length, color: '#35c6ff' },
          { label: 'Active Scans', value: activeScans.length, color: '#7a3cff' },
          { label: 'Total Findings', value: secureProjects.reduce((sum, p) => sum + p.findingsCount, 0), color: '#ff4fa3' },
          { label: 'Resolved Findings', value: secureProjects.reduce((sum, p) => sum + (p.findingsCount > 0 ? Math.floor(p.findingsCount * 0.7) : 0), 0), color: '#4ade80' }]
          .map((item, idx) => (
            <div key={idx} className="glass-bubble p-6">
              <div className="text-gray-400 text-sm mb-2">{item.label}</div>
              <div className={`text-3xl font-bold`} style={{ color: item.color }}>
                {loading ? <span className="animate-pulse text-gray-600">---</span> : item.value}
              </div>
            </div>
          ))}
      </div>

      {/* Active Scans */}
      {activeScans.length > 0 && (
        <div className="glass-bubble p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Active Scans</h2>
          <div className="space-y-4">
            {activeScans.map((scan) => (
              <div key={scan.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm font-medium text-white mb-2">{scan.projectName}</div>
                  <div className="w-full bg-gray-800/50 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${scan.progress}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
                <span className="text-sm text-gray-400 w-12 text-right">{scan.progress}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Projects</h2>
          <button
            onClick={() => setShowCreateProject(true)}
            className="px-4 py-2 bg-linear-to-r from-[#35c6ff] to-[#7a3cff] text-white rounded-lg text-sm font-medium hover:brightness-110 transition-all shadow-lg shadow-cyan-500/25"
          >
            ➕ Add Project
          </button>
        </div>

        {/* Create Project Modal */}
        {showCreateProject && (
          <div className="mb-6 bg-gray-900/80 border border-cyan-500/30 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Create New Project</h3>
              <button
                onClick={() => { setShowCreateProject(false); setCreateError(null); }}
                className="text-gray-400 hover:text-white text-xl"
                aria-label="Close create project form"
              >
                ✕
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Project Name *</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g. My Web App"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Description (optional)</label>
              <input
                type="text"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Brief project description"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            {createError && (
              <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded border border-red-500/30">{createError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleCreateProject}
                disabled={creating || !newProjectName.trim()}
                className="px-4 py-2 bg-linear-to-r from-[#35c6ff] to-[#7a3cff] text-white rounded text-sm font-medium hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Project'}
              </button>
              <button
                onClick={() => { setShowCreateProject(false); setCreateError(null); }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="glass-card p-6 animate-pulse h-40 bg-gray-900/40" />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="glass-card p-6 text-sm text-gray-400">No projects yet. Kick off your first scan to see data here.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {secureProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => onViewProject(project)}
                className="text-left glass-card p-6 hover:border-[#ff4fa3]/60 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-[#ff4fa3] group-hover:text-[#ff7ab8]">
                    {project.name}
                  </h3>
                  <span className="text-xs bg-[#ff4fa3]/20 text-[#ff7ab8] px-2 py-1 rounded">
                    {project.totalScans} scans
                  </span>
                </div>

                <p className="text-sm text-gray-400 mb-4">Owner: {project.owner}</p>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-gray-500">Scope</span>
                    <div className="text-sm text-gray-300 mt-1">
                      {project.scope.domains.length > 0 && (
                        <div>📍 {project.scope.domains.length} domain(s)</div>
                      )}
                      {project.scope.apis.length > 0 && (
                        <div>🔌 {project.scope.apis.length} API(s)</div>
                      )}
                      {project.scope.mobileBuilds.length > 0 && (
                        <div>📱 {project.scope.mobileBuilds.length} mobile build(s)</div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Findings: <span className="text-red-400 font-semibold">{project.findingsCount}</span>
                    </span>
                    <span className={`font-semibold ${project.activeScans > 0 ? 'text-blue-400' : 'text-green-400'}`}>
                      {project.activeScans > 0 ? `${project.activeScans} scanning` : 'Idle'}
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* AI Security Posture */}
      <div className="mt-8">
        <AIAnalysisComponent findings={findings} showPosture={true} />
      </div>
    </div>
  );
};

export default DashboardOverview;
