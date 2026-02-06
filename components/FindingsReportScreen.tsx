import React, { useMemo, useCallback } from 'react';
import { jsPDF } from 'jspdf';
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

  // ---------------------------------------------------------------
  // PDF helpers
  // ---------------------------------------------------------------
  const severityPdfColor = (severity: Severity): [number, number, number] => {
    switch (severity) {
      case Severity.Critical: return [239, 68, 68];
      case Severity.High: return [249, 115, 22];
      case Severity.Medium: return [234, 179, 8];
      case Severity.Low: return [59, 130, 246];
      case Severity.Informational: return [6, 182, 212];
      case Severity.Resolved: return [34, 197, 94];
    }
  };

  const addWrappedText = (doc: jsPDF, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const lines = doc.splitTextToSize(text, maxWidth);
    for (const line of lines) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(line, x, y);
      y += lineHeight;
    }
    return y;
  };

  const addPdfHeader = (doc: jsPDF) => {
    // Dark header bar
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 30, 'F');
    // Accent line
    doc.setFillColor(53, 198, 255);
    doc.rect(0, 30, 210, 1.5, 'F');
    // Title
    doc.setTextColor(53, 198, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('ANCHOR SECURITY', 15, 15);
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Security Findings Report', 15, 22);
    // Date
    doc.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 145, 22);
  };

  // ---------------------------------------------------------------
  // Export single finding as PDF
  // ---------------------------------------------------------------
  const exportFindingPdf = useCallback(() => {
    if (!secureSelectedFinding) return;
    const doc = new jsPDF();

    addPdfHeader(doc);

    let y = 42;

    // Severity badge
    const [r, g, b] = severityPdfColor(secureSelectedFinding.severity);
    doc.setFillColor(r, g, b);
    doc.roundedRect(15, y - 5, 30, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(secureSelectedFinding.severity.toUpperCase(), 17, y);
    y += 2;

    // Finding title
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    y += 8;
    y = addWrappedText(doc, secureSelectedFinding.type, 15, y, 180, 7);
    y += 2;

    // Project
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`Project: ${secureSelectedFinding.project}`, 15, y);
    y += 10;

    // Description
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y - 5, 180, 8, 'F');
    doc.setTextColor(53, 198, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Description', 18, y);
    y += 6;
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    y = addWrappedText(doc, secureSelectedFinding.description, 18, y, 174, 5);
    y += 6;

    // Remediation Guidance
    doc.setFillColor(240, 253, 244);
    doc.rect(15, y - 5, 180, 8, 'F');
    doc.setTextColor(22, 163, 74);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Remediation Guidance', 18, y);
    y += 6;
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    y = addWrappedText(doc, secureSelectedFinding.guidance, 18, y, 174, 5);
    y += 6;

    // Reproduction Steps
    doc.setFillColor(241, 245, 249);
    doc.rect(15, y - 5, 180, 8, 'F');
    doc.setTextColor(53, 198, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('How to Reproduce', 18, y);
    y += 6;
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont('courier', 'normal');
    y = addWrappedText(doc, secureSelectedFinding.reproduction, 18, y, 174, 4.5);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Confidential - Anchor Security Platform', 15, 285);
    doc.text(`Page 1`, 190, 285);

    doc.save(`finding-${secureSelectedFinding.id}.pdf`);
  }, [secureSelectedFinding]);

  // ---------------------------------------------------------------
  // Export full report PDF (all findings)
  // ---------------------------------------------------------------
  const exportFullReportPdf = useCallback(() => {
    if (sortedFindings.length === 0) return;
    const doc = new jsPDF();

    addPdfHeader(doc);

    let y = 42;

    // Summary counts
    const counts: Record<string, number> = {};
    for (const f of sortedFindings) {
      counts[f.severity] = (counts[f.severity] || 0) + 1;
    }

    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 15, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Total Findings: ${sortedFindings.length}`, 15, y);
    y += 6;

    const severities: Severity[] = [Severity.Critical, Severity.High, Severity.Medium, Severity.Low, Severity.Informational, Severity.Resolved];
    for (const sev of severities) {
      if (counts[sev]) {
        const [r, g, b] = severityPdfColor(sev);
        doc.setFillColor(r, g, b);
        doc.circle(18, y - 1.5, 2, 'F');
        doc.setTextColor(51, 65, 85);
        doc.text(`${sev}: ${counts[sev]}`, 23, y);
        y += 5;
      }
    }
    y += 6;

    // Divider
    doc.setDrawColor(203, 213, 225);
    doc.line(15, y, 195, y);
    y += 8;

    // Each finding
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Detailed Findings', 15, y);
    y += 8;

    sortedFindings.forEach((finding, idx) => {
      // Check page space
      if (y > 240) { doc.addPage(); y = 20; }

      // Finding number + severity badge
      const [r, g, b] = severityPdfColor(finding.severity);
      doc.setFillColor(r, g, b);
      doc.roundedRect(15, y - 4, 24, 7, 1.5, 1.5, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(finding.severity.toUpperCase(), 17, y);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const titleLines = doc.splitTextToSize(finding.type, 145);
      doc.text(titleLines[0], 42, y);
      y += 6;
      if (titleLines.length > 1) {
        doc.setFontSize(10);
        for (let i = 1; i < titleLines.length; i++) {
          doc.text(titleLines[i], 42, y);
          y += 5;
        }
      }

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text(`#${idx + 1}  |  Project: ${finding.project}`, 15, y);
      y += 5;

      // Description
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(9);
      y = addWrappedText(doc, finding.description, 15, y, 180, 4.5);
      y += 2;

      // Guidance
      doc.setTextColor(22, 163, 74);
      doc.setFont('helvetica', 'bold');
      doc.text('Fix:', 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      y = addWrappedText(doc, finding.guidance, 24, y, 171, 4.5);
      y += 4;

      // Separator between findings
      doc.setDrawColor(226, 232, 240);
      doc.line(15, y, 195, y);
      y += 6;
    });

    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text('Confidential - Anchor Security Platform', 15, 285);
      doc.text(`Page ${i} of ${pageCount}`, 175, 285);
    }

    doc.save(`anchor-security-report-${new Date().toISOString().slice(0, 10)}.pdf`);
  }, [sortedFindings]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Findings List */}
      <div className="lg:col-span-1 bg-gray-900/50 border border-cyan-500/20 rounded-lg p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">
            Findings ({sortedFindings.length})
          </h2>
          {sortedFindings.length > 0 && (
            <button
              onClick={exportFullReportPdf}
              className="px-3 py-1.5 bg-linear-to-r from-[#35c6ff] to-[#7a3cff] text-white text-xs rounded font-medium hover:opacity-90 transition-opacity"
            >
              PDF Report
            </button>
          )}
        </div>

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
                <span className={`px-2 py-1 rounded text-xs font-semibold shrink-0 ${getSeverityColor(finding.severity)}`}>
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
                Mark as Resolved
              </button>
              <button onClick={exportFindingPdf} className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 py-2 rounded transition-colors">
                Download PDF
              </button>
              <button onClick={exportFinding} className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded transition-colors">
                Export CSV
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center">
              <div className="text-4xl mb-3">Select a finding</div>
              <p>Choose a finding from the list to view details and export</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindingsReportScreen;
