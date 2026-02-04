import React, { useState } from 'react';

// ============================================================================
// API SECURITY SCANNER - OWASP API TOP 10 & COMPREHENSIVE API TESTING
// ============================================================================

interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description?: string;
  authenticated: boolean;
  deprecated: boolean;
  riskLevel: 'critical' | 'high' | 'medium' | 'low' | 'info';
  findings: APIFinding[];
  lastScanned: string;
  responseTime: number;
}

interface APIFinding {
  id: string;
  owaspCategory: string;
  owaspId: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  evidence: string;
  remediation: string;
  cwe: string;
  endpoint: string;
}

interface APICollection {
  id: string;
  name: string;
  baseUrl: string;
  version: string;
  endpointCount: number;
  findingsCount: number;
  criticalFindings: number;
  lastScan: string;
  status: 'healthy' | 'warning' | 'critical';
  authType: 'none' | 'api_key' | 'bearer' | 'oauth2' | 'basic';
}

interface OWASPCategory {
  id: string;
  name: string;
  description: string;
  findingsCount: number;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

// OWASP API Top 10 2023
const OWASP_API_TOP_10: OWASPCategory[] = [
  { id: 'API1', name: 'Broken Object Level Authorization', description: 'APIs expose endpoints handling object identifiers, creating attack surface for BOLA', findingsCount: 0, severity: 'critical' },
  { id: 'API2', name: 'Broken Authentication', description: 'Authentication mechanisms implemented incorrectly allowing attackers to compromise tokens', findingsCount: 0, severity: 'critical' },
  { id: 'API3', name: 'Broken Object Property Level Authorization', description: 'Lack of authorization validation at property level leading to information disclosure', findingsCount: 0, severity: 'high' },
  { id: 'API4', name: 'Unrestricted Resource Consumption', description: 'APIs not restricting size or number of resources requested by clients', findingsCount: 0, severity: 'medium' },
  { id: 'API5', name: 'Broken Function Level Authorization', description: 'Complex access control policies with different hierarchies and roles', findingsCount: 0, severity: 'critical' },
  { id: 'API6', name: 'Unrestricted Access to Sensitive Business Flows', description: 'Exposing business flow without restricting automated access', findingsCount: 0, severity: 'high' },
  { id: 'API7', name: 'Server Side Request Forgery', description: 'SSRF flaws when API fetches remote resources without validating user-supplied URL', findingsCount: 0, severity: 'high' },
  { id: 'API8', name: 'Security Misconfiguration', description: 'APIs and supporting systems contain misconfigurations', findingsCount: 0, severity: 'medium' },
  { id: 'API9', name: 'Improper Inventory Management', description: 'APIs exposing more endpoints than intended, including deprecated versions', findingsCount: 0, severity: 'medium' },
  { id: 'API10', name: 'Unsafe Consumption of APIs', description: 'Developers trust third-party APIs more than user input', findingsCount: 0, severity: 'high' },
];

export const APISecurityScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'endpoints' | 'findings' | 'owasp' | 'discovery'>('overview');
  const [_selectedEndpoint, _setSelectedEndpoint] = useState<APIEndpoint | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Mock API collections
  const collections: APICollection[] = [
    { id: 'col-1', name: 'Production API', baseUrl: 'https://api.company.com/v2', version: '2.1.0', endpointCount: 47, findingsCount: 12, criticalFindings: 3, lastScan: '2026-02-04T10:00:00Z', status: 'critical', authType: 'bearer' },
    { id: 'col-2', name: 'Internal API', baseUrl: 'https://internal-api.company.com', version: '1.5.0', endpointCount: 23, findingsCount: 5, criticalFindings: 0, lastScan: '2026-02-03T14:30:00Z', status: 'warning', authType: 'api_key' },
    { id: 'col-3', name: 'Partner API', baseUrl: 'https://partners.company.com/api', version: '3.0.0', endpointCount: 15, findingsCount: 2, criticalFindings: 0, lastScan: '2026-02-02T08:00:00Z', status: 'healthy', authType: 'oauth2' },
  ];

