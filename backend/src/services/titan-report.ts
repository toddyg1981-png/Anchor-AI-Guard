/**
 * TITAN Engine Performance Report Generator
 * 
 * Generates a comprehensive PDF-quality HTML report of TITAN's
 * performance metrics, threat intelligence ingestion, detection
 * rule generation, and engine health.
 * 
 * Reports are generated on-demand via the dashboard
 * "Generate TITAN Report" button.
 */

import {
  getEvolutionData,
  getEvolutionStatus,
  getEvolutionThreats,
  getEvolutionRules,
} from '../routes/ai-evolution';

// ============================================
// REPORT DATA COLLECTION
// ============================================

interface ReportMetrics {
  generatedAt: Date;
  periodStart: Date;
  periodEnd: Date;
  engine: {
    isRunning: boolean;
    uptime: string;
    lastCycleStatus: string;
    consecutiveFailures: number;
  };
  threats: {
    total: number;
    newInPeriod: number;
    bySeverity: Record<string, number>;
    bySource: Record<string, number>;
    byType: Record<string, number>;
    topCritical: Array<{ title: string; severity: string; source: string; cveIds: string[] }>;
  };
  rules: {
    total: number;
    newInPeriod: number;
    byType: Record<string, number>;
    avgEffectiveness: number;
    avgFalsePositiveRate: number;
    topRules: Array<{ name: string; type: string; severity: string; effectiveness: number }>;
  };
  intelligence: {
    aiAnalysisCount: number;
    competitiveScore: number;
    feedsActive: number;
    feedsTotal: number;
    updatesApplied: number;
  };
  recentLog: Array<{ timestamp: string; action: string; details: string }>;
}

function collectReportMetrics(): ReportMetrics {
  const status = getEvolutionStatus();
  const threats = getEvolutionThreats();
  const rules = getEvolutionRules();
  const evolutionData = getEvolutionData();

  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setHours(periodStart.getHours() - 24);

  // Calculate uptime
  const uptimeMs = now.getTime() - status.engineStartTime.getTime();
  const uptimeHours = Math.floor(uptimeMs / (1000 * 60 * 60));
  const uptimeMins = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
  const uptimeStr = `${uptimeHours}h ${uptimeMins}m`;

  // Threats by severity
  const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const bySource: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let newInPeriod = 0;

  for (const t of threats) {
    bySeverity[t.severity] = (bySeverity[t.severity] || 0) + 1;
    bySource[t.source] = (bySource[t.source] || 0) + 1;
    byType[t.type] = (byType[t.type] || 0) + 1;
    if (new Date(t.timestamp) >= periodStart) newInPeriod++;
  }

  // Top 10 critical threats
  const topCritical = threats
    .filter(t => t.severity === 'critical' || t.severity === 'high')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
    .map(t => ({
      title: t.title.substring(0, 100),
      severity: t.severity,
      source: t.source,
      cveIds: t.cveIds || [],
    }));

  // Rules breakdown
  const rulesByType: Record<string, number> = {};
  let totalEffectiveness = 0;
  let totalFPR = 0;
  let newRulesInPeriod = 0;

  for (const r of rules) {
    rulesByType[r.type] = (rulesByType[r.type] || 0) + 1;
    totalEffectiveness += r.effectiveness;
    totalFPR += r.falsePositiveRate;
    if (new Date(r.createdAt) >= periodStart) newRulesInPeriod++;
  }

  const topRules = rules
    .sort((a, b) => b.effectiveness - a.effectiveness)
    .slice(0, 10)
    .map(r => ({
      name: r.name.substring(0, 80),
      type: r.type,
      severity: r.severity,
      effectiveness: r.effectiveness,
    }));

  // Recent evolution log entries
  const recentLog = (evolutionData.log || [])
    .slice(-20)
    .map(entry => ({
      timestamp: new Date(entry.timestamp).toLocaleString('en-AU', { timeZone: 'Australia/Sydney' }),
      action: entry.action,
      details: entry.details.substring(0, 150),
    }));

  return {
    generatedAt: now,
    periodStart,
    periodEnd: now,
    engine: {
      isRunning: status.isRunning,
      uptime: uptimeStr,
      lastCycleStatus: status.lastCycleStatus,
      consecutiveFailures: status.consecutiveFailures,
    },
    threats: {
      total: threats.length,
      newInPeriod,
      bySeverity,
      bySource,
      byType,
      topCritical,
    },
    rules: {
      total: rules.length,
      newInPeriod: newRulesInPeriod,
      byType: rulesByType,
      avgEffectiveness: rules.length > 0 ? Math.round(totalEffectiveness / rules.length) : 0,
      avgFalsePositiveRate: rules.length > 0 ? Math.round((totalFPR / rules.length) * 100) / 100 : 0,
      topRules,
    },
    intelligence: {
      aiAnalysisCount: status.aiAnalysisCount,
      competitiveScore: status.competitiveScore,
      feedsActive: evolutionData.feedCount,
      feedsTotal: 6,
      updatesApplied: status.updatesApplied,
    },
    recentLog,
  };
}

