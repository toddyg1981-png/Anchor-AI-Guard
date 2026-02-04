import React, { useState } from 'react';

// ============================================================================
// COMPLIANCE HUB - WORLD'S MOST COMPREHENSIVE COMPLIANCE AUTOMATION
// ============================================================================

// Supported Compliance Frameworks
type ComplianceFramework = 
  | 'essential-eight'
  | 'iso-27001'
  | 'soc2'
  | 'pci-dss'
  | 'hipaa'
  | 'nist-csf'
  | 'gdpr'
  | 'cps-234'
  | 'ism';

type MaturityLevel = 0 | 1 | 2 | 3;
type ControlStatus = 'compliant' | 'partial' | 'non-compliant' | 'not-applicable';

interface FrameworkAssessment {
  framework: ComplianceFramework;
  overallScore: number;
  controlsTotal: number;
  controlsCompliant: number;
  controlsPartial: number;
  controlsNonCompliant: number;
  maturityLevel?: MaturityLevel;
  lastAssessment: string;
  nextAssessment: string;
  trend: 'improving' | 'stable' | 'declining';
}

// ============================================================================
// ESSENTIAL EIGHT SPECIFIC TYPES (AUSTRALIAN GOVERNMENT)
// ============================================================================

interface EssentialEightControl {
  id: string;
  name: string;
  description: string;
  maturityLevel: MaturityLevel;
  targetMaturity: MaturityLevel;
  controls: EssentialEightSubControl[];
  recommendations: string[];
}

interface EssentialEightSubControl {
  id: string;
  level: MaturityLevel;
  requirement: string;
  status: ControlStatus;
  evidence: string[];
  gaps: string[];
}

