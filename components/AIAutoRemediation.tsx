import React, { useState, useEffect, useCallback } from 'react';
import { useSecurityModule } from '../hooks/useSecurityModule';

// ═══════════════════════════════════════════════════════════════════════════════
// AI AUTO-REMEDIATION — WORLD FIRST
// ═══════════════════════════════════════════════════════════════════════════════
// The self-healing nervous system of the Anchor organism.
// 
// No other cybersecurity platform on Earth generates, validates, tests, and
// deploys security fixes autonomously. This module is the bridge between
// detection and resolution — the missing link that turns a security platform
// from a warning system into a living, self-repairing entity.
//
// SOVEREIGN INTELLIGENCE: Like white blood cells responding to infection,
// AI Auto-Remediation doesn't wait for human intervention. It identifies
// the vulnerability, generates the fix, validates it against the codebase,
// runs regression tests, and opens a PR — all within seconds.
//
// Part of the TITAN Autonomous Engine — the autonomous nervous system
// that makes Anchor the first self-healing cybersecurity organism.
// ═══════════════════════════════════════════════════════════════════════════════

// ── Type Definitions ─────────────────────────────────────────────────────────

interface RemediationAction {
  id: string;
  timestamp: string;
  vulnerability: string;
  cveId: string | null;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  affectedFile: string;
  affectedComponent: string;
  remediationType: 'Code Fix' | 'Config Change' | 'Dependency Update' | 'IAM Policy' | 'Network Rule' | 'Secret Rotation' | 'Container Patch' | 'Firewall Rule';
  description: string;
  fixDescription: string;
  codeChange: { before: string; after: string } | null;
  confidence: number;
  regressionTests: { passed: number; failed: number; total: number };
  deploymentTarget: string;
  status: 'Generated' | 'Validating' | 'Testing' | 'PR Created' | 'Approved' | 'Deployed' | 'Rolled Back' | 'Rejected';
  prUrl: string | null;
  ttRemediate: string; // time-to-remediate
  humanApprovalRequired: boolean;
  titanDecision: string;
  cortexConfidence: number;
}

interface RemediationPipeline {
  id: string;
  name: string;
  trigger: string;
  steps: string[];
  successRate: number;
  totalExecutions: number;
  avgTimeToFix: string;
  lastRun: string;
  status: 'Active' | 'Paused' | 'Draft';
  autoApprove: boolean;
  scope: string;
}

interface RemediationPolicy {
  id: string;
  name: string;
  description: string;
  scope: string;
  autoApprove: boolean;
  maxSeverityForAuto: 'Low' | 'Medium' | 'High' | 'None';
  requireDualReview: boolean;
  rollbackOnFailure: boolean;
  status: 'Enforced' | 'Draft' | 'Disabled';
  titanOverride: boolean;
}

interface SelfHealingMetric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  trendValue: string;
  description: string;
}

interface RemediationInsight {
  id: string;
  timestamp: string;
  category: string;
  insight: string;
  impact: string;
  cortexConfidence: number;
  actionable: boolean;
}

interface LiveRemediationEvent {
  id: string;
  timestamp: string;
  type: 'fix-generated' | 'test-passed' | 'pr-created' | 'deployed' | 'rollback' | 'escalated';
  message: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  module: string;
}

// ── Demo Data ────────────────────────────────────────────────────────────────

