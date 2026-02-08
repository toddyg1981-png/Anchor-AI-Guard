import React, { useState, useEffect } from 'react';
import { useSBOM } from '../hooks/useIntegrations';
import { backendApi } from '../utils/backendApi';

interface SBOMViewerProps {
  projectId: string;
  projectName: string;
  onBack: () => void;
}

interface Component {
  name: string;
  version: string;
  type: string;
  purl: string;
  direct: boolean;
}

interface Vulnerability {
  cveId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore: number;
  summary: string;
  affectedVersions: string;
  fixedVersion: string | null;
}

interface VulnerabilityReport {
  component: Component;
  vulnerabilities: Vulnerability[];
}

export const SBOMViewer: React.FC<SBOMViewerProps> = ({ projectId, projectName, onBack }) => {
  const { loading, getSBOM, scanSBOM, getVulnerabilities, exportSBOM } = useSBOM();
  const [sbom, setSbom] = useState<any>(null);
  const [vulnerabilities, setVulnerabilities] = useState<VulnerabilityReport[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'components' | 'vulnerabilities'>('components');
  const [searchTerm, setSearchTerm] = useState('');
  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('sbom');
        if (res)       } catch (e) { console.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res: any = await backendApi.modules.analyze('sbom', 'Analyze SBOM for vulnerable dependencies, license compliance risks, and supply chain integrity');
      if (res?.analysis) setAnalysisResult(res.analysis);
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  const loadSBOM = async () => {
    try {
      setError(null);
      const data = await getSBOM(projectId);
      setSbom(data.sbom);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load SBOM');
    }
  };

  const loadVulnerabilities = async () => {
    try {
      setError(null);
      const data = await getVulnerabilities(projectId);
      setVulnerabilities(data.vulnerabilities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vulnerabilities');
    }
  };

  const handleScan = async () => {
    try {
      setError(null);
      // In a real app, you'd let the user specify the target path
      await scanSBOM(projectId, process.cwd());
      await loadSBOM();
      await loadVulnerabilities();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed');
    }
  };

  const handleExport = async (format: 'json' | 'xml') => {
    try {
      await exportSBOM(projectId, format);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  React.useEffect(() => {
    loadSBOM();
    loadVulnerabilities();
  }, [projectId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const filteredComponents = sbom?.components?.filter((c: Component) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredVulnerabilities = vulnerabilities.filter((v) =>
    v.component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vulnerabilities.some((vuln) => vuln.cveId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <h1 className="text-2xl font-bold text-white">Software Bill of Materials</h1>
            <p className="text-slate-400">{projectName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleAIAnalysis} disabled={analyzing || backendLoading} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500 rounded-lg text-purple-400 font-medium disabled:opacity-50 transition-colors">
            {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
          </button>
          <button
            onClick={handleScan}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
            Refresh Scan
          </button>
          <div className="relative">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-all"
              onClick={() => handleExport('json')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
          {error}
        </div>
      )}

      {/* Stats */}
      {sbom && (
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-sm">Total Dependencies</p>
            <p className="text-2xl font-bold text-white">{sbom.totalDependencies}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-sm">Direct Dependencies</p>
            <p className="text-2xl font-bold text-cyan-400">{sbom.directDependencies}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-sm">Transitive Dependencies</p>
            <p className="text-2xl font-bold text-blue-400">{sbom.transitiveDependencies}</p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
            <p className="text-slate-400 text-sm">Vulnerable Packages</p>
            <p className="text-2xl font-bold text-red-400">{vulnerabilities.length}</p>
          </div>
        </div>
      )}

      {/* Tabs and Search */}
      <div className="flex items-center justify-between">
        <div className="flex bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('components')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'components'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Components ({sbom?.components?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('vulnerabilities')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'vulnerabilities'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Vulnerabilities ({vulnerabilities.reduce((acc, v) => acc + v.vulnerabilities.length, 0)})
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-64"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'components' && (
        <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="text-left p-4 text-slate-400 font-medium text-sm">Package</th>
                <th className="text-left p-4 text-slate-400 font-medium text-sm">Version</th>
                <th className="text-left p-4 text-slate-400 font-medium text-sm">Type</th>
                <th className="text-left p-4 text-slate-400 font-medium text-sm">Dependency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredComponents.map((component: Component, index: number) => (
                <tr key={index} className="hover:bg-slate-700/20 transition-all">
                  <td className="p-4">
                    <span className="text-white font-medium">{component.name}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-slate-300 font-mono text-sm">{component.version}</span>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-slate-700/50 text-slate-300 text-xs uppercase">
                      {component.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${
                      component.direct
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-slate-600/50 text-slate-400'
                    }`}>
                      {component.direct ? 'Direct' : 'Transitive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredComponents.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              No components found
            </div>
          )}
        </div>
      )}

      {activeTab === 'vulnerabilities' && (
        <div className="space-y-4">
          {filteredVulnerabilities.length === 0 ? (
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No vulnerabilities detected</h3>
              <p className="text-slate-400">All your dependencies appear to be secure.</p>
            </div>
          ) : (
            filteredVulnerabilities.map((report, index) => (
              <div key={index} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">{report.component.name}</h3>
                    <p className="text-slate-400 text-sm">Version {report.component.version}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/30">
                    {report.vulnerabilities.length} {report.vulnerabilities.length === 1 ? 'vulnerability' : 'vulnerabilities'}
                  </span>
                </div>
                <div className="divide-y divide-slate-700/50">
                  {report.vulnerabilities.map((vuln, vIndex) => (
                    <div key={vIndex} className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(vuln.severity)}`}>
                            {vuln.severity}
                          </span>
                          <span className="text-cyan-400 font-mono text-sm">{vuln.cveId}</span>
                          <span className="text-slate-500 text-sm">CVSS {vuln.cvssScore}</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm mb-2">{vuln.summary}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-500">
                          Affected: <span className="text-slate-300">{vuln.affectedVersions}</span>
                        </span>
                        {vuln.fixedVersion && (
                          <span className="text-slate-500">
                            Fixed in: <span className="text-green-400">{vuln.fixedVersion}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-purple-400">🤖 AI Analysis Result</h3>
            <button onClick={() => setAnalysisResult('')} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{analysisResult}</p>
        </div>
      )}
    </div>
  );
};

export default SBOMViewer;
