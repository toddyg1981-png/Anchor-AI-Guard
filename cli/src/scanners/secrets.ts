/**
 * Secrets Scanner - Detect hardcoded secrets, API keys, passwords
 * Based on patterns from TruffleHog, GitLeaks, and custom rules
 */

import fs from 'fs';
import path from 'path';
import { Finding, Rule } from '../types';

const SECRET_RULES: Rule[] = [
  // AWS
  {
    id: 'aws-access-key',
    name: 'AWS Access Key',
    severity: 'critical',
    pattern: /\b(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}\b/g,
    message: 'Hardcoded AWS Access Key ID detected',
    cwe: 'CWE-798',
  },
  {
    id: 'aws-secret-key',
    name: 'AWS Secret Key',
    severity: 'critical',
    pattern: /(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g,
    message: 'Potential AWS Secret Access Key detected',
    cwe: 'CWE-798',
  },
  // GCP
  {
    id: 'gcp-api-key',
    name: 'GCP API Key',
    severity: 'critical',
    pattern: /AIza[0-9A-Za-z_-]{35}/g,
    message: 'Google Cloud API Key detected',
    cwe: 'CWE-798',
  },
  {
    id: 'gcp-service-account',
    name: 'GCP Service Account',
    severity: 'critical',
    pattern: /"type":\s*"service_account"/g,
    message: 'GCP Service Account JSON key file detected',
    cwe: 'CWE-798',
    filePatterns: ['*.json'],
  },
  // Azure
  {
    id: 'azure-storage-key',
    name: 'Azure Storage Key',
    severity: 'critical',
    pattern: /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+/=]{88}/g,
    message: 'Azure Storage Account connection string detected',
    cwe: 'CWE-798',
  },
  // GitHub
  {
    id: 'github-token',
    name: 'GitHub Token',
    severity: 'critical',
    pattern: /\b(ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|ghu_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36}|ghr_[a-zA-Z0-9]{36})\b/g,
    message: 'GitHub Personal Access Token detected',
    cwe: 'CWE-798',
  },
  {
    id: 'github-app-token',
    name: 'GitHub App Token',
    severity: 'critical',
    pattern: /\b(ghu_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59})\b/g,
    message: 'GitHub App Token detected',
    cwe: 'CWE-798',
  },
  // GitLab
  {
    id: 'gitlab-token',
    name: 'GitLab Token',
    severity: 'critical',
    pattern: /\bglpat-[a-zA-Z0-9_-]{20,}\b/g,
    message: 'GitLab Personal Access Token detected',
    cwe: 'CWE-798',
  },
  // Slack
  {
    id: 'slack-token',
    name: 'Slack Token',
    severity: 'high',
    pattern: /\b(xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9-]*)\b/g,
    message: 'Slack API Token detected',
    cwe: 'CWE-798',
  },
  {
    id: 'slack-webhook',
    name: 'Slack Webhook',
    severity: 'high',
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[a-zA-Z0-9_]{8}\/B[a-zA-Z0-9_]{8,}\/[a-zA-Z0-9_]{24}/g,
    message: 'Slack Webhook URL detected',
    cwe: 'CWE-798',
  },
  // Database
  {
    id: 'database-url',
    name: 'Database URL',
    severity: 'critical',
    pattern: /(mongodb|postgres|postgresql|mysql|redis|amqp):\/\/[^:]+:[^@]+@[^\s'"]+/gi,
    message: 'Database connection string with credentials detected',
    cwe: 'CWE-798',
  },
  // Private Keys
  {
    id: 'private-key-rsa',
    name: 'RSA Private Key',
    severity: 'critical',
    pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    message: 'Private key detected in source code',
    cwe: 'CWE-321',
  },
  {
    id: 'private-key-pkcs8',
    name: 'PKCS8 Private Key',
    severity: 'critical',
    pattern: /-----BEGIN ENCRYPTED PRIVATE KEY-----/g,
    message: 'Encrypted private key detected',
    cwe: 'CWE-321',
  },
  // Generic Secrets
  {
    id: 'api-key-generic',
    name: 'Generic API Key',
    severity: 'high',
    pattern: /(?:api[_-]?key|apikey|api[_-]?secret)['":\s]*[=:]\s*['"]([a-zA-Z0-9_-]{20,})['"]?/gi,
    message: 'Hardcoded API key detected',
    cwe: 'CWE-798',
  },
  {
    id: 'password-assignment',
    name: 'Hardcoded Password',
    severity: 'high',
    pattern: /(?:password|passwd|pwd|secret)['":\s]*[=:]\s*['"]([^'"]{8,})['"](?!\s*(?:process\.env|getenv|os\.environ))/gi,
    message: 'Hardcoded password detected',
    cwe: 'CWE-798',
  },
  // JWT
  {
    id: 'jwt-token',
    name: 'JWT Token',
    severity: 'medium',
    pattern: /\beyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,
    message: 'JWT token detected in source code',
    cwe: 'CWE-798',
  },
  // Stripe
  {
    id: 'stripe-api-key',
    name: 'Stripe API Key',
    severity: 'critical',
    pattern: /\b(sk_live_[0-9a-zA-Z]{24,}|rk_live_[0-9a-zA-Z]{24,})\b/g,
    message: 'Stripe Live API Key detected',
    cwe: 'CWE-798',
  },
  {
    id: 'stripe-test-key',
    name: 'Stripe Test Key',
    severity: 'low',
    pattern: /\b(sk_test_[0-9a-zA-Z]{24,}|rk_test_[0-9a-zA-Z]{24,})\b/g,
    message: 'Stripe Test API Key detected (consider using environment variables)',
    cwe: 'CWE-798',
  },
  // Twilio
  {
    id: 'twilio-api-key',
    name: 'Twilio API Key',
    severity: 'critical',
    pattern: /\bSK[a-f0-9]{32}\b/g,
    message: 'Twilio API Key detected',
    cwe: 'CWE-798',
  },
  // SendGrid
  {
    id: 'sendgrid-api-key',
    name: 'SendGrid API Key',
    severity: 'critical',
    pattern: /\bSG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}\b/g,
    message: 'SendGrid API Key detected',
    cwe: 'CWE-798',
  },
  // NPM
  {
    id: 'npm-token',
    name: 'NPM Token',
    severity: 'critical',
    pattern: /\b(npm_[a-zA-Z0-9]{36})\b/g,
    message: 'NPM Access Token detected',
    cwe: 'CWE-798',
  },
  // Heroku
  {
    id: 'heroku-api-key',
    name: 'Heroku API Key',
    severity: 'critical',
    pattern: /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/g,
    message: 'Potential Heroku API Key (UUID format) detected',
    cwe: 'CWE-798',
  },
];

