/**
 * SAST Scanner - Static Application Security Testing
 * Detects common vulnerability patterns in source code
 */

import fs from 'fs';
import path from 'path';
import { Finding, Rule } from '../types';

const SAST_RULES: Rule[] = [
  // SQL Injection
  {
    id: 'sql-injection',
    name: 'SQL Injection',
    severity: 'critical',
    pattern: /(?:execute|query|raw|exec)\s*\(\s*[`'"].*\$\{.*\}|(?:execute|query|raw)\s*\(\s*.*\+.*['"]/gi,
    message: 'Potential SQL Injection: User input concatenated into SQL query',
    cwe: 'CWE-89',
    owasp: 'A03:2021',
    languages: ['javascript', 'typescript'],
  },
  {
    id: 'sql-injection-python',
    name: 'SQL Injection (Python)',
    severity: 'critical',
    pattern: /(?:execute|executemany|raw)\s*\(\s*f?["'].*\{.*\}|(?:execute|cursor)\s*\(\s*.*%\s*\(/gi,
    message: 'Potential SQL Injection: f-string or % formatting in SQL query',
    cwe: 'CWE-89',
    owasp: 'A03:2021',
    languages: ['python'],
  },
  // XSS
  {
    id: 'xss-innerhtml',
    name: 'XSS via innerHTML',
    severity: 'high',
    pattern: /\.innerHTML\s*=\s*(?!['"`]<)/g,
    message: 'Potential XSS: Dynamic content assigned to innerHTML',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
    languages: ['javascript', 'typescript'],
  },
  {
    id: 'xss-document-write',
    name: 'XSS via document.write',
    severity: 'high',
    pattern: /document\.write\s*\(/g,
    message: 'Potential XSS: document.write can execute arbitrary scripts',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
    languages: ['javascript', 'typescript'],
  },
  {
    id: 'xss-dangerously-set',
    name: 'XSS via dangerouslySetInnerHTML',
    severity: 'high',
    pattern: /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html:\s*(?!['"]\s*['"]\s*\})/g,
    message: 'Potential XSS: dangerouslySetInnerHTML with dynamic content',
    cwe: 'CWE-79',
    owasp: 'A03:2021',
    languages: ['javascript', 'typescript', 'jsx', 'tsx'],
  },
  // Command Injection
  {
    id: 'command-injection',
    name: 'Command Injection',
    severity: 'critical',
    pattern: /(?:exec|spawn|execSync|spawnSync|execFile)\s*\(\s*(?:[`'"].*\$\{|.*\+)/gi,
    message: 'Potential Command Injection: User input in shell command',
    cwe: 'CWE-78',
    owasp: 'A03:2021',
    languages: ['javascript', 'typescript'],
  },
  {
    id: 'command-injection-python',
    name: 'Command Injection (Python)',
    severity: 'critical',
    pattern: /(?:os\.system|os\.popen|subprocess\.call|subprocess\.run|subprocess\.Popen)\s*\(\s*f?["'].*\{|shell\s*=\s*True/gi,
    message: 'Potential Command Injection: User input in shell command',
    cwe: 'CWE-78',
    owasp: 'A03:2021',
    languages: ['python'],
  },
  // Path Traversal
  {
    id: 'path-traversal',
    name: 'Path Traversal',
    severity: 'high',
    pattern: /(?:readFile|readFileSync|createReadStream|writeFile|writeFileSync|unlink|rmdir|mkdir|access)\s*\(\s*(?:[`'"].*\$\{|.*\+|req\.|request\.)/gi,
    message: 'Potential Path Traversal: User input in file path',
    cwe: 'CWE-22',
    owasp: 'A01:2021',
    languages: ['javascript', 'typescript'],
  },
  // Insecure Crypto
  {
    id: 'weak-crypto-md5',
    name: 'Weak Cryptography (MD5)',
    severity: 'medium',
    pattern: /createHash\s*\(\s*['"]md5['"]\s*\)|hashlib\.md5|MD5\s*\(/gi,
    message: 'MD5 is cryptographically weak. Use SHA-256 or better',
    cwe: 'CWE-327',
    owasp: 'A02:2021',
  },
  {
    id: 'weak-crypto-sha1',
    name: 'Weak Cryptography (SHA1)',
    severity: 'medium',
    pattern: /createHash\s*\(\s*['"]sha1['"]\s*\)|hashlib\.sha1|SHA1\s*\(/gi,
    message: 'SHA1 is cryptographically weak. Use SHA-256 or better',
    cwe: 'CWE-327',
    owasp: 'A02:2021',
  },
  {
    id: 'weak-random',
    name: 'Insecure Random',
    severity: 'medium',
    pattern: /Math\.random\s*\(\s*\)/g,
    message: 'Math.random() is not cryptographically secure. Use crypto.randomBytes() for security purposes',
    cwe: 'CWE-330',
    owasp: 'A02:2021',
    languages: ['javascript', 'typescript'],
  },
  // Hardcoded Configuration
  {
    id: 'hardcoded-ip',
    name: 'Hardcoded IP Address',
    severity: 'low',
    pattern: /['"]\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}(?::\d+)?['"]/g,
    message: 'Hardcoded IP address detected. Consider using configuration',
    cwe: 'CWE-547',
  },
  // Insecure Deserialization
  {
    id: 'unsafe-deserialization',
    name: 'Unsafe Deserialization',
    severity: 'critical',
    pattern: /(?:pickle\.loads?|yaml\.load|eval|unserialize)\s*\(/gi,
    message: 'Unsafe deserialization can lead to Remote Code Execution',
    cwe: 'CWE-502',
    owasp: 'A08:2021',
  },
  // eval() usage
  {
    id: 'eval-usage',
    name: 'Eval Usage',
    severity: 'high',
    pattern: /\beval\s*\(\s*(?!['"][^'"]*['"]\s*\))/g,
    message: 'eval() with dynamic input can lead to code injection',
    cwe: 'CWE-95',
    owasp: 'A03:2021',
    languages: ['javascript', 'typescript', 'python'],
  },
  // SSRF
  {
    id: 'ssrf-potential',
    name: 'Potential SSRF',
    severity: 'high',
    pattern: /(?:fetch|axios|request|http\.get|urllib)\s*\(\s*(?:[`'"].*\$\{|.*\+|req\.|request\.)/gi,
    message: 'Potential SSRF: User input used in URL',
    cwe: 'CWE-918',
    owasp: 'A10:2021',
  },
  // Prototype Pollution
  {
    id: 'prototype-pollution',
    name: 'Prototype Pollution',
    severity: 'high',
    pattern: /\[.*\]\s*=\s*(?!null|undefined|false|true|\d)/g,
    message: 'Potential Prototype Pollution via dynamic property assignment',
    cwe: 'CWE-1321',
    languages: ['javascript', 'typescript'],
  },
  // NoSQL Injection
  {
    id: 'nosql-injection',
    name: 'NoSQL Injection',
    severity: 'high',
    pattern: /(?:find|findOne|update|delete|aggregate)\s*\(\s*\{[^}]*:\s*(?:req\.|request\.|params\.|body\.)/gi,
    message: 'Potential NoSQL Injection: User input in database query',
    cwe: 'CWE-943',
    owasp: 'A03:2021',
  },
  // Insecure JWT
  {
    id: 'jwt-none-algorithm',
    name: 'JWT None Algorithm',
    severity: 'critical',
    pattern: /algorithm['":\s]*['"]?none['"]?/gi,
    message: 'JWT with "none" algorithm allows signature bypass',
    cwe: 'CWE-347',
    owasp: 'A02:2021',
  },
  // CORS Misconfiguration
  {
    id: 'cors-wildcard',
    name: 'CORS Wildcard',
    severity: 'medium',
    pattern: /Access-Control-Allow-Origin['":\s]*['"]\*['"]/gi,
    message: 'CORS allows all origins. Consider restricting to specific domains',
    cwe: 'CWE-942',
    owasp: 'A05:2021',
  },
  // Debug/Console in Production
  {
    id: 'console-log',
    name: 'Console Log',
    severity: 'info',
    pattern: /console\.(log|debug|info|warn|error)\s*\(/g,
    message: 'Console statement found. Remove before production',
    cwe: 'CWE-489',
  },
  // Disabled Security
  {
    id: 'security-disabled',
    name: 'Security Disabled',
    severity: 'high',
    pattern: /(?:verify|rejectUnauthorized|secure|checkServerIdentity)\s*[=:]\s*false/gi,
    message: 'Security check explicitly disabled',
    cwe: 'CWE-295',
    owasp: 'A07:2021',
  },
];

const LANGUAGE_MAP: Record<string, string[]> = {
  javascript: ['.js', '.mjs', '.cjs'],
  typescript: ['.ts', '.mts', '.cts'],
  jsx: ['.jsx'],
  tsx: ['.tsx'],
  python: ['.py'],
  java: ['.java'],
  csharp: ['.cs'],
  go: ['.go'],
  ruby: ['.rb'],
  php: ['.php'],
};

export async function scanSAST(basePath: string, files: string[]): Promise<Finding[]> {
  const findings: Finding[] = [];

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    const fullPath = path.join(basePath, file);
    
    // Determine language
    const language = Object.entries(LANGUAGE_MAP).find(([_, exts]) => 
      exts.includes(ext)
    )?.[0];

    if (!language) continue;

    try {
      const content = fs.readFileSync(fullPath, 'utf-8');
      const lines = content.split('\n');

      for (const rule of SAST_RULES) {
        // Skip if rule doesn't apply to this language
        if (rule.languages && !rule.languages.includes(language)) continue;

        // Reset regex state
        rule.pattern.lastIndex = 0;

        let match;
        while ((match = rule.pattern.exec(content)) !== null) {
          // Find line number
          const upToMatch = content.slice(0, match.index);
          const lineNumber = upToMatch.split('\n').length;
          const lineContent = lines[lineNumber - 1] || '';

          // Skip test files for low-severity issues
          if (rule.severity === 'info' || rule.severity === 'low') {
            if (isTestFile(file)) continue;
          }

          findings.push({
            id: `${rule.id}-${findings.length}`,
            rule: rule.id,
            severity: rule.severity,
            message: rule.message,
            file,
            line: lineNumber,
            snippet: lineContent.trim().slice(0, 100),
            cwe: rule.cwe,
            owasp: rule.owasp,
            fix: rule.fix,
          });
        }
      }
    } catch {
      // Skip files that can't be read
    }
  }

  return findings;
}

function isTestFile(file: string): boolean {
  const testPatterns = [
    /\.test\./i,
    /\.spec\./i,
    /__tests__/i,
    /test\//i,
    /tests\//i,
  ];
  return testPatterns.some(p => p.test(file));
}
