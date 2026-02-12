// ============================================================================
// HUMAN BEHAVIOUR RISK ENGINE — WORLD-FIRST AI BEHAVIOURAL SECURITY
// Anchor is the first platform to provide comprehensive AI-driven human
// behaviour risk analysis, detecting insider threats, social engineering
// patterns, behavioural anomalies, and privilege misuse in real-time.
// ============================================================================

import React, { useState } from 'react';

const tabs = [
  'Risk Dashboard',
  'Insider Threats',
  'Social Engineering',
  'Behavioral Anomalies',
  'Privilege Misuse',
] as const;

type Tab = (typeof tabs)[number];

interface RiskUser {
  id: string;
  name: string;
  department: string;
  riskScore: number;
  riskLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  lastIncident: string;
  incidents: number;
}

interface InsiderThreat {
  id: string;
  user: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  description: string;
  timestamp: string;
  status: 'Active' | 'Investigating' | 'Resolved';
  confidence: number;
}

interface SocialEngineeringEvent {
  id: string;
  target: string;
  attackType: 'Phishing' | 'Vishing' | 'Smishing' | 'Pretexting' | 'Baiting';
  outcome: 'Blocked' | 'Clicked' | 'Reported' | 'Compromised';
  susceptibilityScore: number;
  timestamp: string;
  details: string;
}

interface BehavioralAnomaly {
  id: string;
  user: string;
  anomalyType: string;
  description: string;
  deviationScore: number;
  detectedAt: string;
  baselinePeriod: string;
  status: 'New' | 'Under Review' | 'Dismissed' | 'Escalated';
}

interface PrivilegeMisuse {
  id: string;
  user: string;
  action: string;
  resource: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  timestamp: string;
  policyViolated: string;
  status: 'Detected' | 'Investigating' | 'Confirmed' | 'Remediated';
}

// --- Mock Data ---

const highRiskUsers: RiskUser[] = [
  { id: 'U-001', name: 'Marcus Devlin', department: 'Engineering', riskScore: 94, riskLevel: 'Critical', lastIncident: '2026-02-08', incidents: 12 },
  { id: 'U-002', name: 'Sarah Ortega', department: 'Finance', riskScore: 87, riskLevel: 'High', lastIncident: '2026-02-07', incidents: 8 },
  { id: 'U-003', name: 'Jason Kimura', department: 'Sales', riskScore: 82, riskLevel: 'High', lastIncident: '2026-02-06', incidents: 6 },
  { id: 'U-004', name: 'Priya Mehta', department: 'HR', riskScore: 76, riskLevel: 'High', lastIncident: '2026-02-05', incidents: 5 },
  { id: 'U-005', name: 'Tom Ellison', department: 'IT Operations', riskScore: 71, riskLevel: 'Medium', lastIncident: '2026-02-04', incidents: 4 },
  { id: 'U-006', name: 'Diana Reyes', department: 'Legal', riskScore: 63, riskLevel: 'Medium', lastIncident: '2026-02-03', incidents: 3 },
  { id: 'U-007', name: 'Alexei Volkov', department: 'Engineering', riskScore: 58, riskLevel: 'Medium', lastIncident: '2026-02-01', incidents: 3 },
  { id: 'U-008', name: 'Hannah Liu', department: 'Marketing', riskScore: 45, riskLevel: 'Low', lastIncident: '2026-01-28', incidents: 2 },
];

const departmentRisk = [
  { department: 'Engineering', score: 74, users: 48, highRisk: 6 },
  { department: 'Finance', score: 69, users: 22, highRisk: 4 },
  { department: 'Sales', score: 55, users: 35, highRisk: 3 },
  { department: 'HR', score: 51, users: 14, highRisk: 2 },
  { department: 'IT Operations', score: 47, users: 18, highRisk: 2 },
  { department: 'Legal', score: 38, users: 10, highRisk: 1 },
  { department: 'Marketing', score: 32, users: 20, highRisk: 0 },
  { department: 'Executive', score: 28, users: 8, highRisk: 0 },
];

