import React, { useMemo, useCallback, useState } from 'react';
import { jsPDF } from 'jspdf';
import { Finding, Severity } from '../types';
import { useSecureFinding } from '../hooks/useSecurityHooks';
import { sanitizeHtml } from '../utils/sanitization';
import AIAnalysisComponent from './AIAnalysisComponent';

// ─── Subscription Tier Definitions ───
type TierKey = 'free' | 'starter' | 'pro' | 'team' | 'business' | 'enterprise';

interface TierDefinition {
  name: string;
  monthlyPrice: string;
  maxProjects: number | 'Unlimited';
  maxScansPerMonth: number | 'Unlimited';
  maxAIQueries: number | 'Unlimited';
  maxTeamMembers: number | 'Unlimited';
  features: string[];
  worldFirsts: string[];
}

const TIER_ORDER: TierKey[] = ['free', 'starter', 'pro', 'team', 'business', 'enterprise'];

const TIER_DEFINITIONS: Record<TierKey, TierDefinition> = {
  free: {
    name: 'Free',
    monthlyPrice: '$0',
    maxProjects: 1,
    maxScansPerMonth: 5,
    maxAIQueries: 10,
    maxTeamMembers: 1,
    features: [
      'Basic vulnerability scanning',
      'GitHub integration',
      'Community support',
    ],
    worldFirsts: [],
  },
  starter: {
    name: 'Starter',
    monthlyPrice: '$990/mo',
    maxProjects: 3,
    maxScansPerMonth: 50,
    maxAIQueries: 100,
    maxTeamMembers: 1,
    features: [
      'All vulnerability scanners',
      'AI Security Chat',
      'Email support',
      'Export reports (PDF)',
      'Security score badge',
    ],
    worldFirsts: [],
  },
  pro: {
    name: 'Pro',
    monthlyPrice: '$4,990/mo',
    maxProjects: 10,
    maxScansPerMonth: 250,
    maxAIQueries: 1000,
    maxTeamMembers: 3,
    features: [
      'API access',
      'Priority email support',
      'Slack integration',
    ],
    worldFirsts: [
      'Predictive CVE Intelligence',
      'AI Auto-Fix with 1-click PRs',
      'Attack Path Visualization',
      'Threat Hunting Module',
      'Architecture Drift Detection',
      'Identity Drift Detection',
    ],
  },
  team: {
    name: 'Team',
    monthlyPrice: '$14,990/mo',
    maxProjects: 50,
    maxScansPerMonth: 1500,
    maxAIQueries: 7500,
    maxTeamMembers: 15,
    features: [
      'All Pro features included',
      'Team dashboard & analytics',
      'Role-based access control',
      'Full audit logs',
      'Jira & GitHub integration',
      'Priority support',
    ],
    worldFirsts: [
      'Real-time Collaboration',
      'Digital Twin Security',
      'Autonomous SOC Access',
      'Data Trust Engine',
      'Human Behaviour Risk Engine',
      'AI Runtime Security',
    ],
  },
  business: {
    name: 'Business',
    monthlyPrice: '$49,990/mo',
    maxProjects: 200,
    maxScansPerMonth: 10000,
    maxAIQueries: 50000,
    maxTeamMembers: 75,
    features: [
      'All 109+ Security Modules',
      'SSO/SAML authentication',
      'Custom security rules',
      'Advanced threat analytics',
      'Dedicated CSM',
      'Phone & Slack support',
      '99.9% SLA',
    ],
    worldFirsts: [
      'Cyber Insurance Integration',
      'Supply Chain Attestation',
      'Hardware Integrity Layer',
      'Firmware & Microcode Scanner',
      'Autonomous Red Team',
      'National-Scale Telemetry',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    monthlyPrice: 'Custom',
    maxProjects: 'Unlimited',
    maxScansPerMonth: 'Unlimited',
    maxAIQueries: 'Unlimited',
    maxTeamMembers: 'Unlimited',
    features: [
      'On-premise deployment option',
      'Custom AI model training',
      'Dedicated security engineer',
      '24/7/365 phone & Slack support',
      '99.95% SLA guarantee',
      'SOC 2 Type II compliance',
      'Quarterly business reviews',
      'Custom integrations',
    ],
    worldFirsts: [
      'All 29 World-First features',
    ],
  },
};

function normaliseTier(raw: string): TierKey {
  const lower = raw.toLowerCase().replace(/[^a-z]/g, '');
  if (TIER_ORDER.includes(lower as TierKey)) return lower as TierKey;
  if (lower.includes('enterprise')) return 'enterprise';
  if (lower.includes('business')) return 'business';
  if (lower.includes('team')) return 'team';
  if (lower.includes('pro')) return 'pro';
  if (lower.includes('starter')) return 'starter';
  return 'free';
}

function getTierIndex(tier: TierKey): number {
  return TIER_ORDER.indexOf(tier);
}

function getNextTier(tier: TierKey): TierKey | null {
  const idx = getTierIndex(tier);
  if (idx < 0 || idx >= TIER_ORDER.length - 1) return null;
  return TIER_ORDER[idx + 1];
}

/** Collect cumulative features for a tier (includes all lower tiers). */
function getCumulativeFeatures(tier: TierKey): string[] {
  const idx = getTierIndex(tier);
  const features: string[] = [];
  for (let i = 0; i <= idx; i++) {
    const t = TIER_ORDER[i];
    features.push(...TIER_DEFINITIONS[t].features);
    features.push(...TIER_DEFINITIONS[t].worldFirsts.map(w => `🌟 ${w} (WORLD FIRST)`));
  }
  return features;
}

/** Get features the user is MISSING by not being on the next tier. */
function getUpgradeFeatures(currentTier: TierKey): { nextTier: TierDefinition; features: string[]; tierKey: TierKey } | null {
  const next = getNextTier(currentTier);
  if (!next) return null;
  const def = TIER_DEFINITIONS[next];
  const features = [
    ...def.features,
    ...def.worldFirsts.map(w => `🌟 ${w} (WORLD FIRST)`),
  ];
  return { nextTier: def, features, tierKey: next };
}

/** Get ALL higher tiers and their features for the upsell section. */
function getAllHigherTiers(currentTier: TierKey): Array<{ tierKey: TierKey; def: TierDefinition; uniqueFeatures: string[] }> {
  const idx = getTierIndex(currentTier);
  const result: Array<{ tierKey: TierKey; def: TierDefinition; uniqueFeatures: string[] }> = [];
  for (let i = idx + 1; i < TIER_ORDER.length; i++) {
    const t = TIER_ORDER[i];
    const def = TIER_DEFINITIONS[t];
    result.push({
      tierKey: t,
      def,
      uniqueFeatures: [
        ...def.features,
        ...def.worldFirsts.map(w => `🌟 ${w} (WORLD FIRST)`),
      ],
    });
  }
  return result;
}

interface FindingsReportScreenProps {
  findings: Finding[];
  selectedFinding: Finding | null;
  onSelectFinding: (finding: Finding) => void;
  subscriptionTier?: string;
  onNavigateToUpgrade?: () => void;
}

const FindingsReportScreen: React.FC<FindingsReportScreenProps> = ({
  findings,
  selectedFinding,
  onSelectFinding,
  subscriptionTier = 'starter',
  onNavigateToUpgrade,
}) => {
  const tier = normaliseTier(subscriptionTier);
  const tierDef = TIER_DEFINITIONS[tier];
  const secureSelectedFinding = useSecureFinding(selectedFinding);
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(new Set());

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
  // Export full report PDF (all findings) — subscription-aware
  // ---------------------------------------------------------------
  const exportFullReportPdf = useCallback(() => {
    if (sortedFindings.length === 0) return;
    const doc = new jsPDF();

    addPdfHeader(doc);

    let y = 42;

    // ── Plan Banner ──
    doc.setFillColor(30, 41, 59);
    doc.roundedRect(15, y - 4, 180, 12, 3, 3, 'F');
    doc.setTextColor(53, 198, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Your Plan: ${tierDef.name}`, 20, y + 3);
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const limitsText = tierDef.maxProjects === 'Unlimited'
      ? 'Unlimited projects · Unlimited scans · Unlimited AI queries'
      : `${tierDef.maxProjects} projects · ${tierDef.maxScansPerMonth} scans/mo · ${tierDef.maxAIQueries} AI queries/mo`;
    doc.text(limitsText, 20, y + 8);
    y += 18;

    // ── Executive Summary ──
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

    // Risk score
    const riskScore = Math.min(100, Math.round(
      ((counts[Severity.Critical] || 0) * 25 +
       (counts[Severity.High] || 0) * 15 +
       (counts[Severity.Medium] || 0) * 8 +
       (counts[Severity.Low] || 0) * 3 +
       (counts[Severity.Informational] || 0) * 1
      ) / Math.max(1, sortedFindings.length) * 10
    ));

    const riskLabel = riskScore >= 75 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MODERATE' : 'LOW';
    const riskColor: [number, number, number] = riskScore >= 75 ? [239,68,68] : riskScore >= 50 ? [249,115,22] : riskScore >= 25 ? [234,179,8] : [34,197,94];
    doc.setFillColor(...riskColor);
    doc.roundedRect(15, y - 4, 40, 8, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Risk: ${riskLabel} (${riskScore}/100)`, 17, y + 1);
    y += 10;

    const severities: Severity[] = [Severity.Critical, Severity.High, Severity.Medium, Severity.Low, Severity.Informational, Severity.Resolved];
    for (const sev of severities) {
      if (counts[sev]) {
        const [r, g, b] = severityPdfColor(sev);
        doc.setFillColor(r, g, b);
        doc.circle(18, y - 1.5, 2, 'F');
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${sev}: ${counts[sev]}`, 23, y);
        y += 5;
      }
    }
    y += 4;

    // Report period
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'italic');
    doc.text(`Report generated: ${new Date().toLocaleDateString('en-AU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 15, y);
    y += 8;

    // Divider
    doc.setDrawColor(203, 213, 225);
    doc.line(15, y, 195, y);
    y += 8;

    // ── Your Plan Includes ──
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Plan Capabilities', 15, y);
    y += 7;

    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');

    const cumulativeFeatures = getCumulativeFeatures(tier);
    for (const feature of cumulativeFeatures) {
      if (y > 265) { doc.addPage(); y = 20; }
      doc.text(`✓  ${feature}`, 18, y);
      y += 4.5;
    }
    y += 4;

    // Divider
    doc.setDrawColor(203, 213, 225);
    doc.line(15, y, 195, y);
    y += 8;

    // ── Subscription Utilisation ──
    if (y > 240) { doc.addPage(); y = 20; }
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('Subscription Utilisation', 15, y);
    y += 8;

    const utilRows = [
      { label: 'Findings detected this period', value: String(sortedFindings.length) },
      { label: 'Critical issues', value: String(counts[Severity.Critical] || 0) },
      { label: 'Issues resolved', value: String(counts[Severity.Resolved] || 0) },
      { label: 'Plan scan limit', value: tierDef.maxScansPerMonth === 'Unlimited' ? 'Unlimited' : `${tierDef.maxScansPerMonth}/month` },
      { label: 'AI query limit', value: tierDef.maxAIQueries === 'Unlimited' ? 'Unlimited' : `${tierDef.maxAIQueries}/month` },
      { label: 'Team member limit', value: tierDef.maxTeamMembers === 'Unlimited' ? 'Unlimited' : `${tierDef.maxTeamMembers}` },
    ];

    for (const row of utilRows) {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(row.label, 18, y);
      doc.setTextColor(30, 41, 59);
      doc.setFont('helvetica', 'bold');
      doc.text(row.value, 140, y);
      y += 6;
    }
    y += 4;

    doc.setDrawColor(203, 213, 225);
    doc.line(15, y, 195, y);
    y += 8;

    // ── Detailed Findings ──
    if (y > 240) { doc.addPage(); y = 20; }
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

    // ── Upsell Section (for non-enterprise tiers) ──
    const higherTiers = getAllHigherTiers(tier);
    if (higherTiers.length > 0) {
      doc.addPage();
      y = 20;

      // Upsell header
      doc.setFillColor(53, 198, 255);
      doc.rect(0, 0, 210, 2, 'F');

      doc.setFontSize(16);
      doc.setTextColor(53, 198, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Unlock More for Your Business', 15, y + 5);
      y += 12;

      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      doc.setFont('helvetica', 'normal');
      y = addWrappedText(doc, `You're currently on the ${tierDef.name} plan. Here's what upgrading would give your organisation:`, 15, y, 180, 5);
      y += 6;

      for (const ht of higherTiers) {
        if (y > 220) { doc.addPage(); y = 20; }

        // Tier title bar
        doc.setFillColor(30, 41, 59);
        doc.roundedRect(15, y - 4, 180, 10, 2, 2, 'F');
        doc.setTextColor(53, 198, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${ht.def.name} Plan — ${ht.def.monthlyPrice}`, 20, y + 2);
        y += 12;

        // Limits
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        const htLimits = ht.def.maxProjects === 'Unlimited'
          ? 'Unlimited projects · Unlimited scans · Unlimited AI queries'
          : `${ht.def.maxProjects} projects · ${ht.def.maxScansPerMonth} scans/mo · ${ht.def.maxAIQueries} AI queries/mo · ${ht.def.maxTeamMembers} members`;
        doc.text(htLimits, 20, y);
        y += 6;

        // Features
        doc.setTextColor(51, 65, 85);
        for (const feat of ht.uniqueFeatures) {
          if (y > 270) { doc.addPage(); y = 20; }
          doc.text(`  ➜  ${feat}`, 20, y);
          y += 4.5;
        }
        y += 6;
      }

      // CTA
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFillColor(53, 198, 255);
      doc.roundedRect(40, y, 130, 14, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Upgrade at anchoraiguard.com/pricing', 50, y + 9);
      y += 20;

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'normal');
      doc.text('Contact sales@anchoraiguard.com for Enterprise & Government pricing.', 30, y);
    }

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
  }, [sortedFindings, tier, tierDef]);

  return (
    <div className="space-y-6 h-full">
      {/* Subscription Banner */}
      <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-linear-to-r from-[#35c6ff] to-[#7a3cff] flex items-center justify-center">
              <span className="text-white font-bold text-sm">{tierDef.name[0]}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">{tierDef.name} Plan</h3>
              <p className="text-xs text-gray-400">
                {tierDef.maxProjects === 'Unlimited' ? 'Unlimited' : tierDef.maxProjects} projects · {tierDef.maxScansPerMonth === 'Unlimited' ? 'Unlimited' : tierDef.maxScansPerMonth} scans/mo · {tierDef.maxAIQueries === 'Unlimited' ? 'Unlimited' : tierDef.maxAIQueries} AI queries/mo
              </p>
            </div>
          </div>
          {tier !== 'enterprise' && onNavigateToUpgrade && (
            <button
              onClick={onNavigateToUpgrade}
              className="px-4 py-2 bg-linear-to-r from-[#35c6ff] to-[#7a3cff] text-white text-xs rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Upgrade Plan
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Findings List */}
        <div className="lg:col-span-1 bg-gray-900/50 border border-cyan-500/20 rounded-lg p-6 overflow-y-auto max-h-[70vh]">
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
              <button
                onClick={() => {
                  if (secureSelectedFinding) {
                    setResolvedIds(prev => new Set(prev).add(secureSelectedFinding.id));
                    onSelectFinding({ ...secureSelectedFinding, severity: Severity.Resolved });
                  }
                }}
                disabled={secureSelectedFinding?.severity === Severity.Resolved || resolvedIds.has(secureSelectedFinding?.id ?? '')}
                className={`flex-1 py-2 rounded transition-colors ${
                  resolvedIds.has(secureSelectedFinding?.id ?? '') || secureSelectedFinding?.severity === Severity.Resolved
                    ? 'bg-green-500/10 text-green-600 cursor-default'
                    : 'bg-green-500/20 hover:bg-green-500/30 text-green-400'
                }`}
              >
                {resolvedIds.has(secureSelectedFinding?.id ?? '') || secureSelectedFinding?.severity === Severity.Resolved ? '✓ Resolved' : 'Mark as Resolved'}
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

      {/* Upsell Panel — only shown for non-Enterprise users */}
      {tier !== 'enterprise' && (() => {
        const upgradeInfo = getUpgradeFeatures(tier);
        const allHigher = getAllHigherTiers(tier);
        if (!upgradeInfo || allHigher.length === 0) return null;
        return (
          <div className="bg-gray-900/50 border border-cyan-500/20 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🚀</span>
              <h3 className="text-lg font-semibold text-white">Unlock More for Your Business</h3>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              You&apos;re on the <span className="text-cyan-400 font-medium">{tierDef.name}</span> plan. 
              See what additional capabilities higher tiers would add to your security posture:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {allHigher.map((ht) => (
                <div key={ht.tierKey} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 hover:border-cyan-500/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-cyan-400">{ht.def.name}</span>
                    <span className="text-xs text-gray-500">{ht.def.monthlyPrice}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-3">
                    {ht.def.maxProjects === 'Unlimited' ? '∞' : ht.def.maxProjects} projects · {ht.def.maxScansPerMonth === 'Unlimited' ? '∞' : ht.def.maxScansPerMonth} scans · {ht.def.maxAIQueries === 'Unlimited' ? '∞' : ht.def.maxAIQueries} AI queries
                  </div>
                  <ul className="space-y-1.5">
                    {ht.uniqueFeatures.slice(0, 6).map((feat, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <span className="text-cyan-500 mt-0.5 shrink-0">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                    {ht.uniqueFeatures.length > 6 && (
                      <li className="text-xs text-gray-500 pl-4">
                        +{ht.uniqueFeatures.length - 6} more features
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            {onNavigateToUpgrade && (
              <div className="mt-4 text-center">
                <button
                  onClick={onNavigateToUpgrade}
                  className="px-6 py-2.5 bg-linear-to-r from-[#35c6ff] to-[#7a3cff] text-white text-sm rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Compare Plans & Upgrade
                </button>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};

export default FindingsReportScreen;
