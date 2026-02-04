import fs from 'fs';
import path from 'path';
import { ScannerFinding } from './types';

export function scanDockerfile(root: string, files: string[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];

  const dockerfiles = files.filter((file) => path.basename(file).toLowerCase() === 'dockerfile');
  for (const file of dockerfiles) {
    const fullPath = path.join(root, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    const hasUser = /\bUSER\b/i.test(content);
    if (!hasUser) {
      findings.push({
        title: 'Dockerfile runs as root',
        type: 'Container Hardening',
        severity: 'MEDIUM',
        description: 'Dockerfile does not specify a non-root user.',
        guidance: 'Add a non-root user and switch to it with the USER directive.',
        reproduction: `Add USER in ${file}.`,
        filePath: file,
      });
    }
  }

  return findings;
}
