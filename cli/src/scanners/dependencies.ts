/**
 * Dependency Scanner - Scan for vulnerable dependencies
 * Checks package.json, requirements.txt, go.mod, etc.
 */

import fs from 'fs';
import path from 'path';
import semver from 'semver';
import { Finding, Severity } from '../types';

interface VulnerablePackage {
  name: string;
  ecosystem: 'npm' | 'pip' | 'go' | 'cargo' | 'maven';
  vulnerableVersions: string;
  fixedVersion?: string;
  severity: Severity;
  cve?: string;
  summary: string;
}

// Known vulnerable packages database
// In production, this would be fetched from OSV, NVD, or commercial APIs
const VULNERABLE_PACKAGES: VulnerablePackage[] = [
  // NPM
  { name: 'lodash', ecosystem: 'npm', vulnerableVersions: '<4.17.21', fixedVersion: '4.17.21', severity: 'high', cve: 'CVE-2021-23337', summary: 'Command Injection in lodash' },
  { name: 'axios', ecosystem: 'npm', vulnerableVersions: '<1.6.0', fixedVersion: '1.6.0', severity: 'medium', cve: 'CVE-2023-45857', summary: 'SSRF vulnerability in axios' },
  { name: 'minimist', ecosystem: 'npm', vulnerableVersions: '<1.2.6', fixedVersion: '1.2.6', severity: 'critical', cve: 'CVE-2021-44906', summary: 'Prototype Pollution in minimist' },
  { name: 'json5', ecosystem: 'npm', vulnerableVersions: '<2.2.2', fixedVersion: '2.2.2', severity: 'high', cve: 'CVE-2022-46175', summary: 'Prototype Pollution in json5' },
  { name: 'express', ecosystem: 'npm', vulnerableVersions: '<4.19.2', fixedVersion: '4.19.2', severity: 'medium', cve: 'CVE-2024-29041', summary: 'Open redirect in express' },
  { name: 'follow-redirects', ecosystem: 'npm', vulnerableVersions: '<1.15.4', fixedVersion: '1.15.4', severity: 'medium', cve: 'CVE-2024-28849', summary: 'SSRF in follow-redirects' },
  { name: 'semver', ecosystem: 'npm', vulnerableVersions: '<7.5.2', fixedVersion: '7.5.2', severity: 'medium', cve: 'CVE-2022-25883', summary: 'ReDoS in semver' },
  { name: 'tar', ecosystem: 'npm', vulnerableVersions: '<6.2.1', fixedVersion: '6.2.1', severity: 'high', cve: 'CVE-2024-28863', summary: 'Arbitrary File Creation in tar' },
  { name: 'qs', ecosystem: 'npm', vulnerableVersions: '<6.10.3', fixedVersion: '6.10.3', severity: 'high', cve: 'CVE-2022-24999', summary: 'Prototype Pollution in qs' },
  { name: 'node-fetch', ecosystem: 'npm', vulnerableVersions: '<2.6.7', fixedVersion: '2.6.7', severity: 'high', cve: 'CVE-2022-0235', summary: 'SSRF in node-fetch' },
  { name: 'jsonwebtoken', ecosystem: 'npm', vulnerableVersions: '<9.0.0', fixedVersion: '9.0.0', severity: 'high', cve: 'CVE-2022-23539', summary: 'Algorithm confusion in jsonwebtoken' },
  { name: 'moment', ecosystem: 'npm', vulnerableVersions: '<2.29.4', fixedVersion: '2.29.4', severity: 'high', cve: 'CVE-2022-31129', summary: 'ReDoS in moment' },
  { name: 'underscore', ecosystem: 'npm', vulnerableVersions: '<1.13.6', fixedVersion: '1.13.6', severity: 'critical', cve: 'CVE-2021-23358', summary: 'Arbitrary Code Execution in underscore' },
  { name: 'handlebars', ecosystem: 'npm', vulnerableVersions: '<4.7.7', fixedVersion: '4.7.7', severity: 'critical', cve: 'CVE-2021-23369', summary: 'RCE in handlebars' },
  { name: 'serialize-javascript', ecosystem: 'npm', vulnerableVersions: '<3.1.0', fixedVersion: '3.1.0', severity: 'critical', cve: 'CVE-2020-7660', summary: 'RCE in serialize-javascript' },
  
  // Python
  { name: 'django', ecosystem: 'pip', vulnerableVersions: '<4.2.11', fixedVersion: '4.2.11', severity: 'high', cve: 'CVE-2024-27351', summary: 'Potential ReDoS in django' },
  { name: 'flask', ecosystem: 'pip', vulnerableVersions: '<2.3.2', fixedVersion: '2.3.2', severity: 'high', cve: 'CVE-2023-30861', summary: 'Session cookie security in flask' },
  { name: 'requests', ecosystem: 'pip', vulnerableVersions: '<2.32.0', fixedVersion: '2.32.0', severity: 'medium', cve: 'CVE-2024-35195', summary: 'SSRF in requests' },
  { name: 'pillow', ecosystem: 'pip', vulnerableVersions: '<10.2.0', fixedVersion: '10.2.0', severity: 'high', cve: 'CVE-2024-28219', summary: 'Buffer overflow in pillow' },
  { name: 'pyyaml', ecosystem: 'pip', vulnerableVersions: '<6.0.1', fixedVersion: '6.0.1', severity: 'critical', cve: 'CVE-2020-14343', summary: 'Arbitrary code execution in pyyaml' },
  { name: 'cryptography', ecosystem: 'pip', vulnerableVersions: '<42.0.0', fixedVersion: '42.0.0', severity: 'high', cve: 'CVE-2024-26130', summary: 'NULL pointer dereference in cryptography' },
  { name: 'urllib3', ecosystem: 'pip', vulnerableVersions: '<2.0.7', fixedVersion: '2.0.7', severity: 'medium', cve: 'CVE-2023-45803', summary: 'Cookie leakage in urllib3' },
  { name: 'jinja2', ecosystem: 'pip', vulnerableVersions: '<3.1.3', fixedVersion: '3.1.3', severity: 'medium', cve: 'CVE-2024-22195', summary: 'XSS in jinja2' },
];

