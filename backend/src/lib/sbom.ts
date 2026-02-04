import path from 'path';
import fs from 'fs';
import { prisma } from './prisma';

export interface SBOMComponent {
  name: string;
  version: string;
  type: 'npm' | 'pip' | 'go' | 'cargo' | 'maven' | 'nuget';
  purl: string; // Package URL (https://github.com/package-url/purl-spec)
  licenses: string[];
  direct: boolean;
}

export interface CVEMatch {
  cveId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  cvssScore: number;
  summary: string;
  affectedVersions: string;
  fixedVersion: string | null;
  publishedDate: string;
  references: string[];
}

export interface SBOMResult {
  components: SBOMComponent[];
  totalDependencies: number;
  directDependencies: number;
  transitiveDependencies: number;
  generatedAt: string;
}

export interface VulnerabilityReport {
  component: SBOMComponent;
  vulnerabilities: CVEMatch[];
}

// Known vulnerable packages database (in production, this would be fetched from NVD/OSV)
const KNOWN_VULNERABILITIES: Record<string, CVEMatch[]> = {
  'lodash': [
    {
      cveId: 'CVE-2021-23337',
      severity: 'HIGH',
      cvssScore: 7.2,
      summary: 'Command Injection in lodash',
      affectedVersions: '<4.17.21',
      fixedVersion: '4.17.21',
      publishedDate: '2021-02-15',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-23337'],
    },
  ],
  'axios': [
    {
      cveId: 'CVE-2023-45857',
      severity: 'MEDIUM',
      cvssScore: 6.5,
      summary: 'SSRF in axios',
      affectedVersions: '<1.6.0',
      fixedVersion: '1.6.0',
      publishedDate: '2023-11-08',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2023-45857'],
    },
  ],
  'express': [
    {
      cveId: 'CVE-2024-29041',
      severity: 'MEDIUM',
      cvssScore: 6.1,
      summary: 'Open Redirect in express',
      affectedVersions: '<4.19.2',
      fixedVersion: '4.19.2',
      publishedDate: '2024-03-25',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2024-29041'],
    },
  ],
  'jsonwebtoken': [
    {
      cveId: 'CVE-2022-23529',
      severity: 'HIGH',
      cvssScore: 7.6,
      summary: 'Insecure implementation in jsonwebtoken',
      affectedVersions: '<9.0.0',
      fixedVersion: '9.0.0',
      publishedDate: '2022-12-21',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-23529'],
    },
  ],
  'minimist': [
    {
      cveId: 'CVE-2021-44906',
      severity: 'CRITICAL',
      cvssScore: 9.8,
      summary: 'Prototype Pollution in minimist',
      affectedVersions: '<1.2.6',
      fixedVersion: '1.2.6',
      publishedDate: '2022-03-17',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-44906'],
    },
  ],
  'node-fetch': [
    {
      cveId: 'CVE-2022-0235',
      severity: 'MEDIUM',
      cvssScore: 6.5,
      summary: 'Exposure of Sensitive Information in node-fetch',
      affectedVersions: '<2.6.7',
      fixedVersion: '2.6.7',
      publishedDate: '2022-01-14',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2022-0235'],
    },
  ],
  'tar': [
    {
      cveId: 'CVE-2021-37713',
      severity: 'HIGH',
      cvssScore: 8.6,
      summary: 'Arbitrary File Creation/Overwrite via insufficient symlink protection',
      affectedVersions: '<6.1.9',
      fixedVersion: '6.1.9',
      publishedDate: '2021-08-31',
      references: ['https://nvd.nist.gov/vuln/detail/CVE-2021-37713'],
    },
  ],
};

function parseVersion(version: string): number[] {
  return version.replace(/^[^0-9]*/, '').split('.').map(Number);
}

function isVersionAffected(currentVersion: string, affectedVersions: string): boolean {
  // Simple version comparison - in production use semver library
  const match = affectedVersions.match(/<(.+)/);
  if (!match) return false;

  const maxVersion = parseVersion(match[1]);
  const current = parseVersion(currentVersion);

  for (let i = 0; i < Math.max(maxVersion.length, current.length); i++) {
    const max = maxVersion[i] || 0;
    const cur = current[i] || 0;
    if (cur < max) return true;
    if (cur > max) return false;
  }
  return false;
}

