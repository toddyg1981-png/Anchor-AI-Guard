import React, { useMemo, useState } from 'react';
import { Project, ScanRun } from '../types';
import { useSecureProject } from '../hooks/useSecurityHooks';
import { sanitizeHtml } from '../utils/sanitization';
import { backendApi } from '../utils/backendApi';
import { logger } from '../utils/logger';

interface ProjectDetailScreenProps {
  project: Project;
  onBack: () => void;
  onRefetch?: () => void;
}

const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({ project, onBack, onRefetch }) => {
  const secureProject = useSecureProject(project);
  const [scanStatus, setScanStatus] = useState<'idle' | 'running' | 'error' | 'success'>('idle');
  const [scanError, setScanError] = useState<string | null>(null);

  const defaultTarget = useMemo(() => {
    const domain = secureProject?.scope.domains?.[0];
    return domain ?? secureProject?.name ?? 'target';
  }, [secureProject]);

  const allDomains = useMemo(() => secureProject?.scope.domains || [], [secureProject]);
  const allApis = useMemo(() => secureProject?.scope.apis || [], [secureProject]);
  const allBuilds = useMemo(() => secureProject?.scope.mobileBuilds || [], [secureProject]);

  const handleRunScan = async () => {
    if (!secureProject) return;
    setScanStatus('running');
    setScanError(null);
    try {
      await backendApi.runScan(secureProject.id, defaultTarget);
      setScanStatus('success');
      onRefetch?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to start scan';
      setScanError(message);
      setScanStatus('error');
      logger.error('Scan trigger failed', { error: message, projectId: secureProject.id });
    }
  };

  if (!secureProject) {
    return <div className="text-red-400">Error loading project</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-3xl font-bold text-cyan-400">{secureProject.name}</h1>
        <div className="ml-auto flex items-center gap-3">
          {scanStatus === 'error' && (
            <span className="text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded border border-red-500/30">
              {scanError}
            </span>
          )}
          {scanStatus === 'success' && (
            <span className="text-xs text-green-300 bg-green-500/10 px-2 py-1 rounded border border-green-500/30">
              Scan queued
            </span>
          )}
          <button
            onClick={handleRunScan}
            disabled={scanStatus === 'running'}
            className="px-4 py-2 bg-gradient-to-r from-[#35c6ff] to-[#7a3cff] text-white rounded shadow hover:opacity-90 disabled:opacity-50"
          >
            {scanStatus === 'running' ? 'Starting...' : 'Trigger Scan'}
          </button>
        </div>
      </div>

      {/* Project Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Owner</div>
          <div className="text-sm font-semibold text-white">{secureProject.owner}</div>
        </div>

        <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Total Scans</div>
          <div className="text-2xl font-bold text-cyan-400">{secureProject.totalScans}</div>
        </div>

        <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Active Scans</div>
          <div className={`text-2xl font-bold ${secureProject.activeScans > 0 ? 'text-blue-400' : 'text-green-400'}`}>
            {secureProject.activeScans}
          </div>
        </div>

        <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4">
          <div className="text-gray-400 text-xs mb-1">Findings</div>
          <div className="text-2xl font-bold text-red-400">{secureProject.findingsCount}</div>
        </div>
      </div>

      {/* Scope */}
      <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Scan Scope</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Domains */}
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">📍 Domains ({allDomains.length})</h3>
            <div className="space-y-2">
              {allDomains.length > 0 ? (
                allDomains.map((domain, i) => (
                  <div key={i} className="bg-gray-800/50 rounded px-3 py-2 text-xs text-gray-300 break-all">
                    {domain}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No domains configured</div>
              )}
            </div>
          </div>

          {/* APIs */}
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">🔌 APIs ({allApis.length})</h3>
            <div className="space-y-2">
              {allApis.length > 0 ? (
                allApis.map((api, i) => (
                  <div key={i} className="bg-gray-800/50 rounded px-3 py-2 text-xs text-gray-300">
                    {api}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No APIs configured</div>
              )}
            </div>
          </div>

          {/* Mobile Builds */}
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">📱 Mobile Builds ({allBuilds.length})</h3>
            <div className="space-y-2">
              {allBuilds.length > 0 ? (
                allBuilds.map((build, i) => (
                  <div key={i} className="bg-gray-800/50 rounded px-3 py-2 text-xs text-gray-300">
                    {build}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500">No mobile builds configured</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Run History */}
      <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Scan History</h2>
        <div className="space-y-3">
          {secureProject.runHistory && secureProject.runHistory.length > 0 ? (
            secureProject.runHistory.map((run: ScanRun) => (
              <div key={run.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded">
                <div>
                  <div className="text-sm font-medium text-white">
                    {run.date}
                  </div>
                  <div className="text-xs text-gray-400">
                    {sanitizeHtml(run.result)}
                  </div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded ${
                  run.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                  run.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {run.status}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400">No scan history available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailScreen;