  // Mock endpoints
  const endpoints: APIEndpoint[] = [
    { id: 'ep-1', method: 'GET', path: '/users/{id}', description: 'Get user by ID', authenticated: true, deprecated: false, riskLevel: 'critical', findings: [], lastScanned: '2026-02-04T10:00:00Z', responseTime: 45 },
    { id: 'ep-2', method: 'POST', path: '/users', description: 'Create new user', authenticated: true, deprecated: false, riskLevel: 'high', findings: [], lastScanned: '2026-02-04T10:00:00Z', responseTime: 120 },
    { id: 'ep-3', method: 'DELETE', path: '/users/{id}', description: 'Delete user', authenticated: true, deprecated: false, riskLevel: 'critical', findings: [], lastScanned: '2026-02-04T10:00:00Z', responseTime: 35 },
    { id: 'ep-4', method: 'GET', path: '/users/{id}/orders', description: 'Get user orders', authenticated: true, deprecated: false, riskLevel: 'high', findings: [], lastScanned: '2026-02-04T10:00:00Z', responseTime: 230 },
    { id: 'ep-5', method: 'POST', path: '/auth/login', description: 'User login', authenticated: false, deprecated: false, riskLevel: 'medium', findings: [], lastScanned: '2026-02-04T10:00:00Z', responseTime: 180 },
    { id: 'ep-6', method: 'GET', path: '/v1/users', description: 'Legacy user list', authenticated: false, deprecated: true, riskLevel: 'critical', findings: [], lastScanned: '2026-02-04T10:00:00Z', responseTime: 560 },
    { id: 'ep-7', method: 'POST', path: '/files/upload', description: 'File upload', authenticated: true, deprecated: false, riskLevel: 'high', findings: [], lastScanned: '2026-02-04T10:00:00Z', responseTime: 890 },
    { id: 'ep-8', method: 'GET', path: '/admin/settings', description: 'Admin settings', authenticated: true, deprecated: false, riskLevel: 'critical', findings: [], lastScanned: '2026-02-04T10:00:00Z', responseTime: 25 },
  ];

  // Mock findings
  const findings: APIFinding[] = [
    {
      id: 'find-1',
      owaspCategory: 'Broken Object Level Authorization',
      owaspId: 'API1',
      title: 'IDOR Vulnerability in User Endpoint',
      severity: 'critical',
      description: 'The /users/{id} endpoint allows authenticated users to access any user record by changing the ID parameter.',
      evidence: 'Request: GET /users/12345 with auth token for user 67890 returns user 12345 data',
      remediation: 'Implement proper authorization checks to ensure users can only access their own records. Use the authenticated user\'s ID from the token, not from the URL parameter.',
      cwe: 'CWE-639',
      endpoint: '/users/{id}'
    },
    {
      id: 'find-2',
      owaspCategory: 'Broken Authentication',
      owaspId: 'API2',
      title: 'No Rate Limiting on Login Endpoint',
      severity: 'critical',
      description: 'The /auth/login endpoint has no rate limiting, allowing unlimited authentication attempts.',
      evidence: '1000 login attempts made in 60 seconds without blocking',
      remediation: 'Implement rate limiting (e.g., 5 attempts per minute). Consider CAPTCHA after 3 failed attempts. Implement account lockout after multiple failures.',
      cwe: 'CWE-307',
      endpoint: '/auth/login'
    },
    {
      id: 'find-3',
      owaspCategory: 'Broken Function Level Authorization',
      owaspId: 'API5',
      title: 'Admin Endpoint Accessible Without Admin Role',
      severity: 'critical',
      description: 'The /admin/settings endpoint is accessible to regular authenticated users without admin privileges.',
      evidence: 'Request: GET /admin/settings with regular user token returns 200 OK with admin settings',
      remediation: 'Implement role-based access control (RBAC). Verify the user has admin role before processing admin endpoint requests.',
      cwe: 'CWE-285',
      endpoint: '/admin/settings'
    },
    {
      id: 'find-4',
      owaspCategory: 'Security Misconfiguration',
      owaspId: 'API8',
      title: 'Verbose Error Messages Exposing Stack Traces',
      severity: 'high',
      description: 'Error responses include detailed stack traces revealing internal implementation details.',
      evidence: 'Error response includes: "at com.company.api.UserService.getUser(UserService.java:145)"',
      remediation: 'Implement proper error handling that returns generic error messages to clients. Log detailed errors server-side only.',
      cwe: 'CWE-209',
      endpoint: '/users/{id}'
    },
    {
      id: 'find-5',
      owaspCategory: 'Improper Inventory Management',
      owaspId: 'API9',
      title: 'Deprecated API Version Still Active',
      severity: 'medium',
      description: 'The legacy /v1/users endpoint is still accessible and lacks authentication.',
      evidence: 'GET /v1/users returns 200 OK without authentication header',
      remediation: 'Decommission deprecated API versions. If backward compatibility is required, ensure deprecated endpoints have equivalent security controls.',
      cwe: 'CWE-1059',
      endpoint: '/v1/users'
    },
    {
      id: 'find-6',
      owaspCategory: 'Unrestricted Resource Consumption',
      owaspId: 'API4',
      title: 'No Pagination Limit on User List',
      severity: 'medium',
      description: 'The /users endpoint allows requesting unlimited records, potentially causing DoS.',
      evidence: 'GET /users?limit=1000000 returns all records, response time: 45 seconds',
      remediation: 'Implement maximum pagination limits (e.g., max 100 records per request). Set default pagination values.',
      cwe: 'CWE-770',
      endpoint: '/users'
    }
  ];

