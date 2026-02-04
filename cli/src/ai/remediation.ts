/**
 * AI Auto-Remediation Engine - WORLD FIRST
 * Automatically generates fix code and creates PRs for vulnerabilities
 */

import Anthropic from '@anthropic-ai/sdk';
import { Finding, Severity } from '../types';

export interface RemediationContext {
  finding: Finding;
  fileContent: string;
  language: string;
  framework?: string;
  dependencies?: Record<string, string>;
}

export interface RemediationResult {
  success: boolean;
  originalCode: string;
  fixedCode: string;
  explanation: string;
  confidence: number;
  breaking: boolean;
  testSuggestions: string[];
  securityImprovement: string;
}

export interface PRContent {
  title: string;
  body: string;
  branch: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  labels: string[];
}

const REMEDIATION_PROMPTS: Record<string, string> = {
  'sql-injection': `Fix this SQL injection vulnerability by using parameterized queries or prepared statements.
NEVER concatenate user input into SQL strings.
Use the appropriate method for the database library:
- Node.js mysql: Use ? placeholders
- Node.js pg: Use $1, $2 placeholders  
- Python: Use %s or ? with parameters
- Java: Use PreparedStatement`,

  'xss-innerhtml': `Fix this XSS vulnerability by:
1. Using textContent instead of innerHTML when displaying text
2. Using a sanitization library like DOMPurify for HTML
3. Encoding special characters
4. Using framework's built-in escaping (React's JSX, Vue's v-text)`,

  'command-injection': `Fix this command injection by:
1. Using parameterized APIs instead of shell commands
2. Validating and sanitizing input against allowlist
3. Using execFile instead of exec (Node.js)
4. Escaping shell metacharacters
5. Avoiding shell=True (Python)`,

  'path-traversal': `Fix this path traversal by:
1. Using path.resolve() and validating it starts with expected directory
2. Rejecting paths containing .. or absolute paths
3. Using a allowlist of permitted paths
4. Normalizing paths before validation`,

  'hardcoded-secret': `Fix this hardcoded secret by:
1. Moving to environment variables
2. Using a secrets manager (AWS Secrets Manager, HashiCorp Vault)
3. Using .env files (not committed to git)
4. Implementing proper secret rotation`,

  'prototype-pollution': `Fix this prototype pollution by:
1. Using Object.create(null) for lookup objects
2. Validating property names against allowlist
3. Using Map instead of plain objects
4. Freezing objects with Object.freeze()`,

  'weak-crypto': `Fix this weak cryptography by:
1. Using SHA-256 or SHA-3 instead of MD5/SHA1
2. Using bcrypt/argon2 for passwords
3. Using crypto.randomBytes for random values
4. Using modern cipher modes (GCM, not ECB)`,
};