// Files to skip
const SKIP_EXTENSIONS = [
  '.min.js', '.bundle.js', '.map',
  '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico',
  '.woff', '.woff2', '.ttf', '.eot',
  '.pdf', '.doc', '.docx',
  '.zip', '.tar', '.gz',
  '.lock', '.sum',
];

const SKIP_FILES = [
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  'composer.lock',
  'Gemfile.lock',
  'go.sum',
];

export async function scanSecrets(basePath: string, files: string[]): Promise<Finding[]> {
  const findings: Finding[] = [];

  for (const file of files) {
    // Skip binary/lock files
    if (SKIP_EXTENSIONS.some(ext => file.endsWith(ext))) continue;
    if (SKIP_FILES.includes(path.basename(file))) continue;

    const fullPath = path.join(basePath, file);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (const rule of SECRET_RULES) {
        // Check file pattern filter
        if (rule.filePatterns) {
          const matches = rule.filePatterns.some(pattern => {
            const regex = new RegExp(pattern.replace('*', '.*'));
            return regex.test(file);
          });
          if (!matches) continue;
        }

        // Reset regex state
        rule.pattern.lastIndex = 0;

        let match;
        while ((match = rule.pattern.exec(content)) !== null) {
          // Find line number
          const upToMatch = content.slice(0, match.index);
          const lineNumber = upToMatch.split('\n').length;
          const lineContent = lines[lineNumber - 1] || '';

          // Skip if in comment
          if (isInComment(lineContent, content, match.index)) continue;

          // Skip if it's a test/example file
          if (isTestFile(file)) continue;

          // Mask the secret for reporting
          const maskedSecret = maskSecret(match[0]);

          findings.push({
            id: `${rule.id}-${findings.length}`,
            rule: rule.id,
            severity: rule.severity,
            message: `${rule.message}: ${maskedSecret}`,
            file,
            line: lineNumber,
            cwe: rule.cwe,
            fix: 'Move sensitive data to environment variables or a secrets manager',
          });
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return findings;
}

function isInComment(line: string, _content: string, _index: number): boolean {
  const trimmed = line.trim();
  return (
    trimmed.startsWith('//') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('*') ||
    trimmed.startsWith('/*')
  );
}

function isTestFile(file: string): boolean {
  const testPatterns = [
    /\.test\./i,
    /\.spec\./i,
    /__tests__/i,
    /test\//i,
    /tests\//i,
    /\.example\./i,
    /example\//i,
    /mock/i,
    /fixture/i,
  ];
  return testPatterns.some(p => p.test(file));
}

function maskSecret(secret: string): string {
  if (secret.length <= 8) return '****';
  return secret.slice(0, 4) + '...' + secret.slice(-4);
}