  const runScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setScanProgress(i);
    }
    
    setIsScanning(false);
    setScanProgress(0);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500';
      default: return 'text-blue-400 bg-blue-500/10 border-blue-500';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500/20 text-green-400';
      case 'POST': return 'bg-blue-500/20 text-blue-400';
      case 'PUT': return 'bg-yellow-500/20 text-yellow-400';
      case 'DELETE': return 'bg-red-500/20 text-red-400';
      case 'PATCH': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const totalFindings = findings.length;
  const criticalFindings = findings.filter(f => f.severity === 'critical').length;
  const highFindings = findings.filter(f => f.severity === 'high').length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">🔌 API Security Scanner</h1>
          <p className="text-gray-400">OWASP API Top 10 testing and comprehensive API security analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium">
            📥 Import OpenAPI
          </button>
          <button
            onClick={runScan}
            disabled={isScanning}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 rounded-lg font-medium flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Scanning... {scanProgress}%
              </>
            ) : (
              <>🚀 Run Full Scan</>
            )}
          </button>
        </div>
      </div>

      {/* Scan Progress */}
      {isScanning && (
        <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-cyan-400 font-medium">Scanning APIs...</span>
            <span className="text-cyan-400">{scanProgress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{collections.length}</div>
          <div className="text-gray-400 text-sm">API Collections</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-cyan-400">{endpoints.length}</div>
          <div className="text-gray-400 text-sm">Endpoints</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{criticalFindings}</div>
          <div className="text-gray-400 text-sm">Critical</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-400">{highFindings}</div>
          <div className="text-gray-400 text-sm">High</div>
        </div>
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">{totalFindings}</div>
          <div className="text-gray-400 text-sm">Total Findings</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{endpoints.filter(e => e.deprecated).length}</div>
          <div className="text-gray-400 text-sm">Deprecated</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'overview', label: '📊 Overview' },
          { id: 'endpoints', label: '🔗 Endpoints' },
          { id: 'findings', label: '🐛 Findings' },
          { id: 'owasp', label: '🛡️ OWASP API Top 10' },
          { id: 'discovery', label: '🔍 API Discovery' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Collections */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📚 API Collections</h2>
            <div className="space-y-3">
              {collections.map(collection => (
                <div key={collection.id} className={`p-4 rounded-lg border ${
                  collection.status === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  collection.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-green-500/10 border-green-500/30'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{collection.name}</h3>
                      <p className="text-sm text-gray-400 font-mono">{collection.baseUrl}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      collection.status === 'critical' ? 'bg-red-500 text-white' :
                      collection.status === 'warning' ? 'bg-yellow-500 text-black' :
                      'bg-green-500 text-white'
                    }`}>
                      {collection.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{collection.endpointCount} endpoints</span>
                    <span>{collection.findingsCount} findings</span>
                    <span className="px-2 py-0.5 bg-gray-700 rounded">{collection.authType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* OWASP Coverage */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🛡️ OWASP API Top 10 Coverage</h2>
            <div className="space-y-2">
              {OWASP_API_TOP_10.map(category => {
                const categoryFindings = findings.filter(f => f.owaspId === category.id).length;
                return (
                  <div key={category.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${getSeverityColor(category.severity)}`}>
                        {category.id}
                      </span>
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {categoryFindings > 0 ? (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold">
                          {categoryFindings} findings
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">
                          ✓ Passed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Findings */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">🐛 Recent Critical Findings</h2>
            <div className="space-y-3">
              {findings.filter(f => f.severity === 'critical').map(finding => (
                <div key={finding.id} className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-mono ${getSeverityColor(finding.severity)}`}>
                        {finding.owaspId}
                      </span>
                      <h3 className="font-semibold">{finding.title}</h3>
                    </div>
                    <span className="px-3 py-1 bg-red-500 text-white rounded text-xs font-bold">CRITICAL</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{finding.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="font-mono">{finding.endpoint}</span>
                    <span>{finding.cwe}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Tab */}
      {activeTab === 'endpoints' && (
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-400 text-sm border-b border-gray-800">
                <th className="p-4">Method</th>
                <th className="p-4">Endpoint</th>
                <th className="p-4">Description</th>
                <th className="p-4">Auth</th>
                <th className="p-4">Risk</th>
                <th className="p-4">Response Time</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map(endpoint => (
                <tr key={endpoint.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-sm">{endpoint.path}</td>
                  <td className="p-4 text-gray-400 text-sm">{endpoint.description}</td>
                  <td className="p-4">
                    {endpoint.authenticated ? (
                      <span className="text-green-400">🔒</span>
                    ) : (
                      <span className="text-red-400">🔓</span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(endpoint.riskLevel)}`}>
                      {endpoint.riskLevel}
                    </span>
                  </td>
                  <td className="p-4 text-sm">
                    <span className={endpoint.responseTime > 500 ? 'text-red-400' : endpoint.responseTime > 200 ? 'text-yellow-400' : 'text-green-400'}>
                      {endpoint.responseTime}ms
                    </span>
                  </td>
                  <td className="p-4">
                    {endpoint.deprecated ? (
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">Deprecated</span>
                    ) : (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Findings Tab */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {findings.map(finding => (
            <div key={finding.id} className={`p-6 rounded-xl border ${getSeverityColor(finding.severity)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className={`px-3 py-1 rounded text-sm font-mono ${getSeverityColor(finding.severity)}`}>
                      {finding.owaspId}
                    </span>
                    <h3 className="text-lg font-semibold">{finding.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm">{finding.owaspCategory}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold uppercase border ${getSeverityColor(finding.severity)}`}>
                  {finding.severity}
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-black/30 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Description</h4>
                  <p className="text-gray-300">{finding.description}</p>
                </div>

                <div className="p-4 bg-black/30 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">Evidence</h4>
                  <code className="text-sm text-orange-400">{finding.evidence}</code>
                </div>

                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="text-sm font-medium text-green-400 mb-2">💡 Remediation</h4>
                  <p className="text-gray-300">{finding.remediation}</p>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>Endpoint: <code className="text-cyan-400">{finding.endpoint}</code></span>
                  <span>CWE: <code className="text-purple-400">{finding.cwe}</code></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* OWASP Tab */}
      {activeTab === 'owasp' && (
        <div className="space-y-4">
          {OWASP_API_TOP_10.map(category => {
            const categoryFindings = findings.filter(f => f.owaspId === category.id);
            return (
              <div key={category.id} className={`p-6 rounded-xl border ${
                categoryFindings.length > 0 ? getSeverityColor(category.severity) : 'bg-gray-900/50 border-gray-800'
              }`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-3 py-1 rounded text-sm font-mono font-bold ${getSeverityColor(category.severity)}`}>
                        {category.id}
                      </span>
                      <h3 className="text-lg font-semibold">{category.name}</h3>
                    </div>
                    <p className="text-gray-400">{category.description}</p>
                  </div>
                  {categoryFindings.length > 0 ? (
                    <span className="px-3 py-1 bg-red-500 text-white rounded-lg font-bold">
                      {categoryFindings.length} FINDINGS
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg font-bold">
                      ✓ PASSED
                    </span>
                  )}
                </div>

                {categoryFindings.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {categoryFindings.map(finding => (
                      <div key={finding.id} className="p-3 bg-black/30 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{finding.title}</span>
                          <span className={`px-2 py-0.5 rounded text-xs ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{finding.endpoint}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Discovery Tab */}
      {activeTab === 'discovery' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🔍 API Discovery</h2>
            <p className="text-gray-400 mb-4">Automatically discover APIs in your infrastructure by analyzing traffic, code, and documentation.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-medium mb-2">Traffic Analysis</h3>
                <p className="text-sm text-gray-400 mb-3">Monitor network traffic to discover API endpoints</p>
                <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm">
                  Start Capture
                </button>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-medium mb-2">Code Scanning</h3>
                <p className="text-sm text-gray-400 mb-3">Scan source code for API definitions</p>
                <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm">
                  Scan Repos
                </button>
              </div>
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <h3 className="font-medium mb-2">Documentation Import</h3>
                <p className="text-sm text-gray-400 mb-3">Import OpenAPI/Swagger specifications</p>
                <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg text-sm">
                  Import Spec
                </button>
              </div>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <h3 className="font-medium text-yellow-400 mb-2">⚠️ Shadow API Detection</h3>
              <p className="text-sm text-gray-400">
                Found <strong className="text-yellow-400">3 undocumented endpoints</strong> that may be shadow APIs.
                These endpoints are active but not in your OpenAPI specification.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default APISecurityScanner;