const remediationActions: RemediationAction[] = [
  {
    id: 'rem-001', timestamp: '2026-02-14 09:14:33', vulnerability: 'SQL Injection via unsanitized user input',
    cveId: 'CVE-2026-0142', severity: 'Critical', affectedFile: 'src/api/users.ts', affectedComponent: 'User API',
    remediationType: 'Code Fix', description: 'Direct string concatenation in SQL query allows injection attack',
    fixDescription: 'Replaced string concatenation with parameterized query using prepared statements',
    codeChange: {
      before: 'const query = `SELECT * FROM users WHERE id = ${req.params.id}`;',
      after: 'const query = `SELECT * FROM users WHERE id = $1`;\nconst result = await db.query(query, [req.params.id]);'
    },
    confidence: 99.2, regressionTests: { passed: 142, failed: 0, total: 142 },
    deploymentTarget: 'staging → production', status: 'Deployed', prUrl: 'https://github.com/org/app/pull/1847',
    ttRemediate: '47 seconds', humanApprovalRequired: false,
    titanDecision: 'TITAN auto-approved: Critical severity, 99.2% confidence, 0 regression failures, pattern matches 847 previous successful remediations',
    cortexConfidence: 99.2
  },
  {
    id: 'rem-002', timestamp: '2026-02-14 09:08:11', vulnerability: 'Hardcoded AWS access key in configuration',
    cveId: null, severity: 'Critical', affectedFile: 'config/aws.config.ts', affectedComponent: 'Cloud Configuration',
    remediationType: 'Secret Rotation', description: 'AWS access key AKIA*** hardcoded in config file — exposed in git history',
    fixDescription: 'Rotated AWS key, moved to AWS Secrets Manager, updated config to use IAM role-based auth, purged from git history',
    codeChange: {
      before: 'accessKeyId: "AKIAIOSFODNN7EXAMPLE",\nsecretAccessKey: "wJalrXUtnFEMI...",',
      after: '// Credentials managed by IAM role — no keys in code\naccessKeyId: process.env.AWS_ACCESS_KEY_ID, // injected by Secrets Manager'
    },
    confidence: 98.8, regressionTests: { passed: 89, failed: 0, total: 89 },
    deploymentTarget: 'production (immediate)', status: 'Deployed', prUrl: 'https://github.com/org/app/pull/1846',
    ttRemediate: '2 minutes 14 seconds', humanApprovalRequired: false,
    titanDecision: 'TITAN emergency protocol: Credential exposure requires immediate rotation — no human delay acceptable. Old key revoked, new role-based auth deployed.',
    cortexConfidence: 98.8
  },
  {
    id: 'rem-003', timestamp: '2026-02-14 08:55:44', vulnerability: 'Critical dependency vulnerability in lodash 4.17.20',
    cveId: 'CVE-2026-0098', severity: 'High', affectedFile: 'package.json', affectedComponent: 'Dependencies',
    remediationType: 'Dependency Update', description: 'Prototype pollution vulnerability in lodash < 4.17.22 allows arbitrary code execution',
    fixDescription: 'Updated lodash from 4.17.20 to 4.17.22, verified no breaking changes in API surface, ran full integration suite',
    codeChange: {
      before: '"lodash": "^4.17.20",',
      after: '"lodash": "^4.17.22", // Auto-patched by TITAN — CVE-2026-0098'
    },
    confidence: 97.5, regressionTests: { passed: 312, failed: 0, total: 312 },
    deploymentTarget: 'staging', status: 'PR Created', prUrl: 'https://github.com/org/app/pull/1848',
    ttRemediate: '1 minute 33 seconds', humanApprovalRequired: true,
    titanDecision: 'TITAN recommends auto-approve: High confidence, zero test failures, semver-compatible minor patch. Awaiting human confirmation per policy.',
    cortexConfidence: 97.5
  },
  {
    id: 'rem-004', timestamp: '2026-02-14 08:44:22', vulnerability: 'Overly permissive IAM role allows s3:* on all buckets',
    cveId: null, severity: 'High', affectedFile: 'infrastructure/iam.tf', affectedComponent: 'IAM / Cloud Infrastructure',
    remediationType: 'IAM Policy', description: 'Lambda execution role has s3:* permissions on Resource: * — violates principle of least privilege',
    fixDescription: 'Scoped IAM policy to specific buckets and actions: s3:GetObject, s3:PutObject on arn:aws:s3:::app-data-* only',
    codeChange: {
      before: '{\n  "Effect": "Allow",\n  "Action": "s3:*",\n  "Resource": "*"\n}',
      after: '{\n  "Effect": "Allow",\n  "Action": ["s3:GetObject", "s3:PutObject"],\n  "Resource": "arn:aws:s3:::app-data-*/*"\n}'
    },
    confidence: 96.1, regressionTests: { passed: 44, failed: 1, total: 45 },
    deploymentTarget: 'staging', status: 'Testing',
    prUrl: null, ttRemediate: '3 minutes 8 seconds', humanApprovalRequired: true,
    titanDecision: 'TITAN flagged: 1 test failure in S3 backup module — backup job uses s3:ListBucket which is not in scoped policy. Cortex recommends adding s3:ListBucket for backup-* prefix only.',
    cortexConfidence: 96.1
  },
  {
    id: 'rem-005', timestamp: '2026-02-14 08:33:08', vulnerability: 'Container running as root with host network access',
    cveId: null, severity: 'Critical', affectedFile: 'docker-compose.prod.yml', affectedComponent: 'Container Infrastructure',
    remediationType: 'Container Patch', description: 'Production API container runs as root (UID 0) with network_mode: host — container escape risk',
    fixDescription: 'Added non-root user, dropped all capabilities except NET_BIND_SERVICE, removed host network, added security context',
    codeChange: {
      before: 'services:\n  api:\n    image: app-api:latest\n    network_mode: host',
      after: 'services:\n  api:\n    image: app-api:latest\n    user: "1001:1001"\n    security_opt:\n      - no-new-privileges:true\n    cap_drop:\n      - ALL\n    cap_add:\n      - NET_BIND_SERVICE\n    networks:\n      - app-internal'
    },
    confidence: 95.4, regressionTests: { passed: 67, failed: 0, total: 67 },
    deploymentTarget: 'staging', status: 'Approved', prUrl: 'https://github.com/org/app/pull/1845',
    ttRemediate: '4 minutes 22 seconds', humanApprovalRequired: true,
    titanDecision: 'TITAN analysis: Container hardening verified. Non-root user confirmed working. All 67 integration tests pass. Network isolation verified. Recommending deployment.',
    cortexConfidence: 95.4
  },
  {
    id: 'rem-006', timestamp: '2026-02-14 08:22:55', vulnerability: 'Missing rate limiting on authentication endpoint',
    cveId: null, severity: 'High', affectedFile: 'src/middleware/auth.ts', affectedComponent: 'Authentication',
    remediationType: 'Code Fix', description: '/api/auth/login endpoint has no rate limiting — susceptible to credential stuffing',
    fixDescription: 'Added sliding window rate limiter: 5 attempts per 15 minutes per IP, exponential backoff, account lockout after 10 failures',
    codeChange: {
      before: 'router.post("/login", async (req, res) => {',
      after: 'router.post("/login", rateLimiter({ window: "15m", max: 5, backoff: "exponential" }), accountLockout({ threshold: 10 }), async (req, res) => {'
    },
    confidence: 98.1, regressionTests: { passed: 28, failed: 0, total: 28 },
    deploymentTarget: 'staging → production', status: 'Deployed', prUrl: 'https://github.com/org/app/pull/1844',
    ttRemediate: '1 minute 11 seconds', humanApprovalRequired: false,
    titanDecision: 'TITAN auto-approved: Authentication hardening with zero regression. Rate limiter configuration derived from OWASP best practices + Cortex analysis of 12,400 similar deployments.',
    cortexConfidence: 98.1
  },
  {
    id: 'rem-007', timestamp: '2026-02-14 08:11:33', vulnerability: 'Firewall allows ingress on port 22 from 0.0.0.0/0',
    cveId: null, severity: 'Critical', affectedFile: 'infrastructure/security-groups.tf', affectedComponent: 'Network Security',
    remediationType: 'Firewall Rule', description: 'SSH port 22 open to the internet on production security group — brute force risk',
    fixDescription: 'Restricted SSH to VPN CIDR (10.0.0.0/8), added session manager as alternative, enabled SSH key-only auth',
    codeChange: {
      before: 'ingress {\n  from_port = 22\n  to_port = 22\n  cidr_blocks = ["0.0.0.0/0"]\n}',
      after: 'ingress {\n  from_port = 22\n  to_port = 22\n  cidr_blocks = ["10.0.0.0/8"] # VPN only — TITAN remediation\n  description = "SSH restricted to VPN"\n}'
    },
    confidence: 99.8, regressionTests: { passed: 12, failed: 0, total: 12 },
    deploymentTarget: 'production (immediate)', status: 'Deployed', prUrl: 'https://github.com/org/app/pull/1843',
    ttRemediate: '28 seconds', humanApprovalRequired: false,
    titanDecision: 'TITAN emergency protocol: Public SSH is an active exploit target. Firewall rule applied immediately. VPN connectivity verified for all 4 engineering team members before old rule removed.',
    cortexConfidence: 99.8
  },
  {
    id: 'rem-008', timestamp: '2026-02-14 07:55:44', vulnerability: 'XSS vulnerability in user profile rendering',
    cveId: 'CVE-2026-0201', severity: 'Medium', affectedFile: 'src/components/UserProfile.tsx', affectedComponent: 'Frontend',
    remediationType: 'Code Fix', description: 'User bio field rendered with dangerouslySetInnerHTML — stored XSS via profile update',
    fixDescription: 'Replaced dangerouslySetInnerHTML with DOMPurify sanitization + React text rendering',
    codeChange: {
      before: '<div dangerouslySetInnerHTML={{ __html: user.bio }} />',
      after: '<div>{DOMPurify.sanitize(user.bio, { ALLOWED_TAGS: ["b", "i", "a"], ALLOWED_ATTR: ["href"] })}</div>'
    },
    confidence: 99.5, regressionTests: { passed: 56, failed: 0, total: 56 },
    deploymentTarget: 'staging', status: 'PR Created', prUrl: 'https://github.com/org/app/pull/1842',
    ttRemediate: '52 seconds', humanApprovalRequired: false,
    titanDecision: 'TITAN auto-approved: XSS remediation is a well-understood pattern. DOMPurify config preserves formatting while eliminating script injection. 56 tests confirm no UI regressions.',
    cortexConfidence: 99.5
  },
];

