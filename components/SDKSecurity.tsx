import { useState, useEffect } from 'react';

// ============================================================================
// SDK SECURITY - Multi-Language SDK Management, Security Scanning & Code Gen
// ============================================================================

interface SDK {
  id: string;
  language: string;
  icon: string;
  version: string;
  status: 'stable' | 'beta' | 'alpha' | 'deprecated';
  lastUpdated: string;
  downloads: number;
  securityScore: number;
  vulnerabilities: SDKVulnerability[];
  dependencies: SDKDependency[];
  installCommand: string;
  packageName: string;
  repoUrl: string;
  docsUrl: string;
  features: string[];
  size: string;
  minRuntime: string;
}

interface SDKVulnerability {
  id: string;
  cve?: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedVersions: string;
  fixedVersion: string;
  publishedDate: string;
}

interface SDKDependency {
  name: string;
  version: string;
  latest: string;
  isOutdated: boolean;
  hasVulnerabilities: boolean;
  license: string;
}

interface SDKScanResult {
  sdkId: string;
  timestamp: string;
  totalIssues: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  findings: SDKFinding[];
}

interface SDKFinding {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  remediation: string;
  file?: string;
  line?: number;
}

interface IntegrationGuide {
  language: string;
  title: string;
  code: string;
}

// SDK Data
const SDKS: SDK[] = [
  {
    id: 'python', language: 'Python', icon: '🐍', version: '2.4.1', status: 'stable',
    lastUpdated: '2026-02-05', downloads: 284500, securityScore: 96,
    installCommand: 'pip install anchor-security-sdk',
    packageName: 'anchor-security-sdk', repoUrl: 'https://github.com/anchor/python-sdk',
    docsUrl: 'https://docs.anchoraiguard.com/sdks/python', size: '2.8 MB', minRuntime: 'Python 3.9+',
    features: ['Threat Intelligence', 'Rule Generation', 'AI Analysis', 'IOC Enrichment', 'Async Support', 'Type Hints', 'Auto-Retry', 'Rate Limiting'],
    vulnerabilities: [], dependencies: [
      { name: 'httpx', version: '0.27.2', latest: '0.27.2', isOutdated: false, hasVulnerabilities: false, license: 'BSD-3' },
      { name: 'pydantic', version: '2.10.3', latest: '2.10.3', isOutdated: false, hasVulnerabilities: false, license: 'MIT' },
      { name: 'cryptography', version: '43.0.3', latest: '43.0.3', isOutdated: false, hasVulnerabilities: false, license: 'Apache-2.0' },
    ],
  },
  {
    id: 'nodejs', language: 'Node.js', icon: '🟢', version: '2.3.0', status: 'stable',
    lastUpdated: '2026-02-03', downloads: 312800, securityScore: 94,
    installCommand: 'npm install @anchor/security-sdk',
    packageName: '@anchor/security-sdk', repoUrl: 'https://github.com/anchor/node-sdk',
    docsUrl: 'https://docs.anchoraiguard.com/sdks/nodejs', size: '1.9 MB', minRuntime: 'Node.js 18+',
    features: ['Threat Intelligence', 'Rule Generation', 'AI Analysis', 'IOC Enrichment', 'TypeScript Native', 'Streaming', 'Auto-Retry', 'Webhook Support'],
    vulnerabilities: [
      { id: 'ANCHOR-2026-001', severity: 'low', title: 'Debug logging may expose API keys in verbose mode', description: 'When verbose logging is enabled, API keys may be written to stdout in plaintext.', affectedVersions: '< 2.2.5', fixedVersion: '2.2.5', publishedDate: '2026-01-15' },
    ],
    dependencies: [
      { name: 'undici', version: '6.21.0', latest: '6.21.0', isOutdated: false, hasVulnerabilities: false, license: 'MIT' },
      { name: 'zod', version: '3.24.1', latest: '3.24.1', isOutdated: false, hasVulnerabilities: false, license: 'MIT' },
      { name: 'jose', version: '5.9.6', latest: '5.9.6', isOutdated: false, hasVulnerabilities: false, license: 'MIT' },
    ],
  },
  {
    id: 'go', language: 'Go', icon: '🔷', version: '1.8.0', status: 'stable',
    lastUpdated: '2026-01-28', downloads: 156200, securityScore: 98,
    installCommand: 'go get github.com/anchor/security-sdk-go',
    packageName: 'github.com/anchor/security-sdk-go', repoUrl: 'https://github.com/anchor/go-sdk',
    docsUrl: 'https://docs.anchoraiguard.com/sdks/go', size: '4.2 MB', minRuntime: 'Go 1.22+',
    features: ['Threat Intelligence', 'Rule Generation', 'AI Analysis', 'IOC Enrichment', 'Context-Aware', 'Zero Alloc', 'Connection Pooling', 'gRPC Support'],
    vulnerabilities: [], dependencies: [
      { name: 'net/http', version: 'stdlib', latest: 'stdlib', isOutdated: false, hasVulnerabilities: false, license: 'BSD-3' },
      { name: 'crypto/tls', version: 'stdlib', latest: 'stdlib', isOutdated: false, hasVulnerabilities: false, license: 'BSD-3' },
    ],
  },
  {
    id: 'java', language: 'Java', icon: '☕', version: '2.1.0', status: 'stable',
    lastUpdated: '2026-01-20', downloads: 198400, securityScore: 95,
    installCommand: '<dependency>\n  <groupId>com.anchoraiguard</groupId>\n  <artifactId>security-sdk</artifactId>\n  <version>2.1.0</version>\n</dependency>',
    packageName: 'com.anchoraiguard:security-sdk', repoUrl: 'https://github.com/anchor/java-sdk',
    docsUrl: 'https://docs.anchoraiguard.com/sdks/java', size: '6.1 MB', minRuntime: 'Java 17+',
    features: ['Threat Intelligence', 'Rule Generation', 'AI Analysis', 'IOC Enrichment', 'Spring Boot Starter', 'Reactive Support', 'Connection Pooling', 'Retry Policies'],
    vulnerabilities: [], dependencies: [
      { name: 'okhttp3', version: '4.12.0', latest: '4.12.0', isOutdated: false, hasVulnerabilities: false, license: 'Apache-2.0' },
      { name: 'jackson-databind', version: '2.18.2', latest: '2.18.2', isOutdated: false, hasVulnerabilities: false, license: 'Apache-2.0' },
      { name: 'slf4j-api', version: '2.0.16', latest: '2.0.16', isOutdated: false, hasVulnerabilities: false, license: 'MIT' },
    ],
  },
  {
    id: 'csharp', language: 'C#', icon: '💜', version: '1.6.0', status: 'stable',
    lastUpdated: '2026-01-25', downloads: 89300, securityScore: 97,
    installCommand: 'dotnet add package Anchor.SecuritySDK',
    packageName: 'Anchor.SecuritySDK', repoUrl: 'https://github.com/anchor/dotnet-sdk',
    docsUrl: 'https://docs.anchoraiguard.com/sdks/csharp', size: '3.4 MB', minRuntime: '.NET 8+',
    features: ['Threat Intelligence', 'Rule Generation', 'AI Analysis', 'IOC Enrichment', 'Async/Await', 'DI Integration', 'Polly Resilience', 'Source Generators'],
    vulnerabilities: [], dependencies: [
      { name: 'System.Net.Http.Json', version: '9.0.1', latest: '9.0.1', isOutdated: false, hasVulnerabilities: false, license: 'MIT' },
      { name: 'Microsoft.Extensions.Http', version: '9.0.1', latest: '9.0.1', isOutdated: false, hasVulnerabilities: false, license: 'MIT' },
    ],
  },
  {
    id: 'ruby', language: 'Ruby', icon: '💎', version: '1.4.2', status: 'stable',
    lastUpdated: '2026-01-18', downloads: 45600, securityScore: 93,
    installCommand: 'gem install anchor-security-sdk',
    packageName: 'anchor-security-sdk', repoUrl: 'https://github.com/anchor/ruby-sdk',
    docsUrl: 'https://docs.anchoraiguard.com/sdks/ruby', size: '1.2 MB', minRuntime: 'Ruby 3.2+',
    features: ['Threat Intelligence', 'Rule Generation', 'AI Analysis', 'IOC Enrichment', 'Faraday Middleware', 'Rails Integration', 'Auto-Retry', 'Thread-Safe'],
    vulnerabilities: [
      { id: 'ANCHOR-2026-003', severity: 'medium', title: 'SSL certificate validation bypass in proxy mode', description: 'When using a proxy, SSL certificates may not be properly validated if the proxy_ssl_verify option is not explicitly set.', affectedVersions: '< 1.4.0', fixedVersion: '1.4.0', publishedDate: '2026-01-10' },
    ],
    dependencies: [
      { name: 'faraday', version: '2.12.2', latest: '2.12.2', isOutdated: false, hasVulnerabilities: false, license: 'MIT' },
      { name: 'oj', version: '3.16.8', latest: '3.16.8', isOutdated: false, hasVulnerabilities: false, license: 'MIT' },
    ],
  },
];