// Essential Eight Mitigation Strategies
const ESSENTIAL_EIGHT_STRATEGIES: EssentialEightControl[] = [
  {
    id: 'e8-1',
    name: 'Application Control',
    description: 'Prevent execution of unapproved/malicious programs including .exe, DLL, scripts and installers',
    maturityLevel: 0,
    targetMaturity: 3,
    controls: [
      {
        id: 'e8-1-ml1',
        level: 1,
        requirement: 'Application control is implemented on workstations to restrict execution of executables to an approved set',
        status: 'non-compliant',
        evidence: [],
        gaps: ['No application whitelisting detected', 'Need to implement Microsoft Defender Application Control or AppLocker']
      },
      {
        id: 'e8-1-ml2',
        level: 2,
        requirement: 'Application control is implemented on workstations and servers, restricting executables, software libraries, scripts and installers',
        status: 'non-compliant',
        evidence: [],
        gaps: ['Server application control not implemented', 'Script controls not in place']
      },
      {
        id: 'e8-1-ml3',
        level: 3,
        requirement: 'Application control rulesets are validated annually or more frequently',
        status: 'non-compliant',
        evidence: [],
        gaps: ['No validation process documented', 'Annual review not scheduled']
      }
    ],
    recommendations: [
      'Deploy Microsoft Defender Application Control (WDAC) on all workstations',
      'Implement AppLocker policies on Windows Server',
      'Create application whitelist based on publisher certificates',
      'Establish quarterly ruleset review process'
    ]
  },
  {
    id: 'e8-2',
    name: 'Patch Applications',
    description: 'Patch/mitigate computers with extreme risk vulnerabilities within 48 hours',
    maturityLevel: 0,
    targetMaturity: 3,
    controls: [
      {
        id: 'e8-2-ml1',
        level: 1,
        requirement: 'Security vulnerabilities in internet-facing services are patched within two weeks of release',
        status: 'partial',
        evidence: [],
        gaps: ['Some applications patched beyond 2-week window']
      },
      {
        id: 'e8-2-ml2',
        level: 2,
        requirement: 'Security vulnerabilities in internet-facing services are patched within 48 hours if exploit exists',
        status: 'non-compliant',
        evidence: [],
        gaps: ['No automated 48-hour patching process', 'Exploit monitoring not implemented']
      },
      {
        id: 'e8-2-ml3',
        level: 3,
        requirement: 'Security vulnerabilities in all applications are patched within 48 hours if exploit exists',
        status: 'non-compliant',
        evidence: [],
        gaps: ['Internal application patching not accelerated', 'Vulnerability scanning not comprehensive']
      }
    ],
    recommendations: [
      'Implement automated patch management (WSUS/SCCM/Intune)',
      'Subscribe to CVE/exploit notification feeds',
      'Create emergency patching procedures for critical vulns',
      'Deploy vulnerability scanning with Anchor CLI'
    ]
  },
  {
    id: 'e8-3',
    name: 'Configure Microsoft Office Macro Settings',
    description: 'Block macros from the internet and only allow vetted macros in trusted locations',
    maturityLevel: 0,
    targetMaturity: 3,
    controls: [
      {
        id: 'e8-3-ml1',
        level: 1,
        requirement: 'Microsoft Office macros are disabled for users who do not require them',
        status: 'non-compliant',
        evidence: [],
        gaps: ['Macros enabled for all users', 'No GPO policy detected']
      },
      {
        id: 'e8-3-ml2',
        level: 2,
        requirement: 'Microsoft Office macros in files from the internet are blocked',
        status: 'non-compliant',
        evidence: [],
        gaps: ['Mark of the Web blocking not configured', 'Trusted locations not defined']
      },
      {
        id: 'e8-3-ml3',
        level: 3,
        requirement: 'Only Microsoft Office macros digitally signed by trusted publishers can execute',
        status: 'non-compliant',
        evidence: [],
        gaps: ['No code signing policy', 'Trusted publisher list not maintained']
      }
    ],
    recommendations: [
      'Deploy GPO to disable macros for non-essential users',
      'Configure "Block macros from running in Office files from the Internet"',
      'Establish trusted locations for approved macros',
      'Implement macro code signing for essential macros'
    ]
  },
  {
    id: 'e8-4',
    name: 'User Application Hardening',
    description: 'Configure web browsers and PDF readers to block ads, Java, and Flash',
    maturityLevel: 0,
    targetMaturity: 3,
    controls: [
      {
        id: 'e8-4-ml1',
        level: 1,
        requirement: 'Web browsers do not process Java from the internet and web advertisements are blocked',
        status: 'partial',
        evidence: [],
        gaps: ['Ad blocking not enforced', 'Some browsers not hardened']
      },
      {
        id: 'e8-4-ml2',
        level: 2,
        requirement: 'Web browsers and PDF viewers do not process Java, web ads, Flash and other risky content',
        status: 'non-compliant',
        evidence: [],
        gaps: ['PDF viewer hardening not implemented', 'Flash still enabled on some systems']
      },
      {
        id: 'e8-4-ml3',
        level: 3,
        requirement: 'Internet Explorer 11 is disabled or removed, and .NET Framework 3.5 is disabled or removed',
        status: 'non-compliant',
        evidence: [],
        gaps: ['IE11 still present on workstations', '.NET 3.5 not removed']
      }
    ],
    recommendations: [
      'Deploy browser hardening via GPO (Edge/Chrome policies)',
      'Enable ad blocking at network level (DNS filtering)',
      'Remove Flash and Java plugins from all endpoints',
      'Disable IE11 via Windows Features'
    ]
  },
  {
    id: 'e8-5',
    name: 'Restrict Administrative Privileges',
    description: 'Restrict admin privileges to only users who need them and use separate accounts',
    maturityLevel: 0,
    targetMaturity: 3,
    controls: [
      {
        id: 'e8-5-ml1',
        level: 1,
        requirement: 'Privileged access to systems and applications is restricted to only those required',
        status: 'partial',
        evidence: [],
        gaps: ['Some users have unnecessary admin rights', 'Service accounts overprivileged']
      },
      {
        id: 'e8-5-ml2',
        level: 2,
        requirement: 'Privileged accounts cannot access the internet, email or web services',
        status: 'non-compliant',
        evidence: [],
        gaps: ['Admin accounts can browse internet', 'No PAW implementation']
      },
      {
        id: 'e8-5-ml3',
        level: 3,
        requirement: 'Just-in-time administration is used for administering systems and applications',
        status: 'non-compliant',
        evidence: [],
        gaps: ['No JIT/JEA implementation', 'Permanent admin access exists']
      }
    ],
    recommendations: [
      'Audit and reduce privileged account membership',
      'Implement Privileged Access Workstations (PAWs)',
      'Deploy Azure AD PIM or similar JIT solution',
      'Create separate admin accounts for each admin'
    ]
  },
  {
    id: 'e8-6',
    name: 'Patch Operating Systems',
    description: 'Patch/mitigate operating systems with extreme risk vulnerabilities within 48 hours',
    maturityLevel: 0,
    targetMaturity: 3,
    controls: [
      {
        id: 'e8-6-ml1',
        level: 1,
        requirement: 'Security vulnerabilities in internet-facing OS are patched within two weeks',
        status: 'partial',
        evidence: [],
        gaps: ['Some servers patched beyond 2-week window']
      },
      {
        id: 'e8-6-ml2',
        level: 2,
        requirement: 'Security vulnerabilities in internet-facing OS are patched within 48 hours if exploit exists',
        status: 'non-compliant',
        evidence: [],
        gaps: ['No emergency OS patching process', 'Exploit tracking not automated']
      },
      {
        id: 'e8-6-ml3',
        level: 3,
        requirement: 'All operating systems are supported, and vulnerabilities patched within 48 hours if exploit exists',
        status: 'non-compliant',
        evidence: [],
        gaps: ['Some unsupported OS versions detected', 'Legacy systems not upgraded']
      }
    ],
    recommendations: [
      'Implement automated OS patching (WSUS/Intune/SCCM)',
      'Subscribe to Microsoft/vendor security bulletins',
      'Upgrade unsupported operating systems',
      'Create emergency patching runbook'
    ]
  },
  {
    id: 'e8-7',
    name: 'Multi-Factor Authentication',
    description: 'MFA for all users accessing internet-facing services and privileged actions',
    maturityLevel: 0,
    targetMaturity: 3,
    controls: [
      {
        id: 'e8-7-ml1',
        level: 1,
        requirement: 'MFA is used for all users when accessing internet-facing services',
        status: 'partial',
        evidence: [],
        gaps: ['Some internet services lack MFA', 'Legacy apps not MFA-enabled']
      },
      {
        id: 'e8-7-ml2',
        level: 2,
        requirement: 'MFA is used for all privileged users and important data repositories',
        status: 'partial',
        evidence: [],
        gaps: ['Some admin accounts lack MFA', 'Data repositories not MFA protected']
      },
      {
        id: 'e8-7-ml3',
        level: 3,
        requirement: 'MFA uses phishing-resistant methods (hardware tokens, passkeys)',
        status: 'non-compliant',
        evidence: [],
        gaps: ['SMS-based MFA in use', 'No hardware tokens deployed']
      }
    ],
    recommendations: [
      'Enable MFA on all internet-facing services (Microsoft 365, VPN)',
      'Require MFA for all privileged accounts',
      'Deploy phishing-resistant MFA (FIDO2 keys, Windows Hello)',
      'Disable SMS/voice MFA methods'
    ]
  },
  {
    id: 'e8-8',
    name: 'Regular Backups',
    description: 'Regularly backup important data and test restoration',
    maturityLevel: 0,
    targetMaturity: 3,
    controls: [
      {
        id: 'e8-8-ml1',
        level: 1,
        requirement: 'Backups of important data, software and configuration settings are performed monthly',
        status: 'compliant',
        evidence: ['Monthly backup logs'],
        gaps: []
      },
      {
        id: 'e8-8-ml2',
        level: 2,
        requirement: 'Backups are stored disconnected and retention is at least 3 months',
        status: 'partial',
        evidence: [],
        gaps: ['Backups not fully air-gapped', 'Retention policy not documented']
      },
      {
        id: 'e8-8-ml3',
        level: 3,
        requirement: 'Unprivileged accounts cannot access backups and restoration is tested annually',
        status: 'non-compliant',
        evidence: [],
        gaps: ['Backup access not restricted', 'No restoration testing documented']
      }
    ],
    recommendations: [
      'Implement 3-2-1 backup strategy',
      'Enable immutable backups (Azure Immutable Storage)',
      'Restrict backup access to dedicated backup admins',
      'Schedule quarterly restoration tests'
    ]
  }
];