const topRiskFactors = [
  { factor: 'Excessive data downloads', percentage: 34 },
  { factor: 'After-hours privileged access', percentage: 28 },
  { factor: 'Unusual geographic logins', percentage: 19 },
  { factor: 'Failed authentication spikes', percentage: 12 },
  { factor: 'Shadow IT usage', percentage: 7 },
];

const insiderThreats: InsiderThreat[] = [
  { id: 'IT-001', user: 'Marcus Devlin', type: 'Mass File Download', severity: 'Critical', description: 'Downloaded 2,847 confidential files from engineering repository in 45 minutes — 14x above baseline.', timestamp: '2026-02-08 23:14', status: 'Active', confidence: 96 },
  { id: 'IT-002', user: 'Sarah Ortega', type: 'Unusual Data Access', severity: 'High', description: 'Accessed payroll records for departments outside her scope — 3 separate occasions this week.', timestamp: '2026-02-07 14:32', status: 'Investigating', confidence: 89 },
  { id: 'IT-003', user: 'Jason Kimura', type: 'After-Hours Activity', severity: 'High', description: 'Logged in at 03:22 AM from unrecognized VPN endpoint and exported full client database.', timestamp: '2026-02-06 03:22', status: 'Investigating', confidence: 91 },
  { id: 'IT-004', user: 'Priya Mehta', type: 'Privilege Escalation', severity: 'Medium', description: 'Requested and used temporary admin credentials 7 times this month — normally 1/month.', timestamp: '2026-02-05 09:45', status: 'Active', confidence: 78 },
  { id: 'IT-005', user: 'Tom Ellison', type: 'Data Staging', severity: 'High', description: 'Created compressed archives of source code repositories on personal cloud storage path.', timestamp: '2026-02-04 17:58', status: 'Active', confidence: 85 },
  { id: 'IT-006', user: 'Diana Reyes', type: 'Policy Circumvention', severity: 'Medium', description: 'Bypassed DLP controls by renaming file extensions before upload to personal email.', timestamp: '2026-02-03 11:20', status: 'Resolved', confidence: 82 },
];

const socialEngineeringEvents: SocialEngineeringEvent[] = [
  { id: 'SE-001', target: 'Sarah Ortega', attackType: 'Phishing', outcome: 'Clicked', susceptibilityScore: 78, timestamp: '2026-02-08 10:15', details: 'Clicked credential-harvesting link impersonating internal SSO portal.' },
  { id: 'SE-002', target: 'Tom Ellison', attackType: 'Vishing', outcome: 'Reported', susceptibilityScore: 22, timestamp: '2026-02-07 16:40', details: 'Caller impersonated IT helpdesk requesting VPN credentials. User reported to SOC.' },
  { id: 'SE-003', target: 'Hannah Liu', attackType: 'Smishing', outcome: 'Blocked', susceptibilityScore: 35, timestamp: '2026-02-06 09:30', details: 'SMS with malicious link impersonating CEO — blocked by mobile threat defense.' },
  { id: 'SE-004', target: 'Marcus Devlin', attackType: 'Pretexting', outcome: 'Compromised', susceptibilityScore: 88, timestamp: '2026-02-05 14:22', details: 'Attacker posed as vendor partner and obtained API credentials via Teams chat.' },
  { id: 'SE-005', target: 'Priya Mehta', attackType: 'Phishing', outcome: 'Reported', susceptibilityScore: 30, timestamp: '2026-02-04 08:55', details: 'Spear-phishing email with spoofed executive sender. Reported within 2 minutes.' },
  { id: 'SE-006', target: 'Jason Kimura', attackType: 'Baiting', outcome: 'Clicked', susceptibilityScore: 65, timestamp: '2026-02-03 12:10', details: 'Inserted unknown USB device found in parking lot into workstation.' },
  { id: 'SE-007', target: 'Alexei Volkov', attackType: 'Phishing', outcome: 'Blocked', susceptibilityScore: 15, timestamp: '2026-02-02 11:00', details: 'Phishing email blocked by AI email gateway before delivery.' },
];