const remediationPipelines: RemediationPipeline[] = [
  { id: 'pipe-1', name: 'Critical Vulnerability Auto-Fix', trigger: 'CVSS >= 9.0 detected by scanner', steps: ['Vulnerability confirmed by Cortex', 'Fix generated by TITAN', 'Unit tests auto-generated', 'Regression suite executed', 'PR created with full context', 'Auto-merge if 0 failures + confidence > 98%'], successRate: 94.2, totalExecutions: 847, avgTimeToFix: '2m 14s', lastRun: '2026-02-14 09:14:33', status: 'Active', autoApprove: true, scope: 'All repositories' },
  { id: 'pipe-2', name: 'Dependency Vulnerability Patcher', trigger: 'CVE published for tracked dependency', steps: ['CVE matched to dependency graph', 'Patch version identified', 'Compatibility analysis', 'Lock file updated', 'Integration tests', 'PR with changelog + migration notes'], successRate: 97.8, totalExecutions: 2341, avgTimeToFix: '1m 33s', lastRun: '2026-02-14 08:55:44', status: 'Active', autoApprove: false, scope: 'All npm/pip/maven projects' },
  { id: 'pipe-3', name: 'Secret Exposure Emergency Response', trigger: 'Credential detected in code or logs', steps: ['Credential type identified', 'Immediate key rotation via vault', 'Git history purged (BFG)', 'New credential injected via Secrets Manager', 'Audit log entry created', 'Incident report filed'], successRate: 100, totalExecutions: 23, avgTimeToFix: '2m 08s', lastRun: '2026-02-14 09:08:11', status: 'Active', autoApprove: true, scope: 'All repositories + CI/CD logs' },
  { id: 'pipe-4', name: 'IAM Least-Privilege Enforcer', trigger: 'Overly permissive IAM policy detected', steps: ['Current permissions mapped', 'Actual usage analyzed (90-day CloudTrail)', 'Minimal policy generated', 'Diff review generated', 'Staged rollout (monitor mode first)', 'Full enforcement after 48h'], successRate: 89.3, totalExecutions: 156, avgTimeToFix: '8m 44s', lastRun: '2026-02-14 08:44:22', status: 'Active', autoApprove: false, scope: 'AWS + GCP + Azure' },
  { id: 'pipe-5', name: 'Container Hardening Pipeline', trigger: 'Container scan finds root/capability issues', steps: ['Base image analyzed', 'Non-root user created', 'Capabilities dropped', 'Security context applied', 'Network policy generated', 'Smoke tests in isolated namespace'], successRate: 91.7, totalExecutions: 412, avgTimeToFix: '4m 22s', lastRun: '2026-02-14 08:33:08', status: 'Active', autoApprove: false, scope: 'All Kubernetes workloads' },
  { id: 'pipe-6', name: 'Network Security Auto-Remediation', trigger: 'Open port / misconfigured firewall detected', steps: ['Port exposure risk scored', 'Legitimate traffic patterns analyzed', 'Restrictive rule generated', 'Connectivity test executed', 'Rule applied with rollback window', 'Alert if connectivity broken within 1h'], successRate: 96.4, totalExecutions: 89, avgTimeToFix: '1m 45s', lastRun: '2026-02-14 08:11:33', status: 'Active', autoApprove: true, scope: 'All cloud security groups + firewalls' },
  { id: 'pipe-7', name: 'OWASP Top 10 Code Fixer', trigger: 'SAST scan detects OWASP vulnerability', steps: ['Vulnerability pattern classified', 'Fix template selected from 2,400+ patterns', 'Context-aware code generated', 'Security-specific unit tests added', 'Peer fix quality scored by Cortex', 'PR with OWASP reference + remediation guide'], successRate: 93.1, totalExecutions: 1203, avgTimeToFix: '1m 28s', lastRun: '2026-02-14 07:55:44', status: 'Active', autoApprove: true, scope: 'All source code repositories' },
  { id: 'pipe-8', name: 'Compliance Drift Auto-Corrector', trigger: 'Configuration drift from compliance baseline', steps: ['Drift detected against baseline', 'Remediation action determined', 'Change validated against compliance framework', 'Applied with audit trail', 'Compliance re-scan triggered', 'Report updated automatically'], successRate: 98.2, totalExecutions: 567, avgTimeToFix: '3m 12s', lastRun: '2026-02-13 22:14:08', status: 'Active', autoApprove: false, scope: 'SOC 2, ISO 27001, HIPAA workloads' },
];

