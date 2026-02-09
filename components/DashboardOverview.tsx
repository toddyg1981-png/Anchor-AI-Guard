import React, { useMemo, useState } from 'react';
import { ActiveScan, Finding, Project } from '../types';
import { sanitizeProject } from '../hooks/useSecurityHooks';
import AIAnalysisComponent from './AIAnalysisComponent';
import { backendApi } from '../utils/backendApi';

interface DashboardOverviewProps {
  onViewProject: (project: Project) => void;
  projects: Project[];
  activeScans: ActiveScan[];
  findings: Finding[];
  loading?: boolean;
  error?: string | null;
  onRefetch?: () => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onViewProject,
  projects,
  activeScans,
  findings,
  loading,
  error,
  onRefetch,
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