// ============================================
// HTML REPORT GENERATION
// ============================================

function generateReportHTML(metrics: ReportMetrics): string {
  const dateStr = metrics.generatedAt.toLocaleDateString('en-AU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    timeZone: 'Australia/Sydney',
  });
  const timeStr = metrics.generatedAt.toLocaleTimeString('en-AU', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Australia/Sydney',
  });

  const severityColor = (s: string) => {
    switch (s) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      case 'low': return '#22d3ee';
      default: return '#a78bfa';
    }
  };

  const statusBadge = metrics.engine.isRunning
    ? '<span style="color:#22c55e;font-weight:bold;">● ONLINE</span>'
    : '<span style="color:#ef4444;font-weight:bold;">● OFFLINE</span>';

  const cycleStatusBadge = (s: string) => {
    switch (s) {
      case 'success': return '<span style="background:#22c55e20;color:#22c55e;padding:2px 8px;border-radius:4px;">Success</span>';
      case 'partial': return '<span style="background:#eab30820;color:#eab308;padding:2px 8px;border-radius:4px;">Partial</span>';
      case 'error': return '<span style="background:#ef444420;color:#ef4444;padding:2px 8px;border-radius:4px;">Error</span>';
      default: return '<span style="background:#a78bfa20;color:#a78bfa;padding:2px 8px;border-radius:4px;">Idle</span>';
    }
  };

  // Source breakdown rows
  const sourceRows = Object.entries(metrics.threats.bySource)
    .sort(([, a], [, b]) => b - a)
    .map(([source, count]) => `<tr><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${source}</td><td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:600;">${count}</td></tr>`)
    .join('');

  // Top threats rows
  const threatRows = metrics.threats.topCritical.map(t => `
    <tr>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;max-width:300px;">${t.title}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">
        <span style="background:${severityColor(t.severity)}20;color:${severityColor(t.severity)};padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold;text-transform:uppercase;">${t.severity}</span>
      </td>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${t.source}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-size:12px;">${t.cveIds.join(', ') || '—'}</td>
    </tr>`).join('');

  // Top rules rows
  const ruleRows = metrics.rules.topRules.map(r => `
    <tr>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;">${r.name}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${r.type}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">
        <span style="background:${severityColor(r.severity)}20;color:${severityColor(r.severity)};padding:2px 8px;border-radius:4px;font-size:11px;text-transform:uppercase;">${r.severity}</span>
      </td>
      <td style="padding:6px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">
        <span style="font-weight:bold;color:${r.effectiveness >= 80 ? '#22c55e' : r.effectiveness >= 60 ? '#eab308' : '#ef4444'}">${r.effectiveness}%</span>
      </td>
    </tr>`).join('');

  // Activity log rows
  const logRows = metrics.recentLog.map(l => `
    <tr>
      <td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b;white-space:nowrap;">${l.timestamp}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-size:12px;font-weight:600;">${l.action}</td>
      <td style="padding:4px 8px;border-bottom:1px solid #f1f5f9;font-size:12px;color:#475569;">${l.details}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TITAN Engine Daily Report — ${dateStr}</title>
  <style>
    body { margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; background:#f8fafc; color:#1e293b; }
    .container { max-width:800px; margin:0 auto; background:#fff; }
    .header { background:linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0c4a6e 100%); color:#fff; padding:32px 40px; }
    .header h1 { margin:0 0 4px 0; font-size:24px; }
    .header .subtitle { color:#67e8f9; font-size:14px; margin:0; }
    .header .date { color:#94a3b8; font-size:13px; margin-top:8px; }
    .section { padding:24px 40px; border-bottom:1px solid #e2e8f0; }
    .section h2 { font-size:18px; color:#0891b2; margin:0 0 16px 0; padding-bottom:8px; border-bottom:2px solid #0891b220; }
    .metrics-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
    .metric-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px 16px; text-align:center; }
    .metric-card .value { font-size:28px; font-weight:700; color:#0f172a; }
    .metric-card .label { font-size:11px; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; margin-top:4px; }
    .metric-card.critical { border-color:#ef4444; background:#fef2f2; }
    .metric-card.critical .value { color:#ef4444; }
    .metric-card.success { border-color:#22c55e; background:#f0fdf4; }
    .metric-card.success .value { color:#22c55e; }
    .metric-card.highlight { border-color:#0891b2; background:#ecfeff; }
    .metric-card.highlight .value { color:#0891b2; }
    table { width:100%; border-collapse:collapse; margin-top:8px; font-size:13px; }
    thead th { background:#f1f5f9; padding:8px 12px; text-align:left; font-size:11px; text-transform:uppercase; color:#64748b; letter-spacing:0.5px; }
    .status-bar { display:flex; gap:24px; align-items:center; flex-wrap:wrap; }
    .status-item { display:flex; align-items:center; gap:8px; font-size:14px; }
    .severity-bar { display:flex; height:24px; border-radius:4px; overflow:hidden; margin-top:8px; }
    .severity-bar .segment { display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#fff; min-width:1px; }
    .footer { padding:24px 40px; background:#f8fafc; color:#94a3b8; font-size:12px; text-align:center; }
    .footer a { color:#0891b2; text-decoration:none; }
    @media print { body { background:#fff; } .container { box-shadow:none; } }
    @media (max-width:600px) { .metrics-grid { grid-template-columns:repeat(2,1fr); } .section { padding:16px 20px; } .header { padding:24px 20px; } }
  </style>
</head>
<body>
  <div class="container">
    <!-- HEADER -->
    <div class="header">
      <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td>
          <h1>⚡ TITAN Engine — Daily Report</h1>
          <p class="subtitle">Anchor Security AI Evolution Engine Performance Summary</p>
          <p class="date">${dateStr} at ${timeStr} AEST</p>
        </td>
        <td style="text-align:right;vertical-align:top;">
          <div style="font-size:14px;">${statusBadge}</div>
          <div style="color:#94a3b8;font-size:12px;margin-top:4px;">Uptime: ${metrics.engine.uptime}</div>
        </td>
      </tr></table>
    </div>

    <!-- ENGINE STATUS -->
    <div class="section">
      <h2>🔧 Engine Status</h2>
      <div class="status-bar">
        <div class="status-item">${statusBadge} <span>Engine</span></div>
        <div class="status-item">${cycleStatusBadge(metrics.engine.lastCycleStatus)} <span>Last Cycle</span></div>
        <div class="status-item"><strong>${metrics.intelligence.feedsActive}/${metrics.intelligence.feedsTotal}</strong> <span>Active Feeds</span></div>
        <div class="status-item"><strong>${metrics.engine.consecutiveFailures}</strong> <span>Consecutive Failures</span></div>
      </div>
    </div>

    <!-- OVERVIEW METRICS -->
    <div class="section">
      <h2>📊 24-Hour Overview</h2>
      <div class="metrics-grid">
        <div class="metric-card highlight">
          <div class="value">${metrics.threats.total.toLocaleString()}</div>
          <div class="label">Total Threats</div>
        </div>
        <div class="metric-card ${metrics.threats.newInPeriod > 0 ? 'critical' : ''}">
          <div class="value">+${metrics.threats.newInPeriod.toLocaleString()}</div>
          <div class="label">New Threats (24h)</div>
        </div>
        <div class="metric-card success">
          <div class="value">${metrics.rules.total.toLocaleString()}</div>
          <div class="label">Detection Rules</div>
        </div>
        <div class="metric-card ${metrics.rules.newInPeriod > 0 ? 'success' : ''}">
          <div class="value">+${metrics.rules.newInPeriod}</div>
          <div class="label">New Rules (24h)</div>
        </div>
      </div>
      <div class="metrics-grid" style="margin-top:12px;">
        <div class="metric-card">
          <div class="value">${metrics.intelligence.aiAnalysisCount}</div>
          <div class="label">AI Analyses</div>
        </div>
        <div class="metric-card">
          <div class="value">${metrics.rules.avgEffectiveness}%</div>
          <div class="label">Avg Effectiveness</div>
        </div>
        <div class="metric-card">
          <div class="value">${metrics.rules.avgFalsePositiveRate}%</div>
          <div class="label">Avg FP Rate</div>
        </div>
        <div class="metric-card highlight">
          <div class="value">${metrics.intelligence.competitiveScore}/100</div>
          <div class="label">Competitive Score</div>
        </div>
      </div>
    </div>

    <!-- SEVERITY BREAKDOWN -->
    <div class="section">
      <h2>🎯 Threat Severity Breakdown</h2>
      ${(() => {
        const total = metrics.threats.total || 1;
        const segments = [
          { label: 'CRITICAL', count: metrics.threats.bySeverity.critical || 0, color: '#ef4444' },
          { label: 'HIGH', count: metrics.threats.bySeverity.high || 0, color: '#f97316' },
          { label: 'MEDIUM', count: metrics.threats.bySeverity.medium || 0, color: '#eab308' },
          { label: 'LOW', count: metrics.threats.bySeverity.low || 0, color: '#22d3ee' },
          { label: 'INFO', count: metrics.threats.bySeverity.info || 0, color: '#a78bfa' },
        ];
        const bar = segments
          .filter(s => s.count > 0)
          .map(s => `<div class="segment" style="background:${s.color};width:${(s.count / total * 100).toFixed(1)}%;">${s.count > 0 ? s.count : ''}</div>`)
          .join('');
        const legend = segments.map(s => `<span style="margin-right:16px;font-size:13px;"><span style="display:inline-block;width:10px;height:10px;background:${s.color};border-radius:2px;margin-right:4px;vertical-align:middle;"></span>${s.label}: <strong>${s.count}</strong></span>`).join('');
        return `<div class="severity-bar">${bar}</div><div style="margin-top:8px;">${legend}</div>`;
      })()}
    </div>

    <!-- THREAT SOURCES -->
    <div class="section">
      <h2>📡 Threat Intelligence Sources</h2>
      <table>
        <thead><tr><th>Source</th><th style="text-align:right;">Threats Collected</th></tr></thead>
        <tbody>${sourceRows || '<tr><td colspan="2" style="padding:12px;color:#94a3b8;text-align:center;">No data yet — engine may have just started</td></tr>'}</tbody>
      </table>
    </div>

    <!-- TOP THREATS -->
    ${metrics.threats.topCritical.length > 0 ? `
    <div class="section">
      <h2>🚨 Top Critical/High Threats</h2>
      <table>
        <thead><tr><th>Threat</th><th style="text-align:center;">Severity</th><th>Source</th><th>CVE IDs</th></tr></thead>
        <tbody>${threatRows}</tbody>
      </table>
    </div>` : ''}

    <!-- TOP RULES -->
    ${metrics.rules.topRules.length > 0 ? `
    <div class="section">
      <h2>🛡️ Top Detection Rules by Effectiveness</h2>
      <table>
        <thead><tr><th>Rule Name</th><th style="text-align:center;">Type</th><th style="text-align:center;">Severity</th><th style="text-align:right;">Effectiveness</th></tr></thead>
        <tbody>${ruleRows}</tbody>
      </table>
    </div>` : ''}

    <!-- ACTIVITY LOG -->
    ${metrics.recentLog.length > 0 ? `
    <div class="section">
      <h2>📋 Recent Activity Log</h2>
      <table>
        <thead><tr><th>Time (AEST)</th><th>Action</th><th>Details</th></tr></thead>
        <tbody>${logRows}</tbody>
      </table>
    </div>` : ''}

    <!-- FOOTER -->
    <div class="footer">
      <p>Generated on-demand from the TITAN AI Evolution Engine.</p>
      <p>Anchor Security Pty Ltd — <a href="https://anchoraiguard.com">anchoraiguard.com</a></p>
      <p style="margin-top:8px;">Report period: ${metrics.periodStart.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} — ${metrics.periodEnd.toLocaleString('en-AU', { timeZone: 'Australia/Sydney' })} AEST</p>
    </div>
  </div>
</body>
</html>`;
}



// ============================================
// PUBLIC API
// ============================================

/**
 * Generate report HTML and metrics (for preview / download).
 */
export function generateTitanReport(): { html: string; metrics: ReportMetrics } {
  const metrics = collectReportMetrics();
  const html = generateReportHTML(metrics);
  return { html, metrics };
}