export class AIRemediationEngine {
  private anthropic: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Generate a fix for a security finding
   */
  async generateFix(context: RemediationContext): Promise<RemediationResult> {
    const prompt = this.buildPrompt(context);
    
    const response = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      system: `You are an expert security engineer specializing in secure code remediation.
Your task is to fix security vulnerabilities while:
1. Maintaining existing functionality
2. Following best practices for the language/framework
3. Writing clean, maintainable code
4. Minimizing breaking changes
5. Providing clear explanations

Always respond with valid JSON in the specified format.`,
    });

    return this.parseResponse(response, context);
  }

  /**
   * Generate fixes for multiple findings and create a PR
   */
  async generatePR(
    findings: Finding[],
    fileContents: Map<string, string>,
    _repoInfo: { owner: string; repo: string; baseBranch: string }
  ): Promise<PRContent> {
    // Group findings by file
    const findingsByFile = this.groupByFile(findings);
    const fixedFiles: Array<{ path: string; content: string }> = [];
    const allExplanations: string[] = [];

    for (const [file, fileFindings] of Object.entries(findingsByFile)) {
      let content = fileContents.get(file) || '';
      
      // Fix each finding in the file
      for (const finding of fileFindings) {
        const result = await this.generateFix({
          finding,
          fileContent: content,
          language: this.detectLanguage(file),
        });

        if (result.success) {
          content = result.fixedCode;
          allExplanations.push(`### ${finding.rule} in \`${file}\`\n${result.explanation}`);
        }
      }

      fixedFiles.push({ path: file, content });
    }

    // Generate PR content
    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const highCount = findings.filter(f => f.severity === 'high').length;

    return {
      title: `🔒 Security: Fix ${findings.length} vulnerabilities (${criticalCount} critical, ${highCount} high)`,
      body: this.generatePRBody(findings, allExplanations),
      branch: `anchor/security-fix-${Date.now()}`,
      files: fixedFiles,
      labels: ['security', 'automated', 'anchor-security'],
    };
  }

  /**
   * Batch remediation for CI/CD pipelines
   */
  async batchRemediate(
    findings: Finding[],
    fileContents: Map<string, string>,
    options: {
      maxFixes?: number;
      severityThreshold?: Severity;
      autoMerge?: boolean;
    } = {}
  ): Promise<{
    fixed: Finding[];
    skipped: Finding[];
    errors: Array<{ finding: Finding; error: string }>;
  }> {
    const { maxFixes = 10, severityThreshold = 'high' } = options;
    
    const severityOrder: Severity[] = ['critical', 'high', 'medium', 'low', 'info'];
    const thresholdIndex = severityOrder.indexOf(severityThreshold);
    
    // Filter and sort by severity
    const eligibleFindings = findings
      .filter(f => severityOrder.indexOf(f.severity) <= thresholdIndex)
      .sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity))
      .slice(0, maxFixes);

    const fixed: Finding[] = [];
    const skipped: Finding[] = [];
    const errors: Array<{ finding: Finding; error: string }> = [];

    for (const finding of eligibleFindings) {
      const content = fileContents.get(finding.file);
      if (!content) {
        skipped.push(finding);
        continue;
      }

      try {
        const result = await this.generateFix({
          finding,
          fileContent: content,
          language: this.detectLanguage(finding.file),
        });

        if (result.success && result.confidence >= 0.8) {
          fileContents.set(finding.file, result.fixedCode);
          fixed.push(finding);
        } else {
          skipped.push(finding);
        }
      } catch (error) {
        errors.push({ finding, error: String(error) });
      }
    }

    // Skip findings below threshold
    const belowThreshold = findings.filter(
      f => severityOrder.indexOf(f.severity) > thresholdIndex
    );
    skipped.push(...belowThreshold);

    return { fixed, skipped, errors };
  }

  private buildPrompt(context: RemediationContext): string {
    const { finding, fileContent, language, framework } = context;
    
    const specificGuidance = REMEDIATION_PROMPTS[finding.rule] || 
      'Fix this security vulnerability following security best practices.';

    return `
## Security Vulnerability Fix Request

**Vulnerability Type:** ${finding.rule}
**Severity:** ${finding.severity.toUpperCase()}
**File:** ${finding.file}
**Line:** ${finding.line || 'Unknown'}
**Language:** ${language}${framework ? `\n**Framework:** ${framework}` : ''}

**Issue:**
${finding.message}

**CWE:** ${finding.cwe || 'Not specified'}
${finding.owasp ? `**OWASP:** ${finding.owasp}` : ''}

**Remediation Guidance:**
${specificGuidance}

**Current Code:**
\`\`\`${language}
${fileContent}
\`\`\`

${finding.snippet ? `**Vulnerable Section:**\n\`\`\`\n${finding.snippet}\n\`\`\`` : ''}

---

Please provide the fixed code. Respond with JSON in this exact format:
{
  "success": true,
  "fixedCode": "// The complete fixed file content",
  "explanation": "Clear explanation of what was changed and why",
  "confidence": 0.95,
  "breaking": false,
  "testSuggestions": ["Test suggestion 1", "Test suggestion 2"],
  "securityImprovement": "Description of security improvement"
}