const remediationPolicies: RemediationPolicy[] = [
  { id: 'pol-1', name: 'Auto-approve critical fixes with 98%+ confidence', description: 'TITAN autonomously deploys fixes for critical vulnerabilities when confidence exceeds 98% and all regression tests pass', scope: 'All production systems', autoApprove: true, maxSeverityForAuto: 'High', requireDualReview: false, rollbackOnFailure: true, status: 'Enforced', titanOverride: true },
  { id: 'pol-2', name: 'Emergency credential rotation — zero-delay', description: 'Exposed credentials are rotated immediately without human approval. Every second of exposure is a breach risk.', scope: 'All secrets & credentials', autoApprove: true, maxSeverityForAuto: 'High', requireDualReview: false, rollbackOnFailure: false, status: 'Enforced', titanOverride: true },
  { id: 'pol-3', name: 'Dependency updates require human review', description: 'Dependency version bumps may have breaking changes — TITAN generates the PR but waits for human approval', scope: 'All package managers', autoApprove: false, maxSeverityForAuto: 'None', requireDualReview: true, rollbackOnFailure: true, status: 'Enforced', titanOverride: false },
  { id: 'pol-4', name: 'IAM changes staged with 48h monitor window', description: 'IAM permission changes are applied in monitor-only mode for 48 hours before enforcement to prevent service disruption', scope: 'Cloud IAM (AWS/GCP/Azure)', autoApprove: false, maxSeverityForAuto: 'None', requireDualReview: true, rollbackOnFailure: true, status: 'Enforced', titanOverride: false },
  { id: 'pol-5', name: 'Auto-rollback on any test failure post-deploy', description: 'If any health check or smoke test fails within 30 minutes of deployment, TITAN automatically rolls back the change', scope: 'All deployments', autoApprove: true, maxSeverityForAuto: 'High', requireDualReview: false, rollbackOnFailure: true, status: 'Enforced', titanOverride: true },
  { id: 'pol-6', name: 'Firewall remediation auto-approved for public exposure', description: 'Any rule that exposes internal services to 0.0.0.0/0 is immediately remediated without human delay', scope: 'All network security groups', autoApprove: true, maxSeverityForAuto: 'High', requireDualReview: false, rollbackOnFailure: true, status: 'Enforced', titanOverride: true },
  { id: 'pol-7', name: 'Compliance drift corrections require audit trail', description: 'All compliance-related changes must generate a full audit trail with before/after state and framework reference', scope: 'Regulated workloads', autoApprove: false, maxSeverityForAuto: 'Medium', requireDualReview: true, rollbackOnFailure: true, status: 'Enforced', titanOverride: false },
  { id: 'pol-8', name: 'TITAN decision transparency — all decisions logged', description: 'Every TITAN autonomous decision is logged with reasoning chain, confidence score, and Cortex analysis for full auditability', scope: 'All TITAN actions', autoApprove: true, maxSeverityForAuto: 'High', requireDualReview: false, rollbackOnFailure: false, status: 'Enforced', titanOverride: true },
];

const selfHealingMetrics: SelfHealingMetric[] = [
  { label: 'Mean Time to Remediate (MTTR)', value: '2m 14s', trend: 'down', trendValue: '↓ 84% vs manual (industry avg: 16 hours)', description: 'From vulnerability detection to deployed fix — fully autonomous' },
  { label: 'Auto-Remediated (30d)', value: '1,247', trend: 'up', trendValue: '↑ 34% from last month', description: 'Vulnerabilities fixed without any human intervention' },
  { label: 'Fix Success Rate', value: '96.2%', trend: 'up', trendValue: '↑ 2.1% improvement', description: 'Deployed fixes that resolved the vulnerability with zero regressions' },
  { label: 'Rollbacks (30d)', value: '3', trend: 'down', trendValue: '↓ from 7 last month', description: 'Auto-rollbacks triggered by post-deployment health check failures' },
  { label: 'Human Hours Saved (30d)', value: '2,847', trend: 'up', trendValue: '≈ $427K labor cost equivalent', description: 'Engineering hours that would have been spent on manual remediation' },
  { label: 'Cortex Confidence (avg)', value: '97.4%', trend: 'stable', trendValue: 'Consistently above 95%', description: 'Average Cortex confidence across all generated fixes' },
  { label: 'PRs Auto-Created (30d)', value: '892', trend: 'up', trendValue: '↑ 28% from last month', description: 'Pull requests generated with full context, tests, and documentation' },
  { label: 'Zero-Day Response Time', value: '< 4 min', trend: 'down', trendValue: 'Industry avg: 60+ days', description: 'Time from zero-day disclosure to protective fix deployed' },
];

const cortexInsights: RemediationInsight[] = [
  { id: 'ci-1', timestamp: '2026-02-14 09:15:00', category: 'Pattern Recognition', insight: 'TITAN has identified a recurring SQL injection pattern across 3 microservices. Root cause: shared ORM helper function `buildQuery()` in utils/db.ts uses string interpolation. Cortex recommends refactoring the shared function rather than patching individual callsites.', impact: 'Would prevent 12 future vulnerabilities across all services using this helper', cortexConfidence: 98.7, actionable: true },
  { id: 'ci-2', timestamp: '2026-02-14 08:45:00', category: 'Predictive Remediation', insight: 'Based on the CVE publication velocity for React ecosystem (4.2 CVEs/week avg), Cortex predicts 2-3 dependency vulnerabilities in the next 7 days. Pre-generating fix templates for top 5 most likely affected packages.', impact: 'Reduces future MTTR by ~60% through pre-generated fix templates', cortexConfidence: 87.3, actionable: true },
  { id: 'ci-3', timestamp: '2026-02-14 08:00:00', category: 'Architecture Weakness', insight: 'The codebase has 14 instances of direct database access without parameterized queries. While 8 have been remediated this month, 6 remain in legacy modules. Cortex recommends a systematic sweep using the OWASP Code Fixer pipeline.', impact: 'Eliminates entire attack surface class — SQL injection becomes structurally impossible', cortexConfidence: 99.1, actionable: true },
  { id: 'ci-4', timestamp: '2026-02-13 16:00:00', category: 'Self-Evolution', insight: 'TITAN remediation engine has learned 23 new fix patterns this month from successful deployments. The pattern library now contains 2,447 verified fix templates. Success rate improved from 94.1% to 96.2% through continuous self-learning.', impact: 'Every successful fix makes TITAN smarter — the AI flywheel that competitors cannot replicate', cortexConfidence: 99.9, actionable: false },
  { id: 'ci-5', timestamp: '2026-02-13 12:00:00', category: 'Cost Intelligence', insight: 'At current remediation velocity, TITAN is saving the equivalent of 6.2 full-time security engineers ($1.86M annually). The Autonomous SOC + Auto-Remediation combination has reduced the SOC alert-to-resolution pipeline from 4.2 hours to 3.1 minutes.', impact: 'Team of 5 operating at the capacity of 50+ — the core Anchor value proposition proven in metrics', cortexConfidence: 97.8, actionable: false },
  { id: 'ci-6', timestamp: '2026-02-13 08:00:00', category: 'Sovereign Intelligence', insight: 'The remediation knowledge graph now contains 847K vulnerability-fix pairs. This represents the largest privately-held cybersecurity remediation dataset globally. Every customer interaction enriches the model — creating a data moat that grows exponentially.', impact: 'Irreplicable competitive advantage — would take competitors 3+ years and $50M+ to build equivalent dataset', cortexConfidence: 99.5, actionable: false },
];