const behavioralAnomalies: BehavioralAnomaly[] = [
  { id: 'BA-001', user: 'Marcus Devlin', anomalyType: 'Unusual Login Time', description: 'Logged in at 02:47 AM — historical baseline is 08:00–19:00. 4 occurrences this week.', deviationScore: 94, detectedAt: '2026-02-08 02:47', baselinePeriod: '90 days', status: 'Escalated' },
  { id: 'BA-002', user: 'Sarah Ortega', anomalyType: 'New Device', description: 'Authenticated from unregistered Android device — no prior mobile device enrollment.', deviationScore: 87, detectedAt: '2026-02-07 08:12', baselinePeriod: '180 days', status: 'Under Review' },
  { id: 'BA-003', user: 'Jason Kimura', anomalyType: 'Geographic Anomaly', description: 'Login from Lagos, Nigeria — 6,200 miles from usual location (San Francisco). No travel booked.', deviationScore: 98, detectedAt: '2026-02-06 03:22', baselinePeriod: '365 days', status: 'Escalated' },
  { id: 'BA-004', user: 'Tom Ellison', anomalyType: 'Application Usage Change', description: 'First-time use of cloud storage sync client, installed without IT approval.', deviationScore: 72, detectedAt: '2026-02-05 15:30', baselinePeriod: '90 days', status: 'Under Review' },
  { id: 'BA-005', user: 'Priya Mehta', anomalyType: 'Access Pattern Change', description: 'Accessed 340% more files than 90-day average; concentrated in executive compensation data.', deviationScore: 81, detectedAt: '2026-02-04 10:15', baselinePeriod: '90 days', status: 'Under Review' },
  { id: 'BA-006', user: 'Diana Reyes', anomalyType: 'Network Behaviour', description: 'Unusual outbound traffic to TOR exit nodes detected from workstation.', deviationScore: 91, detectedAt: '2026-02-03 22:05', baselinePeriod: '180 days', status: 'Escalated' },
  { id: 'BA-007', user: 'Alexei Volkov', anomalyType: 'Typing Pattern Change', description: 'Keystroke dynamics deviation — 42% variance from baseline. Possible credential sharing.', deviationScore: 68, detectedAt: '2026-02-02 14:00', baselinePeriod: '60 days', status: 'New' },
];

const privilegeMisuseEvents: PrivilegeMisuse[] = [
  { id: 'PM-001', user: 'Marcus Devlin', action: 'Bulk Data Export', resource: 'Source Code Repository', severity: 'Critical', timestamp: '2026-02-08 23:18', policyViolated: 'DLP-001: Bulk Export Restriction', status: 'Investigating' },
  { id: 'PM-002', user: 'Sarah Ortega', action: 'Unauthorized Record Access', resource: 'Payroll Database', severity: 'High', timestamp: '2026-02-07 14:35', policyViolated: 'AC-003: Need-to-Know Access', status: 'Investigating' },
  { id: 'PM-003', user: 'Tom Ellison', action: 'Admin Credential Misuse', resource: 'Production Servers', severity: 'Critical', timestamp: '2026-02-06 18:10', policyViolated: 'PAM-002: Privileged Session Policy', status: 'Confirmed' },
  { id: 'PM-004', user: 'Priya Mehta', action: 'Excessive Permission Request', resource: 'IAM Console', severity: 'Medium', timestamp: '2026-02-05 09:50', policyViolated: 'IAM-005: Least Privilege', status: 'Detected' },
  { id: 'PM-005', user: 'Jason Kimura', action: 'Data Exfiltration Attempt', resource: 'Client Database', severity: 'Critical', timestamp: '2026-02-04 03:45', policyViolated: 'DLP-003: External Transfer Block', status: 'Confirmed' },
  { id: 'PM-006', user: 'Diana Reyes', action: 'DLP Bypass', resource: 'Legal Documents', severity: 'High', timestamp: '2026-02-03 11:22', policyViolated: 'DLP-002: Extension Masking', status: 'Remediated' },
  { id: 'PM-007', user: 'Alexei Volkov', action: 'Unauthorized Tool Install', resource: 'Dev Workstation', severity: 'Medium', timestamp: '2026-02-02 16:30', policyViolated: 'EP-001: Approved Software Only', status: 'Detected' },
];

// --- Helper Components ---