export async function scanDependencies(basePath: string): Promise<Finding[]> {
  const findings: Finding[] = [];

  // Scan package.json (npm)
  const packageJsonPath = path.join(basePath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    findings.push(...await scanNpmDependencies(packageJsonPath));
  }

  // Scan package-lock.json for transitive deps
  const packageLockPath = path.join(basePath, 'package-lock.json');
  if (fs.existsSync(packageLockPath)) {
    findings.push(...await scanNpmLockfile(packageLockPath));
  }

  // Scan requirements.txt (pip)
  const requirementsPath = path.join(basePath, 'requirements.txt');
  if (fs.existsSync(requirementsPath)) {
    findings.push(...await scanPipDependencies(requirementsPath));
  }

  // Scan Pipfile.lock
  const pipfileLockPath = path.join(basePath, 'Pipfile.lock');
  if (fs.existsSync(pipfileLockPath)) {
    findings.push(...await scanPipfileLock(pipfileLockPath));
  }

  return findings;
}

async function scanNpmDependencies(filePath: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const allDeps = {
      ...content.dependencies,
      ...content.devDependencies,
    };

    for (const [name, versionSpec] of Object.entries(allDeps)) {
      const version = cleanVersion(versionSpec as string);
      const vulns = VULNERABLE_PACKAGES.filter(
        v => v.name === name && v.ecosystem === 'npm'
      );

      for (const vuln of vulns) {
        if (isVulnerable(version, vuln.vulnerableVersions)) {
          findings.push({
            id: `dep-${name}-${findings.length}`,
            rule: 'vulnerable-dependency',
            severity: vuln.severity,
            message: `${vuln.summary} in ${name}@${version}`,
            file: 'package.json',
            cwe: 'CWE-1395',
            fix: vuln.fixedVersion 
              ? `Upgrade to ${name}@${vuln.fixedVersion} or later`
              : 'Check for available patches',
            metadata: {
              package: name,
              installedVersion: version,
              vulnerableVersions: vuln.vulnerableVersions,
              fixedVersion: vuln.fixedVersion,
              cve: vuln.cve,
            },
          });
        }
      }
    }
  } catch {
    // Skip invalid files
  }

  return findings;
}

