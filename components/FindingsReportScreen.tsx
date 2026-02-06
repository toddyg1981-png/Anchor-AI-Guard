import React, { useMemo, useCallback } from 'react';
import { Finding, Severity } from '../types';
import { useSecureFinding } from '../hooks/useSecurityHooks';
import { sanitizeHtml } from '../utils/sanitization';
import AIAnalysisComponent from './AIAnalysisComponent';

interface FindingsReportScreenProps {
  findings: Finding[];
  selectedFinding: Finding | null;
  onSelectFinding: (finding: Finding) => void;
}

const FindingsReportScreen: React.FC<FindingsReportScreenProps> = ({
  findings,
  selectedFinding,
  onSelectFinding,
}) => {
  const secureSelectedFinding = useSecureFinding(selectedFinding);

  const severityOrder: Record<Severity, number> = {
    [Severity.Critical]: 0,
    [Severity.High]: 1,
    [Severity.Medium]: 2,
    [Severity.Low]: 3,
    [Severity.Informational]: 4,
    [Severity.Resolved]: 5,
  };

  const sortedFindings = useMemo(() => {
    return [...findings].sort(
      (a, b) => severityOrder[a.severity as Severity] - severityOrder[b.severity as Severity]
    );
  }, [findings]);

  const getSeverityColor = (severity: Severity) => {
    switch (severity) {
      case Severity.Critical:
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case Severity.High:
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case Severity.Medium:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case Severity.Low:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      case Severity.Informational:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40';
      case Severity.Resolved:
        return 'bg-green-500/20 text-green-400 border-green-500/40';
    }
  };

  const getSeverityBgColor = (severity: Severity) => {
    switch (severity) {
      case Severity.Critical:
        return 'bg-red-500/10';
      case Severity.High:
        return 'bg-orange-500/10';
      case Severity.Medium:
        return 'bg-yellow-500/10';
      case Severity.Low:
        return 'bg-blue-500/10';
      case Severity.Informational:
        return 'bg-cyan-500/10';
      case Severity.Resolved:
        return 'bg-green-500/10';
    }
  };

  const exportFinding = useCallback(() => {
    if (!secureSelectedFinding) return;
    const csv = [
      'Severity,Type,Project,Description,Guidance,Reproduction',
      [
        secureSelectedFinding.severity,
        `"${secureSelectedFinding.type.replace(/"/g, '""')}"`,
        `"${secureSelectedFinding.project.replace(/"/g, '""')}"`,
        `"${secureSelectedFinding.description.replace(/"/g, '""')}"`,
        `"${secureSelectedFinding.guidance.replace(/"/g, '""')}"`,
        `"${secureSelectedFinding.reproduction.replace(/"/g, '""')}"`,
      ].join(','),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finding-${secureSelectedFinding.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [secureSelectedFinding]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Findings List */}
      <div className="lg:col-span-1 bg-gray-900/50 border border-cyan-500/20 rounded-lg p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold text-white mb-4">
          Findings ({sortedFindings.length})
        </h2>

        <div className="space-y-2">
          {sortedFindings.map((finding) => (
            <button
              key={finding.id}
              onClick={() => onSelectFinding(finding)}
              className={`w-full text-left p-3 rounded border-2 transition-all ${
                selectedFinding?.id === finding.id
                  ? `${getSeverityColor(finding.severity)} border-2`
                  : `border-transparent hover:${getSeverityBgColor(finding.severity)}`
              }`}
            >
              <div className="flex items-start gap-2">
                <span className={`px-2 py-1 rounded text-xs font-semibold flex-shrink-0 ${getSeverityColor(finding.severity)}`}>
                  {finding.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {sanitizeHtml(finding.type)}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {sanitizeHtml(finding.project)}
                  </div>
                </div>
              </div>
            </button>
          ))}

          {sortedFindings.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No findings available
            </div>
          )}
        </div>
      </div>

      {/* Finding Details */}
      <div className="lg:col-span-2 bg-gray-900/50 border border-cyan-500/20 rounded-lg p-6 overflow-y-auto">
        {secureSelectedFinding ? (
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded font-semibold text-sm ${getSeverityColor(secureSelectedFinding.severity)}`}>
                  {secureSelectedFinding.severity}
                </span>
                <h3 className="text-2xl font-bold text-white">
                  {secureSelectedFinding.type}
                </h3>
              </div>
              <p className="text-sm text-gray-400">
                Project: {secureSelectedFinding.project}
              </p>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">Description</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {secureSelectedFinding.description}
              </p>
            </div>

            {/* Guidance */}
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">Remediation Guidance</h4>
              <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {secureSelectedFinding.guidance}
                </p>
              </div>
            </div>

            {/* Reproduction */}
            <div>
              <h4 className="text-sm font-semibold text-cyan-400 mb-2">How to Reproduce</h4>
              <div className="bg-gray-800/50 rounded p-4">
                <p className="text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
                  {secureSelectedFinding.reproduction}
                </p>
              </div>
            </div>

            {/* AI Analysis */}
            <div>
              <AIAnalysisComponent finding={secureSelectedFinding} />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-700">
              <button className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded transition-colors">
                ✓ Mark as Resolved
              </button>
              <button onClick={exportFinding} className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded transition-colors">
                📋 Export
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3">👈</div>
              <p>Select a finding to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindingsReportScreen;
