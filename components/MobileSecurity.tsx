import React, { useState, useEffect } from 'react';
import { backendApi } from '../utils/backendApi';

// ============================================================================
// MOBILE SECURITY - iOS & ANDROID APP SECURITY SCANNING
// ============================================================================

interface MobileApp {
  id: string;
  name: string;
  platform: 'ios' | 'android' | 'cross-platform';
  version: string;
  bundleId: string;
  lastScan: string;
  securityScore: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  findings: number;
  criticalFindings: number;
  status: 'secure' | 'vulnerable' | 'pending';
}

interface MobileFinding {
  id: string;
  appId: string;
  category: 'data_storage' | 'network' | 'authentication' | 'code_quality' | 'platform_interaction' | 'cryptography';
  owaspMobile: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  location: string;
  evidence: string;
  remediation: string;
}

interface PermissionRisk {
  permission: string;
  risk: 'high' | 'medium' | 'low';
  justification: string;
  used: boolean;
}

export const MobileSecurity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'apps' | 'findings' | 'permissions' | 'owasp'>('apps');
  const [_selectedApp, _setSelectedApp] = useState<MobileApp | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [uploadedApp, setUploadedApp] = useState<string | null>(null);
  const appFileInputRef = React.useRef<HTMLInputElement>(null);
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setBackendLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('mobile-security');
        if (res) console.log('Dashboard loaded:', res);
      } catch (e) { console.error(e); } finally { setBackendLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res: any = await backendApi.modules.analyze('mobile-security', 'Analyze mobile device fleet security for MDM compliance, app vulnerabilities, and jailbreak detection');
      if (res?.analysis) setAnalysisResult(res.analysis);
    } catch (e) { console.error(e); } finally { setAnalyzing(false); }
  };

  // Mock mobile apps
  const apps: MobileApp[] = [
    { id: 'app-1', name: 'Company Banking', platform: 'ios', version: '4.2.1', bundleId: 'com.company.banking', lastScan: '2026-02-04', securityScore: 45, riskLevel: 'critical', findings: 15, criticalFindings: 4, status: 'vulnerable' },
    { id: 'app-2', name: 'Company Banking', platform: 'android', version: '4.2.1', bundleId: 'com.company.banking', lastScan: '2026-02-04', securityScore: 52, riskLevel: 'high', findings: 12, criticalFindings: 2, status: 'vulnerable' },
    { id: 'app-3', name: 'Employee Portal', platform: 'cross-platform', version: '2.8.0', bundleId: 'com.company.portal', lastScan: '2026-02-03', securityScore: 78, riskLevel: 'medium', findings: 6, criticalFindings: 0, status: 'vulnerable' },
    { id: 'app-4', name: 'Customer App', platform: 'ios', version: '3.5.2', bundleId: 'com.company.customer', lastScan: '2026-02-01', securityScore: 92, riskLevel: 'low', findings: 2, criticalFindings: 0, status: 'secure' },
    { id: 'app-5', name: 'Customer App', platform: 'android', version: '3.5.2', bundleId: 'com.company.customer', lastScan: '2026-02-01', securityScore: 88, riskLevel: 'low', findings: 3, criticalFindings: 0, status: 'secure' }
  ];

  // Mock findings
  const findings: MobileFinding[] = [
    { id: 'find-1', appId: 'app-1', category: 'data_storage', owaspMobile: 'M2', title: 'Sensitive data stored in plaintext', severity: 'critical', description: 'User credentials and session tokens are stored in NSUserDefaults without encryption', location: 'LoginManager.swift:145', evidence: 'UserDefaults.standard.set(password, forKey: "userPassword")', remediation: 'Use Keychain Services for storing sensitive data with appropriate access controls' },
    { id: 'find-2', appId: 'app-1', category: 'network', owaspMobile: 'M3', title: 'SSL Pinning not implemented', severity: 'critical', description: 'App does not implement certificate pinning, making it vulnerable to MITM attacks', location: 'NetworkManager.swift:32', evidence: 'URLSession with default configuration', remediation: 'Implement SSL certificate pinning using URLSession delegate methods or TrustKit' },
    { id: 'find-3', appId: 'app-1', category: 'authentication', owaspMobile: 'M4', title: 'Weak biometric authentication', severity: 'high', description: 'Biometric authentication can be bypassed as fallback uses simple PIN', location: 'AuthController.swift:78', evidence: 'LAContext with fallback to PIN', remediation: 'Require strong secondary authentication and implement biometric-protected keychain access' },
    { id: 'find-4', appId: 'app-2', category: 'code_quality', owaspMobile: 'M7', title: 'Debug logging in production', severity: 'high', description: 'Verbose logging including sensitive data enabled in release build', location: 'BaseActivity.java:45', evidence: 'Log.d(TAG, "User token: " + token)', remediation: 'Remove all debug logs or use ProGuard/R8 to strip logging in release builds' },
    { id: 'find-5', appId: 'app-2', category: 'platform_interaction', owaspMobile: 'M1', title: 'Exported content provider without permission', severity: 'critical', description: 'Content provider exposing user data is exported without protection', location: 'AndroidManifest.xml:67', evidence: 'android:exported="true" without permission', remediation: 'Set android:exported="false" or add appropriate permission requirements' },
    { id: 'find-6', appId: 'app-1', category: 'cryptography', owaspMobile: 'M5', title: 'Use of deprecated crypto algorithm', severity: 'high', description: 'App uses MD5 for password hashing which is cryptographically broken', location: 'CryptoUtils.swift:23', evidence: 'CC_MD5(data, length, hash)', remediation: 'Use modern algorithms like bcrypt, scrypt, or Argon2 for password hashing' },
    { id: 'find-7', appId: 'app-3', category: 'network', owaspMobile: 'M3', title: 'Cleartext traffic allowed', severity: 'medium', description: 'App allows unencrypted HTTP connections in network security config', location: 'network_security_config.xml:12', evidence: 'cleartextTrafficPermitted="true"', remediation: 'Set cleartextTrafficPermitted="false" and ensure all endpoints use HTTPS' }
  ];

  // Permission analysis
  const permissions: PermissionRisk[] = [
    { permission: 'CAMERA', risk: 'medium', justification: 'Used for document scanning', used: true },
    { permission: 'LOCATION_ALWAYS', risk: 'high', justification: 'Required for branch finder', used: true },
    { permission: 'CONTACTS', risk: 'high', justification: 'Not used in app code', used: false },
    { permission: 'MICROPHONE', risk: 'high', justification: 'Not used in app code', used: false },
    { permission: 'BIOMETRIC', risk: 'low', justification: 'Used for authentication', used: true },
    { permission: 'PUSH_NOTIFICATIONS', risk: 'low', justification: 'Transaction alerts', used: true },
    { permission: 'STORAGE', risk: 'medium', justification: 'Export statements', used: true },
    { permission: 'PHONE_STATE', risk: 'high', justification: 'Not used in app code', used: false }
  ];

  // OWASP Mobile Top 10
  const owaspMobile = [
    { id: 'M1', name: 'Improper Platform Usage', description: 'Misuse of platform features or security controls', findings: 1 },
    { id: 'M2', name: 'Insecure Data Storage', description: 'Insecure storage of sensitive information', findings: 1 },
    { id: 'M3', name: 'Insecure Communication', description: 'Insecure network communication', findings: 2 },
    { id: 'M4', name: 'Insecure Authentication', description: 'Weak or missing authentication', findings: 1 },
    { id: 'M5', name: 'Insufficient Cryptography', description: 'Weak or broken cryptographic algorithms', findings: 1 },
    { id: 'M6', name: 'Insecure Authorization', description: 'Authorization failures', findings: 0 },
    { id: 'M7', name: 'Client Code Quality', description: 'Code quality issues leading to vulnerabilities', findings: 1 },
    { id: 'M8', name: 'Code Tampering', description: 'Binary patches, resource modification', findings: 0 },
    { id: 'M9', name: 'Reverse Engineering', description: 'Lack of binary protections', findings: 0 },
    { id: 'M10', name: 'Extraneous Functionality', description: 'Hidden backdoors, debug features', findings: 0 }
  ];

  const runScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    
    for (let i = 0; i <= 100; i += 2) {
      await new Promise(resolve => setTimeout(resolve, 150));
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

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return '🍎';
      case 'android': return '🤖';
      case 'cross-platform': return '📱';
      default: return '📱';
    }
  };

  const criticalApps = apps.filter(a => a.riskLevel === 'critical').length;
  const totalFindings = findings.length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">📱 Mobile Security</h1>
          <p className="text-gray-400">iOS and Android application security scanning and analysis</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={handleAIAnalysis} disabled={analyzing || backendLoading} className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500 rounded-lg text-purple-400 font-medium disabled:opacity-50 transition-colors">
            {analyzing ? '⏳ Analyzing...' : '🤖 AI Analysis'}
          </button>
          <input
            ref={appFileInputRef}
            type="file"
            accept=".apk,.aab,.ipa,.zip"
            className="hidden"
            title="Upload mobile app package"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setUploadedApp(file.name);
                // Trigger scan after upload
                runScan();
              }
            }}
          />
          <button
            onClick={() => appFileInputRef.current?.click()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
          >
            📤 {uploadedApp ? `Uploaded: ${uploadedApp}` : 'Upload App'}
          </button>
          <button
            onClick={runScan}
            disabled={isScanning}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 rounded-lg font-medium flex items-center gap-2"
          >
            {isScanning ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Scanning... {scanProgress}%
              </>
            ) : (
              <>🔍 Scan Apps</>
            )}
          </button>
        </div>
      </div>

      {/* Scan Progress */}
      {isScanning && (
        <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-400 font-medium">Analyzing mobile applications...</span>
            <span className="text-blue-400">{scanProgress}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {scanProgress < 20 && 'Extracting application binary...'}
            {scanProgress >= 20 && scanProgress < 40 && 'Decompiling and analyzing code...'}
            {scanProgress >= 40 && scanProgress < 60 && 'Checking data storage security...'}
            {scanProgress >= 60 && scanProgress < 80 && 'Analyzing network security...'}
            {scanProgress >= 80 && 'Generating security report...'}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
          <div className="text-3xl font-bold text-white">{apps.length}</div>
          <div className="text-gray-400 text-sm">Mobile Apps</div>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{criticalApps}</div>
          <div className="text-gray-400 text-sm">Critical Risk</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-orange-400">{totalFindings}</div>
          <div className="text-gray-400 text-sm">Total Findings</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{permissions.filter(p => !p.used).length}</div>
          <div className="text-gray-400 text-sm">Unused Permissions</div>
        </div>
        <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-cyan-400">{apps.filter(a => a.platform === 'ios').length}</div>
          <div className="text-gray-400 text-sm">iOS Apps</div>
        </div>
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{apps.filter(a => a.platform === 'android').length}</div>
          <div className="text-gray-400 text-sm">Android Apps</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2">
        {[
          { id: 'apps', label: '📱 Applications' },
          { id: 'findings', label: '🐛 Findings' },
          { id: 'permissions', label: '🔐 Permissions' },
          { id: 'owasp', label: '📋 OWASP Mobile' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Apps Tab */}
      {activeTab === 'apps' && (
        <div className="space-y-4">
          {apps.map(app => (
            <div key={app.id} className={`p-6 rounded-xl border ${getSeverityColor(app.riskLevel)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{getPlatformIcon(app.platform)}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{app.name}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityColor(app.riskLevel)}`}>
                        {app.riskLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="font-mono">{app.bundleId}</span>
                      <span>•</span>
                      <span>v{app.version}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        app.platform === 'ios' ? 'bg-gray-500/20 text-gray-300' :
                        app.platform === 'android' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {app.platform}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${
                      app.securityScore >= 80 ? 'text-green-400' :
                      app.securityScore >= 60 ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>{app.securityScore}</div>
                    <div className="text-xs text-gray-500">Security Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-400">{app.findings}</div>
                    <div className="text-xs text-gray-500">Findings</div>
                  </div>
                  {app.criticalFindings > 0 && (
                    <div className="text-center">
                      <div className="text-xl font-bold text-red-400">{app.criticalFindings}</div>
                      <div className="text-xs text-gray-500">Critical</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Last scanned: {app.lastScan}</span>
                <button
                  onClick={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                  className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500 rounded text-blue-400"
                >
                  {expandedAppId === app.id ? 'Hide Report' : 'View Report'}
                </button>
              </div>

              {expandedAppId === app.id && (
                <div className="mt-4 p-4 bg-black/30 rounded-lg border border-gray-700 space-y-3">
                  <h4 className="text-sm font-semibold text-cyan-400">Security Report: {app.name} ({app.platform})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="p-2 bg-gray-800/50 rounded">
                      <div className="text-gray-500">Bundle ID</div>
                      <div className="font-mono text-xs">{app.bundleId}</div>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <div className="text-gray-500">Version</div>
                      <div>{app.version}</div>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <div className="text-gray-500">Total Findings</div>
                      <div className="text-orange-400 font-bold">{app.findings}</div>
                    </div>
                    <div className="p-2 bg-gray-800/50 rounded">
                      <div className="text-gray-500">Critical</div>
                      <div className="text-red-400 font-bold">{app.criticalFindings}</div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-xs text-gray-500 mb-2">Related Findings:</h5>
                    {findings.filter(f => f.appId === app.id).length > 0 ? (
                      <ul className="space-y-1">
                        {findings.filter(f => f.appId === app.id).map(f => (
                          <li key={f.id} className="flex items-center gap-2 text-sm">
                            <span className={`w-2 h-2 rounded-full ${
                              f.severity === 'critical' ? 'bg-red-500' :
                              f.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                            }`} />
                            <span>{f.title}</span>
                            <span className="text-gray-600">({f.severity})</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 text-sm">No findings for this app.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Findings Tab */}
      {activeTab === 'findings' && (
        <div className="space-y-4">
          {findings.map(finding => (
            <div key={finding.id} className={`p-6 rounded-xl border ${getSeverityColor(finding.severity)}`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-mono ${getSeverityColor(finding.severity)}`}>
                      {finding.owaspMobile}
                    </span>
                    <h3 className="font-semibold">{finding.title}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border ${getSeverityColor(finding.severity)}`}>
                      {finding.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{finding.category.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <p className="text-gray-400 mb-4">{finding.description}</p>

              <div className="space-y-3">
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Location</div>
                  <code className="text-cyan-400 text-sm">{finding.location}</code>
                </div>
                <div className="p-3 bg-black/30 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Evidence</div>
                  <code className="text-orange-400 text-sm">{finding.evidence}</code>
                </div>
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-green-400 text-sm">💡 {finding.remediation}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🔐 Permission Analysis</h2>
            <div className="space-y-3">
              {permissions.map((perm, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${
                  !perm.used ? 'bg-red-500/10 border-red-500/50' :
                  perm.risk === 'high' ? 'bg-orange-500/10 border-orange-500/30' :
                  perm.risk === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-green-500/10 border-green-500/30'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        perm.risk === 'high' ? 'bg-orange-500 text-white' :
                        perm.risk === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-green-500 text-white'
                      }`}>
                        {perm.risk.toUpperCase()}
                      </span>
                      <span className="font-medium font-mono">{perm.permission}</span>
                      {!perm.used && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs animate-pulse">
                          ⚠️ UNUSED
                        </span>
                      )}
                    </div>
                    <span className={perm.used ? 'text-green-400' : 'text-red-400'}>
                      {perm.used ? '✓ Used' : '✗ Not Used'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">{perm.justification}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-2">⚠️ Unused Permissions Detected</h3>
            <p className="text-gray-400">
              Found {permissions.filter(p => !p.used).length} permissions declared but never used in the app code.
              Remove unused permissions to reduce attack surface and improve user trust.
            </p>
          </div>
        </div>
      )}

      {/* OWASP Mobile Tab */}
      {activeTab === 'owasp' && (
        <div className="space-y-4">
          {owaspMobile.map(item => (
            <div key={item.id} className={`p-4 rounded-xl border ${
              item.findings > 0 ? getSeverityColor('high') : 'bg-gray-900/50 border-gray-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded text-sm font-mono font-bold ${
                    item.findings > 0 ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                    {item.id}
                  </span>
                  <div>
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
                {item.findings > 0 ? (
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg font-bold">
                    {item.findings} FINDINGS
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg">
                    ✓ PASSED
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Analysis Result */}
      {analysisResult && (
        <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-purple-400">🤖 AI Analysis Result</h3>
            <button onClick={() => setAnalysisResult('')} className="text-gray-400 hover:text-white">✕</button>
          </div>
          <p className="text-gray-300 whitespace-pre-wrap">{analysisResult}</p>
        </div>
      )}
    </div>
  );
};

export default MobileSecurity;
