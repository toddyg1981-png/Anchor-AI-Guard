# 🔌 Anchor Security Platform - API Reference

Complete API documentation for integrating with Anchor AI Guard.

## Base URL

```
Production: https://api.anchoraiguard.com
Development: http://localhost:3001/api
```

## Authentication

All API endpoints require authentication via Bearer token or API Key.

### Bearer Token
```http
Authorization: Bearer <jwt_token>
```

### API Key
```http
X-API-Key: anchor_live_xxxxxxxxxxxx
```

---

## 📋 Core Endpoints

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List all projects |
| `POST` | `/projects` | Create a new project |
| `GET` | `/projects/:id` | Get project details |
| `PUT` | `/projects/:id` | Update project |
| `DELETE` | `/projects/:id` | Delete project |

#### Create Project
```json
POST /projects
{
  "name": "My Application",
  "description": "Production web application",
  "scope": {
    "domains": ["example.com"],
    "apis": ["api.example.com"],
    "mobileBuilds": []
  }
}
```

### Scans

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/scans` | List all scans |
| `POST` | `/scans/run` | Run a local scan |
| `POST` | `/scans/github` | Scan a GitHub repository |
| `POST` | `/scans/upload` | Scan uploaded files |
| `POST` | `/scans/snippet` | Scan a code snippet |
| `GET` | `/scans/:id` | Get scan status |

#### Run GitHub Scan
```json
POST /scans/github
{
  "projectId": "proj_xxxxx",
  "repoUrl": "https://github.com/org/repo",
  "branch": "main"
}
```

### Findings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/findings` | List all findings |
| `GET` | `/findings/:id` | Get finding details |
| `PUT` | `/findings/:id` | Update finding status |

---

## 🧠 TITAN Engine (AI Evolution)

Real-time threat detection engine with autonomous rule generation.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ai-evolution/status` | Get TITAN engine status |
| `POST` | `/ai-evolution/start` | Start the evolution engine |
| `POST` | `/ai-evolution/stop` | Stop the evolution engine |
| `GET` | `/ai-evolution/stream` | SSE stream for real-time updates |
| `GET` | `/ai-evolution/rules` | Get generated detection rules |
| `GET` | `/ai-evolution/threats` | Get processed threat intel |
| `GET` | `/ai-evolution/metrics` | Get performance metrics |

#### Engine Status Response
```json
{
  "isRunning": true,
  "lastUpdate": "2026-02-12T10:30:00Z",
  "threatsProcessed": 12450,
  "rulesGenerated": 847,
  "aiAnalysisCount": 3421,
  "competitiveScore": 95
}
```

---

## 🛡️ Threat Intelligence

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/threat-intel/dashboard` | Get threat intel overview |
| `POST` | `/threat-intel/extract-iocs` | Extract IOCs from text |
| `POST` | `/threat-intel/analyze` | Analyze an indicator |
| `POST` | `/threat-intel/predict-vulnerabilities` | Predict vulnerabilities |
| `GET` | `/threat-intel/cves` | Search CVEs |
| `GET` | `/threat-intel/kev` | Get CISA KEV catalog |
| `POST` | `/threat-intel/reputation` | Check indicator reputation |

---

## ✅ Compliance

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/compliance/dashboard` | Get compliance overview |
| `GET` | `/compliance/frameworks` | List supported frameworks |
| `POST` | `/compliance/assess` | Run compliance assessment |
| `GET` | `/compliance/report/:frameworkId` | Get compliance report |
| `POST` | `/compliance/audit` | Run full audit |

### Supported Frameworks
- SOC 2 Type II
- ISO 27001
- GDPR
- HIPAA
- PCI DSS
- NIST CSF
- CIS Controls
- Essential Eight
- IRAP (Australian Government)

---

## 📡 SOC / Security Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/soc/dashboard` | Get SOC dashboard |
| `GET` | `/soc/events` | List security events |
| `POST` | `/soc/events` | Create event |
| `PUT` | `/soc/events/:id` | Update event |
| `GET` | `/soc/incidents` | List incidents |
| `POST` | `/soc/incidents` | Create incident |
| `POST` | `/soc/triage` | AI-powered triage |
| `GET` | `/soc/playbooks` | Get playbooks |
| `POST` | `/soc/playbooks/execute` | Execute a playbook |

---

