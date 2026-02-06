import React, { useCallback, useMemo, useRef, useState } from 'react';
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

type ScanMode = 'github' | 'upload' | 'snippet';

const ProjectDetailScreen: React.FC<ProjectDetailScreenProps> = ({ project, onBack, onRefetch }) => {
  const secureProject = useSecureProject(project);
  const [scanStatus, setScanStatus] = useState<'idle' | 'running' | 'error' | 'success'>('idle');
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanMode, setScanMode] = useState<ScanMode>('github');
  const [showScanPanel, setShowScanPanel] = useState(false);

  // GitHub scan fields
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');

  // Upload scan fields
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; content: string }>>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Snippet scan fields
  const [snippetCode, setSnippetCode] = useState('');
  const [snippetFilename, setSnippetFilename] = useState('snippet.ts');

  const allDomains = useMemo(() => secureProject?.scope.domains || [], [secureProject]);
  const allApis = useMemo(() => secureProject?.scope.apis || [], [secureProject]);
  const allBuilds = useMemo(() => secureProject?.scope.mobileBuilds || [], [secureProject]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const readers: Promise<{ name: string; content: string }>[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      readers.push(
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ name: file.name, content: reader.result as string });
          reader.readAsText(file);
        })
      );
    }

    Promise.all(readers).then((results) => {
      setUploadedFiles((prev) => [...prev, ...results]);
    });
  }, []);

  const handleRunScan = async () => {
    if (!secureProject) return;
    setScanStatus('running');
    setScanError(null);

    try {
      switch (scanMode) {
        case 'github':
          if (!repoUrl.trim()) throw new Error('Enter a repository URL');
          await backendApi.scanGithub(secureProject.id, repoUrl.trim(), branch.trim() || 'main');
          break;
        case 'upload':
          if (uploadedFiles.length === 0) throw new Error('Select at least one file');
          await backendApi.scanUpload(secureProject.id, uploadedFiles);
          break;
        case 'snippet':
          if (!snippetCode.trim()) throw new Error('Paste some code to scan');
          await backendApi.scanSnippet(secureProject.id, snippetCode, snippetFilename);
          break;
      }
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

  const modeLabels: Record<ScanMode, string> = {
    github: 'GitHub Repo',
    upload: 'Upload Files',
    snippet: 'Paste Code',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-white transition-colors"
        >
          &larr; Back
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
            onClick={() => setShowScanPanel(!showScanPanel)}
            className="px-4 py-2 bg-linear-to-r from-[#35c6ff] to-[#7a3cff] text-white rounded shadow hover:opacity-90"
          >
            {showScanPanel ? 'Close Scanner' : 'New Scan'}
          </button>
        </div>
      </div>

      {/* Scan Panel */}
      {showScanPanel && (
        <div className="bg-gray-900/80 border border-cyan-500/30 rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">Start a Security Scan</h2>

          {/* Mode Tabs */}
          <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1">
            {(Object.keys(modeLabels) as ScanMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setScanMode(mode)}
                className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                  scanMode === mode
                    ? 'bg-linear-to-r from-[#35c6ff] to-[#7a3cff] text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {modeLabels[mode]}
              </button>
            ))}
          </div>

          {/* GitHub Mode */}
          {scanMode === 'github' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Repository URL</label>
                <input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/owner/repo"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Branch</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500">
                Anchor clones the repo, scans for secrets, code risks, IaC misconfigs, Dockerfile issues, and risky dependencies, then deletes the clone.
              </p>
            </div>
          )}

          {/* Upload Mode */}
          {scanMode === 'upload' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Select Files</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".ts,.tsx,.js,.jsx,.json,.env,.yml,.yaml,.tf,.md,.py,.go,.rs,.java,.dockerfile"
                  onChange={handleFileSelect}
                  className="hidden"
                  title="Select files to scan"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-800 border border-gray-700 rounded text-sm text-gray-300 hover:border-cyan-500 transition-colors"
                >
                  Choose Files...
                </button>
              </div>
              {uploadedFiles.length > 0 && (
                <div className="space-y-1">
                  <div className="text-xs text-gray-400">{uploadedFiles.length} file(s) selected:</div>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1">
                        <span className="text-xs text-gray-300 truncate">{f.name}</span>
                        <button
                          onClick={() => setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-xs text-red-400 hover:text-red-300 ml-2"
                        >
                          x
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setUploadedFiles([])}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Clear all
                  </button>
                </div>
              )}
              <p className="text-xs text-gray-500">
                Upload source files directly. Supports .ts, .js, .json, .env, .yml, .tf, Dockerfile, and more.
              </p>
            </div>
          )}

          {/* Snippet Mode */}
          {scanMode === 'snippet' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Filename</label>
                <input
                  type="text"
                  value={snippetFilename}
                  onChange={(e) => setSnippetFilename(e.target.value)}
                  placeholder="snippet.ts"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Code</label>
                <textarea
                  value={snippetCode}
                  onChange={(e) => setSnippetCode(e.target.value)}
                  placeholder="Paste your code here..."
                  rows={8}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white text-sm font-mono placeholder-gray-500 focus:border-cyan-500 focus:outline-none resize-y"
                />
              </div>
              <p className="text-xs text-gray-500">
                Paste a code snippet to scan for secrets, eval() usage, innerHTML, and other security issues.
              </p>
            </div>
          )}

          {/* Scan Button */}
          <button
            onClick={handleRunScan}
            disabled={scanStatus === 'running'}
            className="w-full px-4 py-3 bg-linear-to-r from-[#35c6ff] to-[#7a3cff] text-white rounded font-semibold shadow hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {scanStatus === 'running' ? 'Scanning...' : `Scan via ${modeLabels[scanMode]}`}
          </button>
        </div>
      )}

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
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">Domains ({allDomains.length})</h3>
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
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">APIs ({allApis.length})</h3>
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
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">Mobile Builds ({allBuilds.length})</h3>
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