const INTEGRATION_GUIDES: IntegrationGuide[] = [
  {
    language: 'python',
    title: 'Python Quick Start',
    code: `from anchor_security import AnchorClient

# Initialize the SDK with your API key
client = AnchorClient(api_key="anc_your_api_key_here")

# Get real-time threat intelligence feed
threats = client.threats.list(
    severity="critical",
    limit=50,
    since="24h"
)

for threat in threats:
    print(f"[{threat.severity}] {threat.name}")
    print(f"  IOCs: {len(threat.indicators)}")
    print(f"  MITRE: {', '.join(threat.mitre_techniques)}")

# Generate a YARA detection rule
rule = client.rules.generate(
    threat_name="Cobalt Strike Beacon",
    rule_format="yara",
    confidence_threshold=0.85
)
print(rule.content)

# Analyze a suspicious file hash
analysis = client.analyze.submit(
    type="malware",
    data={"hash": "abc123def456..."},
    deep_scan=True
)
print(f"Verdict: {analysis.verdict}")
print(f"Confidence: {analysis.confidence}%")
print(f"Family: {analysis.malware_family}")

# Real-time IOC enrichment
enriched = client.ioc.enrich(
    indicators=["192.168.1.100", "evil-domain.com"],
    sources=["all"]
)
for ioc in enriched:
    print(f"{ioc.value}: Risk={ioc.risk_score}/100")`,
  },
  {
    language: 'nodejs',
    title: 'Node.js / TypeScript Quick Start',
    code: `import { AnchorClient } from '@anchor/security-sdk';

// Initialize with your API key
const client = new AnchorClient({
  apiKey: 'anc_your_api_key_here',
  region: 'us-east-1', // optional
});

// Get threat intelligence feed
const threats = await client.threats.list({
  severity: 'critical',
  limit: 50,
  since: '24h',
});

threats.forEach(threat => {
  console.log(\`[\${threat.severity}] \${threat.name}\`);
  console.log(\`  IOCs: \${threat.indicators.length}\`);
  console.log(\`  MITRE: \${threat.mitreTechniques.join(', ')}\`);
});

// Generate Sigma detection rules
const rule = await client.rules.generate({
  threatName: 'Cobalt Strike Beacon',
  format: 'sigma',
  confidenceThreshold: 0.85,
});
console.log(rule.content);

// Stream real-time threat events
const stream = client.threats.stream({ severity: ['critical', 'high'] });
for await (const event of stream) {
  console.log(\`New threat: \${event.name} [\${event.severity}]\`);
  // Auto-generate detection rule for new threats
  const autoRule = await client.rules.generate({
    threatName: event.name,
    format: 'sigma',
  });
  await deploy(autoRule);
}`,
  },
  {
    language: 'go',
    title: 'Go Quick Start',
    code: `package main

import (
    "context"
    "fmt"
    "log"

    anchor "github.com/anchor/security-sdk-go"
)

func main() {
    // Initialize the SDK
    client, err := anchor.NewClient(
        anchor.WithAPIKey("anc_your_api_key_here"),
        anchor.WithRegion("us-east-1"),
    )
    if err != nil {
        log.Fatal(err)
    }
    defer client.Close()

    ctx := context.Background()

    // Get threat intelligence feed
    threats, err := client.Threats.List(ctx, &anchor.ThreatListParams{
        Severity: anchor.SeverityCritical,
        Limit:    50,
        Since:    "24h",
    })
    if err != nil {
        log.Fatal(err)
    }

    for _, threat := range threats.Data {
        fmt.Printf("[%s] %s\\n", threat.Severity, threat.Name)
        fmt.Printf("  IOCs: %d\\n", len(threat.Indicators))
    }

    // Generate YARA rule
    rule, err := client.Rules.Generate(ctx, &anchor.RuleGenerateParams{
        ThreatName:          "Cobalt Strike Beacon",
        Format:              anchor.FormatYARA,
        ConfidenceThreshold: 0.85,
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(rule.Content)

    // Analyze suspicious hash
    analysis, err := client.Analyze.Submit(ctx, &anchor.AnalyzeParams{
        Type: anchor.AnalysisMalware,
        Data: map[string]string{"hash": "abc123def456..."},
    })
    if err != nil {
        log.Fatal(err)
    }
    fmt.Printf("Verdict: %s (Confidence: %d%%)\\n",
        analysis.Verdict, analysis.Confidence)
}`,
  },
  {
    language: 'java',
    title: 'Java Quick Start',
    code: `import com.anchoraiguard.sdk.AnchorClient;
import com.anchoraiguard.sdk.model.*;

public class SecurityScanner {
    public static void main(String[] args) {
        // Initialize the SDK
        AnchorClient client = AnchorClient.builder()
            .apiKey("anc_your_api_key_here")
            .region("us-east-1")
            .build();

        // Get threat intelligence feed
        ThreatListResponse threats = client.threats().list(
            ThreatListParams.builder()
                .severity(Severity.CRITICAL)
                .limit(50)
                .since("24h")
                .build()
        );

        threats.getData().forEach(threat -> {
            System.out.printf("[%s] %s%n", threat.getSeverity(), threat.getName());
            System.out.printf("  IOCs: %d%n", threat.getIndicators().size());
        });

        // Generate Sigma detection rules
        RuleResponse rule = client.rules().generate(
            RuleGenerateParams.builder()
                .threatName("Cobalt Strike Beacon")
                .format(RuleFormat.SIGMA)
                .confidenceThreshold(0.85)
                .build()
        );
        System.out.println(rule.getContent());

        // Analyze suspicious file hash
        AnalysisResult analysis = client.analyze().submit(
            AnalyzeParams.builder()
                .type(AnalysisType.MALWARE)
                .data(Map.of("hash", "abc123def456..."))
                .deepScan(true)
                .build()
        );
        System.out.printf("Verdict: %s (%d%% confidence)%n",
            analysis.getVerdict(), analysis.getConfidence());
    }
}`,
  },
  {
    language: 'csharp',
    title: 'C# / .NET Quick Start',
    code: `using Anchor.SecuritySDK;
using Anchor.SecuritySDK.Models;

// Initialize with dependency injection (recommended)
builder.Services.AddAnchorSecurity(options =>
{
    options.ApiKey = "anc_your_api_key_here";
    options.Region = "us-east-1";
});

// Or create directly
var client = new AnchorClient(new AnchorOptions
{
    ApiKey = "anc_your_api_key_here"
});

// Get threat intelligence feed
var threats = await client.Threats.ListAsync(new ThreatListParams
{
    Severity = Severity.Critical,
    Limit = 50,
    Since = "24h"
});

foreach (var threat in threats.Data)
{
    Console.WriteLine($"[{threat.Severity}] {threat.Name}");
    Console.WriteLine($"  IOCs: {threat.Indicators.Count}");
}

// Generate YARA detection rules
var rule = await client.Rules.GenerateAsync(new RuleGenerateParams
{
    ThreatName = "Cobalt Strike Beacon",
    Format = RuleFormat.Yara,
    ConfidenceThreshold = 0.85
});
Console.WriteLine(rule.Content);

// Analyze suspicious hash with cancellation support
using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(5));
var analysis = await client.Analyze.SubmitAsync(
    new AnalyzeParams
    {
        Type = AnalysisType.Malware,
        Data = new { Hash = "abc123def456..." },
        DeepScan = true
    },
    cts.Token
);
Console.WriteLine($"Verdict: {analysis.Verdict} ({analysis.Confidence}%)");`,
  },
  {
    language: 'ruby',
    title: 'Ruby Quick Start',
    code: `require 'anchor_security'

# Initialize the SDK
client = Anchor::Client.new(
  api_key: 'anc_your_api_key_here',
  region: 'us-east-1'
)

# Get threat intelligence feed
threats = client.threats.list(
  severity: :critical,
  limit: 50,
  since: '24h'
)

threats.each do |threat|
  puts "[#{threat.severity}] #{threat.name}"
  puts "  IOCs: #{threat.indicators.count}"
  puts "  MITRE: #{threat.mitre_techniques.join(', ')}"
end

# Generate YARA detection rules
rule = client.rules.generate(
  threat_name: 'Cobalt Strike Beacon',
  format: :yara,
  confidence_threshold: 0.85
)
puts rule.content

# Analyze suspicious hash
analysis = client.analyze.submit(
  type: :malware,
  data: { hash: 'abc123def456...' },
  deep_scan: true
)
puts "Verdict: #{analysis.verdict} (#{analysis.confidence}%)"
puts "Family: #{analysis.malware_family}"

# Rails integration
# config/initializers/anchor.rb
Anchor.configure do |config|
  config.api_key = ENV['ANCHOR_API_KEY']
  config.logger = Rails.logger
  config.retry_count = 3
end`,
  },
];