## 🌐 Attack Surface Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/attack-surface/dashboard` | Get ASM overview |
| `GET` | `/attack-surface/assets` | List discovered assets |
| `POST` | `/attack-surface/assets` | Add an asset |
| `DELETE` | `/attack-surface/assets/:id` | Remove asset |
| `POST` | `/attack-surface/discover` | Discover assets for domain |
| `POST` | `/attack-surface/analyze` | Analyze attack surface |

---

## 🤖 AI Guardrails (LLM Security)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/ai-guardrails/dashboard` | Get guardrails overview |
| `POST` | `/ai-guardrails/scan` | Scan a prompt for threats |
| `POST` | `/ai-guardrails/sanitize` | Sanitize input |
| `POST` | `/ai-guardrails/analyze-model` | Analyze LLM model |
| `GET` | `/ai-guardrails/config` | Get configuration |
| `PUT` | `/ai-guardrails/config` | Update configuration |
| `GET` | `/ai-guardrails/audit-log` | Get audit log |

---

## 🔐 Quantum Cryptography

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/quantum-crypto/dashboard` | Get quantum-safe status |
| `POST` | `/quantum-crypto/scan` | Scan for quantum vulnerabilities |
| `POST` | `/quantum-crypto/generate-keypair` | Generate PQC keypair |
| `POST` | `/quantum-crypto/migration-plan` | Get migration plan |
| `POST` | `/quantum-crypto/test-resistance` | Test algorithm resistance |
| `GET` | `/quantum-crypto/agility-score` | Get crypto agility score |

---

## 📦 Supply Chain Security

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/supply-chain/dashboard` | Get supply chain overview |
| `POST` | `/supply-chain/scan` | Scan a package |
| `POST` | `/supply-chain/analyze` | Analyze dependencies |
| `POST` | `/supply-chain/verify-attestation` | Verify SLSA attestation |

---

## 🔥 Breach Simulation

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/breach-sim/dashboard` | Get simulation overview |
| `GET` | `/breach-sim/scenarios` | List attack scenarios |
| `POST` | `/breach-sim/run` | Run a scenario |
| `GET` | `/breach-sim/results/:id` | Get simulation results |
| `POST` | `/breach-sim/custom` | Run custom simulation |

---

## 🪤 Deception Technology

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/deception/dashboard` | Get deception overview |
| `GET` | `/deception/honeypots` | List honeypots |
| `POST` | `/deception/honeypots/:id/interact` | Simulate interaction |
| `POST` | `/deception/decoys` | Create a decoy |
| `POST` | `/deception/breadcrumbs` | Generate breadcrumbs |
| `POST` | `/deception/analyze-attacker` | Analyze attacker behavior |

---

## 🏛️ Additional Modules

All security modules follow a consistent API pattern:

```
GET  /modules/{module}/dashboard  - Module overview
GET  /modules/{module}/items      - List items
POST /modules/{module}/items      - Create item
POST /modules/{module}/analyze    - AI analysis
```

### Available Modules
- `dark-web` - Dark web monitoring
- `phishing-sim` - Phishing simulation
- `incident-response` - Incident response playbooks
- `security-metrics` - KPI dashboards
- `zero-trust` - Zero trust posture
- `container-security` - Container scanning
- `cloud-security` - Cloud posture management
- `cicd-security` - CI/CD pipeline security
- `api-security` - API security testing
- `threat-hunting` - Proactive threat hunting
- `vendor-risk` - Third-party risk management

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid project ID",
    "details": { ... }
  }
}
```

---

## 🚦 Rate Limits

| Plan | Requests/min | Concurrent Scans |
|------|-------------|-----------------|
| Starter | 60 | 5 |
| Professional | 300 | 25 |
| Enterprise | 1000 | 100 |
| Unlimited | ∞ | ∞ |

---

## 📡 Webhooks

Configure webhooks to receive real-time notifications:

```json
POST /integrations/webhooks
{
  "url": "https://your-server.com/webhook",
  "events": [
    "scan.completed",
    "finding.new",
    "threat.detected",
    "compliance.alert"
  ],
  "secret": "your_webhook_secret"
}
```

---

## SDKs & Libraries

- **JavaScript/TypeScript**: `npm install @anchor-security/sdk`
- **Python**: `pip install anchor-security`
- **Go**: `go get github.com/anchor-security/anchor-go`

---

Last Updated: February 2026  
Version: 1.0.0
