import React from 'react';
import { ActiveScan, Finding, Project } from '../types';
import { useSecureProject } from '../hooks/useSecurityHooks';
import AIAnalysisComponent from './AIAnalysisComponent';

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
  const secureProjects = projects.map(p => useSecureProject(p)).filter(Boolean) as any[];

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
          { label: 'Avg Scan Time', value: '2.5h', color: '#4ade80' }]
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
                      className="bg-gradient-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] h-2 rounded-full transition-all duration-300"
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
        <h2 className="text-lg font-semibold text-white mb-4">Projects</h2>
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
