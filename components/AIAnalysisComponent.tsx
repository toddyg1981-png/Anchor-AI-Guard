import React from 'react';
import { Finding } from '../types';
import { useAIFindingAnalysis, useSecurityPosture, usePrioritizedFindings } from '../hooks/useAIAnalysis';

interface AIAnalysisComponentProps {
  finding?: Finding | null;
  findings?: Finding[];
  showPosture?: boolean;
}

/**
 * AI-Powered Security Analysis Component
 * Displays intelligent threat analysis, recommendations, and security posture
 */
export const AIAnalysisComponent: React.FC<AIAnalysisComponentProps> = ({
  finding = null,
  findings = [],
  showPosture = true,
}) => {
  const { analysis, loading: findingLoading } = useAIFindingAnalysis(finding);
  const posture = useSecurityPosture(findings);
  const { prioritized } = usePrioritizedFindings(findings);

  // Get threat color based on score
  const getThreatColor = (score: number): string => {
    if (score >= 80) return 'text-red-500';
    if (score >= 60) return 'text-orange-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  // Get posture rating color
  const getPostureColor = (rating: string): string => {
    if (rating === 'Excellent') return 'text-green-400';
    if (rating === 'Good') return 'text-blue-400';
    if (rating === 'Fair') return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Security Posture Overview */}
      {showPosture && findings.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-400">🛡️ Security Posture</h3>
            <div className={`text-3xl font-bold ${getPostureColor(posture.rating)}`}>
              {posture.securityScore}%
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-red-900/20 border border-red-700/50 rounded p-3">
              <div className="text-red-400 text-sm font-medium">Critical</div>
              <div className="text-2xl font-bold text-red-400">{posture.criticalCount}</div>
            </div>
            <div className="bg-orange-900/20 border border-orange-700/50 rounded p-3">
              <div className="text-orange-400 text-sm font-medium">High</div>
              <div className="text-2xl font-bold text-orange-400">{posture.highCount}</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded p-3">
              <div className="text-yellow-400 text-sm font-medium">Medium</div>
              <div className="text-2xl font-bold text-yellow-400">{posture.mediumCount}</div>
            </div>
            <div className="bg-blue-900/20 border border-blue-700/50 rounded p-3">
              <div className="text-blue-400 text-sm font-medium">Low</div>
              <div className="text-2xl font-bold text-blue-400">{posture.lowCount}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="text-sm font-medium text-gray-300">Rating: </div>
            <div className={`font-bold ${getPostureColor(posture.rating)}`}>{posture.rating}</div>
            {posture.isHealthy && (
              <div className="ml-auto px-3 py-1 bg-green-900/30 border border-green-700/50 rounded text-green-400 text-sm font-medium">
                ✓ Healthy
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="text-sm font-semibold text-cyan-400">AI Recommendations:</div>
            {posture.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-cyan-400 mt-1">→</span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Finding Analysis */}
      {finding && analysis && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-cyan-400">🔍 AI Threat Analysis</h3>
            <div className={`text-3xl font-bold ${getThreatColor(analysis.threatScore)}`}>
              {analysis.threatScore}
            </div>
          </div>

          <div className="mb-4 p-4 bg-gray-800 rounded border border-gray-700">
            <div className="text-sm font-medium text-gray-300 mb-2">Risk Assessment:</div>
            <div className="text-gray-200">{analysis.riskAssessment}</div>
          </div>

          <div className="mb-4">
            <div className="text-sm font-semibold text-cyan-400 mb-2">Automated Remediation Steps:</div>
            <ol className="space-y-2">
              {analysis.automatedRemediationSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="font-bold text-cyan-400 min-w-6">{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-800 rounded p-3 border border-gray-700">
              <div className="text-xs font-medium text-gray-400 mb-1">Estimated Fix Time</div>
              <div className="text-cyan-400 font-semibold">{analysis.estimatedFixTime}</div>
            </div>
            <div className="bg-gray-800 rounded p-3 border border-gray-700">
              <div className="text-xs font-medium text-gray-400 mb-1">Priority</div>
              <div className={`font-semibold ${
                analysis.priority === 'critical' ? 'text-red-400' :
                analysis.priority === 'high' ? 'text-orange-400' :
                analysis.priority === 'medium' ? 'text-yellow-400' :
                'text-blue-400'
              }`}>
                {analysis.priority.toUpperCase()}
              </div>
            </div>
          </div>

          {analysis.relatedCVEs.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-semibold text-cyan-400 mb-2">Related CVEs:</div>
              <div className="flex flex-wrap gap-2">
                {analysis.relatedCVEs.map((cve, idx) => (
                  <span key={idx} className="px-2 py-1 bg-red-900/30 border border-red-700/50 rounded text-xs text-red-400 font-mono">
                    {cve}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <div className="text-sm font-semibold text-cyan-400 mb-2">Prevention Strategies:</div>
            <ul className="space-y-1">
              {analysis.preventionStrategies.map((strategy, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-cyan-400">•</span>
                  <span>{strategy}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-sm font-semibold text-cyan-400 mb-2">🤖 Automation Suggestions:</div>
            <div className="space-y-1">
              {analysis.automationSuggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-gray-300 p-2 bg-gray-800 rounded border-l-2 border-cyan-400">
                  <span className="text-cyan-400 font-bold">⚙</span>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {findingLoading && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full"></div>
            <span className="text-gray-300">Analyzing threat with AI...</span>
          </div>
        </div>
      )}

      {/* Priority Summary */}
      {findings.length > 0 && prioritized.length > 0 && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">📊 Priority Queue</h3>
          <div className="space-y-2">
            {prioritized.slice(0, 5).map((f, idx) => (
              <div key={f.id} className="flex items-center justify-between p-3 bg-gray-800 rounded border border-gray-700">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-cyan-400">#{idx + 1}</span>
                  <div>
                    <div className="font-medium text-gray-200">{f.type}</div>
                    <div className="text-xs text-gray-400">{f.project}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  f.severity === 'Critical' ? 'bg-red-900/50 text-red-400' :
                  f.severity === 'High' ? 'bg-orange-900/50 text-orange-400' :
                  f.severity === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                  'bg-blue-900/50 text-blue-400'
                }`}>
                  {f.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAnalysisComponent;