const severityColor = (severity: string) => {
  switch (severity) {
    case 'Critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
    case 'High': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
    case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'Low': return 'text-green-400 bg-green-400/10 border-green-400/30';
    default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case 'Active': case 'Detected': case 'New': return 'text-red-400';
    case 'Investigating': case 'Under Review': return 'text-yellow-400';
    case 'Resolved': case 'Remediated': case 'Dismissed': return 'text-green-400';
    case 'Escalated': case 'Confirmed': return 'text-orange-400';
    default: return 'text-slate-400';
  }
};

const outcomeColor = (outcome: string) => {
  switch (outcome) {
    case 'Blocked': return 'text-green-400 bg-green-400/10';
    case 'Reported': return 'text-cyan-400 bg-cyan-400/10';
    case 'Clicked': return 'text-orange-400 bg-orange-400/10';
    case 'Compromised': return 'text-red-400 bg-red-400/10';
    default: return 'text-slate-400 bg-slate-400/10';
  }
};

const riskScoreColor = (score: number) => {
  if (score >= 85) return 'text-red-400';
  if (score >= 65) return 'text-orange-400';
  if (score >= 40) return 'text-yellow-400';
  return 'text-green-400';
};

const RiskBar: React.FC<{ score: number; max?: number }> = ({ score, max = 100 }) => {
  const pct = Math.min((score / max) * 100, 100);
  const barColor = score >= 85 ? 'bg-red-500' : score >= 65 ? 'bg-orange-500' : score >= 40 ? 'bg-yellow-500' : 'bg-green-500';
  return (
    <div className="w-full bg-slate-700 rounded-full h-2">
      <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
    </div>
  );
};

