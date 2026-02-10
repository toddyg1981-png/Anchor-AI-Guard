/**
 * Predictive Vulnerability Alerts Panel - WORLD FIRST
 * Shows AI-predicted CVEs before they're publicly disclosed
 */

import React, { useState, useEffect, useMemo } from 'react';
import { backendApi } from '../utils/backendApi';
import { logger } from '../utils/logger';

// Types
export interface PredictedVulnerability {
  id: string;
  predictedCveId: string;
  title: string;
  description: string;
  affectedPackage: string;
  affectedVersions: string;
  predictedSeverity: 'critical' | 'high' | 'medium' | 'low';
  predictedCvss: number;
  confidence: number;
  aiReasoning: string;
  signals: PredictionSignal[];
  timeline: {
    predictedAt: number;
    estimatedDisclosure: number;
    estimatedPatch: number;
  };
  affectedFiles: string[];
  recommendedActions: string[];
  status: 'predicted' | 'confirmed' | 'dismissed' | 'patched';
}

export interface PredictionSignal {
  type: 'github_activity' | 'security_advisory' | 'code_pattern' | 'dependency_chain' | 'cve_similarity' | 'exploit_chatter';
  description: string;
  strength: number;
  source: string;
  timestamp: number;
}

interface PredictiveAlertsPanelProps {
  predictions?: PredictedVulnerability[];
  onViewDetails?: (prediction: PredictedVulnerability) => void;
  onDismiss?: (predictionId: string) => void;
  onTakeAction?: (predictionId: string, action: string) => void;
}

// Severity colors
const severityColors: Record<string, { bg: string; text: string; border: string }> = {
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/50' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/50' },
  medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/50' },
  low: { bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/50' },
};

// Signal type icons
const signalIcons: Record<string, string> = {
  github_activity: '🔀',
  security_advisory: '🛡️',
  code_pattern: '📝',
  dependency_chain: '🔗',
  cve_similarity: '🔍',
  exploit_chatter: '💬',
};

// Confidence gauge component
const ConfidenceGauge: React.FC<{ value: number; size?: 'sm' | 'md' | 'lg' }> = ({ value, size = 'md' }) => {
  const dimensions = {
    sm: { width: 40, height: 40, strokeWidth: 3, fontSize: '10px' },
    md: { width: 60, height: 60, strokeWidth: 4, fontSize: '12px' },
    lg: { width: 80, height: 80, strokeWidth: 5, fontSize: '14px' },
  };
  
  const { width, height, strokeWidth, fontSize } = dimensions[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * Math.PI; // Semi-circle
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 80) return '#22c55e';
    if (value >= 60) return '#eab308';
    if (value >= 40) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="relative" style={{ width, height: height / 2 + 10 }}>
      <svg width={width} height={height / 2 + 10} className="overflow-visible">
        {/* Background arc */}
        <path
          d={`M ${strokeWidth / 2} ${height / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${height / 2}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${strokeWidth / 2} ${height / 2} A ${radius} ${radius} 0 0 1 ${width - strokeWidth / 2} ${height / 2}`}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div 
        className="absolute bottom-0 left-1/2 -translate-x-1/2 font-bold text-white"
        style={{ fontSize }}
      >
        {value}%
      </div>
    </div>
  );
};