const SECURITY_BEST_PRACTICES = [
  { id: 'key-rotation', title: 'API Key Rotation', description: 'Rotate API keys every 90 days. All SDKs support hot-swapping keys without downtime.', severity: 'high' as const },
  { id: 'env-vars', title: 'Environment Variables', description: 'Never hardcode API keys. Use environment variables or secret managers (Vault, AWS Secrets Manager).', severity: 'critical' as const },
  { id: 'tls-pinning', title: 'TLS Certificate Pinning', description: 'Enable certificate pinning in production to prevent MITM attacks. All SDKs support custom CA bundles.', severity: 'high' as const },
  { id: 'rate-limiting', title: 'Client-Side Rate Limiting', description: 'Enable built-in rate limiting to prevent accidental API abuse and quota exhaustion.', severity: 'medium' as const },
  { id: 'error-handling', title: 'Secure Error Handling', description: 'Never log full error responses in production — they may contain sensitive data. Use structured logging.', severity: 'high' as const },
  { id: 'version-pinning', title: 'Version Pinning', description: 'Pin SDK versions in production. Use lockfiles and verify package checksums.', severity: 'medium' as const },
  { id: 'proxy-config', title: 'Proxy Security', description: 'When using proxies, always enable SSL verification. Set proxy_ssl_verify=true explicitly.', severity: 'high' as const },
  { id: 'timeout-config', title: 'Timeout Configuration', description: 'Set appropriate connection and read timeouts to prevent hanging connections and resource exhaustion.', severity: 'medium' as const },
];