const liveEvents: LiveRemediationEvent[] = [
  { id: 'ev-1', timestamp: '09:14:33', type: 'deployed', message: 'SQL injection fix deployed to production — all 142 tests passed', severity: 'Critical', module: 'OWASP Code Fixer' },
  { id: 'ev-2', timestamp: '09:12:44', type: 'test-passed', message: 'Regression suite completed: 142/142 passed for rem-001', severity: 'Info', module: 'Test Runner' },
  { id: 'ev-3', timestamp: '09:10:22', type: 'fix-generated', message: 'TITAN generated parameterized query fix for users.ts:47', severity: 'Critical', module: 'Code Generator' },
  { id: 'ev-4', timestamp: '09:08:11', type: 'deployed', message: 'Emergency credential rotation completed — AWS key AKIA*** revoked', severity: 'Critical', module: 'Secret Rotation' },
  { id: 'ev-5', timestamp: '08:55:44', type: 'pr-created', message: 'PR #1848: lodash 4.17.20 → 4.17.22 (CVE-2026-0098)', severity: 'High', module: 'Dependency Patcher' },
  { id: 'ev-6', timestamp: '08:44:22', type: 'fix-generated', message: 'IAM policy scoped from s3:* to least-privilege set', severity: 'High', module: 'IAM Enforcer' },
  { id: 'ev-7', timestamp: '08:33:08', type: 'pr-created', message: 'Container hardening: root → non-root, dropped ALL capabilities', severity: 'Critical', module: 'Container Hardener' },
  { id: 'ev-8', timestamp: '08:22:55', type: 'deployed', message: 'Rate limiter deployed on /api/auth/login — 5 req/15min', severity: 'High', module: 'OWASP Code Fixer' },
  { id: 'ev-9', timestamp: '08:11:33', type: 'deployed', message: 'Firewall rule: SSH restricted from 0.0.0.0/0 to VPN only', severity: 'Critical', module: 'Network Remediator' },
  { id: 'ev-10', timestamp: '07:55:44', type: 'pr-created', message: 'XSS fix: dangerouslySetInnerHTML → DOMPurify sanitization', severity: 'Medium', module: 'OWASP Code Fixer' },
];

// ── Component ────────────────────────────────────────────────────────────────

