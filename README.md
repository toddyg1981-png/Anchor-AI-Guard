<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Anchor Security Scanner

[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-Anchor%20Security%20Scanner-blue?logo=github)](https://github.com/marketplace/actions/anchor-security-scanner)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

> **Enterprise-grade security scanning for your CI/CD pipeline.**  
> SAST • Secrets Detection • Dependency Audit • AI Security Analysis  
> 95+ Security Modules • 25 World-First Features

---

## 🚀 Quick Start

Add to any workflow in **2 lines**:

```yaml
- name: Anchor Security Scan
  uses: toddyg1981-png/Anchor-AI-Guard@v1
```

## 📋 Full Example

```yaml
name: Security Scan
on: [push, pull_request]

permissions:
  contents: read
  security-events: write
  pull-requests: write

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Anchor Security Scan
        uses: toddyg1981-png/Anchor-AI-Guard@v1
        id: anchor
        with:
          scan-type: 'all'
          severity-threshold: 'medium'
          fail-on-findings: 'true'

      - name: Upload SARIF
        if: always()
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: .anchor-reports/anchor-results.sarif
```

## 🛡️ What It Scans

### 🔑 Secrets Detection (23 patterns)
- AWS keys, GitHub tokens, Stripe keys, database URLs
- API keys, JWTs, private keys, cloud provider credentials
- Slack tokens, npm tokens, Docker Hub tokens, Vault tokens
- Skips test files, examples, and `.env.example` automatically

### 🔍 SAST — Static Application Security Testing (30+ rules)
- **JavaScript/TypeScript**: eval(), innerHTML, dangerouslySetInnerHTML, command injection, XSS vectors
- **Python**: pickle deserialization, shell injection, unsafe YAML, Flask debug mode
- **General**: Hardcoded credentials, weak crypto, insecure HTTP, debug logging
- **React-specific**: dangerouslySetInnerHTML, unsafe patterns

### 📦 Dependency Scanning
- `npm audit` integration with severity mapping
- Stale lockfile detection
- Dockerfile security (root user, :latest tag, broad COPY)
- Python dependency version checks

### 🤖 AI Security Analysis (13 rules)
- AI API key exposure (OpenAI, Anthropic, Cohere, HuggingFace)
- Prompt injection detection
- Unsanitized LLM input analysis
- Model serialization risks, training data PII
- RAG pipeline security, function calling risks
- System prompt exposure detection

## ⚙️ Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `scan-type` | `all`, `sast`, `secrets`, `dependencies`, `ai` | `all` |
| `severity-threshold` | `critical`, `high`, `medium`, `low`, `info` | `medium` |
| `fail-on-findings` | Fail workflow if findings exceed threshold | `true` |
| `scan-path` | Path to scan (relative to repo root) | `.` |
| `exclude-patterns` | Comma-separated globs to exclude | `node_modules/**,dist/**,...` |
| `enable-sarif` | Generate SARIF for GitHub Security tab | `true` |
| `enable-annotations` | Add inline PR annotations | `true` |
| `max-findings` | Max findings to report (0 = unlimited) | `100` |
| `api-key` | Anchor API key for cloud features | _(optional)_ |
| `config-file` | Path to `.anchor.yml` config | _(auto-detected)_ |

## 📤 Outputs

| Output | Description |
|--------|-------------|
| `findings-count` | Total findings |
| `critical-count` | Critical severity count |
| `high-count` | High severity count |
| `medium-count` | Medium severity count |
| `low-count` | Low severity count |
| `sarif-file` | Path to SARIF report |
| `report-file` | Path to JSON report |
| `scan-duration` | Scan time in seconds |
| `exit-code` | `0` = pass, `1` = findings above threshold |

## 🎯 Use Cases

### Scan only secrets
```yaml
- uses: toddyg1981-png/Anchor-AI-Guard@v1
  with:
    scan-type: 'secrets'
    severity-threshold: 'high'
```

### Scan a specific directory
```yaml
- uses: toddyg1981-png/Anchor-AI-Guard@v1
  with:
    scan-path: 'src'
    exclude-patterns: 'src/tests/**,src/__mocks__/**'
```

### Report without failing
```yaml
- uses: toddyg1981-png/Anchor-AI-Guard@v1
  with:
    fail-on-findings: 'false'
```

### AI-only scan for ML projects
```yaml
- uses: toddyg1981-png/Anchor-AI-Guard@v1
  with:
    scan-type: 'ai'
    severity-threshold: 'high'
```

## 📊 GitHub Security Integration

When `enable-sarif: true`, findings appear in your repository's **Security → Code scanning alerts** tab. Add the SARIF upload step:

```yaml
- uses: github/codeql-action/upload-sarif@v3
  if: always()
  with:
    sarif_file: .anchor-reports/anchor-results.sarif
    category: anchor-security
```

## 🏗️ Configuration File

Create `.anchor.yml` in your repo root for persistent config:

```yaml
scan:
  enabled: [sast, secrets, dependencies, ai]
  severity-threshold: medium
  fail-on-findings: true

exclude:
  - node_modules/**
  - dist/**
  - '*.test.ts'

rules:
  ignore:
    - ANCHOR-SAST-CONSOLE-LOG
```

## 🔒 Security

- **Zero data exfiltration**: All scanning runs locally in your GitHub Actions runner
- **No network calls**: Unless you provide an API key for cloud features
- **SARIF standard**: Industry-standard format compatible with all SAST tools
- **Open source**: Full audit transparency

## 📈 Why Anchor?

| Feature | Anchor | CodeQL | Snyk | Semgrep |
|---------|--------|--------|------|---------|
| SAST | ✅ | ✅ | ✅ | ✅ |
| Secrets Detection | ✅ | ❌ | ❌ | ✅ |
| Dependency Audit | ✅ | ❌ | ✅ | ❌ |
| AI/ML Security | ✅ | ❌ | ❌ | ❌ |
| SARIF Output | ✅ | ✅ | ✅ | ✅ |
| PR Annotations | ✅ | ✅ | ✅ | ✅ |
| Zero Config | ✅ | ❌ | ❌ | ❌ |
| Scan Modules | 95+ | ~30 | ~50 | ~40 |
| World-First Features | 25 | 0 | 0 | 0 |

## 🖥️ Security Dashboard

Anchor AI Guard also includes an enterprise security dashboard for monitoring projects, scans, and vulnerabilities.

### Run the Dashboard Locally

**Prerequisites:** Node.js 18+

1. Install dependencies: `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app: `npm run dev`

## 📄 License

Apache 2.0 — see [LICENSE](LICENSE) for details.

---

**Built by [Anchor AI Guard](https://github.com/toddyg1981-png/Anchor-AI-Guard)** — Protecting the world's code, one scan at a time.
