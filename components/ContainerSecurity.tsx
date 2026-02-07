import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

const ContainerSecurity: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [imageInput, setImageInput] = useState('nginx:latest');
  const [activeTab, setActiveTab] = useState<'runtime' | 'images' | 'k8s' | 'policies'>('runtime');

  const [findings, setFindings] = useState([
    { id: 'k-1', name: 'Outdated base image (nginx:1.19)', severity: 'High', status: 'Open', namespace: 'production', cluster: 'us-east-1' },
    { id: 'k-2', name: 'Privileged pod detected', severity: 'Critical', status: 'Isolated', namespace: 'staging', cluster: 'us-west-2' },
    { id: 'k-3', name: 'Public image pull', severity: 'Medium', status: 'In Review', namespace: 'dev', cluster: 'eu-west-1' },
    { id: 'k-4', name: 'Container running as root', severity: 'High', status: 'Open', namespace: 'production', cluster: 'us-east-1' },
    { id: 'k-5', name: 'Missing resource limits', severity: 'Medium', status: 'In Review', namespace: 'staging', cluster: 'us-west-2' },
  ]);

  const [stats, setStats] = useState([
    { label: 'Clusters', value: 12 },
    { label: 'Namespaces', value: 148 },
    { label: 'Images scanned (24h)', value: 862 },
    { label: 'Runtime blocks', value: 11 },
  ]);

  const k8sPolicies = [
    { name: 'No privileged containers', status: 'Enforced', violations: 0 },
    { name: 'Image pull from trusted registries only', status: 'Enforced', violations: 2 },
    { name: 'Resource limits required', status: 'Warning', violations: 14 },
    { name: 'No host network access', status: 'Enforced', violations: 0 },
    { name: 'Read-only root filesystem', status: 'Audit', violations: 31 },
    { name: 'Non-root user required', status: 'Warning', violations: 8 },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const result = await backendApi.modules.getDashboard('container-security');
      if ((result as any)?.stats) setStats(prev => (result as any).stats.length > 0 ? (result as any).stats : prev);
      if ((result as any)?.items) setFindings(prev => (result as any).items.length > 0 ? (result as any).items : prev);
    } catch (err) {
      console.error('Failed to load container security dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanImage = async () => {
    if (!imageInput.trim()) return;
    setScanning(true);
    try {
      const result = await backendApi.containerSecurity.scan(imageInput);
      if (result) setScanResult(result);
    } catch (err) {
      console.error('Image scan failed:', err);
    } finally {
      setScanning(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">Container Security</h1>
          <p className="text-slate-400">Image scanning, runtime protection, and Kubernetes posture.</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-300">Admission control: On</div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(card => (
          <div key={card.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <div className="text-slate-400 text-sm">{card.label}</div>
            <div className="text-2xl font-semibold mt-1">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-slate-700 pb-2">
        {(['runtime', 'images', 'k8s', 'policies'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-slate-800 text-blue-400 border border-slate-700 border-b-0' : 'text-slate-400 hover:text-white'}`}>
            {tab === 'runtime' ? 'Runtime Findings' : tab === 'images' ? 'Image Scanner' : tab === 'k8s' ? 'K8s Posture' : 'Policies'}
          </button>
        ))}
      </div>

      {activeTab === 'runtime' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Runtime Findings</h2>
            <span className="text-xs text-slate-400">{findings.length} findings</span>
          </div>
          <div className="space-y-3">
            {findings.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm flex items-center justify-between">
                <div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-slate-500">{item.namespace} / {item.cluster}</div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${item.severity === 'Critical' ? 'bg-red-500/20 text-red-300' : item.severity === 'High' ? 'bg-orange-500/20 text-orange-300' : 'bg-yellow-500/20 text-yellow-200'}`}>{item.severity}</span>
                  <div className="text-green-300 text-xs mt-1">{item.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'images' && (
        <div className="space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-3">Scan Container Image</h2>
            <div className="flex gap-3">
              <input type="text" value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="e.g., nginx:latest, node:18-alpine"
                className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-blue-500 focus:outline-none" />
              <button onClick={handleScanImage} disabled={scanning}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
                {scanning ? 'Scanning...' : 'Scan Image'}
              </button>
            </div>
          </div>
          {scanResult && (
            <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-blue-400 mb-2">Scan Results: {scanResult.image || imageInput}</h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-red-400">{scanResult.critical || 0}</div>
                  <div className="text-xs text-slate-400">Critical</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-orange-400">{scanResult.high || 0}</div>
                  <div className="text-xs text-slate-400">High</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-400">{scanResult.medium || 0}</div>
                  <div className="text-xs text-slate-400">Medium</div>
                </div>
              </div>
              {scanResult.vulnerabilities && (
                <div className="space-y-2">
                  {scanResult.vulnerabilities.slice(0, 5).map((v: any, i: number) => (
                    <div key={i} className="bg-slate-900 rounded-lg p-2 text-sm flex justify-between">
                      <span>{v.id || v.name}</span>
                      <span className="text-red-300">{v.severity}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'k8s' && (
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Cluster Health</h3>
            <div className="space-y-2">
              {['us-east-1', 'us-west-2', 'eu-west-1', 'ap-southeast-1'].map(cluster => (
                <div key={cluster} className="bg-slate-900 rounded-lg p-3 flex justify-between items-center">
                  <span className="font-medium">{cluster}</span>
                  <span className="text-green-400 text-sm">Healthy</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Workload Summary</h3>
            <div className="space-y-2">
              {[{ type: 'Deployments', count: 186, healthy: 182 }, { type: 'StatefulSets', count: 24, healthy: 24 }, { type: 'DaemonSets', count: 12, healthy: 11 }, { type: 'CronJobs', count: 38, healthy: 36 }].map(w => (
                <div key={w.type} className="bg-slate-900 rounded-lg p-3 flex justify-between items-center">
                  <span>{w.type}</span>
                  <span className="text-sm"><span className="text-green-400">{w.healthy}</span>/{w.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <h3 className="font-semibold mb-3">Admission Policies</h3>
          <div className="space-y-2">
            {k8sPolicies.map(p => (
              <div key={p.name} className="bg-slate-900 border border-slate-700 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.violations} violations</div>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${p.status === 'Enforced' ? 'bg-green-500/20 text-green-300' : p.status === 'Warning' ? 'bg-yellow-500/20 text-yellow-300' : 'bg-blue-500/20 text-blue-300'}`}>{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ContainerSecurity;