export async function generateSBOM(targetPath: string): Promise<SBOMResult> {
  const components: SBOMComponent[] = [];

  // Check for package.json (npm)
  const packageJsonPath = path.join(targetPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

      // Direct dependencies
      for (const [name, version] of Object.entries(packageJson.dependencies || {})) {
        const versionStr = String(version).replace(/^[\^~]/, '');
        components.push({
          name,
          version: versionStr,
          type: 'npm',
          purl: `pkg:npm/${name}@${versionStr}`,
          licenses: [],
          direct: true,
        });
      }

      // Dev dependencies
      for (const [name, version] of Object.entries(packageJson.devDependencies || {})) {
        const versionStr = String(version).replace(/^[\^~]/, '');
        components.push({
          name,
          version: versionStr,
          type: 'npm',
          purl: `pkg:npm/${name}@${versionStr}`,
          licenses: [],
          direct: true,
        });
      }

      // Try to read package-lock.json for transitive dependencies
      const lockfilePath = path.join(targetPath, 'package-lock.json');
      if (fs.existsSync(lockfilePath)) {
        try {
          const lockfile = JSON.parse(fs.readFileSync(lockfilePath, 'utf-8'));
          const packages = lockfile.packages || lockfile.dependencies || {};

          for (const [pkgPath, pkg] of Object.entries(packages)) {
            if (!pkgPath || pkgPath === '') continue;
            const pkgData = pkg as any;
            const name = pkgPath.replace(/^node_modules\//, '').split('/node_modules/').pop() || '';
            
            if (name && !components.some((c) => c.name === name)) {
              components.push({
                name,
                version: pkgData.version || 'unknown',
                type: 'npm',
                purl: `pkg:npm/${name}@${pkgData.version || 'unknown'}`,
                licenses: [],
                direct: false,
              });
            }
          }
        } catch {
          // Ignore lockfile parse errors
        }
      }
    } catch {
      // Ignore package.json parse errors
    }
  }

  // Check for requirements.txt (Python)
  const requirementsPath = path.join(targetPath, 'requirements.txt');
  if (fs.existsSync(requirementsPath)) {
    try {
      const content = fs.readFileSync(requirementsPath, 'utf-8');
      const lines = content.split('\n').filter((l) => l.trim() && !l.startsWith('#'));

      for (const line of lines) {
        const match = line.match(/^([a-zA-Z0-9_-]+)([=<>!]+)?(.+)?$/);
        if (match) {
          const [, name, , version] = match;
          components.push({
            name,
            version: version || 'latest',
            type: 'pip',
            purl: `pkg:pypi/${name}@${version || 'latest'}`,
            licenses: [],
            direct: true,
          });
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  // Check for go.mod (Go)
  const goModPath = path.join(targetPath, 'go.mod');
  if (fs.existsSync(goModPath)) {
    try {
      const content = fs.readFileSync(goModPath, 'utf-8');
      const lines = content.split('\n');

      for (const line of lines) {
        const match = line.match(/^\s+([^\s]+)\s+v([^\s]+)/);
        if (match) {
          const [, name, version] = match;
          components.push({
            name,
            version,
            type: 'go',
            purl: `pkg:golang/${name}@${version}`,
            licenses: [],
            direct: true,
          });
        }
      }
    } catch {
      // Ignore parse errors
    }
  }

  const directDeps = components.filter((c) => c.direct).length;

  return {
    components,
    totalDependencies: components.length,
    directDependencies: directDeps,
    transitiveDependencies: components.length - directDeps,
    generatedAt: new Date().toISOString(),
  };
}

export async function scanForVulnerabilities(sbom: SBOMResult): Promise<VulnerabilityReport[]> {
  const reports: VulnerabilityReport[] = [];

  for (const component of sbom.components) {
    const knownVulns = KNOWN_VULNERABILITIES[component.name];
    if (!knownVulns) continue;

    const matchingVulns = knownVulns.filter((vuln) =>
      isVersionAffected(component.version, vuln.affectedVersions)
    );

    if (matchingVulns.length > 0) {
      reports.push({
        component,
        vulnerabilities: matchingVulns,
      });
    }
  }

  return reports;
}

export async function runSBOMScan(projectId: string, targetPath: string): Promise<{
  sbom: SBOMResult;
  vulnerabilities: VulnerabilityReport[];
  findingsCreated: number;
}> {
  // Generate SBOM
  const sbom = await generateSBOM(targetPath);

  // Scan for vulnerabilities
  const vulnerabilities = await scanForVulnerabilities(sbom);

  // Create findings for each vulnerability
  let findingsCreated = 0;

  for (const report of vulnerabilities) {
    for (const vuln of report.vulnerabilities) {
      // Check if finding already exists
      const existing = await prisma.finding.findFirst({
        where: {
          projectId,
          type: 'Vulnerable Dependency',
          title: { contains: vuln.cveId },
        },
      });

      if (!existing) {
        await prisma.finding.create({
          data: {
            projectId,
            type: 'Vulnerable Dependency',
            title: `${vuln.cveId}: ${report.component.name}@${report.component.version}`,
            severity: vuln.severity,
            description: `${vuln.summary}\n\nAffected package: ${report.component.name}\nInstalled version: ${report.component.version}\nAffected versions: ${vuln.affectedVersions}`,
            guidance: vuln.fixedVersion
              ? `Update ${report.component.name} to version ${vuln.fixedVersion} or later.\n\nnpm update ${report.component.name}\n\nor explicitly:\n\nnpm install ${report.component.name}@${vuln.fixedVersion}`
              : `No fix is currently available. Consider using an alternative package or implementing mitigations.`,
            reproduction: `1. Check package.json or package-lock.json for ${report.component.name}\n2. Verify version is ${report.component.version}\n3. Cross-reference with ${vuln.references[0] || 'NVD database'}`,
            filePath: 'package.json',
          },
        });
        findingsCreated++;
      }
    }
  }

  // Store SBOM in database
  await prisma.sBOM.upsert({
    where: { projectId },
    update: {
      components: sbom.components as any,
      totalDependencies: sbom.totalDependencies,
      directDependencies: sbom.directDependencies,
      transitiveDependencies: sbom.transitiveDependencies,
      generatedAt: new Date(sbom.generatedAt),
    },
    create: {
      projectId,
      components: sbom.components as any,
      totalDependencies: sbom.totalDependencies,
      directDependencies: sbom.directDependencies,
      transitiveDependencies: sbom.transitiveDependencies,
      generatedAt: new Date(sbom.generatedAt),
    },
  });

  return {
    sbom,
    vulnerabilities,
    findingsCreated,
  };
}
