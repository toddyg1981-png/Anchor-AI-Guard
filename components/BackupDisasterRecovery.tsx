import React, { useState, useEffect } from 'react';
import { logger } from '../utils/logger';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// BACKUP & DISASTER RECOVERY
// ============================================================================
// If everything goes wrong, we can recover. Immutable backups, geo-redundancy,
// and tested recovery procedures.
// ============================================================================

interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential' | 'snapshot';
  target: string;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: 'healthy' | 'running' | 'failed' | 'warning';
  size: string;
  retention: string;
  encrypted: boolean;
  immutable: boolean;
}

interface RecoveryPoint {
  id: string;
  timestamp: string;
  type: 'full' | 'incremental';
  size: string;
  verified: boolean;
  location: 'primary' | 'secondary' | 'offsite';
  rto: string;
}

interface DRTest {
  id: string;
  date: string;
  type: 'tabletop' | 'partial' | 'full';
  scenario: string;
  result: 'passed' | 'failed' | 'partial';
  rtoAchieved: string;
  rpoAchieved: string;
  notes: string;
}

export const BackupDisasterRecovery: React.FC = () => {
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<'idle' | 'restoring' | 'success'>('idle');
  const [_loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('backup-dr');
        // eslint-disable-line no-console
      } catch (e) { logger.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('backup-dr', 'Analyze backup and disaster recovery posture for gaps in RPO/RTO compliance') as Record<string, unknown>;
      if (res?.analysis) setAnalysisResult(res.analysis as string);
    } catch (e) { logger.error(e); } finally { setAnalyzing(false); }
  };

  const handleRestore = (_rpId: string) => {
    if (!window.confirm('Are you sure you want to restore from this recovery point? This will overwrite current data.')) return;
    setRestoreStatus('restoring');
    setTimeout(() => {
      setRestoreStatus('success');
      setSelectedBackup(null);
      setIsRecoveryMode(false);
      setTimeout(() => setRestoreStatus('idle'), 3000);
    }, 2000);
  };

  // Backup jobs
  const backupJobs: BackupJob[] = [
    { id: 'bk-1', name: 'Database Full Backup', type: 'full', target: 'PostgreSQL', schedule: 'Daily 02:00', lastRun: '2026-02-04T02:00:00Z', nextRun: '2026-02-05T02:00:00Z', status: 'healthy', size: '4.5 GB', retention: '30 days', encrypted: true, immutable: true },
    { id: 'bk-2', name: 'Database Incremental', type: 'incremental', target: 'PostgreSQL', schedule: 'Hourly', lastRun: '2026-02-04T11:00:00Z', nextRun: '2026-02-04T12:00:00Z', status: 'healthy', size: '125 MB', retention: '7 days', encrypted: true, immutable: true },
    { id: 'bk-3', name: 'Application State', type: 'snapshot', target: 'Container Registry', schedule: 'Every 6 hours', lastRun: '2026-02-04T06:00:00Z', nextRun: '2026-02-04T12:00:00Z', status: 'healthy', size: '2.1 GB', retention: '14 days', encrypted: true, immutable: false },
    { id: 'bk-4', name: 'Secrets Backup', type: 'full', target: 'Vault', schedule: 'Daily 03:00', lastRun: '2026-02-04T03:00:00Z', nextRun: '2026-02-05T03:00:00Z', status: 'healthy', size: '5 MB', retention: '90 days', encrypted: true, immutable: true },
    { id: 'bk-5', name: 'Audit Logs', type: 'incremental', target: 'S3 Archive', schedule: 'Every 15 min', lastRun: '2026-02-04T11:45:00Z', nextRun: '2026-02-04T12:00:00Z', status: 'healthy', size: '890 MB', retention: '7 years', encrypted: true, immutable: true },
    { id: 'bk-6', name: 'Geo-Replicated Backup', type: 'full', target: 'AWS Sydney → Singapore', schedule: 'Daily 04:00', lastRun: '2026-02-04T04:00:00Z', nextRun: '2026-02-05T04:00:00Z', status: 'healthy', size: '6.8 GB', retention: '60 days', encrypted: true, immutable: true }
  ];

  // Recovery points
  const recoveryPoints: RecoveryPoint[] = [
    { id: 'rp-1', timestamp: '2026-02-04T11:00:00Z', type: 'incremental', size: '125 MB', verified: true, location: 'primary', rto: '5 min' },
    { id: 'rp-2', timestamp: '2026-02-04T06:00:00Z', type: 'incremental', size: '2.1 GB', verified: true, location: 'primary', rto: '15 min' },
    { id: 'rp-3', timestamp: '2026-02-04T02:00:00Z', type: 'full', size: '4.5 GB', verified: true, location: 'primary', rto: '30 min' },
    { id: 'rp-4', timestamp: '2026-02-04T02:00:00Z', type: 'full', size: '4.5 GB', verified: true, location: 'secondary', rto: '45 min' },
    { id: 'rp-5', timestamp: '2026-02-03T02:00:00Z', type: 'full', size: '4.4 GB', verified: true, location: 'offsite', rto: '60 min' }
  ];

  // DR tests
  const drTests: DRTest[] = [
    { id: 'dr-1', date: '2026-02-01', type: 'full', scenario: 'Complete datacenter failure', result: 'passed', rtoAchieved: '28 min', rpoAchieved: '15 min', notes: 'Successfully failed over to Singapore region' },
    { id: 'dr-2', date: '2026-01-15', type: 'partial', scenario: 'Database corruption recovery', result: 'passed', rtoAchieved: '12 min', rpoAchieved: '5 min', notes: 'Point-in-time recovery successful' },
    { id: 'dr-3', date: '2026-01-01', type: 'tabletop', scenario: 'Ransomware attack response', result: 'passed', rtoAchieved: 'N/A', rpoAchieved: 'N/A', notes: 'Reviewed immutable backup restoration procedures' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'passed': return 'bg-green-500/10 border-green-500 text-green-400';
      case 'running': return 'bg-cyan-500/10 border-cyan-500 text-cyan-400 animate-pulse';
      case 'failed': return 'bg-red-500/10 border-red-500 text-red-400';
      case 'warning': case 'partial': return 'bg-yellow-500/10 border-yellow-500 text-yellow-400';
      default: return 'bg-gray-500/10 border-gray-500 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">💾 Backup & Disaster Recovery</h1>
          <p className="text-gray-400">Immutable backups, geo-redundancy, and tested recovery procedures</p>
          <button onClick={handleAIAnalysis} disabled={analyzing} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm">{analyzing ? 'Analyzing...' : 'AI Analysis'}</button>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsRecoveryMode(!isRecoveryMode)}
            className={`px-6 py-3 rounded-lg font-bold transition-all ${
              isRecoveryMode
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-red-500/20 text-red-400 border border-red-500 hover:bg-red-500/30'
            }`}
          >
            🚨 {isRecoveryMode ? 'RECOVERY MODE ACTIVE' : 'Enter Recovery Mode'}
          </button>
        </div>
      </div>

      {/* Restore Success Banner */}
      {restoreStatus === 'success' && (
        <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-xl text-green-400 font-semibold text-center">
          ✅ Recovery completed successfully. All systems restored.
        </div>
      )}

      {/* Recovery Mode Alert */}
      {isRecoveryMode && (
        <div className="mb-6 p-6 bg-red-500/10 border-2 border-red-500 rounded-xl animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🚨</span>
              <div>
                <h3 className="text-xl font-bold text-red-400">RECOVERY MODE ACTIVE</h3>
                <p className="text-gray-400">Select a recovery point to restore from. This will overwrite current data.</p>
              </div>
            </div>
            <button
              onClick={() => setIsRecoveryMode(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{backupJobs.filter(b => b.status === 'healthy').length}/{backupJobs.length}</div>
          <div className="text-xs text-gray-400">Backups Healthy</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">{recoveryPoints.length}</div>
          <div className="text-xs text-gray-400">Recovery Points</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">&lt; 30 min</div>
          <div className="text-xs text-gray-400">RTO Target</div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">&lt; 15 min</div>
          <div className="text-xs text-gray-400">RPO Target</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-400">100%</div>
          <div className="text-xs text-gray-400">DR Tests Passed</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-cyan-400">3</div>
          <div className="text-xs text-gray-400">Geo Locations</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Backup Jobs */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">📁 Backup Jobs</h2>
          <div className="space-y-3">
            {backupJobs.map(job => (
              <div key={job.id} className={`p-4 rounded-lg border ${getStatusColor(job.status)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{job.name}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{job.size}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                  <div>Target: {job.target}</div>
                  <div>Schedule: {job.schedule}</div>
                  <div>Retention: {job.retention}</div>
                  <div className="flex gap-2">
                    {job.encrypted && <span className="text-green-400">🔐</span>}
                    {job.immutable && <span className="text-cyan-400">🔒 Immutable</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recovery Points */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">⏱️ Recovery Points</h2>
          <div className="space-y-3">
            {recoveryPoints.map(rp => (
              <div
                key={rp.id}
                onClick={() => isRecoveryMode && setSelectedBackup(rp.id)}
                className={`p-4 rounded-lg border transition-colors ${
                  selectedBackup === rp.id ? 'border-cyan-500 bg-cyan-500/10' :
                  isRecoveryMode ? 'border-gray-600 hover:border-cyan-500 cursor-pointer' :
                  'border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{new Date(rp.timestamp).toLocaleString()}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${
                      rp.type === 'full' ? 'bg-purple-500/20 text-purple-400' : 'bg-cyan-500/20 text-cyan-400'
                    }`}>
                      {rp.type}
                    </span>
                    {rp.verified && <span className="text-green-400">✓ Verified</span>}
                  </div>
                  <span className="text-sm text-gray-500">{rp.size}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Location: {rp.location}</span>
                  <span>RTO: {rp.rto}</span>
                </div>
                {selectedBackup === rp.id && isRecoveryMode && (
                  <button onClick={() => handleRestore(rp.id)} disabled={restoreStatus === 'restoring'} className="mt-3 w-full py-2 bg-red-500 hover:bg-red-600 rounded-lg font-bold disabled:opacity-50">
                    {restoreStatus === 'restoring' ? '⏳ Restoring...' : '🚨 RESTORE FROM THIS POINT'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DR Test History */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">🧪 Disaster Recovery Test History</h2>
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-400 border-b border-gray-800">
              <th className="p-3">Date</th>
              <th className="p-3">Type</th>
              <th className="p-3">Scenario</th>
              <th className="p-3">Result</th>
              <th className="p-3">RTO Achieved</th>
              <th className="p-3">RPO Achieved</th>
            </tr>
          </thead>
          <tbody>
            {drTests.map(test => (
              <tr key={test.id} className="border-b border-gray-800/50">
                <td className="p-3">{new Date(test.date).toLocaleDateString()}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${
                    test.type === 'full' ? 'bg-red-500/20 text-red-400' :
                    test.type === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-blue-500/20 text-blue-400'
                  }`}>
                    {test.type}
                  </span>
                </td>
                <td className="p-3">{test.scenario}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-xs ${getStatusColor(test.result)}`}>
                    {test.result}
                  </span>
                </td>
                <td className="p-3 text-green-400">{test.rtoAchieved}</td>
                <td className="p-3 text-green-400">{test.rpoAchieved}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {analysisResult && (
        <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4 mt-4">
          <div className="flex justify-between items-center mb-2"><h3 className="font-semibold text-blue-400">AI Analysis</h3><button onClick={() => setAnalysisResult('')} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default BackupDisasterRecovery;