const Badge: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => (
  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${className}`}>{text}</span>
);

// --- Tab Content Components ---

const RiskDashboardTab: React.FC = () => {
  const overallScore = 67;
  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 col-span-1 flex flex-col items-center justify-center">
          <p className="text-slate-400 text-sm mb-2">Overall Human Risk Score</p>
          <div className={`text-5xl font-bold ${riskScoreColor(overallScore)}`}>{overallScore}</div>
          <p className="text-slate-500 text-xs mt-1">out of 100</p>
          <RiskBar score={overallScore} />
          <p className="text-orange-400 text-xs mt-2 font-medium">▲ 4.2 from last week</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
          <p className="text-slate-400 text-sm mb-1">High-Risk Users</p>
          <p className="text-3xl font-bold text-red-400">18</p>
          <p className="text-slate-500 text-xs">of 175 monitored</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
          <p className="text-slate-400 text-sm mb-1">Active Incidents</p>
          <p className="text-3xl font-bold text-orange-400">7</p>
          <p className="text-slate-500 text-xs">3 critical</p>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
          <p className="text-slate-400 text-sm mb-1">Behavioral Alerts (24h)</p>
          <p className="text-3xl font-bold text-cyan-400">42</p>
          <p className="text-slate-500 text-xs">▲ 12% above average</p>
        </div>
      </div>

      {/* High-Risk Users Table */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /> High-Risk Users
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2 px-3">User</th>
                <th className="text-left py-2 px-3">Department</th>
                <th className="text-center py-2 px-3">Risk Score</th>
                <th className="text-center py-2 px-3">Level</th>
                <th className="text-center py-2 px-3">Incidents</th>
                <th className="text-left py-2 px-3">Last Incident</th>
              </tr>
            </thead>
            <tbody>
              {highRiskUsers.map((u) => (
                <tr key={u.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-2 px-3 text-white font-medium">{u.name}</td>
                  <td className="py-2 px-3 text-slate-300">{u.department}</td>
                  <td className="py-2 px-3 text-center">
                    <span className={`font-bold ${riskScoreColor(u.riskScore)}`}>{u.riskScore}</span>
                  </td>
                  <td className="py-2 px-3 text-center"><Badge text={u.riskLevel} className={severityColor(u.riskLevel)} /></td>
                  <td className="py-2 px-3 text-center text-slate-300">{u.incidents}</td>
                  <td className="py-2 px-3 text-slate-400">{u.lastIncident}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Risk & Top Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Risk Distribution by Department</h3>
          <div className="space-y-3">
            {departmentRisk.map((d) => (
              <div key={d.department}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{d.department}</span>
                  <span className={`font-semibold ${riskScoreColor(d.score)}`}>{d.score} <span className="text-slate-500 font-normal">({d.highRisk} high-risk)</span></span>
                </div>
                <RiskBar score={d.score} />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4">Top Risk Factors</h3>
          <div className="space-y-4">
            {topRiskFactors.map((f, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-300">{f.factor}</span>
                  <span className="text-pink-400 font-semibold">{f.percentage}%</span>
                </div>
                <RiskBar score={f.percentage} />
              </div>
            ))}
          </div>
          <div className="mt-6 bg-slate-900/50 border border-slate-600 rounded-lg p-3">
            <p className="text-cyan-400 text-xs font-semibold mb-1">AI Insight</p>
            <p className="text-slate-300 text-xs">Excessive data downloads have increased 23% week-over-week, primarily concentrated in Engineering and Finance departments. Recommend targeted DLP policy review and user awareness sessions.</p>
          </div>
        </div>
      </div>

      {/* Behavioral Trends */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Behavioral Trend Analysis (7 days)</h3>
        <div className="grid grid-cols-7 gap-2 text-center text-xs">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
            const values = [38, 42, 55, 61, 67, 29, 34];
            return (
              <div key={day} className="space-y-1">
                <div className="bg-slate-700 rounded-lg p-3">
                  <div className={`text-lg font-bold ${riskScoreColor(values[i])}`}>{values[i]}</div>
                </div>
                <span className="text-slate-500">{day}</span>
              </div>
            );
          })}
        </div>
        <p className="text-slate-400 text-xs mt-3">Peak risk detected on Friday — correlates with end-of-week data exports and off-hours activity.</p>
      </div>
    </div>
  );
};

const InsiderThreatsTab: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-slate-800 border border-red-500/30 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Active Threats</p>
        <p className="text-3xl font-bold text-red-400">3</p>
        <p className="text-red-400/70 text-xs">Immediate attention required</p>
      </div>
      <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Under Investigation</p>
        <p className="text-3xl font-bold text-yellow-400">2</p>
        <p className="text-yellow-400/70 text-xs">SOC team assigned</p>
      </div>
      <div className="bg-slate-800 border border-green-500/30 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Resolved (30d)</p>
        <p className="text-3xl font-bold text-green-400">14</p>
        <p className="text-green-400/70 text-xs">Avg resolution: 4.2 hours</p>
      </div>
    </div>

    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /> AI-Detected Insider Threat Indicators
      </h3>
      <div className="space-y-3">
        {insiderThreats.map((t) => (
          <div key={t.id} className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-white font-medium">{t.user}</span>
              <Badge text={t.severity} className={severityColor(t.severity)} />
              <Badge text={t.type} className="text-cyan-400 bg-cyan-400/10 border-cyan-400/30" />
              <span className={`text-xs font-semibold ${statusColor(t.status)}`}>● {t.status}</span>
              <span className="text-slate-500 text-xs ml-auto">{t.timestamp}</span>
            </div>
            <p className="text-slate-300 text-sm">{t.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-slate-500 text-xs">AI Confidence:</span>
              <div className="w-24 bg-slate-700 rounded-full h-1.5">
                <div className={`h-1.5 rounded-full ${t.confidence >= 90 ? 'bg-red-500' : t.confidence >= 75 ? 'bg-orange-500' : 'bg-yellow-500'}`} style={{ width: `${t.confidence}%` }} />
              </div>
              <span className={`text-xs font-semibold ${t.confidence >= 90 ? 'text-red-400' : t.confidence >= 75 ? 'text-orange-400' : 'text-yellow-400'}`}>{t.confidence}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-2">Threat Detection Model Performance</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
        <div className="bg-slate-900/60 rounded-lg p-3"><p className="text-slate-400">Precision</p><p className="text-cyan-400 font-bold text-xl">94.7%</p></div>
        <div className="bg-slate-900/60 rounded-lg p-3"><p className="text-slate-400">Recall</p><p className="text-cyan-400 font-bold text-xl">91.2%</p></div>
        <div className="bg-slate-900/60 rounded-lg p-3"><p className="text-slate-400">False Positive Rate</p><p className="text-green-400 font-bold text-xl">2.1%</p></div>
        <div className="bg-slate-900/60 rounded-lg p-3"><p className="text-slate-400">Mean Detection Time</p><p className="text-pink-400 font-bold text-xl">8.4 min</p></div>
      </div>
    </div>
  </div>
);

const SocialEngineeringTab: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Attacks Detected (30d)</p>
        <p className="text-3xl font-bold text-pink-400">127</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Blocked</p>
        <p className="text-3xl font-bold text-green-400">89</p>
        <p className="text-green-400/70 text-xs">70.1% block rate</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Clicked / Engaged</p>
        <p className="text-3xl font-bold text-orange-400">31</p>
        <p className="text-orange-400/70 text-xs">24.4% click rate</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Compromised</p>
        <p className="text-3xl font-bold text-red-400">7</p>
        <p className="text-red-400/70 text-xs">5.5% compromise rate</p>
      </div>
    </div>

    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4">Recent Social Engineering Events</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-2 px-3">Target</th>
              <th className="text-center py-2 px-3">Attack Type</th>
              <th className="text-center py-2 px-3">Outcome</th>
              <th className="text-center py-2 px-3">Susceptibility</th>
              <th className="text-left py-2 px-3">Details</th>
              <th className="text-left py-2 px-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {socialEngineeringEvents.map((e) => (
              <tr key={e.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-2 px-3 text-white font-medium">{e.target}</td>
                <td className="py-2 px-3 text-center"><Badge text={e.attackType} className="text-purple-400 bg-purple-400/10 border-purple-400/30" /></td>
                <td className="py-2 px-3 text-center"><Badge text={e.outcome} className={outcomeColor(e.outcome)} /></td>
                <td className="py-2 px-3 text-center"><span className={`font-bold ${riskScoreColor(e.susceptibilityScore)}`}>{e.susceptibilityScore}</span></td>
                <td className="py-2 px-3 text-slate-300 max-w-xs truncate">{e.details}</td>
                <td className="py-2 px-3 text-slate-500 text-xs whitespace-nowrap">{e.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Attack Type Breakdown</h3>
        <div className="space-y-3">
          {[
            { type: 'Phishing', count: 78, pct: 61 },
            { type: 'Vishing', count: 22, pct: 17 },
            { type: 'Smishing', count: 14, pct: 11 },
            { type: 'Pretexting', count: 9, pct: 7 },
            { type: 'Baiting', count: 4, pct: 4 },
          ].map((a) => (
            <div key={a.type}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{a.type}</span>
                <span className="text-pink-400 font-semibold">{a.count} ({a.pct}%)</span>
              </div>
              <RiskBar score={a.pct} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Most Susceptible Users</h3>
        <div className="space-y-2">
          {[
            { name: 'Marcus Devlin', score: 88, attempts: 5 },
            { name: 'Sarah Ortega', score: 78, attempts: 4 },
            { name: 'Jason Kimura', score: 65, attempts: 3 },
            { name: 'Hannah Liu', score: 35, attempts: 2 },
            { name: 'Priya Mehta', score: 30, attempts: 3 },
          ].map((u) => (
            <div key={u.name} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-2.5">
              <span className="text-slate-300 text-sm">{u.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-xs">{u.attempts} attempts</span>
                <span className={`font-bold text-sm ${riskScoreColor(u.score)}`}>{u.score}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-slate-900/50 border border-slate-600 rounded-lg p-3">
          <p className="text-cyan-400 text-xs font-semibold mb-1">AI Recommendation</p>
          <p className="text-slate-300 text-xs">Schedule mandatory security awareness training for Marcus Devlin and Sarah Ortega. Both show susceptibility scores above 75 and have engaged with simulated attacks multiple times.</p>
        </div>
      </div>
    </div>
  </div>
);

const BehavioralAnomaliesTab: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Total Anomalies (7d)</p>
        <p className="text-3xl font-bold text-cyan-400">34</p>
      </div>
      <div className="bg-slate-800 border border-orange-500/30 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Escalated</p>
        <p className="text-3xl font-bold text-orange-400">3</p>
      </div>
      <div className="bg-slate-800 border border-yellow-500/30 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Under Review</p>
        <p className="text-3xl font-bold text-yellow-400">12</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Avg Deviation Score</p>
        <p className="text-3xl font-bold text-pink-400">78.3</p>
      </div>
    </div>

    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" /> AI-Detected Behavioral Anomalies
      </h3>
      <div className="space-y-3">
        {behavioralAnomalies.map((a) => (
          <div key={a.id} className="bg-slate-900/60 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="text-white font-medium">{a.user}</span>
              <Badge text={a.anomalyType} className="text-purple-400 bg-purple-400/10 border-purple-400/30" />
              <span className={`text-xs font-semibold ${statusColor(a.status)}`}>● {a.status}</span>
              <span className="text-slate-500 text-xs ml-auto">{a.detectedAt}</span>
            </div>
            <p className="text-slate-300 text-sm mb-2">{a.description}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">Deviation Score:</span>
                <span className={`font-bold text-sm ${riskScoreColor(a.deviationScore)}`}>{a.deviationScore}/100</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">Baseline:</span>
                <span className="text-slate-400 text-xs">{a.baselinePeriod}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-3">Anomaly Categories Distribution</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { type: 'Login Time', count: 12, icon: '🕐' },
          { type: 'New Device', count: 8, icon: '📱' },
          { type: 'Geo Anomaly', count: 5, icon: '🌍' },
          { type: 'App Usage', count: 4, icon: '💻' },
          { type: 'Access Pattern', count: 3, icon: '📂' },
          { type: 'Network', count: 2, icon: '🌐' },
        ].map((c) => (
          <div key={c.type} className="bg-slate-900/60 border border-slate-700 rounded-lg p-3 text-center">
            <div className="text-2xl mb-1">{c.icon}</div>
            <p className="text-white font-bold">{c.count}</p>
            <p className="text-slate-400 text-xs">{c.type}</p>
          </div>
        ))}
      </div>
    </div>

    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-2">AI Behavioral Baseline Engine</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="bg-slate-900/60 rounded-lg p-3">
          <p className="text-slate-400">Users Baselined</p>
          <p className="text-cyan-400 font-bold text-xl">175 / 175</p>
          <p className="text-green-400 text-xs">100% coverage</p>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-3">
          <p className="text-slate-400">Features Tracked per User</p>
          <p className="text-cyan-400 font-bold text-xl">847</p>
          <p className="text-slate-500 text-xs">Login, access, network, app, temporal</p>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-3">
          <p className="text-slate-400">Model Retrain Frequency</p>
          <p className="text-cyan-400 font-bold text-xl">6 hours</p>
          <p className="text-slate-500 text-xs">Last retrained: 2 hours ago</p>
        </div>
      </div>
    </div>
  </div>
);

const PrivilegeMisuseTab: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-slate-800 border border-red-500/30 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Critical Incidents</p>
        <p className="text-3xl font-bold text-red-400">3</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Policy Violations (30d)</p>
        <p className="text-3xl font-bold text-orange-400">24</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Data Exfiltration Attempts</p>
        <p className="text-3xl font-bold text-pink-400">5</p>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 text-center">
        <p className="text-slate-400 text-sm mb-1">Unauthorized Access</p>
        <p className="text-3xl font-bold text-yellow-400">11</p>
      </div>
    </div>

    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" /> Detected Privilege Misuse Incidents
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 border-b border-slate-700">
              <th className="text-left py-2 px-3">User</th>
              <th className="text-left py-2 px-3">Action</th>
              <th className="text-left py-2 px-3">Resource</th>
              <th className="text-center py-2 px-3">Severity</th>
              <th className="text-left py-2 px-3">Policy Violated</th>
              <th className="text-center py-2 px-3">Status</th>
              <th className="text-left py-2 px-3">Time</th>
            </tr>
          </thead>
          <tbody>
            {privilegeMisuseEvents.map((p) => (
              <tr key={p.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                <td className="py-2 px-3 text-white font-medium">{p.user}</td>
                <td className="py-2 px-3 text-slate-300">{p.action}</td>
                <td className="py-2 px-3 text-slate-300">{p.resource}</td>
                <td className="py-2 px-3 text-center"><Badge text={p.severity} className={severityColor(p.severity)} /></td>
                <td className="py-2 px-3 text-cyan-400 text-xs">{p.policyViolated}</td>
                <td className="py-2 px-3 text-center"><span className={`text-xs font-semibold ${statusColor(p.status)}`}>● {p.status}</span></td>
                <td className="py-2 px-3 text-slate-500 text-xs whitespace-nowrap">{p.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Violation Types</h3>
        <div className="space-y-3">
          {[
            { type: 'Data Loss Prevention', count: 9, pct: 37 },
            { type: 'Access Control', count: 7, pct: 29 },
            { type: 'Privileged Access Mgmt', count: 4, pct: 17 },
            { type: 'Identity & Access Mgmt', count: 3, pct: 13 },
            { type: 'Endpoint Protection', count: 1, pct: 4 },
          ].map((v) => (
            <div key={v.type}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-300">{v.type}</span>
                <span className="text-pink-400 font-semibold">{v.count} ({v.pct}%)</span>
              </div>
              <RiskBar score={v.pct} />
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Automated Response Actions</h3>
        <div className="space-y-2 text-sm">
          {[
            { action: 'Account suspended pending review', user: 'Marcus Devlin', time: '23:20' },
            { action: 'Session terminated & MFA re-challenged', user: 'Jason Kimura', time: '03:48' },
            { action: 'Export privileges revoked', user: 'Tom Ellison', time: '18:15' },
            { action: 'Manager notification sent', user: 'Sarah Ortega', time: '14:40' },
            { action: 'File extension bypass blocked', user: 'Diana Reyes', time: '11:25' },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-900/50 rounded-lg p-2.5">
              <span className="text-green-400 mt-0.5">✓</span>
              <div>
                <p className="text-white">{r.action}</p>
                <p className="text-slate-500 text-xs">{r.user} — {r.time}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-slate-900/50 border border-slate-600 rounded-lg p-3">
          <p className="text-cyan-400 text-xs font-semibold mb-1">SOAR Integration</p>
          <p className="text-slate-300 text-xs">All critical privilege misuse incidents automatically trigger playbook execution: account isolation → forensic snapshot → manager notification → SOC escalation. Average playbook execution time: 12 seconds.</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main Component ---

const HumanBehaviourEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Risk Dashboard');

  const renderTab = () => {
    switch (activeTab) {
      case 'Risk Dashboard': return <RiskDashboardTab />;
      case 'Insider Threats': return <InsiderThreatsTab />;
      case 'Social Engineering': return <SocialEngineeringTab />;
      case 'Behavioral Anomalies': return <BehavioralAnomaliesTab />;
      case 'Privilege Misuse': return <PrivilegeMisuseTab />;
      default: return null;
    }
  };

  return (
    <div className="bg-slate-900 text-white p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-2xl md:text-3xl font-bold text-white">Human Behaviour Risk Engine</h1>
          <span className="px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-pink-500/20">
            WORLD FIRST
          </span>
        </div>
        <p className="text-slate-400 text-sm max-w-3xl">
          AI-driven human behaviour risk analysis — detecting insider threats, social engineering patterns, behavioural anomalies, and privilege misuse across your entire organization in real-time.
        </p>
      </div>

      {/* Live Status Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 font-semibold">ENGINE ACTIVE</span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Users Monitored: <span className="text-white font-semibold">175</span></span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Events/sec: <span className="text-cyan-400 font-semibold">2,847</span></span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">AI Models: <span className="text-pink-400 font-semibold">12 active</span></span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Last Analysis: <span className="text-white font-semibold">4s ago</span></span>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 mb-6 bg-slate-800 border border-slate-700 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-cyan-500/20 to-pink-500/20 text-white border border-cyan-500/30 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">{renderTab()}</div>

      {/* Footer */}
      <div className="mt-8 text-center text-slate-600 text-xs border-t border-slate-800 pt-4">
        Anchor Human Behaviour Risk Engine v3.0 — Powered by Titan · Behavioural models retrained every 6 hours · UEBA · SOAR integrated
      </div>
    </div>
  );
};

export default HumanBehaviourEngine;