const AIAutoRemediation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'live' | 'actions' | 'pipelines' | 'insights' | 'policies' | 'metrics'>('live');
  const [selectedAction, setSelectedAction] = useState<RemediationAction | null>(null);
  const [liveEventFeed, setLiveEventFeed] = useState<LiveRemediationEvent[]>(liveEvents);
  const [pulseActive, setPulseActive] = useState(true);

  const tabs = [
    { key: 'live' as const, label: '⚡ Live Feed', count: liveEventFeed.length },
    { key: 'actions' as const, label: 'Remediations', count: remediationActions.length },
    { key: 'pipelines' as const, label: 'Pipelines', count: remediationPipelines.length },
    { key: 'insights' as const, label: 'Cortex Insights', count: cortexInsights.length },
    { key: 'policies' as const, label: 'Policies', count: remediationPolicies.length },
    { key: 'metrics' as const, label: 'Self-Healing Metrics' },
  ];

  const stats = [
    { label: 'Auto-Remediated (24h)', value: '47' },
    { label: 'MTTR', value: '2m 14s' },
    { label: 'Success Rate', value: '96.2%' },
    { label: 'Human Hours Saved', value: '2,847' },
    { label: 'Fix Patterns Learned', value: '2,447' },
    { label: 'Cortex Confidence', value: '97.4%' },
  ];

  const { loading, analyzing, analysisResult, runAnalysis, clearAnalysis } = useSecurityModule('ai-auto-remediation', {
    remediationActions, remediationPipelines, remediationPolicies, selfHealingMetrics, cortexInsights, liveEvents: liveEventFeed, stats,
  });

  // Simulate live event feed
  useEffect(() => {
    if (!pulseActive) return;
    const interval = setInterval(() => {
      const newEvent: LiveRemediationEvent = {
        id: `ev-live-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        type: ['fix-generated', 'test-passed', 'pr-created', 'deployed'][Math.floor(Math.random() * 4)] as LiveRemediationEvent['type'],
        message: [
          'TITAN scanning 142 endpoints for configuration drift...',
          'Cortex confidence threshold met — fix template selected',
          'Regression test suite queued for rem-' + String(Math.floor(Math.random() * 900) + 100).padStart(3, '0'),
          'Self-healing check: all 109 modules reporting nominal',
          'Pattern library updated — 2,448 verified fix templates',
          'Autonomous pipeline heartbeat — 8/8 pipelines active',
        ][Math.floor(Math.random() * 6)],
        severity: 'Info',
        module: 'TITAN Engine',
      };
      setLiveEventFeed(prev => [newEvent, ...prev].slice(0, 20));
    }, 8000);
    return () => clearInterval(interval);
  }, [pulseActive]);

  const severityColor = (s: string) => { switch (s) { case 'Critical': return 'text-red-400'; case 'High': return 'text-orange-400'; case 'Medium': return 'text-yellow-400'; case 'Low': return 'text-blue-400'; default: return 'text-slate-400'; } };
  const severityBg = (s: string) => { switch (s) { case 'Critical': return 'bg-red-900/30 border-red-800'; case 'High': return 'bg-orange-900/30 border-orange-800'; case 'Medium': return 'bg-yellow-900/30 border-yellow-800'; default: return 'bg-slate-800 border-slate-700'; } };
  const statusColor = (s: string) => { switch (s) { case 'Deployed': return 'text-green-400 bg-green-900/30'; case 'Approved': return 'text-blue-400 bg-blue-900/30'; case 'PR Created': return 'text-cyan-400 bg-cyan-900/30'; case 'Testing': return 'text-yellow-400 bg-yellow-900/30'; case 'Validating': return 'text-amber-400 bg-amber-900/30'; case 'Generated': return 'text-purple-400 bg-purple-900/30'; case 'Rolled Back': return 'text-red-400 bg-red-900/30'; case 'Rejected': return 'text-red-400 bg-red-900/30'; default: return 'text-slate-400 bg-slate-800'; } };
  const eventTypeIcon = (t: string) => { switch (t) { case 'fix-generated': return '🔧'; case 'test-passed': return '✅'; case 'pr-created': return '📋'; case 'deployed': return '🚀'; case 'rollback': return '⏪'; case 'escalated': return '🔔'; default: return '⚡'; } };
  const confidenceColor = (c: number) => c >= 98 ? 'text-green-400' : c >= 95 ? 'text-emerald-400' : c >= 90 ? 'text-yellow-400' : 'text-orange-400';

  if (loading) return (<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="text-center space-y-4"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-400 mx-auto" /><p className="text-slate-400 text-sm">TITAN Self-Healing Engine initializing...</p></div></div>);

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* ── Sovereign Header ── */}
      <div className="bg-linear-to-r from-violet-950 via-slate-900 to-purple-950 border-b border-violet-800/50 px-6 py-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-violet-400 via-purple-400 to-fuchsia-400">AI Auto-Remediation</h1>
              <span className="bg-violet-900 text-violet-300 text-xs font-bold px-2.5 py-1 rounded-full border border-violet-700 animate-pulse">WORLD FIRST</span>
              <span className="bg-purple-900/60 text-purple-300 text-xs font-semibold px-2.5 py-1 rounded-full border border-purple-700">TITAN ENGINE</span>
            </div>
            <p className="text-slate-400 mt-1 max-w-3xl">The self-healing nervous system of the Anchor organism. TITAN autonomously generates, validates, tests, and deploys security fixes — turning detection into resolution in seconds, not days. <span className="text-violet-400 font-medium">No other cybersecurity platform on Earth does this.</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setPulseActive(!pulseActive)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${pulseActive ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
              <span className={pulseActive ? 'animate-pulse' : ''}>●</span> {pulseActive ? 'Live' : 'Paused'}
            </button>
            <button onClick={() => runAnalysis()} disabled={analyzing} className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">{analyzing ? 'Cortex Analyzing…' : '🧠 Cortex Analysis'}</button>
          </div>
        </div>

        {/* ── Sovereign Organism Banner ── */}
        <div className="mt-4 bg-slate-900/60 border border-violet-800/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧬</span>
            <div>
              <h3 className="text-sm font-semibold text-violet-300">SOVEREIGN INTELLIGENCE — Self-Healing Cybersecurity</h3>
              <p className="text-xs text-slate-400 mt-1">Like white blood cells responding to infection, TITAN doesn't wait for human intervention. It identifies the vulnerability, generates the fix, validates it against your codebase, runs regression tests, and deploys — all within seconds. This is the bridge between detection and resolution that transforms Anchor from a security platform into a <span className="text-violet-400 font-medium">living, self-repairing organism</span>.</p>
            </div>
          </div>
        </div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
          {stats.map(s => (
            <div key={s.label} className="bg-slate-800/80 border border-slate-700/50 rounded-xl p-3">
              <div className="text-slate-400 text-xs">{s.label}</div>
              <div className="text-xl font-bold mt-1 text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-purple-400">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="px-6 pt-4">
        <div className="flex gap-1 border-b border-slate-700 pb-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === t.key ? 'bg-slate-800 text-violet-400 border border-b-0 border-slate-700' : 'text-slate-400 hover:text-white'}`}>
              {t.label}
              {t.count !== undefined && <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-violet-900 text-violet-300' : 'bg-slate-700 text-slate-400'}`}>{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-4 space-y-4">
        {/* ── Live Feed Tab ── */}
        {activeTab === 'live' && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-violet-700/30 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className={pulseActive ? 'animate-pulse text-green-400' : 'text-slate-500'}>●</span>
                  TITAN Self-Healing Live Feed
                </h2>
                <span className="text-xs text-slate-500">Auto-refreshing every 8 seconds</span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {liveEventFeed.map(ev => (
                  <div key={ev.id} className={`bg-slate-900 border rounded-lg p-3 text-sm flex items-center gap-3 transition-all ${ev.severity === 'Critical' ? 'border-red-800/50' : ev.severity === 'High' ? 'border-orange-800/50' : 'border-slate-700'}`}>
                    <span className="text-lg">{eventTypeIcon(ev.type)}</span>
                    <div className="flex-1">
                      <span className="text-slate-300">{ev.message}</span>
                      <span className="ml-2 text-xs text-slate-500">[{ev.module}]</span>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">{ev.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Remediation Actions Tab ── */}
        {activeTab === 'actions' && (
          <div className="space-y-4">
            {selectedAction ? (
              <div className="space-y-4">
                <button onClick={() => setSelectedAction(null)} className="text-sm text-violet-400 hover:text-violet-300 flex items-center gap-1">← Back to all remediations</button>
                <div className={`border rounded-xl p-6 space-y-4 ${severityBg(selectedAction.severity)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedAction.vulnerability}</h2>
                      <div className="flex items-center gap-3 mt-1 text-sm">
                        {selectedAction.cveId && <span className="text-cyan-400 font-mono">{selectedAction.cveId}</span>}
                        <span className={severityColor(selectedAction.severity)}>{selectedAction.severity}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(selectedAction.status)}`}>{selectedAction.status}</span>
                        <span className="text-slate-500">{selectedAction.timestamp}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Time to Remediate</div>
                      <div className="text-2xl font-bold text-violet-400">{selectedAction.ttRemediate}</div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-900/80 rounded-lg p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-slate-300">Vulnerability</h3>
                      <p className="text-sm text-slate-400">{selectedAction.description}</p>
                      <div className="text-xs text-slate-500">File: <span className="text-cyan-400 font-mono">{selectedAction.affectedFile}</span></div>
                      <div className="text-xs text-slate-500">Component: {selectedAction.affectedComponent}</div>
                    </div>
                    <div className="bg-slate-900/80 rounded-lg p-4 space-y-2">
                      <h3 className="text-sm font-semibold text-slate-300">TITAN Fix</h3>
                      <p className="text-sm text-slate-400">{selectedAction.fixDescription}</p>
                      <div className="text-xs text-slate-500">Type: <span className="text-violet-400">{selectedAction.remediationType}</span></div>
                      <div className="text-xs text-slate-500">Confidence: <span className={confidenceColor(selectedAction.confidence)}>{selectedAction.confidence}%</span></div>
                    </div>
                  </div>

                  {selectedAction.codeChange && (
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold text-slate-300">Code Change</h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-3">
                          <div className="text-xs text-red-400 mb-1 font-semibold">BEFORE (Vulnerable)</div>
                          <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">{selectedAction.codeChange.before}</pre>
                        </div>
                        <div className="bg-green-950/30 border border-green-900/50 rounded-lg p-3">
                          <div className="text-xs text-green-400 mb-1 font-semibold">AFTER (TITAN Fix)</div>
                          <pre className="text-xs text-green-300 whitespace-pre-wrap font-mono">{selectedAction.codeChange.after}</pre>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="bg-slate-900/80 rounded-lg p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-slate-300">Regression Tests</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 bg-slate-800 rounded-full h-3 overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${(selectedAction.regressionTests.passed / selectedAction.regressionTests.total) * 100}%` }} />
                      </div>
                      <span className="text-sm font-mono">
                        <span className="text-green-400">{selectedAction.regressionTests.passed}</span>
                        {selectedAction.regressionTests.failed > 0 && <> / <span className="text-red-400">{selectedAction.regressionTests.failed} failed</span></>}
                        <span className="text-slate-500"> / {selectedAction.regressionTests.total}</span>
                      </span>
                    </div>
                  </div>

                  <div className="bg-violet-950/30 border border-violet-800/50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🤖</span>
                      <h3 className="text-sm font-semibold text-violet-300">TITAN Decision Reasoning</h3>
                    </div>
                    <p className="text-sm text-slate-300">{selectedAction.titanDecision}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500">Cortex Confidence: <span className={confidenceColor(selectedAction.cortexConfidence)}>{selectedAction.cortexConfidence}%</span></span>
                      <span className="text-slate-500">Human Approval: <span className={selectedAction.humanApprovalRequired ? 'text-yellow-400' : 'text-green-400'}>{selectedAction.humanApprovalRequired ? 'Required' : 'Autonomous'}</span></span>
                      {selectedAction.prUrl && <a href={selectedAction.prUrl} className="text-cyan-400 hover:text-cyan-300">View PR →</a>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
                <h2 className="text-lg font-semibold">Remediation Actions</h2>
                <p className="text-xs text-slate-500">Click any remediation to see full TITAN decision reasoning, code diffs, and test results</p>
                {remediationActions.map(a => (
                  <button key={a.id} onClick={() => setSelectedAction(a)} className={`w-full text-left border rounded-lg p-4 text-sm space-y-2 hover:border-violet-600 transition-colors ${severityBg(a.severity)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${severityColor(a.severity)}`}>{a.severity}</span>
                        <span className="text-white font-medium">{a.vulnerability}</span>
                        {a.cveId && <span className="text-cyan-400 font-mono text-xs">{a.cveId}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor(a.status)}`}>{a.status}</span>
                        <span className="text-violet-400 text-xs font-mono">{a.ttRemediate}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{a.affectedFile} · {a.remediationType}</span>
                      <span className="flex items-center gap-2">
                        <span>Tests: <span className="text-green-400">{a.regressionTests.passed}/{a.regressionTests.total}</span></span>
                        <span>Confidence: <span className={confidenceColor(a.confidence)}>{a.confidence}%</span></span>
                        {!a.humanApprovalRequired && <span className="bg-violet-900/50 text-violet-300 px-1.5 py-0.5 rounded">Autonomous</span>}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Pipelines Tab ── */}
        {activeTab === 'pipelines' && (
          <div className="space-y-4">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-1">Autonomous Remediation Pipelines</h2>
              <p className="text-xs text-slate-500 mb-4">Self-healing workflows that detect, fix, test, and deploy security patches without human intervention</p>
              {remediationPipelines.map(p => (
                <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-3 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{p.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'Active' ? 'bg-green-900/50 text-green-400' : p.status === 'Paused' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>{p.status}</span>
                      {p.autoApprove && <span className="bg-violet-900/50 text-violet-300 text-xs px-2 py-0.5 rounded">Auto-Approve</span>}
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <span className="text-green-400 font-semibold">{p.successRate}%</span> success · {p.totalExecutions.toLocaleString()} runs
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">Trigger: <span className="text-cyan-400">{p.trigger}</span></div>
                  <div className="flex flex-wrap gap-1">
                    {p.steps.map((step, i) => (
                      <React.Fragment key={i}>
                        <span className="bg-slate-800 border border-slate-600 text-slate-300 text-xs px-2 py-1 rounded">{i + 1}. {step}</span>
                        {i < p.steps.length - 1 && <span className="text-violet-500 self-center">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Avg fix time: <span className="text-violet-400">{p.avgTimeToFix}</span></span>
                    <span>Scope: {p.scope}</span>
                    <span>Last run: {p.lastRun}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Cortex Insights Tab ── */}
        {activeTab === 'insights' && (
          <div className="space-y-4">
            <div className="bg-linear-to-r from-violet-950/50 to-purple-950/50 border border-violet-800/30 rounded-xl p-4 mb-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🧠</span>
                <h2 className="text-lg font-semibold text-violet-300">The Cortex — Intelligence Core</h2>
              </div>
              <p className="text-xs text-slate-400">The Cortex is the intelligence core of the Anchor organism — a self-evolving AI that learns from every remediation, predicts future vulnerabilities, and builds an irreplicable knowledge graph. Every fix makes it smarter. Every customer interaction deepens the moat.</p>
            </div>
            {cortexInsights.map(ci => (
              <div key={ci.id} className={`border rounded-xl p-4 space-y-2 ${ci.actionable ? 'bg-violet-950/20 border-violet-800/40' : 'bg-slate-800 border-slate-700'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-violet-400 bg-violet-900/50 px-2 py-0.5 rounded">{ci.category}</span>
                    {ci.actionable && <span className="text-xs text-green-400">Actionable</span>}
                  </div>
                  <span className="text-xs text-slate-500">{ci.timestamp}</span>
                </div>
                <p className="text-sm text-slate-300">{ci.insight}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Impact: <span className="text-slate-300">{ci.impact}</span></span>
                  <span className="text-slate-500">Cortex Confidence: <span className={confidenceColor(ci.cortexConfidence)}>{ci.cortexConfidence}%</span></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Policies Tab ── */}
        {activeTab === 'policies' && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
            <h2 className="text-lg font-semibold">Remediation Policies</h2>
            <p className="text-xs text-slate-500">Governance guardrails for autonomous remediation — the rules that define how TITAN operates</p>
            {remediationPolicies.map(p => (
              <div key={p.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">{p.name}</span>
                  <div className="flex items-center gap-2">
                    {p.titanOverride && <span className="bg-violet-900/50 text-violet-300 text-xs px-2 py-0.5 rounded">TITAN Override</span>}
                    <span className={`text-xs px-2 py-0.5 rounded ${p.status === 'Enforced' ? 'bg-green-900/50 text-green-400' : p.status === 'Draft' ? 'bg-yellow-900/50 text-yellow-400' : 'bg-slate-700 text-slate-400'}`}>{p.status}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">{p.description}</p>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  <span>Scope: {p.scope}</span>
                  <span>Auto-approve: <span className={p.autoApprove ? 'text-green-400' : 'text-yellow-400'}>{p.autoApprove ? 'Yes' : 'No'}</span></span>
                  {p.maxSeverityForAuto !== 'None' && <span>Max auto severity: <span className="text-orange-400">{p.maxSeverityForAuto}</span></span>}
                  {p.requireDualReview && <span className="text-yellow-400">Dual review required</span>}
                  {p.rollbackOnFailure && <span className="text-blue-400">Auto-rollback enabled</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Self-Healing Metrics Tab ── */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="bg-linear-to-r from-violet-950/50 to-purple-950/50 border border-violet-800/30 rounded-xl p-4">
              <h2 className="text-lg font-semibold text-violet-300 mb-1">Self-Healing Organism Metrics</h2>
              <p className="text-xs text-slate-400">The vital signs of the Anchor organism — measuring how effectively the platform heals itself, learns from every interaction, and evolves its defensive capabilities autonomously.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {selfHealingMetrics.map(m => (
                <div key={m.label} className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-300">{m.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${m.trend === 'up' ? 'bg-green-900/50 text-green-400' : m.trend === 'down' ? 'bg-blue-900/50 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                      {m.trendValue}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-purple-400">{m.value}</div>
                  <p className="text-xs text-slate-500">{m.description}</p>
                </div>
              ))}
            </div>

            {/* Organism health visualization */}
            <div className="bg-slate-800 border border-violet-700/30 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-violet-300">🧬 Organism Health — Self-Evolution Status</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-2xl">🧠</div>
                  <div className="text-xs text-slate-400 mt-1">Cortex</div>
                  <div className="text-sm font-semibold text-green-400">Optimal</div>
                  <div className="text-xs text-slate-500">2,447 patterns</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-2xl">⚡</div>
                  <div className="text-xs text-slate-400 mt-1">TITAN Engine</div>
                  <div className="text-sm font-semibold text-green-400">Active</div>
                  <div className="text-xs text-slate-500">8/8 pipelines</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-2xl">🛡️</div>
                  <div className="text-xs text-slate-400 mt-1">Immune System</div>
                  <div className="text-sm font-semibold text-green-400">96.2% efficacy</div>
                  <div className="text-xs text-slate-500">Self-healing active</div>
                </div>
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-2xl">🔄</div>
                  <div className="text-xs text-slate-400 mt-1">Evolution</div>
                  <div className="text-sm font-semibold text-green-400">+23 patterns/mo</div>
                  <div className="text-xs text-slate-500">Continuous learning</div>
                </div>
              </div>
            </div>

            {/* Comparison section */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300">Industry Comparison — Why This Changes Everything</h3>
              <div className="space-y-2">
                {[
                  { metric: 'Mean Time to Remediate', anchor: '2m 14s', industry: '16 hours', improvement: '430x faster' },
                  { metric: 'Fix Success Rate', anchor: '96.2%', industry: '~60% (manual)', improvement: '1.6x higher' },
                  { metric: 'Zero-Day Response', anchor: '< 4 minutes', industry: '60+ days', improvement: '21,600x faster' },
                  { metric: 'Human Hours Required', anchor: '0 (autonomous)', industry: '4.2 hrs/vuln avg', improvement: '∞ efficiency' },
                  { metric: 'Coverage', anchor: '8 fix categories', industry: '1-2 per vendor', improvement: '4-8x broader' },
                  { metric: 'Learning Rate', anchor: '+23 patterns/month', industry: 'Static rules', improvement: 'Self-evolving' },
                ].map(c => (
                  <div key={c.metric} className="bg-slate-900 rounded-lg p-3 flex items-center justify-between text-sm">
                    <span className="text-slate-400 w-48">{c.metric}</span>
                    <span className="text-violet-400 font-semibold">{c.anchor}</span>
                    <span className="text-slate-600">vs</span>
                    <span className="text-red-400">{c.industry}</span>
                    <span className="text-green-400 text-xs font-medium bg-green-900/30 px-2 py-0.5 rounded">{c.improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── AI Analysis Result ── */}
        {analysisResult && (
          <div className="bg-slate-800 border border-violet-700 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-violet-400">🧠 Cortex Analysis</h2>
              <button onClick={() => clearAnalysis()} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <pre className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAutoRemediation;
