/**
 * Type definitions for Anchor CLI
 */

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  id: string;
  rule: string;
  severity: Severity;
  message: string;
  file: string;
  line?: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  snippet?: string;
  cwe?: string;
  owasp?: string;
  fix?: string;
  references?: string[];
  metadata?: Record<string, any>;
}

export interface ScanResult {
  id?: string;
  version: string;
  scanTime: string;
  target: string;
  filesScanned: number;
  findings: Finding[];
  scannersRun?: string[];
  duration?: number;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
}

export interface ScanOptions {
  output?: string;
  format?: 'json' | 'sarif' | 'table' | 'markdown';
  severity?: string;
  ignore?: string | string[];
  config?: string;
  secrets?: boolean;
  sast?: boolean;
  deps?: boolean;
  iac?: boolean;
  docker?: boolean;
  ci?: boolean;
  failOn?: string;
  json?: boolean;
  sarif?: boolean;
  quiet?: boolean;
  verbose?: boolean;
  rules?: Record<string, 'error' | 'warning' | 'off'>;
  fix?: boolean;
  fixDryRun?: boolean;
}

export interface Config {
  version?: string;
  severity?: string;
  failOn?: string;
  ignore?: string[];
  scanners?: {
    secrets?: boolean;
    sast?: boolean;
    dependencies?: boolean;
    iac?: boolean;
    dockerfile?: boolean;
  };
  rules?: Record<string, 'error' | 'warning' | 'off'>;
}

export interface Rule {
  id: string;
  name: string;
  severity: Severity;
  pattern: RegExp;
  message: string;
  cwe?: string;
  owasp?: string;
  fix?: string;
  languages?: string[];
  filePatterns?: string[];
}

export interface FixResult {
  success: boolean;
  file: string;
  action: 'created' | 'updated' | 'redacted' | 'suggestion' | 'skipped' | 'failed';
  message: string;
  suggestion?: string;
}

export interface FixOptions {
  removeSecretsFromDocs?: boolean;
  updateDeps?: boolean;
  createGitignore?: boolean;
  createEnvExample?: boolean;
  dryRun?: boolean;
}