export default function SDKSecurity() {
  const [activeTab, setActiveTab] = useState<'overview' | 'sdks' | 'security' | 'integration' | 'scanner'>('overview');
  const [selectedSDK, setSelectedSDK] = useState<SDK | null>(null);
  const [scanningSDK, setScanningSDK] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<SDKScanResult[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [copiedInstall, setCopiedInstall] = useState<string | null>(null);
  const [showVulnDetails, setShowVulnDetails] = useState<string | null>(null);

  useEffect(() => {
    // Simulate initial load
  }, []);

  const runSDKScan = (sdkId: string) => {
    setScanningSDK(sdkId);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanningSDK(null);
          const newResult: SDKScanResult = {
            sdkId,
            timestamp: new Date().toISOString(),
            totalIssues: Math.floor(Math.random() * 5),
            critical: 0,
            high: Math.floor(Math.random() * 2),
            medium: Math.floor(Math.random() * 3),
            low: Math.floor(Math.random() * 3),
            findings: [
              { id: `f-${Date.now()}-1`, category: 'Dependency', severity: 'medium', title: 'Outdated transitive dependency detected', description: 'A transitive dependency is 2+ minor versions behind and may contain known vulnerabilities.', remediation: 'Run dependency update and re-test.' },
              { id: `f-${Date.now()}-2`, category: 'Configuration', severity: 'low', title: 'Debug logging enabled by default', description: 'SDK debug logging is enabled which may expose sensitive request/response data.', remediation: 'Set debug=false in production configuration.' },
              { id: `f-${Date.now()}-3`, category: 'Authentication', severity: 'info', title: 'API key transmitted via header (secure)', description: 'API keys are correctly transmitted via x-api-key header over TLS.', remediation: 'No action required - this is the recommended approach.' },
            ],
          };
          setScanResults(prev => [newResult, ...prev.filter(r => r.sdkId !== sdkId)]);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);
  };

  const copyToClipboard = (text: string, sdkId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedInstall(sdkId);
    setTimeout(() => setCopiedInstall(null), 2000);
  };

  const totalDownloads = SDKS.reduce((acc, sdk) => acc + sdk.downloads, 0);
  const avgSecurityScore = Math.round(SDKS.reduce((acc, sdk) => acc + sdk.securityScore, 0) / SDKS.length);
  const totalVulns = SDKS.reduce((acc, sdk) => acc + sdk.vulnerabilities.length, 0);

  const sevColor = (s: string) => {
    switch (s) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'stable': return 'text-green-400 bg-green-500/20';
      case 'beta': return 'text-yellow-400 bg-yellow-500/20';
      case 'alpha': return 'text-orange-400 bg-orange-500/20';
      case 'deprecated': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">📦</span>
            SDK Security
          </h1>
          <p className="text-gray-400 mt-1">Manage, scan, and secure official Anchor SDKs across all languages</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              SDKS.forEach(sdk => runSDKScan(sdk.id));
            }}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
          >
            <span>🔍</span> Scan All SDKs
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Official SDKs', value: SDKS.length.toString(), icon: '📦', color: 'cyan' },
          { label: 'Total Downloads', value: `${(totalDownloads / 1000).toFixed(0)}K+`, icon: '📥', color: 'green' },
          { label: 'Avg Security Score', value: `${avgSecurityScore}/100`, icon: '🛡️', color: 'blue' },
          { label: 'Known Vulns', value: totalVulns.toString(), icon: '⚠️', color: totalVulns > 0 ? 'yellow' : 'green' },
          { label: 'Languages', value: SDKS.length.toString(), icon: '🌐', color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className={`bg-gray-900 rounded-xl border border-${stat.color}-500/20 p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase">{stat.label}</span>
              <span>{stat.icon}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800">
        <div className="flex gap-1">
          {[
            { id: 'overview' as const, label: 'Overview', icon: '📊' },
            { id: 'sdks' as const, label: 'SDK Catalog', icon: '📦' },
            { id: 'security' as const, label: 'Security Analysis', icon: '🔒' },
            { id: 'integration' as const, label: 'Integration Guides', icon: '📖' },
            { id: 'scanner' as const, label: 'Dependency Scanner', icon: '🔍' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* SDK Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SDKS.map(sdk => (
              <div
                key={sdk.id}
                onClick={() => { setSelectedSDK(sdk); setActiveTab('sdks'); }}
                className="bg-gray-900 rounded-xl border border-gray-800 hover:border-cyan-500/40 p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-cyan-500/5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{sdk.icon}</span>
                    <div>
                      <h3 className="font-bold">{sdk.language}</h3>
                      <span className="text-xs text-gray-500">v{sdk.version}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(sdk.status)}`}>
                    {sdk.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-400">Security Score</span>
                      <span className={sdk.securityScore >= 95 ? 'text-green-400' : sdk.securityScore >= 90 ? 'text-yellow-400' : 'text-red-400'}>
                        {sdk.securityScore}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${sdk.securityScore >= 95 ? 'bg-green-500' : sdk.securityScore >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${sdk.securityScore}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{(sdk.downloads / 1000).toFixed(0)}K downloads</span>
                  <span>{sdk.vulnerabilities.length} vulns</span>
                  <span>{sdk.dependencies.length} deps</span>
                </div>
                {sdk.vulnerabilities.length > 0 && (
                  <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-xs text-yellow-400">
                    ⚠️ {sdk.vulnerabilities.length} known vulnerability{sdk.vulnerabilities.length > 1 ? 'ies' : 'y'} (all patched in latest)
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Security Best Practices */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">🔒 SDK Security Best Practices</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {SECURITY_BEST_PRACTICES.map(practice => (
                <div key={practice.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${sevColor(practice.severity)}`}>
                    {practice.severity}
                  </span>
                  <div>
                    <h4 className="font-medium text-sm">{practice.title}</h4>
                    <p className="text-gray-400 text-xs mt-1">{practice.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SDK Catalog Tab */}
      {activeTab === 'sdks' && (
        <div className="space-y-6">
          {selectedSDK ? (
            <div className="space-y-6">
              <button
                onClick={() => setSelectedSDK(null)}
                className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1"
              >
                ← Back to all SDKs
              </button>

              {/* SDK Detail Header */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-5xl">{selectedSDK.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedSDK.language} SDK</h2>
                      <p className="text-gray-400">v{selectedSDK.version} • {selectedSDK.packageName}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(selectedSDK.status)}`}>
                          {selectedSDK.status}
                        </span>
                        <span className="text-xs text-gray-500">Updated {selectedSDK.lastUpdated}</span>
                        <span className="text-xs text-gray-500">{selectedSDK.size}</span>
                        <span className="text-xs text-gray-500">{selectedSDK.minRuntime}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => runSDKScan(selectedSDK.id)}
                    disabled={scanningSDK === selectedSDK.id}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {scanningSDK === selectedSDK.id ? `Scanning... ${Math.round(scanProgress)}%` : '🔍 Run Security Scan'}
                  </button>
                </div>
              </div>

              {/* Install */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="font-bold mb-3">Installation</h3>
                <div className="relative">
                  <pre className="bg-gray-950 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
                    <code>{selectedSDK.installCommand}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(selectedSDK.installCommand, selectedSDK.id)}
                    className="absolute top-2 right-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
                  >
                    {copiedInstall === selectedSDK.id ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="font-bold mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSDK.features.map(feature => (
                    <span key={feature} className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm border border-cyan-500/20">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dependencies */}
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="font-bold mb-3">Dependencies ({selectedSDK.dependencies.length})</h3>
                <div className="space-y-2">
                  {selectedSDK.dependencies.map(dep => (
                    <div key={dep.name} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${dep.hasVulnerabilities ? 'bg-red-500' : dep.isOutdated ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <span className="font-mono text-sm">{dep.name}</span>
                        <span className="text-xs text-gray-500">v{dep.version}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">{dep.license}</span>
                        {dep.isOutdated && <span className="text-xs text-yellow-400">Update available: {dep.latest}</span>}
                        {dep.hasVulnerabilities && <span className="text-xs text-red-400">⚠️ Vulnerable</span>}
                        {!dep.isOutdated && !dep.hasVulnerabilities && <span className="text-xs text-green-400">✓ Secure</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vulnerabilities */}
              {selectedSDK.vulnerabilities.length > 0 && (
                <div className="bg-gray-900 rounded-xl border border-yellow-500/30 p-6">
                  <h3 className="font-bold mb-3 text-yellow-400">⚠️ Known Vulnerabilities ({selectedSDK.vulnerabilities.length})</h3>
                  <div className="space-y-3">
                    {selectedSDK.vulnerabilities.map(vuln => (
                      <div key={vuln.id} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${sevColor(vuln.severity)}`}>
                              {vuln.severity}
                            </span>
                            <span className="font-medium text-sm">{vuln.title}</span>
                          </div>
                          <span className="text-xs text-gray-500">{vuln.id}</span>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{vuln.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Affected: {vuln.affectedVersions}</span>
                          <span className="text-green-400">Fixed in: {vuln.fixedVersion}</span>
                          <span>Published: {vuln.publishedDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scan Results */}
              {scanResults.filter(r => r.sdkId === selectedSDK.id).map(result => (
                <div key={result.timestamp} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                  <h3 className="font-bold mb-3">Latest Scan Results</h3>
                  <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{result.totalIssues}</div>
                      <div className="text-xs text-gray-500">Total Issues</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-400">{result.critical}</div>
                      <div className="text-xs text-gray-500">Critical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-400">{result.high}</div>
                      <div className="text-xs text-gray-500">High</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-400">{result.medium}</div>
                      <div className="text-xs text-gray-500">Medium</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-400">{result.low}</div>
                      <div className="text-xs text-gray-500">Low</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {result.findings.map(finding => (
                      <div key={finding.id} className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${sevColor(finding.severity)}`}>
                          {finding.severity}
                        </span>
                        <div>
                          <h4 className="font-medium text-sm">{finding.title}</h4>
                          <p className="text-gray-400 text-xs mt-1">{finding.description}</p>
                          <p className="text-cyan-400 text-xs mt-1">💡 {finding.remediation}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {SDKS.map(sdk => (
                <div
                  key={sdk.id}
                  onClick={() => setSelectedSDK(sdk)}
                  className="bg-gray-900 rounded-xl border border-gray-800 hover:border-cyan-500/40 p-5 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{sdk.icon}</span>
                      <div>
                        <h3 className="font-bold text-lg">{sdk.language} SDK</h3>
                        <p className="text-gray-400 text-sm">{sdk.packageName} • v{sdk.version}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className={`text-lg font-bold ${sdk.securityScore >= 95 ? 'text-green-400' : sdk.securityScore >= 90 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {sdk.securityScore}
                        </div>
                        <div className="text-xs text-gray-500">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{(sdk.downloads / 1000).toFixed(0)}K</div>
                        <div className="text-xs text-gray-500">Downloads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold">{sdk.dependencies.length}</div>
                        <div className="text-xs text-gray-500">Deps</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(sdk.status)}`}>
                        {sdk.status}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); runSDKScan(sdk.id); }}
                        disabled={scanningSDK === sdk.id}
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-sm rounded-lg transition-colors"
                      >
                        {scanningSDK === sdk.id ? `${Math.round(scanProgress)}%` : 'Scan'}
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {sdk.features.slice(0, 5).map(f => (
                      <span key={f} className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full">{f}</span>
                    ))}
                    {sdk.features.length > 5 && (
                      <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-500 rounded-full">+{sdk.features.length - 5} more</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Security Analysis Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Vulnerability Overview */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4">Vulnerability Overview Across All SDKs</h3>
            <div className="space-y-4">
              {SDKS.map(sdk => {
                const result = scanResults.find(r => r.sdkId === sdk.id);
                return (
                  <div key={sdk.id} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{sdk.icon}</span>
                        <span className="font-medium">{sdk.language} SDK v{sdk.version}</span>
                        {sdk.vulnerabilities.length === 0 && (!result || result.critical === 0) && <span className="text-green-400 text-xs">✓ Clean</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${sdk.securityScore >= 95 ? 'bg-green-500' : sdk.securityScore >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        <span className="text-sm">{sdk.securityScore}/100</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${sdk.securityScore >= 95 ? 'bg-green-500' : sdk.securityScore >= 90 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${sdk.securityScore}%` }}
                      />
                    </div>
                    {sdk.vulnerabilities.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {sdk.vulnerabilities.map(v => (
                          <div key={v.id} className="flex items-center gap-2 text-xs">
                            <span className={`px-1.5 py-0.5 rounded font-bold uppercase border ${sevColor(v.severity)}`}>{v.severity}</span>
                            <span className="text-gray-300">{v.title}</span>
                            <span className="text-green-400 ml-auto">Fixed in {v.fixedVersion}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Supply Chain Security */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4">🔗 Supply Chain Security</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: 'Package Integrity', desc: 'All SDK packages are signed with GPG keys and published via verified CI/CD pipelines.', status: 'verified', icon: '✅' },
                { title: 'SBOM Generated', desc: 'Software Bill of Materials (SBOM) in SPDX format is published with every release.', status: 'verified', icon: '📋' },
                { title: 'Reproducible Builds', desc: 'Builds are deterministic and reproducible from source for independent verification.', status: 'verified', icon: '🔄' },
                { title: 'Dependency Pinning', desc: 'All transitive dependencies are pinned to exact versions with integrity checksums.', status: 'verified', icon: '📌' },
                { title: 'SLSA Level 3', desc: 'All SDK build processes meet SLSA Level 3 supply chain integrity requirements.', status: 'verified', icon: '🏛️' },
                { title: 'Provenance Attestation', desc: 'Sigstore-based attestations prove the origin and build process of each artifact.', status: 'verified', icon: '🔐' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-green-500/10">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <h4 className="font-medium text-sm">{item.title}</h4>
                    <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
                    <span className="text-green-400 text-xs font-medium mt-2 inline-block">● Verified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* License Compliance */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="text-lg font-bold mb-4">📜 License Compliance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left py-2 px-3">SDK</th>
                    <th className="text-left py-2 px-3">License</th>
                    <th className="text-left py-2 px-3">Dependencies</th>
                    <th className="text-left py-2 px-3">Copyleft Risk</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SDKS.map(sdk => (
                    <tr key={sdk.id} className="border-b border-gray-800/50">
                      <td className="py-3 px-3 flex items-center gap-2">
                        <span>{sdk.icon}</span>
                        <span>{sdk.language}</span>
                      </td>
                      <td className="py-3 px-3 text-gray-400">Apache-2.0</td>
                      <td className="py-3 px-3 text-gray-400">
                        {sdk.dependencies.map(d => d.license).join(', ')}
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-green-400 text-xs">None</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="text-green-400 text-xs">✓ Compliant</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Integration Guides Tab */}
      {activeTab === 'integration' && (
        <div className="space-y-6">
          {/* Language Selector */}
          <div className="flex gap-2 flex-wrap">
            {SDKS.map(sdk => (
              <button
                key={sdk.id}
                onClick={() => setSelectedLanguage(sdk.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedLanguage === sdk.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{sdk.icon}</span>
                {sdk.language}
              </button>
            ))}
          </div>

          {/* Install Command */}
          {(() => {
            const sdk = SDKS.find(s => s.id === selectedLanguage);
            if (!sdk) return null;
            return (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="font-bold mb-3">📥 Installation</h3>
                <div className="relative">
                  <pre className="bg-gray-950 rounded-lg p-4 text-sm text-green-400 overflow-x-auto">
                    <code>{sdk.installCommand}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(sdk.installCommand, sdk.id)}
                    className="absolute top-2 right-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
                  >
                    {copiedInstall === sdk.id ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  <span>v{sdk.version}</span>
                  <span>{sdk.minRuntime}</span>
                  <span>{sdk.size}</span>
                  <span className="text-green-400">● {sdk.status}</span>
                </div>
              </div>
            );
          })()}

          {/* Code Example */}
          {(() => {
            const guide = INTEGRATION_GUIDES.find(g => g.language === selectedLanguage);
            if (!guide) return null;
            return (
              <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
                <h3 className="font-bold mb-3">🚀 {guide.title}</h3>
                <div className="relative">
                  <pre className="bg-gray-950 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto max-h-[600px]">
                    <code>{guide.code}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(guide.code, `code-${selectedLanguage}`)}
                    className="absolute top-2 right-2 px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs transition-colors"
                  >
                    {copiedInstall === `code-${selectedLanguage}` ? '✓ Copied' : '📋 Copy'}
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Security Configuration */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <h3 className="font-bold mb-3">🔒 Recommended Security Configuration</h3>
            <pre className="bg-gray-950 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
              <code>{selectedLanguage === 'python' ? `from anchor_security import AnchorClient

client = AnchorClient(
    api_key=os.environ["ANCHOR_API_KEY"],  # Never hardcode!
    
    # Security settings
    tls_verify=True,                # Always verify TLS certificates
    tls_min_version="1.3",          # Minimum TLS 1.3
    certificate_pinning=True,       # Enable cert pinning in production
    
    # Rate limiting
    max_retries=3,                  # Auto-retry on transient failures
    rate_limit_enabled=True,        # Client-side rate limiting
    
    # Logging
    log_level="WARNING",            # Don't log sensitive data
    redact_api_keys=True,           # Auto-redact keys from logs
    
    # Timeouts
    connect_timeout=10,             # 10 second connection timeout
    read_timeout=30,                # 30 second read timeout
)` : selectedLanguage === 'nodejs' ? `import { AnchorClient } from '@anchor/security-sdk';

const client = new AnchorClient({
  apiKey: process.env.ANCHOR_API_KEY,  // Never hardcode!
  
  // Security settings
  tlsVerify: true,               // Always verify TLS
  tlsMinVersion: '1.3',          // Minimum TLS 1.3
  certificatePinning: true,      // Enable cert pinning
  
  // Rate limiting
  maxRetries: 3,                 // Auto-retry on transient failures
  rateLimitEnabled: true,        // Client-side rate limiting
  
  // Logging
  logLevel: 'warn',              // Don't log sensitive data
  redactApiKeys: true,           // Auto-redact keys from logs
  
  // Timeouts
  connectTimeout: 10_000,        // 10 second connection timeout
  readTimeout: 30_000,           // 30 second read timeout
});` : selectedLanguage === 'go' ? `client, err := anchor.NewClient(
    anchor.WithAPIKey(os.Getenv("ANCHOR_API_KEY")),
    
    // Security settings
    anchor.WithTLSVerify(true),
    anchor.WithTLSMinVersion(tls.VersionTLS13),
    anchor.WithCertificatePinning(true),
    
    // Rate limiting
    anchor.WithMaxRetries(3),
    anchor.WithRateLimiting(true),
    
    // Logging
    anchor.WithLogLevel(anchor.LogWarn),
    anchor.WithRedactAPIKeys(true),
    
    // Timeouts
    anchor.WithConnectTimeout(10 * time.Second),
    anchor.WithReadTimeout(30 * time.Second),
)` : selectedLanguage === 'java' ? `AnchorClient client = AnchorClient.builder()
    .apiKey(System.getenv("ANCHOR_API_KEY"))
    
    // Security settings
    .tlsVerify(true)
    .tlsMinVersion("1.3")
    .certificatePinning(true)
    
    // Rate limiting
    .maxRetries(3)
    .rateLimitEnabled(true)
    
    // Logging
    .logLevel(LogLevel.WARN)
    .redactApiKeys(true)
    
    // Timeouts
    .connectTimeout(Duration.ofSeconds(10))
    .readTimeout(Duration.ofSeconds(30))
    .build();` : selectedLanguage === 'csharp' ? `var client = new AnchorClient(new AnchorOptions
{
    ApiKey = Environment.GetEnvironmentVariable("ANCHOR_API_KEY"),
    
    // Security settings
    TlsVerify = true,
    TlsMinVersion = SslProtocols.Tls13,
    CertificatePinning = true,
    
    // Rate limiting
    MaxRetries = 3,
    RateLimitEnabled = true,
    
    // Logging
    LogLevel = LogLevel.Warning,
    RedactApiKeys = true,
    
    // Timeouts
    ConnectTimeout = TimeSpan.FromSeconds(10),
    ReadTimeout = TimeSpan.FromSeconds(30),
});` : `client = Anchor::Client.new(
  api_key: ENV['ANCHOR_API_KEY'],
  
  # Security settings
  tls_verify: true,
  tls_min_version: :TLSv1_3,
  certificate_pinning: true,
  
  # Rate limiting
  max_retries: 3,
  rate_limit_enabled: true,
  
  # Logging
  log_level: :warn,
  redact_api_keys: true,
  
  # Timeouts
  connect_timeout: 10,
  read_timeout: 30,
)`}</code>
            </pre>
          </div>
        </div>
      )}

      {/* Dependency Scanner Tab */}
      {activeTab === 'scanner' && (
        <div className="space-y-6">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">🔍 SDK Dependency Scanner</h3>
              <button
                onClick={() => SDKS.forEach(sdk => runSDKScan(sdk.id))}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Scan All Dependencies
              </button>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Deep dependency analysis across all official SDKs. Checks for known CVEs, license compliance, and outdated packages.
            </p>

            {/* Scan Progress */}
            {scanningSDK && (
              <div className="mb-4 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-cyan-400">Scanning {SDKS.find(s => s.id === scanningSDK)?.language} SDK...</span>
                  <span className="text-sm text-cyan-400">{Math.round(scanProgress)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-cyan-500 transition-all"
                    style={{ width: `${Math.min(scanProgress, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* All Dependencies Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-800">
                    <th className="text-left py-2 px-3">SDK</th>
                    <th className="text-left py-2 px-3">Dependency</th>
                    <th className="text-left py-2 px-3">Version</th>
                    <th className="text-left py-2 px-3">Latest</th>
                    <th className="text-left py-2 px-3">License</th>
                    <th className="text-left py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {SDKS.flatMap(sdk =>
                    sdk.dependencies.map(dep => (
                      <tr key={`${sdk.id}-${dep.name}`} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="py-2 px-3 flex items-center gap-2">
                          <span>{sdk.icon}</span>
                          <span className="text-gray-400">{sdk.language}</span>
                        </td>
                        <td className="py-2 px-3 font-mono">{dep.name}</td>
                        <td className="py-2 px-3 text-gray-400">{dep.version}</td>
                        <td className="py-2 px-3 text-gray-400">{dep.latest}</td>
                        <td className="py-2 px-3 text-gray-400">{dep.license}</td>
                        <td className="py-2 px-3">
                          {dep.hasVulnerabilities ? (
                            <span className="text-red-400 text-xs font-medium">⚠️ Vulnerable</span>
                          ) : dep.isOutdated ? (
                            <span className="text-yellow-400 text-xs font-medium">↑ Update</span>
                          ) : (
                            <span className="text-green-400 text-xs font-medium">✓ Secure</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Scan History */}
          {scanResults.length > 0 && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <h3 className="text-lg font-bold mb-4">📋 Scan History</h3>
              <div className="space-y-3">
                {scanResults.map((result, i) => {
                  const sdk = SDKS.find(s => s.id === result.sdkId);
                  return (
                    <div key={i} className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{sdk?.icon}</span>
                          <span className="font-medium">{sdk?.language} SDK</span>
                          <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          {result.critical > 0 && <span className="text-red-400">{result.critical} critical</span>}
                          {result.high > 0 && <span className="text-orange-400">{result.high} high</span>}
                          {result.medium > 0 && <span className="text-yellow-400">{result.medium} medium</span>}
                          {result.low > 0 && <span className="text-blue-400">{result.low} low</span>}
                          {result.totalIssues === 0 && <span className="text-green-400">✓ No issues</span>}
                        </div>
                      </div>
                      {result.findings.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {result.findings.map(f => (
                            <div key={f.id} className="flex items-center gap-2 text-xs">
                              <span className={`px-1.5 py-0.5 rounded font-bold uppercase border ${sevColor(f.severity)}`}>{f.severity}</span>
                              <span className="text-gray-300">{f.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SDK Detail Modal for vulnerability details */}
      {showVulnDetails && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowVulnDetails(null)}>
          <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">Vulnerability Details</h3>
            <pre className="bg-gray-950 rounded p-4 text-xs text-gray-300 overflow-x-auto">{showVulnDetails}</pre>
            <button onClick={() => setShowVulnDetails(null)} className="mt-4 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