If you cannot fix it safely, respond with:
{
  "success": false,
  "fixedCode": "",
  "explanation": "Reason why automatic fix is not possible",
  "confidence": 0,
  "breaking": false,
  "testSuggestions": [],
  "securityImprovement": ""
}
`;
  }

  private parseResponse(response: any, context: RemediationContext): RemediationResult {
    try {
      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          success: parsed.success || false,
          originalCode: context.fileContent,
          fixedCode: parsed.fixedCode || context.fileContent,
          explanation: parsed.explanation || '',
          confidence: parsed.confidence || 0,
          breaking: parsed.breaking || false,
          testSuggestions: parsed.testSuggestions || [],
          securityImprovement: parsed.securityImprovement || '',
        };
      }
    } catch {
      // Parse error
    }

    return {
      success: false,
      originalCode: context.fileContent,
      fixedCode: context.fileContent,
      explanation: 'Failed to parse AI response',
      confidence: 0,
      breaking: false,
      testSuggestions: [],
      securityImprovement: '',
    };
  }

  private groupByFile(findings: Finding[]): Record<string, Finding[]> {
    return findings.reduce((acc, finding) => {
      if (!acc[finding.file]) {
        acc[finding.file] = [];
      }
      acc[finding.file].push(finding);
      return acc;
    }, {} as Record<string, Finding[]>);
  }

  private detectLanguage(file: string): string {
    const ext = file.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'javascript',
      ts: 'typescript',
      tsx: 'typescript',
      py: 'python',
      rb: 'ruby',
      java: 'java',
      go: 'go',
      rs: 'rust',
      cs: 'csharp',
      php: 'php',
      swift: 'swift',
      kt: 'kotlin',
    };
    return langMap[ext] || ext;
  }

  private generatePRBody(findings: Finding[], explanations: string[]): string {
    const bySeverity = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length,
    };

    return `## 🔒 Anchor Security Auto-Fix

This PR was automatically generated by **Anchor Security** to fix security vulnerabilities.

### Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | ${bySeverity.critical} |
| 🟠 High | ${bySeverity.high} |
| 🟡 Medium | ${bySeverity.medium} |
| 🟢 Low | ${bySeverity.low} |

### Changes Made

${explanations.join('\n\n')}

### Verification

Please review these changes before merging:

- [ ] Changes don't break existing functionality
- [ ] Tests pass
- [ ] Code follows project conventions
- [ ] Security improvement is verified

### Testing Suggestions

Run your test suite to verify no regressions:
\`\`\`bash
npm test
\`\`\`

---

🤖 *This PR was automatically generated by [Anchor Security](https://anchor.security)*
`;
  }
}

// Quick fix suggestions for common vulnerabilities (non-AI fallback)
export const QUICK_FIXES: Record<string, (code: string, finding: Finding) => string> = {
  'xss-innerhtml': (code, finding) => {
    const line = finding.line || 0;
    const lines = code.split('\n');
    if (lines[line - 1]) {
      lines[line - 1] = lines[line - 1].replace('.innerHTML', '.textContent');
    }
    return lines.join('\n');
  },
  
  'console-log': (code, finding) => {
    const line = finding.line || 0;
    const lines = code.split('\n');
    if (lines[line - 1]) {
      lines[line - 1] = '// ' + lines[line - 1];
    }
    return lines.join('\n');
  },
  
  'weak-crypto-md5': (code) => {
    return code
      .replace(/createHash\s*\(\s*['"]md5['"]\s*\)/g, "createHash('sha256')")
      .replace(/hashlib\.md5/g, 'hashlib.sha256');
  },
  
  'weak-crypto-sha1': (code) => {
    return code
      .replace(/createHash\s*\(\s*['"]sha1['"]\s*\)/g, "createHash('sha256')")
      .replace(/hashlib\.sha1/g, 'hashlib.sha256');
  },
};
