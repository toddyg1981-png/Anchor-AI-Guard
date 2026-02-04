import fs from 'fs';
import path from 'path';
import { ScannerFinding } from './types';

export function scanIaC(root: string, files: string[]): ScannerFinding[] {
  const findings: ScannerFinding[] = [];

  const terraformFiles = files.filter((file) => file.endsWith('.tf') || file.endsWith('.tfvars'));
  for (const file of terraformFiles) {
    const fullPath = path.join(root, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    if (content.includes('0.0.0.0/0') && content.includes('ingress')) {
      findings.push({
        title: 'Open ingress rule detected',
        type: 'IaC Misconfiguration',
        severity: 'HIGH',
        description: 'Terraform configuration allows open ingress from 0.0.0.0/0.',
        guidance: 'Restrict ingress rules to trusted IP ranges and least privilege ports.',
        reproduction: `Review ${file} for ingress rules allowing 0.0.0.0/0.`,
        filePath: file,
      });
    }
  }

  return findings;
}