// Signal badge component
const SignalBadge: React.FC<{ signal: PredictionSignal }> = ({ signal }) => {
  return (
    <div className="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg" title={signal.description}>
      <span className="text-lg">{signalIcons[signal.type]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-300 truncate">{signal.description}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 rounded-full"
              style={{ width: `${signal.strength * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{Math.round(signal.strength * 100)}%</span>
        </div>
      </div>
    </div>
  );
};

// Timeline component
const PredictionTimeline: React.FC<{ timeline: PredictedVulnerability['timeline'] }> = ({ timeline }) => {
  const now = Date.now();
  const total = timeline.estimatedPatch - timeline.predictedAt;
  const elapsed = now - timeline.predictedAt;
  const progress = Math.min(100, (elapsed / total) * 100);

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString();
  const daysUntilDisclosure = Math.ceil((timeline.estimatedDisclosure - now) / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>Predicted</span>
        <span>Est. Disclosure</span>
        <span>Est. Patch</span>
      </div>
      <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="absolute left-0 top-0 h-full bg-linear-to-r from-cyan-500 to-purple-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
        {/* Disclosure marker */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-500 rounded-full border-2 border-gray-900"
          style={{ left: `${((timeline.estimatedDisclosure - timeline.predictedAt) / total) * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{formatDate(timeline.predictedAt)}</span>
        <span className={daysUntilDisclosure <= 7 ? 'text-red-400 font-medium' : 'text-yellow-400'}>
          {daysUntilDisclosure > 0 ? `${daysUntilDisclosure} days until disclosure` : 'Disclosure imminent!'}
        </span>
        <span className="text-gray-500">{formatDate(timeline.estimatedPatch)}</span>
      </div>
    </div>
  );
};

// Alert Card component
const AlertCard: React.FC<{
  prediction: PredictedVulnerability;
  onViewDetails: () => void;
  onDismiss: () => void;
  onTakeAction: (action: string) => void;
}> = ({ prediction, onViewDetails, onDismiss, onTakeAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllFiles, setShowAllFiles] = useState(false);
  const colors = severityColors[prediction.predictedSeverity];

  return (
    <div className={`border ${colors.border} rounded-xl overflow-hidden ${colors.bg}`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium uppercase ${colors.text}`}>
                {prediction.predictedSeverity}
              </span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs text-cyan-400 font-mono">
                {prediction.predictedCveId}
              </span>
              {prediction.status === 'confirmed' && (
                <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                  Confirmed
                </span>
              )}
            </div>
            <h4 className="font-medium text-white">{prediction.title}</h4>
            <p className="text-sm text-gray-400 mt-1">{prediction.description}</p>
          </div>
          <ConfidenceGauge value={prediction.confidence} size="md" />
        </div>

        {/* Package info */}
        <div className="flex flex-wrap gap-3 mt-3">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-500">📦</span>
            <span className="text-white font-mono">{prediction.affectedPackage}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-500">🏷️</span>
            <span className="text-gray-400">{prediction.affectedVersions}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <span className="text-gray-500">📊</span>
            <span className={colors.text}>CVSS {prediction.predictedCvss.toFixed(1)}</span>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-4">
          <PredictionTimeline timeline={prediction.timeline} />
        </div>
      </div>

      {/* Expandable section */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-400 hover:text-white border-t border-gray-700/50 transition-colors"
      >
        <span>View AI Analysis & Signals</span>
        <svg 
          className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-700/50">
          {/* AI Reasoning */}
          <div className="pt-4">
            <h5 className="text-xs font-medium text-gray-400 uppercase mb-2">AI Analysis</h5>
            <p className="text-sm text-gray-300 bg-gray-800/50 rounded-lg p-3">
              {prediction.aiReasoning}
            </p>
          </div>

          {/* Detection Signals */}
          <div>
            <h5 className="text-xs font-medium text-gray-400 uppercase mb-2">Detection Signals</h5>
            <div className="grid gap-2">
              {prediction.signals.map((signal, idx) => (
                <SignalBadge key={idx} signal={signal} />
              ))}
            </div>
          </div>

          {/* Affected Files */}
          {prediction.affectedFiles.length > 0 && (
            <div>
              <h5 className="text-xs font-medium text-gray-400 uppercase mb-2">Affected Files ({prediction.affectedFiles.length})</h5>
              <div className="space-y-1">
                {prediction.affectedFiles.slice(0, 3).map((file, idx) => (
                  <div key={idx} className="text-sm text-cyan-400 font-mono truncate">
                    📄 {file}
                  </div>
                ))}
                {prediction.affectedFiles.length > 3 && !showAllFiles && (
                  <button onClick={() => setShowAllFiles(true)} className="text-xs text-gray-500 hover:text-gray-400">
                    +{prediction.affectedFiles.length - 3} more files
                  </button>
                )}
                {showAllFiles && prediction.affectedFiles.slice(3).map((file, idx) => (
                  <div key={idx + 3} className="text-sm text-cyan-400 font-mono truncate">
                    📄 {file}
                  </div>
                ))}
                {showAllFiles && (
                  <button onClick={() => setShowAllFiles(false)} className="text-xs text-gray-500 hover:text-gray-400">
                    Show less
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recommended Actions */}
          <div>
            <h5 className="text-xs font-medium text-gray-400 uppercase mb-2">Recommended Actions</h5>
            <div className="flex flex-wrap gap-2">
              {prediction.recommendedActions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => onTakeAction(action)}
                  className="text-sm px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Actions footer */}
      <div className="px-4 py-3 bg-gray-800/30 border-t border-gray-700/50 flex items-center justify-between">
        <button
          onClick={onDismiss}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Dismiss
        </button>
        <button
          onClick={onViewDetails}
          className="text-sm bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
        >
          View Full Analysis
        </button>
      </div>
    </div>
  );
};

// Main Component
export const PredictiveAlertsPanel: React.FC<PredictiveAlertsPanelProps> = ({
  predictions,
  onViewDetails,
  onDismiss,
  onTakeAction,
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [sortBy, setSortBy] = useState<'confidence' | 'severity' | 'timeline'>('confidence');
  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [showAlertConfig, setShowAlertConfig] = useState(false);

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('predictive-alerts');
        } catch (e) { logger.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res: any = await backendApi.modules.analyze('predictive-alerts', 'Analyze alert patterns for prediction accuracy, false positive optimization, and emerging threat correlation');
      if (res?.analysis) setAnalysisResult(res.analysis);
    } catch (e) { logger.error(e); } finally { setAnalyzing(false); }
  };

  // Mock data for demo
  const demoData: PredictedVulnerability[] = predictions || [
    {
      id: '1',
      predictedCveId: 'CVE-2024-XXXX',
      title: 'Remote Code Execution in express-validator',
      description: 'Potential RCE vulnerability through prototype pollution in input validation logic',
      affectedPackage: 'express-validator',
      affectedVersions: '< 7.1.0',
      predictedSeverity: 'critical',
      predictedCvss: 9.8,
      confidence: 87,
      aiReasoning: 'Analysis of recent commits to express-validator shows modifications to deep object handling code without proper prototype chain checks. Combined with increased security researcher activity on the repository and similar CVE patterns in related packages, there is high probability of an RCE vulnerability disclosure.',
      signals: [
        { type: 'github_activity', description: 'Unusual commit activity in validation logic', strength: 0.92, source: 'GitHub API', timestamp: Date.now() - 86400000 },
        { type: 'cve_similarity', description: 'Pattern matches CVE-2023-45857 (lodash)', strength: 0.85, source: 'CVE Database', timestamp: Date.now() - 172800000 },
        { type: 'exploit_chatter', description: 'Discussions on security forums about express validators', strength: 0.78, source: 'OSINT', timestamp: Date.now() - 259200000 },
      ],
      timeline: {
        predictedAt: Date.now() - 604800000,
        estimatedDisclosure: Date.now() + 432000000,
        estimatedPatch: Date.now() + 864000000,
      },
      affectedFiles: ['src/middleware/validator.ts', 'src/routes/api.ts', 'src/controllers/user.ts'],
      recommendedActions: ['Update to latest version', 'Add input sanitization', 'Enable WAF rules'],
      status: 'predicted',
    },
    {
      id: '2',
      predictedCveId: 'CVE-2024-YYYY',
      title: 'SQL Injection in prisma client',
      description: 'Raw query methods may be vulnerable to SQL injection through template literal interpolation',
      affectedPackage: '@prisma/client',
      affectedVersions: '4.x - 5.10.x',
      predictedSeverity: 'high',
      predictedCvss: 8.6,
      confidence: 72,
      aiReasoning: 'Security advisory drafts detected in Prisma GitHub organization suggest upcoming SQL injection CVE. Code pattern analysis shows raw query methods lack proper parameterization in certain edge cases.',
      signals: [
        { type: 'security_advisory', description: 'Draft security advisory detected', strength: 0.88, source: 'GitHub Security', timestamp: Date.now() - 172800000 },
        { type: 'code_pattern', description: 'Unsafe SQL construction pattern detected', strength: 0.75, source: 'Code Analysis', timestamp: Date.now() - 345600000 },
      ],
      timeline: {
        predictedAt: Date.now() - 432000000,
        estimatedDisclosure: Date.now() + 604800000,
        estimatedPatch: Date.now() + 691200000,
      },
      affectedFiles: ['src/db/queries.ts', 'src/models/user.ts'],
      recommendedActions: ['Audit raw queries', 'Use parameterized queries', 'Enable query logging'],
      status: 'predicted',
    },
    {
      id: '3',
      predictedCveId: 'CVE-2024-ZZZZ',
      title: 'Denial of Service in axios',
      description: 'Regex-based URL parsing vulnerable to ReDoS attack',
      affectedPackage: 'axios',
      affectedVersions: '< 1.6.5',
      predictedSeverity: 'medium',
      predictedCvss: 6.5,
      confidence: 65,
      aiReasoning: 'ReDoS vulnerability pattern detected in URL parsing regular expressions. Similar patterns have led to CVEs in other HTTP clients. Increased fuzzing activity from security researchers observed.',
      signals: [
        { type: 'code_pattern', description: 'Catastrophic backtracking regex detected', strength: 0.82, source: 'Static Analysis', timestamp: Date.now() - 518400000 },
        { type: 'dependency_chain', description: 'Critical path dependency in application', strength: 0.7, source: 'Dependency Graph', timestamp: Date.now() - 604800000 },
      ],
      timeline: {
        predictedAt: Date.now() - 864000000,
        estimatedDisclosure: Date.now() + 1209600000,
        estimatedPatch: Date.now() + 1382400000,
      },
      affectedFiles: ['src/services/api.ts', 'src/utils/http.ts'],
      recommendedActions: ['Update axios', 'Implement request timeout', 'Add rate limiting'],
      status: 'predicted',
    },
  ];

  // Filter and sort predictions
  const filteredPredictions = useMemo(() => {
    let result = [...demoData];
    
    // Apply filter
    if (filter !== 'all') {
      result = result.filter(p => p.predictedSeverity === filter);
    }
    
    // Apply sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'severity': {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return severityOrder[b.predictedSeverity] - severityOrder[a.predictedSeverity];
        }
        case 'timeline':
          return a.timeline.estimatedDisclosure - b.timeline.estimatedDisclosure;
        default:
          return 0;
      }
    });
    
    return result;
  }, [demoData, filter, sortBy]);

  // Stats
  const stats = useMemo(() => ({
    total: demoData.length,
    critical: demoData.filter(p => p.predictedSeverity === 'critical').length,
    high: demoData.filter(p => p.predictedSeverity === 'high').length,
    avgConfidence: Math.round(demoData.reduce((acc, p) => acc + p.confidence, 0) / demoData.length),
    imminentDisclosures: demoData.filter(p => p.timeline.estimatedDisclosure - Date.now() < 604800000).length,
  }), [demoData]);

  return (
    <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">🔮</span>
              Predictive Vulnerability Alerts
            </h3>
            <p className="text-sm text-gray-400">AI-predicted CVEs before public disclosure</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleAIAnalysis} disabled={analyzing || backendLoading} className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500 rounded-lg text-purple-400 text-sm font-medium disabled:opacity-50 transition-colors">
              {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
            </button>
            <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-xs text-gray-400">Predictions</div>
          </div>
          <div className="bg-red-500/10 rounded-lg p-3 text-center border border-red-500/20">
            <div className="text-2xl font-bold text-red-400">{stats.critical}</div>
            <div className="text-xs text-red-400/70">Critical</div>
          </div>
          <div className="bg-cyan-500/10 rounded-lg p-3 text-center border border-cyan-500/20">
            <div className="text-2xl font-bold text-cyan-400">{stats.avgConfidence}%</div>
            <div className="text-xs text-cyan-400/70">Avg Confidence</div>
          </div>
          <div className="bg-yellow-500/10 rounded-lg p-3 text-center border border-yellow-500/20">
            <div className="text-2xl font-bold text-yellow-400">{stats.imminentDisclosures}</div>
            <div className="text-xs text-yellow-400/70">Within 7 Days</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Filter:</span>
          {['all', 'critical', 'high', 'medium', 'low'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filter === f
                  ? 'bg-cyan-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            aria-label="Sort alerts by"
            title="Sort by"
            className="bg-linear-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm text-white text-sm rounded-xl px-3 py-1 border border-cyan-500/30 hover:border-pink-500/50 focus:ring-2 focus:ring-pink-500/30 transition-all"
          >
            <option value="confidence">Confidence</option>
            <option value="severity">Severity</option>
            <option value="timeline">Disclosure Date</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto">
        {filteredPredictions.length > 0 ? (
          filteredPredictions.map(prediction => (
            <AlertCard
              key={prediction.id}
              prediction={prediction}
              onViewDetails={() => onViewDetails?.(prediction)}
              onDismiss={() => onDismiss?.(prediction.id)}
              onTakeAction={(action) => onTakeAction?.(prediction.id, action)}
            />
          ))
        ) : (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🎉</span>
            <p className="text-gray-400">No predictions matching your filter</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-700 bg-gray-800/30 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Predictions are based on AI analysis of security signals. Confidence scores indicate likelihood of accuracy.
        </p>
        <button onClick={() => setShowAlertConfig(!showAlertConfig)} className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">
          {showAlertConfig ? 'Hide Configuration ↑' : 'Configure Alerts →'}
        </button>
      </div>

      {/* Alert Configuration Panel */}
      {showAlertConfig && (
        <div className="mx-6 mt-4 p-4 bg-gray-800/50 border border-cyan-500/30 rounded-xl space-y-4">
          <h3 className="text-lg font-semibold text-cyan-400">⚙️ Alert Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Notification Thresholds</h4>
              <div className="space-y-3">
                {[
                  { level: 'Critical', desc: 'Immediate notification', color: 'text-red-400' },
                  { level: 'High', desc: 'Email + dashboard', color: 'text-orange-400' },
                  { level: 'Medium', desc: 'Dashboard only', color: 'text-yellow-400' },
                  { level: 'Low', desc: 'Weekly digest', color: 'text-green-400' },
                ].map(item => (
                  <div key={item.level} className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg">
                    <span className={`text-sm font-medium ${item.color}`}>{item.level}</span>
                    <span className="text-xs text-gray-400">{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-300 mb-3">Notification Channels</h4>
              <div className="space-y-2">
                {['Email', 'Slack', 'PagerDuty', 'Webhook'].map(channel => (
                  <label key={channel} className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg cursor-pointer">
                    <span className="text-sm text-gray-300">{channel}</span>
                    <div className="w-10 h-5 bg-cyan-500/30 rounded-full relative">
                      <div className="absolute left-[calc(100%-1.15rem)] top-0.5 w-4 h-4 bg-cyan-400 rounded-full" />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="m-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
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

export default PredictiveAlertsPanel;
