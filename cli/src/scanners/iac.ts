/**
 * IaC Scanner - Infrastructure as Code Security
 * Scans Terraform, CloudFormation, Kubernetes manifests
 */

import fs from 'fs';
import path from 'path';
import yaml from 'yaml';
import { Finding, Rule } from '../types';

const IAC_RULES: Rule[] = [
  // Terraform
  {
    id: 'tf-public-bucket',
    name: 'Public S3 Bucket',
    severity: 'critical',
    pattern: /acl\s*=\s*["']public-read/gi,
    message: 'S3 bucket configured with public read access',
    cwe: 'CWE-284',
    filePatterns: ['*.tf'],
  },
  {
    id: 'tf-public-bucket-acl',
    name: 'Public S3 Bucket ACL',
    severity: 'critical',
    pattern: /block_public_acls\s*=\s*false/gi,
    message: 'S3 bucket public access block disabled',
    cwe: 'CWE-284',
    filePatterns: ['*.tf'],
  },
  {
    id: 'tf-unencrypted-ebs',
    name: 'Unencrypted EBS Volume',
    severity: 'high',
    pattern: /resource\s*"aws_ebs_volume"[\s\S]*?(?!encrypted\s*=\s*true)/g,
    message: 'EBS volume without encryption enabled',
    cwe: 'CWE-311',
    filePatterns: ['*.tf'],
  },
  {
    id: 'tf-open-security-group',
    name: 'Open Security Group',
    severity: 'critical',
    pattern: /cidr_blocks\s*=\s*\[?"0\.0\.0\.0\/0"\]?/g,
    message: 'Security group allows traffic from any IP (0.0.0.0/0)',
    cwe: 'CWE-284',
    filePatterns: ['*.tf'],
  },
  {
    id: 'tf-hardcoded-secret',
    name: 'Hardcoded Secret in Terraform',
    severity: 'critical',
    pattern: /(?:password|secret|api_key)\s*=\s*"[^$][^"]+"/gi,
    message: 'Hardcoded secret in Terraform configuration',
    cwe: 'CWE-798',
    filePatterns: ['*.tf', '*.tfvars'],
  },
  {
    id: 'tf-rds-public',
    name: 'Public RDS Instance',
    severity: 'critical',
    pattern: /publicly_accessible\s*=\s*true/gi,
    message: 'RDS instance is publicly accessible',
    cwe: 'CWE-284',
    filePatterns: ['*.tf'],
  },
  {
    id: 'tf-rds-unencrypted',
    name: 'Unencrypted RDS Instance',
    severity: 'high',
    pattern: /storage_encrypted\s*=\s*false/gi,
    message: 'RDS instance storage encryption disabled',
    cwe: 'CWE-311',
    filePatterns: ['*.tf'],
  },
  // CloudFormation
  {
    id: 'cfn-public-bucket',
    name: 'Public S3 Bucket (CFN)',
    severity: 'critical',
    pattern: /AccessControl:\s*['"]?PublicRead/gi,
    message: 'S3 bucket configured with public access',
    cwe: 'CWE-284',
    filePatterns: ['*.yaml', '*.yml', '*.json'],
  },
  // Kubernetes
  {
    id: 'k8s-privileged',
    name: 'Privileged Container',
    severity: 'critical',
    pattern: /privileged:\s*true/gi,
    message: 'Container running in privileged mode',
    cwe: 'CWE-250',
    filePatterns: ['*.yaml', '*.yml'],
  },
  {
    id: 'k8s-host-network',
    name: 'Host Network Mode',
    severity: 'high',
    pattern: /hostNetwork:\s*true/gi,
    message: 'Pod using host network namespace',
    cwe: 'CWE-284',
    filePatterns: ['*.yaml', '*.yml'],
  },
  {
    id: 'k8s-host-pid',
    name: 'Host PID Mode',
    severity: 'high',
    pattern: /hostPID:\s*true/gi,
    message: 'Pod using host PID namespace',
    cwe: 'CWE-284',
    filePatterns: ['*.yaml', '*.yml'],
  },
  {
    id: 'k8s-root-user',
    name: 'Running as Root',
    severity: 'medium',
    pattern: /runAsUser:\s*0/g,
    message: 'Container configured to run as root user',
    cwe: 'CWE-250',
    filePatterns: ['*.yaml', '*.yml'],
  },
  {
    id: 'k8s-no-resource-limits',
    name: 'Missing Resource Limits',
    severity: 'low',
    pattern: /containers:[\s\S]*?(?!resources:)/g,
    message: 'Container without resource limits defined',
    cwe: 'CWE-400',
    filePatterns: ['*.yaml', '*.yml'],
  },
  {
    id: 'k8s-latest-tag',
    name: 'Using Latest Tag',
    severity: 'medium',
    pattern: /image:\s*['"]?[^:\s'"]+:latest['"]?/gi,
    message: 'Container using :latest tag (unpinned version)',
    cwe: 'CWE-1104',
    filePatterns: ['*.yaml', '*.yml'],
  },
  {
    id: 'k8s-secrets-env',
    name: 'Secrets in Environment',
    severity: 'medium',
    pattern: /value:\s*['"]?(?:password|secret|api[_-]?key)['":]?\s*['"][^'"]+['"]/gi,
    message: 'Secret value directly in environment variable',
    cwe: 'CWE-798',
    filePatterns: ['*.yaml', '*.yml'],
  },
  // Ansible
  {
    id: 'ansible-plaintext-password',
    name: 'Plaintext Password in Ansible',
    severity: 'critical',
    pattern: /password:\s*['"]?(?!\{\{)[^'"{\s]+['"]?/gi,
    message: 'Plaintext password in Ansible playbook',
    cwe: 'CWE-798',
    filePatterns: ['*.yaml', '*.yml'],
  },
  // Helm
  {
    id: 'helm-default-secrets',
    name: 'Default Secrets in Helm',
    severity: 'high',
    pattern: /(?:password|secret):\s*['"]?(?:admin|password|default|changeme)['"]?/gi,
    message: 'Default/weak secret value in Helm values',
    cwe: 'CWE-798',
    filePatterns: ['values.yaml', 'values.yml'],
  },
];

export async function scanIaC(basePath: string, files: string[]): Promise<Finding[]> {
  const findings: Finding[] = [];
  
  // Filter to only IaC files
  const iacExtensions = ['.tf', '.tfvars', '.yaml', '.yml', '.json'];
  const iacFiles = files.filter(f => 
    iacExtensions.some(ext => f.endsWith(ext)) &&
    !f.includes('node_modules') &&
    !f.includes('.git')
  );

  for (const file of iacFiles) {
    const fullPath = path.join(basePath, file);
    
    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Skip non-IaC YAML/JSON (like package.json)
      if (!isIaCFile(file, content)) continue;

      const lines = content.split('\n');

      for (const rule of IAC_RULES) {
        // Check file pattern filter
        if (rule.filePatterns) {
          const matches = rule.filePatterns.some(pattern => {
            if (pattern.startsWith('*')) {
              return file.endsWith(pattern.slice(1));
            }
            return file.includes(pattern);
          });
          if (!matches) continue;
        }

        // Reset regex state
        rule.pattern.lastIndex = 0;

        let match;
        while ((match = rule.pattern.exec(content)) !== null) {
          const upToMatch = content.slice(0, match.index);
          const lineNumber = upToMatch.split('\n').length;
          const lineContent = lines[lineNumber - 1] || '';

          findings.push({
            id: `iac-${rule.id}-${findings.length}`,
            rule: rule.id,
            severity: rule.severity,
            message: rule.message,
            file,
            line: lineNumber,
            snippet: lineContent.trim(),
            cwe: rule.cwe,
            fix: getIaCFix(rule.id),
          });
        }
      }

      // Additional YAML-specific checks for K8s
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        findings.push(...scanK8sManifest(file, content));
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return findings;
}

function isIaCFile(file: string, content: string): boolean {
  // Check for Terraform
  if (file.endsWith('.tf') || file.endsWith('.tfvars')) return true;
  
  // Check for CloudFormation
  if (content.includes('AWSTemplateFormatVersion') || content.includes('AWS::')) return true;
  
  // Check for Kubernetes
  if (content.includes('apiVersion:') && content.includes('kind:')) return true;
  
  // Check for Ansible
  if (content.includes('hosts:') && content.includes('tasks:')) return true;
  
  // Check for Docker Compose
  if (content.includes('services:') && content.includes('version:')) return true;
  
  // Check for Helm
  if (file.includes('values.yaml') || file.includes('Chart.yaml')) return true;
  
  return false;
}

function scanK8sManifest(file: string, content: string): Finding[] {
  const findings: Finding[] = [];
  
  try {
    const docs = yaml.parseAllDocuments(content);
    
    for (const doc of docs) {
      if (!doc.contents) continue;
      const manifest = doc.toJS() as any;
      
      if (!manifest || !manifest.kind) continue;
      
      // Check for missing security context
      if (manifest.kind === 'Deployment' || manifest.kind === 'Pod') {
        const containers = manifest.spec?.template?.spec?.containers ||
                          manifest.spec?.containers || [];
        
        for (const container of containers) {
          if (!container.securityContext) {
            findings.push({
              id: `k8s-no-security-context-${findings.length}`,
              rule: 'k8s-no-security-context',
              severity: 'medium',
              message: `Container "${container.name || 'unnamed'}" has no securityContext`,
              file,
              cwe: 'CWE-250',
              fix: 'Add securityContext with runAsNonRoot: true and readOnlyRootFilesystem: true',
            });
          }
          
          // Check for missing readiness/liveness probes
          if (!container.readinessProbe && !container.livenessProbe) {
            findings.push({
              id: `k8s-no-probes-${findings.length}`,
              rule: 'k8s-no-health-probes',
              severity: 'low',
              message: `Container "${container.name || 'unnamed'}" has no health probes`,
              file,
              cwe: 'CWE-693',
              fix: 'Add readinessProbe and livenessProbe for better reliability',
            });
          }
        }
      }
      
      // Check for NetworkPolicy
      if (manifest.kind === 'Namespace') {
        findings.push({
          id: `k8s-no-netpol-${findings.length}`,
          rule: 'k8s-no-network-policy',
          severity: 'info',
          message: `Namespace "${manifest.metadata?.name}" - ensure NetworkPolicies are applied`,
          file,
          cwe: 'CWE-284',
          fix: 'Create NetworkPolicy resources to restrict pod communication',
        });
      }
    }
  } catch {
    // Skip invalid YAML
  }
  
  return findings;
}

function getIaCFix(ruleId: string): string {
  const fixes: Record<string, string> = {
    'tf-public-bucket': 'Remove public ACL and enable block_public_access',
    'tf-public-bucket-acl': 'Set block_public_acls = true',
    'tf-unencrypted-ebs': 'Add encrypted = true to the EBS volume',
    'tf-open-security-group': 'Restrict CIDR to specific IP ranges',
    'tf-hardcoded-secret': 'Use variables or AWS Secrets Manager',
    'tf-rds-public': 'Set publicly_accessible = false',
    'tf-rds-unencrypted': 'Set storage_encrypted = true',
    'k8s-privileged': 'Set privileged: false in securityContext',
    'k8s-host-network': 'Set hostNetwork: false unless absolutely required',
    'k8s-host-pid': 'Set hostPID: false unless absolutely required',
    'k8s-root-user': 'Set runAsNonRoot: true and runAsUser: 1000+',
    'k8s-latest-tag': 'Pin to a specific image version',
    'k8s-secrets-env': 'Use Secret resources with secretKeyRef',
  };
  
  return fixes[ruleId] || 'Review and apply security best practices';
}
