import fs from 'fs';
import path from 'path';
import { ScannerFinding } from './types';

const DEPRECATED_PACKAGES = ['request', 'left-pad', 'event-stream'];

export function scanDependencies(root: string): ScannerFinding[] {
  const findings: ScannerFinding[] = [];
  const pkgPath = path.join(root, 'package.json');

  if (!fs.existsSync(pkgPath)) {
    return findings;
  }

  const content = fs.readFileSync(pkgPath, 'utf-8');
  const pkg = JSON.parse(content);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;

  for (const dep of Object.keys(deps ?? {})) {
    if (DEPRECATED_PACKAGES.includes(dep)) {
      findings.push({
        title: `Deprecated dependency: ${dep}`,
        type: 'Dependency Risk',
        severity: 'MEDIUM',
        description: `${dep} is deprecated or known to be risky.`,
        guidance: 'Replace deprecated dependencies and run npm audit to validate.',
        reproduction: `Check package.json dependency list for ${dep}.`,
      });
    }
  }

  return findings;
}