async function scanNpmLockfile(filePath: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const packages = content.packages || content.dependencies || {};

    for (const [pkgPath, pkgInfo] of Object.entries(packages)) {
      if (!pkgPath || pkgPath === '') continue;
      
      const info = pkgInfo as any;
      const name = pkgPath.replace(/^node_modules\//, '').split('node_modules/').pop() || '';
      const version = info.version;
      
      if (!name || !version) continue;

      const vulns = VULNERABLE_PACKAGES.filter(
        v => v.name === name && v.ecosystem === 'npm'
      );

      for (const vuln of vulns) {
        if (isVulnerable(version, vuln.vulnerableVersions)) {
          // Check if we already reported this
          const existing = findings.find(
            f => f.metadata?.package === name && f.metadata?.cve === vuln.cve
          );
          if (existing) continue;

          findings.push({
            id: `dep-lock-${name}-${findings.length}`,
            rule: 'vulnerable-dependency',
            severity: vuln.severity,
            message: `${vuln.summary} in ${name}@${version} (transitive)`,
            file: 'package-lock.json',
            cwe: 'CWE-1395',
            fix: vuln.fixedVersion 
              ? `Run: npm update ${name} or manually upgrade`
              : 'Check for available patches',
            metadata: {
              package: name,
              installedVersion: version,
              vulnerableVersions: vuln.vulnerableVersions,
              fixedVersion: vuln.fixedVersion,
              cve: vuln.cve,
              transitive: true,
            },
          });
        }
      }
    }
  } catch {
    // Skip invalid files
  }

  return findings;
}

async function scanPipDependencies(filePath: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      // Parse package==version or package>=version
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)(?:[=<>!~]+(.+))?$/);
      if (!match) continue;

      const name = match[1].toLowerCase();
      const version = match[2]?.replace(/[<>=!~]/g, '') || '*';

      const vulns = VULNERABLE_PACKAGES.filter(
        v => v.name === name && v.ecosystem === 'pip'
      );

      for (const vuln of vulns) {
        if (version === '*' || isVulnerable(version, vuln.vulnerableVersions)) {
          findings.push({
            id: `dep-pip-${name}-${findings.length}`,
            rule: 'vulnerable-dependency',
            severity: vuln.severity,
            message: `${vuln.summary} in ${name}@${version}`,
            file: 'requirements.txt',
            line: lines.indexOf(line) + 1,
            cwe: 'CWE-1395',
            fix: vuln.fixedVersion 
              ? `Upgrade to ${name}>=${vuln.fixedVersion}`
              : 'Check for available patches',
            metadata: {
              package: name,
              installedVersion: version,
              vulnerableVersions: vuln.vulnerableVersions,
              fixedVersion: vuln.fixedVersion,
              cve: vuln.cve,
            },
          });
        }
      }
    }
  } catch {
    // Skip invalid files
  }

  return findings;
}

async function scanPipfileLock(filePath: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const allPackages = {
      ...content.default,
      ...content.develop,
    };

    for (const [name, info] of Object.entries(allPackages)) {
      const pkgInfo = info as any;
      const version = pkgInfo.version?.replace('==', '') || '*';

      const vulns = VULNERABLE_PACKAGES.filter(
        v => v.name === name.toLowerCase() && v.ecosystem === 'pip'
      );

      for (const vuln of vulns) {
        if (version === '*' || isVulnerable(version, vuln.vulnerableVersions)) {
          findings.push({
            id: `dep-piplock-${name}-${findings.length}`,
            rule: 'vulnerable-dependency',
            severity: vuln.severity,
            message: `${vuln.summary} in ${name}@${version}`,
            file: 'Pipfile.lock',
            cwe: 'CWE-1395',
            fix: vuln.fixedVersion 
              ? `Upgrade to ${name}>=${vuln.fixedVersion}`
              : 'Check for available patches',
            metadata: {
              package: name,
              installedVersion: version,
              vulnerableVersions: vuln.vulnerableVersions,
              fixedVersion: vuln.fixedVersion,
              cve: vuln.cve,
            },
          });
        }
      }
    }
  } catch {
    // Skip invalid files
  }

  return findings;
}

function cleanVersion(versionSpec: string): string {
  return versionSpec.replace(/^[\^~>=<]/, '').split(' ')[0];
}

function isVulnerable(installedVersion: string, vulnerableRange: string): boolean {
  try {
    // Handle "<X.Y.Z" format
    if (vulnerableRange.startsWith('<')) {
      const maxVersion = vulnerableRange.slice(1);
      return semver.lt(semver.coerce(installedVersion) || '0.0.0', maxVersion);
    }
    // Handle semver ranges
    return semver.satisfies(semver.coerce(installedVersion) || '0.0.0', vulnerableRange);
  } catch {
    return false;
  }
}
