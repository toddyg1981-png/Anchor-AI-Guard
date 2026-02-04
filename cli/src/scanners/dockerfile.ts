/**
 * Dockerfile Scanner - Container Security
 * Scans Dockerfiles for security misconfigurations
 */

import fs from 'fs';
import path from 'path';
import { Finding, Severity } from '../types';

interface DockerRule {
  id: string;
  name: string;
  severity: Severity;
  check: (lines: string[], content: string) => Finding | null;
  message: string;
  fix: string;
}

const DOCKERFILE_RULES: DockerRule[] = [
  {
    id: 'docker-root-user',
    name: 'Running as Root',
    severity: 'high',
    message: 'Container runs as root user by default',
    fix: 'Add USER instruction to run as non-root user',
    check: (lines: string[], _content: string) => {
      const hasUserInstruction = lines.some(l => 
        l.trim().toUpperCase().startsWith('USER ') &&
        !l.includes('root')
      );
      if (!hasUserInstruction) {
        return {
          id: 'docker-root-user-0',
          rule: 'docker-root-user',
          severity: 'high',
          message: 'Container runs as root user by default',
          file: '',
          cwe: 'CWE-250',
          fix: 'Add USER instruction to run as non-root user (e.g., USER 1000:1000)',
        };
      }
      return null;
    },
  },
  {
    id: 'docker-latest-tag',
    name: 'Using Latest Tag',
    severity: 'medium',
    message: 'Base image uses :latest tag (unpinned)',
    fix: 'Pin to a specific image version',
    check: (lines: string[], _content: string) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.toUpperCase().startsWith('FROM ')) {
          const image = line.slice(5).trim();
          if (image.endsWith(':latest') || (!image.includes(':') && !image.includes('@'))) {
            return {
              id: `docker-latest-tag-${i}`,
              rule: 'docker-latest-tag',
              severity: 'medium',
              message: `Base image "${image}" uses unpinned version`,
              file: '',
              line: i + 1,
              cwe: 'CWE-1104',
              fix: 'Pin to specific version (e.g., node:20.11.0-alpine)',
            };
          }
        }
      }
      return null;
    },
  },
  {
    id: 'docker-add-instead-of-copy',
    name: 'ADD Instead of COPY',
    severity: 'low',
    message: 'ADD instruction used instead of COPY',
    fix: 'Use COPY unless you need ADD features (auto-extract, remote URLs)',
    check: (lines: string[], _content: string) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.toUpperCase().startsWith('ADD ') && 
            !line.includes('http://') && 
            !line.includes('https://') &&
            !line.includes('.tar') &&
            !line.includes('.gz')) {
          return {
            id: `docker-add-instead-of-copy-${i}`,
            rule: 'docker-add-instead-of-copy',
            severity: 'low',
            message: 'ADD used instead of COPY for local files',
            file: '',
            line: i + 1,
            cwe: 'CWE-693',
            fix: 'Use COPY for simple file copying. ADD has implicit behaviors.',
          };
        }
      }
      return null;
    },
  },
  {
    id: 'docker-sudo',
    name: 'Using Sudo',
    severity: 'medium',
    message: 'sudo used in Dockerfile (already running as root)',
    fix: 'Remove sudo - Dockerfile commands already run as root',
    check: (lines: string[], _content: string) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.toUpperCase().startsWith('RUN ') && line.includes('sudo ')) {
          return {
            id: `docker-sudo-${i}`,
            rule: 'docker-sudo',
            severity: 'medium',
            message: 'Unnecessary sudo in RUN instruction',
            file: '',
            line: i + 1,
            cwe: 'CWE-250',
            fix: 'Remove sudo from commands - RUN already executes as root',
          };
        }
      }
      return null;
    },
  },
  {
    id: 'docker-apt-get-upgrade',
    name: 'apt-get upgrade',
    severity: 'medium',
    message: 'apt-get upgrade/dist-upgrade used',
    fix: 'Remove upgrade - it makes builds non-reproducible',
    check: (lines: string[], _content: string) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase();
        if (line.startsWith('run ') && 
            (line.includes('apt-get upgrade') || line.includes('apt-get dist-upgrade'))) {
          return {
            id: `docker-apt-get-upgrade-${i}`,
            rule: 'docker-apt-get-upgrade',
            severity: 'medium',
            message: 'apt-get upgrade makes builds non-reproducible',
            file: '',
            line: i + 1,
            cwe: 'CWE-1104',
            fix: 'Remove upgrade. Pin package versions for reproducibility.',
          };
        }
      }
      return null;
    },
  },
  {
    id: 'docker-apt-clean',
    name: 'Missing apt-get clean',
    severity: 'info',
    message: 'apt-get used without cleanup',
    fix: 'Add cleanup to reduce image size',
    check: (lines: string[], content: string) => {
      if (content.includes('apt-get install') && 
          !content.includes('apt-get clean') &&
          !content.includes('rm -rf /var/lib/apt/lists')) {
        const lineNum = lines.findIndex(l => l.includes('apt-get install'));
        return {
          id: 'docker-apt-clean-0',
          rule: 'docker-apt-clean',
          severity: 'info',
          message: 'apt-get install without cleanup increases image size',
          file: '',
          line: lineNum + 1,
          cwe: 'CWE-400',
          fix: 'Add: && apt-get clean && rm -rf /var/lib/apt/lists/*',
        };
      }
      return null;
    },
  },
  {
    id: 'docker-expose-all',
    name: 'Expose All Ports',
    severity: 'high',
    message: 'EXPOSE with many ports or wide range',
    fix: 'Only expose necessary ports',
    check: (lines: string[], _content: string) => {
      const exposedPorts = new Set<number>();
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.toUpperCase().startsWith('EXPOSE ')) {
          const ports = line.slice(7).split(/\s+/);
          ports.forEach(p => {
            const portNum = parseInt(p.split('/')[0]);
            if (!isNaN(portNum)) exposedPorts.add(portNum);
          });
        }
      }
      if (exposedPorts.size > 5) {
        return {
          id: 'docker-expose-all-0',
          rule: 'docker-expose-all',
          severity: 'high',
          message: `${exposedPorts.size} ports exposed - review if all are necessary`,
          file: '',
          cwe: 'CWE-284',
          fix: 'Minimize exposed ports to only those required',
        };
      }
      return null;
    },
  },
  {
    id: 'docker-env-secrets',
    name: 'Secrets in ENV',
    severity: 'critical',
    message: 'Sensitive data in ENV instruction',
    fix: 'Use build secrets or runtime environment variables',
    check: (lines: string[], _content: string) => {
      const sensitivePatterns = [
        /password\s*=\s*[^$]/i,
        /secret\s*=\s*[^$]/i,
        /api[_-]?key\s*=\s*[^$]/i,
        /token\s*=\s*[^$]/i,
        /private[_-]?key/i,
      ];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.toUpperCase().startsWith('ENV ') || line.toUpperCase().startsWith('ARG ')) {
          for (const pattern of sensitivePatterns) {
            if (pattern.test(line)) {
              return {
                id: `docker-env-secrets-${i}`,
                rule: 'docker-env-secrets',
                severity: 'critical',
                message: 'Potential secret in ENV/ARG instruction',
                file: '',
                line: i + 1,
                cwe: 'CWE-798',
                fix: 'Use --secret flag or pass secrets at runtime',
              };
            }
          }
        }
      }
      return null;
    },
  },
  {
    id: 'docker-healthcheck',
    name: 'Missing HEALTHCHECK',
    severity: 'low',
    message: 'No HEALTHCHECK instruction',
    fix: 'Add HEALTHCHECK for container orchestration',
    check: (_lines: string[], content: string) => {
      if (!content.toUpperCase().includes('HEALTHCHECK ')) {
        return {
          id: 'docker-healthcheck-0',
          rule: 'docker-healthcheck',
          severity: 'low',
          message: 'Dockerfile has no HEALTHCHECK instruction',
          file: '',
          cwe: 'CWE-693',
          fix: 'Add: HEALTHCHECK --interval=30s CMD curl -f http://localhost/ || exit 1',
        };
      }
      return null;
    },
  },
  {
    id: 'docker-curl-pipe-bash',
    name: 'Curl Pipe to Shell',
    severity: 'high',
    message: 'curl piped to bash/sh - dangerous pattern',
    fix: 'Download scripts first, verify, then execute',
    check: (lines: string[], _content: string) => {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim().toLowerCase();
        if (line.startsWith('run ') && 
            (line.includes('curl') || line.includes('wget')) &&
            (line.includes('| sh') || line.includes('| bash') || 
             line.includes('|sh') || line.includes('|bash'))) {
          return {
            id: `docker-curl-pipe-bash-${i}`,
            rule: 'docker-curl-pipe-bash',
            severity: 'high',
            message: 'Downloading and executing scripts in one command',
            file: '',
            line: i + 1,
            cwe: 'CWE-494',
            fix: 'Download script, verify checksum, then execute in separate steps',
          };
        }
      }
      return null;
    },
  },
];

export async function scanDockerfile(basePath: string, files: string[]): Promise<Finding[]> {
  const findings: Finding[] = [];
  
  // Find Dockerfiles
  const dockerfiles = files.filter(f => 
    f.toLowerCase().includes('dockerfile') ||
    f.endsWith('.dockerfile')
  );

  for (const file of dockerfiles) {
    const fullPath = path.join(basePath, file);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (const rule of DOCKERFILE_RULES) {
        const finding = rule.check(lines, content);
        if (finding) {
          finding.file = file;
          findings.push(finding);
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return findings;
}
