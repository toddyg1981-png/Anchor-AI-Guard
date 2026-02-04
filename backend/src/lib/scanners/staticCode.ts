import fs from 'fs';
import path from 'path';
import { ScannerFinding } from './types';

const CODE_PATTERNS: Array<{ name: string; regex: RegExp; severity: 'HIGH' | 'MEDIUM' }> = [
  { name: 'Use of eval()', regex: /\beval\s*\(/g, severity: 'HIGH' },
  { name: 'Use of Function constructor', regex: /new Function\s*\(/g, severity: 'HIGH' },
  { name: 'InnerHTML assignment', regex: /\.innerHTML\s*=\s*/g, severity: 'MEDIUM' },
  { name: 'dangerouslySetInnerHTML', regex: /dangerouslySetInnerHTML/g, severity: 'MEDIUM' },
];

export function scanStaticCode(root: string, files: string[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];

  for (const file of files) {
    const fullPath = path.join(root, file);
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(path.extname(fullPath))) continue;

    const content = fs.readFileSync(fullPath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const pattern of CODE_PATTERNS) {
        if (pattern.regex.test(line)) {
          findings.push({
            title: pattern.name,
            type: 'Static Code Risk',
            severity: pattern.severity,
            description: `Potentially unsafe pattern detected: ${pattern.name}.`,
            guidance: 'Avoid dynamic code execution and ensure user input is properly sanitized.',
            reproduction: `Review ${file} line ${index + 1}.`,
            filePath: file,
            lineNumber: index + 1,
          });
        }
      }
    });
  }

  return findings;
}
