import fs from 'fs';
import path from 'path';
import { ScannerFinding } from './types';

const SECRET_PATTERNS: Array<{ name: string; regex: RegExp; severity: 'HIGH' | 'MEDIUM' }> = [
  { name: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g, severity: 'HIGH' },
  { name: 'GitHub Token', regex: /ghp_[A-Za-z0-9]{36,}/g, severity: 'HIGH' },
  { name: 'Generic API Key', regex: /(api_key|apikey|secret|token)\s*[:=]\s*['"][A-Za-z0-9-_]{16,}['"]/gi, severity: 'MEDIUM' },
];

export function scanSecrets(root: string, files: string[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];

  for (const file of files) {
    const fullPath = path.join(root, file);
    if (!isTextFile(fullPath)) continue;

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.regex.test(line)) {
          findings.push({
            title: `${pattern.name} detected`,
            type: 'Secret Exposure',
            severity: pattern.severity,
            description: `Potential ${pattern.name} found in source code.`,
            guidance: 'Remove secrets from code, rotate exposed keys, and use a secret manager.',
            reproduction: `Check ${file} line ${index + 1} for the exposed value.`,
            filePath: file,
            lineNumber: index + 1,
          });
        }
      }
    });
  }

  return findings;
}

function isTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.json',
    '.env',
    '.yml',
    '.yaml',
    '.tf',
    '.md',
  ].includes(ext);
}