// ============================================================================
// COMPLIANCE HUB COMPONENT
// ============================================================================

export const ComplianceHub: React.FC = () => {
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFramework>('essential-eight');
  const [_assessments, _setAssessments] = useState<FrameworkAssessment[]>([]);
  const [essentialEight, setEssentialEight] = useState<EssentialEightControl[]>(ESSENTIAL_EIGHT_STRATEGIES);
  const [isAssessing, setIsAssessing] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Framework metadata
  const frameworks: Record<ComplianceFramework, { name: string; icon: string; region: string }> = {
    'essential-eight': { name: 'Essential Eight', icon: '🇦🇺', region: 'Australia' },
    'iso-27001': { name: 'ISO 27001', icon: '🌐', region: 'International' },
    'soc2': { name: 'SOC 2', icon: '🔒', region: 'USA' },
    'pci-dss': { name: 'PCI DSS', icon: '💳', region: 'International' },
    'hipaa': { name: 'HIPAA', icon: '🏥', region: 'USA' },
    'nist-csf': { name: 'NIST CSF', icon: '🇺🇸', region: 'USA' },
    'gdpr': { name: 'GDPR', icon: '🇪🇺', region: 'Europe' },
    'cps-234': { name: 'APRA CPS 234', icon: '🏦', region: 'Australia' },
    'ism': { name: 'ISM', icon: '🇦🇺', region: 'Australia' }
  };

  // Calculate Essential Eight maturity
  const calculateE8Maturity = (): { overall: MaturityLevel; byStrategy: Record<string, MaturityLevel> } => {
    const byStrategy: Record<string, MaturityLevel> = {};
    let lowestMaturity: MaturityLevel = 3;

    essentialEight.forEach(strategy => {
      let strategyMaturity: MaturityLevel = 0;
      
      // Check each maturity level
      for (let level = 1; level <= 3; level++) {
        const controlsAtLevel = strategy.controls.filter(c => c.level === level);
        const allCompliant = controlsAtLevel.every(c => c.status === 'compliant');
        if (allCompliant && controlsAtLevel.length > 0) {
          strategyMaturity = level as MaturityLevel;
        } else {
          break;
        }
      }
      
      byStrategy[strategy.id] = strategyMaturity;
      if (strategyMaturity < lowestMaturity) {
        lowestMaturity = strategyMaturity;
      }
    });

    return { overall: lowestMaturity, byStrategy };
  };

  // Run automated assessment
  const runAssessment = async () => {
    setIsAssessing(true);
    
    // Simulate assessment (in production, this would call actual checks)
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Update with mock assessment results
    const updatedE8 = essentialEight.map(strategy => ({
      ...strategy,
      maturityLevel: Math.floor(Math.random() * 2) as MaturityLevel,
      controls: strategy.controls.map(control => ({
        ...control,
        status: Math.random() > 0.7 ? 'compliant' : Math.random() > 0.5 ? 'partial' : 'non-compliant' as ControlStatus
      }))
    }));
    
    setEssentialEight(updatedE8);
    setIsAssessing(false);
  };

  const { overall: overallMaturity, byStrategy } = calculateE8Maturity();

  // Get status color
  const getStatusColor = (status: ControlStatus) => {
    switch (status) {
      case 'compliant': return 'bg-green-500';
      case 'partial': return 'bg-yellow-500';
      case 'non-compliant': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMaturityColor = (level: MaturityLevel) => {
    switch (level) {
      case 0: return 'text-red-500 bg-red-500/10';
      case 1: return 'text-orange-500 bg-orange-500/10';
      case 2: return 'text-yellow-500 bg-yellow-500/10';
      case 3: return 'text-green-500 bg-green-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🛡️ Compliance Automation Hub</h1>
        <p className="text-gray-400">Automated compliance assessment across all major frameworks</p>
      </div>

      {/* Framework Selector */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Object.entries(frameworks).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setSelectedFramework(key as ComplianceFramework)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
              selectedFramework === key
                ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-gray-600'
            }`}
          >
            <span>{value.icon}</span>
            <span>{value.name}</span>
          </button>
        ))}
      </div>

      {/* Essential Eight Dashboard */}
      {selectedFramework === 'essential-eight' && (
        <div className="space-y-6">
          {/* Overall Maturity Score */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">Essential Eight Maturity Assessment</h2>
                <p className="text-gray-400 text-sm">Australian Cyber Security Centre (ACSC) Framework</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={runAssessment}
                  disabled={isAssessing}
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-600 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {isAssessing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Assessing...
                    </>
                  ) : (
                    <>🔍 Run Assessment</>
                  )}
                </button>
                <button
                  onClick={() => setShowReport(true)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                >
                  📄 Generate Report
                </button>
              </div>
            </div>

            {/* Maturity Level Display */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="col-span-1 md:col-span-2 bg-gray-800/50 rounded-xl p-6 text-center">
                <div className="text-6xl font-bold mb-2">
                  <span className={getMaturityColor(overallMaturity).split(' ')[0]}>ML{overallMaturity}</span>
                </div>
                <div className="text-gray-400">Overall Maturity Level</div>
                <div className="mt-4 flex justify-center gap-2">
                  {[0, 1, 2, 3].map(level => (
                    <div
                      key={level}
                      className={`w-12 h-3 rounded-full ${
                        level <= overallMaturity ? 'bg-cyan-500' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="col-span-1 md:col-span-3 grid grid-cols-2 gap-4">
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-400">
                    {essentialEight.reduce((acc, s) => acc + s.controls.filter(c => c.status === 'compliant').length, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Controls Compliant</div>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-yellow-400">
                    {essentialEight.reduce((acc, s) => acc + s.controls.filter(c => c.status === 'partial').length, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Partially Compliant</div>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-red-400">
                    {essentialEight.reduce((acc, s) => acc + s.controls.filter(c => c.status === 'non-compliant').length, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Non-Compliant</div>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-cyan-400">
                    {essentialEight.reduce((acc, s) => acc + s.controls.length, 0)}
                  </div>
                  <div className="text-gray-400 text-sm">Total Controls</div>
                </div>
              </div>
            </div>

            {/* Strategy Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {essentialEight.map((strategy, index) => (
                <div
                  key={strategy.id}
                  className="bg-gray-800/30 border border-gray-700 rounded-xl p-4 hover:border-cyan-500/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-2xl font-bold text-gray-500">#{index + 1}</div>
                    <div className={`px-2 py-1 rounded text-sm font-medium ${getMaturityColor(byStrategy[strategy.id] || 0)}`}>
                      ML{byStrategy[strategy.id] || 0}
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2 text-sm">{strategy.name}</h3>
                  <p className="text-gray-500 text-xs mb-3 line-clamp-2">{strategy.description}</p>
                  
                  {/* Mini status bars */}
                  <div className="flex gap-1">
                    {strategy.controls.map(control => (
                      <div
                        key={control.id}
                        className={`h-2 flex-1 rounded-full ${getStatusColor(control.status)}`}
                        title={`Level ${control.level}: ${control.status}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Strategy View */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Detailed Control Assessment</h2>
            
            <div className="space-y-4">
              {essentialEight.map((strategy, idx) => (
                <details key={strategy.id} className="group">
                  <summary className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl cursor-pointer hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-500">E8-{idx + 1}</span>
                      <div>
                        <h3 className="font-semibold">{strategy.name}</h3>
                        <p className="text-gray-500 text-sm">{strategy.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-lg font-medium ${getMaturityColor(byStrategy[strategy.id] || 0)}`}>
                        Maturity Level {byStrategy[strategy.id] || 0}
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  
                  <div className="mt-2 p-4 bg-gray-800/30 rounded-xl space-y-4">
                    {/* Controls by maturity level */}
                    {[1, 2, 3].map(level => {
                      const levelControls = strategy.controls.filter(c => c.level === level);
                      if (levelControls.length === 0) return null;
                      
                      return (
                        <div key={level} className="border-l-2 border-gray-700 pl-4">
                          <h4 className="font-medium text-gray-300 mb-2">Maturity Level {level}</h4>
                          {levelControls.map(control => (
                            <div key={control.id} className="mb-3 p-3 bg-gray-800/50 rounded-lg">
                              <div className="flex items-start justify-between">
                                <p className="text-sm text-gray-400 flex-1">{control.requirement}</p>
                                <span className={`px-2 py-1 rounded text-xs font-medium ml-4 ${
                                  control.status === 'compliant' ? 'bg-green-500/20 text-green-400' :
                                  control.status === 'partial' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {control.status.toUpperCase()}
                                </span>
                              </div>
                              {control.gaps.length > 0 && (
                                <div className="mt-2">
                                  <p className="text-xs text-red-400 font-medium">Gaps identified:</p>
                                  <ul className="text-xs text-gray-500 mt-1 space-y-1">
                                    {control.gaps.map((gap, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-red-400">•</span>
                                        {gap}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    
                    {/* Recommendations */}
                    <div className="border-t border-gray-700 pt-4">
                      <h4 className="font-medium text-cyan-400 mb-2">💡 Recommendations</h4>
                      <ul className="space-y-2">
                        {strategy.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                            <span className="text-cyan-400">→</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Remediation Roadmap */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">🗺️ Remediation Roadmap</h2>
            <p className="text-gray-400 mb-4">Prioritized steps to achieve Maturity Level 3</p>
            
            <div className="relative">
              {/* Timeline */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-700" />
              
              <div className="space-y-6">
                {/* Phase 1 */}
                <div className="relative flex gap-4">
                  <div className="w-16 h-16 bg-red-500/20 border border-red-500 rounded-full flex items-center justify-center text-red-400 font-bold z-10">
                    P1
                  </div>
                  <div className="flex-1 bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-semibold text-red-400 mb-2">Phase 1: Critical (Week 1-2)</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Enable MFA on all internet-facing services</li>
                      <li>• Deploy application control on workstations</li>
                      <li>• Patch critical vulnerabilities (48hr window)</li>
                      <li>• Disable macros for non-essential users</li>
                    </ul>
                  </div>
                </div>

                {/* Phase 2 */}
                <div className="relative flex gap-4">
                  <div className="w-16 h-16 bg-yellow-500/20 border border-yellow-500 rounded-full flex items-center justify-center text-yellow-400 font-bold z-10">
                    P2
                  </div>
                  <div className="flex-1 bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-semibold text-yellow-400 mb-2">Phase 2: High (Week 3-4)</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Implement Privileged Access Workstations</li>
                      <li>• Deploy browser hardening policies</li>
                      <li>• Configure air-gapped backups</li>
                      <li>• Remove unsupported operating systems</li>
                    </ul>
                  </div>
                </div>

                {/* Phase 3 */}
                <div className="relative flex gap-4">
                  <div className="w-16 h-16 bg-green-500/20 border border-green-500 rounded-full flex items-center justify-center text-green-400 font-bold z-10">
                    P3
                  </div>
                  <div className="flex-1 bg-gray-800/50 rounded-xl p-4">
                    <h3 className="font-semibold text-green-400 mb-2">Phase 3: Maturity (Week 5-8)</h3>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li>• Deploy phishing-resistant MFA (FIDO2)</li>
                      <li>• Implement Just-in-Time administration</li>
                      <li>• Annual application control ruleset validation</li>
                      <li>• Quarterly backup restoration testing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Essential Eight Compliance Report</h2>
              <button onClick={() => setShowReport(false)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-6" id="compliance-report">
              {/* Report Header */}
              <div className="text-center border-b border-gray-700 pb-6">
                <h1 className="text-3xl font-bold mb-2">🛡️ Essential Eight Maturity Assessment</h1>
                <p className="text-gray-400">Generated: {new Date().toLocaleDateString('en-AU', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}</p>
                <p className="text-gray-400">Organisation: [Your Organisation]</p>
              </div>

              {/* Executive Summary */}
              <div>
                <h2 className="text-xl font-bold mb-4">Executive Summary</h2>
                <div className="bg-gray-800/50 rounded-xl p-4">
                  <p className="text-gray-300 mb-4">
                    This assessment evaluates the organisation's implementation of the Australian Cyber Security Centre's 
                    Essential Eight mitigation strategies. The current overall maturity level is <strong>ML{overallMaturity}</strong>.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Current Maturity</p>
                      <p className="text-2xl font-bold text-cyan-400">Level {overallMaturity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Target Maturity</p>
                      <p className="text-2xl font-bold text-green-400">Level 3</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Maturity by Strategy */}
              <div>
                <h2 className="text-xl font-bold mb-4">Maturity by Strategy</h2>
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="pb-2">Strategy</th>
                      <th className="pb-2">Current</th>
                      <th className="pb-2">Target</th>
                      <th className="pb-2">Gap</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {essentialEight.map((strategy, idx) => {
                      const current = byStrategy[strategy.id] || 0;
                      const target = 3;
                      const gap = target - current;
                      return (
                        <tr key={strategy.id} className="border-t border-gray-800">
                          <td className="py-3">{idx + 1}. {strategy.name}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded ${getMaturityColor(current)}`}>ML{current}</span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-1 rounded bg-green-500/10 text-green-400">ML{target}</span>
                          </td>
                          <td className="py-3">
                            <span className={gap > 0 ? 'text-red-400' : 'text-green-400'}>
                              {gap > 0 ? `${gap} level${gap > 1 ? 's' : ''}` : 'Achieved'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-medium"
              >
                📄 Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplianceHub;
