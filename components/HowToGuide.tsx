import React, { useState } from 'react';

interface GuideSection {
  id: string;
  icon: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

const HowToGuide: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const sections: GuideSection[] = [
    {
      id: 'getting-started',
      icon: '🚀',
      title: 'Getting Started',
      description: 'First steps with Anchor Security',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Getting Started with Anchor Security</h2>
          
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Step 1: Complete Your Profile</h3>
            <p className="text-slate-300 mb-3">
              After signing up, navigate to your profile settings to complete your account setup:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Click your profile picture in the sidebar</li>
              <li>Fill in your personal information</li>
              <li>Add your company details</li>
              <li>Configure notification preferences</li>
            </ol>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Step 2: Create Your First Project</h3>
            <p className="text-slate-300 mb-3">
              Projects are containers for your security scans. Create one by:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Go to the Dashboard</li>
              <li>Click "New Project" button</li>
              <li>Enter a name and description</li>
              <li>Select the project scope (web, API, mobile, etc.)</li>
              <li>Click "Create Project"</li>
            </ol>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Step 3: Run Your First Scan</h3>
            <p className="text-slate-300 mb-3">
              Start scanning for vulnerabilities:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Select your project</li>
              <li>Click "New Scan"</li>
              <li>Choose scan type (SAST, DAST, or both)</li>
              <li>Configure target URLs or upload code</li>
              <li>Click "Start Scan"</li>
            </ol>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-5">
            <p className="text-cyan-300 flex items-center gap-2">
              <span className="text-xl">💡</span>
              <strong>Pro Tip:</strong> Enable GitHub integration for automatic scanning on every pull request!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard-overview',
      icon: '📊',
      title: 'Dashboard Overview',
      description: 'Understanding your security dashboard',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Understanding Your Dashboard</h2>
          
          <p className="text-slate-300">
            The dashboard provides a real-time view of your security posture with key metrics and insights.
          </p>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-red-400">Critical</p>
                <p className="text-slate-400 text-sm">Vulnerabilities requiring immediate attention</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-orange-400">High</p>
                <p className="text-slate-400 text-sm">Significant risk, plan remediation soon</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-yellow-400">Medium</p>
                <p className="text-slate-400 text-sm">Moderate risk, address within 30 days</p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-400">Low</p>
                <p className="text-slate-400 text-sm">Minor issues, best practice improvements</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Security Score</h3>
            <p className="text-slate-300 mb-3">
              Your overall security score (0-100) is calculated based on:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>Number and severity of open vulnerabilities</li>
              <li>Time to remediation</li>
              <li>Security configuration compliance</li>
              <li>Integration coverage</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Navigation</h3>
            <p className="text-slate-300 mb-3">
              Use the left sidebar to navigate between different security modules:
            </p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong>Overview</strong> - Dashboard, Executive View, Metrics</li>
              <li><strong>Threat Detection</strong> - Hunting, Intelligence, UEBA</li>
              <li><strong>Defense & Response</strong> - EDR, SOAR, Incident Response</li>
              <li><strong>Compliance & Risk</strong> - Compliance Hub, Vendor Risk</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'projects-scans',
      icon: '📁',
      title: 'Projects & Scans',
      description: 'Managing security projects and running scans',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Projects & Scans</h2>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Creating a Project</h3>
            <p className="text-slate-300 mb-3">Projects organize your security scans by application or service.</p>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <pre className="text-sm text-slate-300">
{`1. Dashboard → "New Project"
2. Enter project name (e.g., "API Gateway")
3. Add description
4. Select scope: Web App, API, Mobile, Infrastructure
5. Click "Create"`}
              </pre>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Scan Types</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <p className="font-medium text-white">SAST (Static Analysis)</p>
                  <p className="text-slate-400 text-sm">Analyzes source code without execution. Finds SQL injection, XSS, hardcoded secrets.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🎯</span>
                </div>
                <div>
                  <p className="font-medium text-white">DAST (Dynamic Analysis)</p>
                  <p className="text-slate-400 text-sm">Tests running applications. Simulates real attacker behavior.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">📦</span>
                </div>
                <div>
                  <p className="font-medium text-white">SCA (Software Composition)</p>
                  <p className="text-slate-400 text-sm">Scans dependencies for known CVEs and license issues.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Running a Scan</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Select your project from the dashboard</li>
              <li>Click "New Scan" button</li>
              <li>Choose scan type(s) - you can run multiple</li>
              <li>Configure scan settings (depth, exclusions)</li>
              <li>Enter target URL or upload repository</li>
              <li>Click "Start Scan"</li>
              <li>Monitor progress in real-time</li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: 'findings',
      icon: '🐛',
      title: 'Understanding Findings',
      description: 'Interpreting and managing security findings',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Understanding Findings</h2>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Severity Levels</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <span className="text-2xl">🔴</span>
                <div>
                  <p className="font-medium text-red-400">Critical</p>
                  <p className="text-slate-400 text-sm">Exploitable with severe impact. Fix within 24 hours.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                <span className="text-2xl">🟠</span>
                <div>
                  <p className="font-medium text-orange-400">High</p>
                  <p className="text-slate-400 text-sm">Significant security risk. Fix within 7 days.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <span className="text-2xl">🟡</span>
                <div>
                  <p className="font-medium text-yellow-400">Medium</p>
                  <p className="text-slate-400 text-sm">Moderate risk. Fix within 30 days.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <span className="text-2xl">🟢</span>
                <div>
                  <p className="font-medium text-green-400">Low</p>
                  <p className="text-slate-400 text-sm">Best practice improvement. Fix within 90 days.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Finding Details</h3>
            <p className="text-slate-300 mb-3">Each finding includes:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong>Title</strong> - Type of vulnerability (e.g., SQL Injection)</li>
              <li><strong>Location</strong> - File path and line number</li>
              <li><strong>Description</strong> - Detailed explanation of the issue</li>
              <li><strong>Impact</strong> - Potential business impact</li>
              <li><strong>Remediation</strong> - Steps to fix the vulnerability</li>
              <li><strong>References</strong> - OWASP, CWE, and CVE links</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Managing Findings</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm">Fix</span>
                <p className="text-slate-300 text-sm">Apply the suggested remediation</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-sm">Autofix</span>
                <p className="text-slate-300 text-sm">Let AI generate and apply the fix</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-sm">Accept Risk</span>
                <p className="text-slate-300 text-sm">Acknowledge but defer remediation</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded text-sm">False Positive</span>
                <p className="text-slate-300 text-sm">Mark as not a real vulnerability</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'team-management',
      icon: '👥',
      title: 'Team Management',
      description: 'Inviting and managing team members',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Team Management</h2>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Inviting Team Members</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Navigate to Team in the sidebar</li>
              <li>Click "Invite Member"</li>
              <li>Enter their email address and name</li>
              <li>Select their role</li>
              <li>Click "Send Invite"</li>
            </ol>
            <p className="text-slate-400 text-sm mt-3">
              They'll receive an email invitation to join your organization.
            </p>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Role Permissions</h3>
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <p className="font-medium text-white">👑 Owner</p>
                <p className="text-slate-400 text-sm">Full access. Can delete organization. Only one per org.</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <p className="font-medium text-white">🔧 Admin</p>
                <p className="text-slate-400 text-sm">Manage projects, team members, integrations, and billing.</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <p className="font-medium text-white">👤 Member</p>
                <p className="text-slate-400 text-sm">View findings, run scans, apply fixes. Cannot manage team.</p>
              </div>
              <div className="p-3 bg-slate-900/50 rounded-lg">
                <p className="font-medium text-white">👁️ Viewer</p>
                <p className="text-slate-400 text-sm">Read-only access to projects and findings.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Managing Members</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>Change roles from the Team settings page</li>
              <li>Remove members by clicking the remove button</li>
              <li>View activity in the Audit Log</li>
              <li>Resend invites for pending members</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'integrations',
      icon: '🔗',
      title: 'Integrations',
      description: 'Connecting Anchor with your tools',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Integrations</h2>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">GitHub Integration</h3>
            <p className="text-slate-300 mb-3">Automatically scan every pull request:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Go to Integrations → GitHub</li>
              <li>Click "Connect GitHub"</li>
              <li>Authorize Anchor in GitHub</li>
              <li>Select repositories to monitor</li>
              <li>Configure scan triggers (PR, push, etc.)</li>
            </ol>
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-green-400 text-sm">✅ Results appear as comments on your PRs</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Slack Integration</h3>
            <p className="text-slate-300 mb-3">Get real-time security alerts:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Go to Integrations → Slack</li>
              <li>Click "Add to Slack"</li>
              <li>Select your workspace</li>
              <li>Choose alert channel</li>
              <li>Configure alert thresholds</li>
            </ol>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Jira Integration</h3>
            <p className="text-slate-300 mb-3">Create issues from findings:</p>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Go to Integrations → Jira</li>
              <li>Enter your Jira URL</li>
              <li>Authenticate with API token</li>
              <li>Map severity to priority</li>
              <li>Select default project</li>
            </ol>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Available Integrations</h3>
            <div className="grid grid-cols-3 gap-3">
              {['GitHub', 'GitLab', 'Bitbucket', 'Slack', 'Teams', 'Jira', 'ServiceNow', 'PagerDuty', 'Splunk'].map(name => (
                <div key={name} className="p-2 bg-slate-900/50 rounded-lg text-center text-slate-300 text-sm">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'billing',
      icon: '💳',
      title: 'Billing & Plans',
      description: 'Managing your subscription',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Billing & Plans</h2>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Available Plans</h3>
            <div className="space-y-3">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-white">🆓 Starter</p>
                  <p className="text-slate-400">Free</p>
                </div>
                <p className="text-slate-400 text-sm">2 projects, 10 scans/month, basic features</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg border border-cyan-500/30">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-cyan-400">💎 Pro</p>
                  <p className="text-white font-bold">$49/mo</p>
                </div>
                <p className="text-slate-400 text-sm">Unlimited projects, 100 scans/month, AI autofix</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg border border-purple-500/30">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-purple-400">🏢 Team</p>
                  <p className="text-white font-bold">$199/mo</p>
                </div>
                <p className="text-slate-400 text-sm">Everything in Pro, 10 seats, SSO, custom integrations</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-600/50">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium text-white">🏛️ Enterprise</p>
                  <p className="text-slate-400">Contact Sales</p>
                </div>
                <p className="text-slate-400 text-sm">Unlimited everything, on-premise, dedicated support</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Managing Your Subscription</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Navigate to Billing in the sidebar</li>
              <li>View current plan and usage</li>
              <li>Click "Upgrade" or "Manage Subscription"</li>
              <li>Select new plan or modify payment method</li>
              <li>Changes take effect immediately</li>
            </ol>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">Bank Details (Australian Users)</h3>
            <p className="text-slate-300 mb-3">For direct debit payments:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>Go to Profile → Bank Details</li>
              <li>Enter BSB (6 digits)</li>
              <li>Enter Account Number</li>
              <li>Enter Account Name</li>
              <li>Save your details securely</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'security-modules',
      icon: '🛡️',
      title: 'Security Modules',
      description: 'Overview of all security features',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Security Modules Overview</h2>

          <p className="text-slate-300">
            Anchor provides a comprehensive suite of security tools organized by function.
          </p>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">🎯 Threat Detection</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong>Threat Hunting</strong> - Proactive threat investigation</li>
              <li><strong>Threat Intelligence</strong> - IOC feeds and correlation</li>
              <li><strong>UEBA</strong> - User behavior analytics</li>
              <li><strong>Insider Threats</strong> - Internal risk detection</li>
              <li><strong>Dark Web Monitor</strong> - Leaked credential monitoring</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">🛡️ Defense & Response</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong>EDR</strong> - Endpoint detection and response</li>
              <li><strong>SOAR</strong> - Security orchestration and automation</li>
              <li><strong>Incident Response</strong> - Automated playbooks</li>
              <li><strong>Active Defense</strong> - Honeypots and deception</li>
              <li><strong>Autonomous SOC</strong> - 24/7 AI security operations</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">🔍 Vulnerability Management</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong>Attack Surface</strong> - Discover exposed assets</li>
              <li><strong>Vulnerability Mgmt</strong> - CVE tracking and SLAs</li>
              <li><strong>Penetration Testing</strong> - Automated pen testing</li>
              <li><strong>Breach Simulator</strong> - Attack simulation</li>
              <li><strong>API Security</strong> - API endpoint scanning</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">☁️ Cloud & DevSecOps</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong>Cloud Security</strong> - CSPM and misconfiguration detection</li>
              <li><strong>Container Security</strong> - K8s and image scanning</li>
              <li><strong>CI/CD Security</strong> - Pipeline security</li>
              <li><strong>RASP Agent</strong> - Runtime protection</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">🏛️ Government & Defense</h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li><strong>National Security</strong> - Classified environment management</li>
              <li><strong>Critical Infrastructure</strong> - 16 sectors, NERC CIP</li>
              <li><strong>OT/ICS Security</strong> - Industrial control systems</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'api-cicd',
      icon: '🔌',
      title: 'API & CI/CD',
      description: 'Automating security in your pipeline',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">API & CI/CD Integration</h2>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">API Key Setup</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-300 pl-2">
              <li>Go to Settings → API Keys</li>
              <li>Click "Create API Key"</li>
              <li>Name your key (e.g., "CI Pipeline")</li>
              <li>Set expiration (optional)</li>
              <li>Copy and store securely</li>
            </ol>
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-400 text-sm">⚠️ Store API keys in environment variables, never in code!</p>
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">GitHub Actions Example</h3>
            <pre className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto">
{`name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run Anchor Scan
        uses: anchor-security/scan-action@v1
        with:
          api-key: \${{ secrets.ANCHOR_API_KEY }}
          fail-on: critical,high
          
      - name: Upload Results
        if: always()
        uses: anchor-security/upload-action@v1
        with:
          api-key: \${{ secrets.ANCHOR_API_KEY }}`}
            </pre>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">GitLab CI Example</h3>
            <pre className="bg-slate-900 rounded-lg p-4 text-sm text-slate-300 overflow-x-auto">
{`stages:
  - security

anchor-scan:
  stage: security
  image: anchor/scanner:latest
  script:
    - anchor-cli scan 
        --api-key $ANCHOR_API_KEY
        --project-id $CI_PROJECT_ID
        --fail-on critical,high
  artifacts:
    reports:
      security: anchor-results.json`}
            </pre>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-cyan-400 mb-3">API Endpoints</h3>
            <div className="space-y-2">
              <div className="p-2 bg-slate-900/50 rounded flex items-center gap-3">
                <span className="text-green-400 font-mono text-sm">POST</span>
                <span className="text-slate-300 font-mono text-sm">/api/v1/scans</span>
              </div>
              <div className="p-2 bg-slate-900/50 rounded flex items-center gap-3">
                <span className="text-blue-400 font-mono text-sm">GET</span>
                <span className="text-slate-300 font-mono text-sm">/api/v1/scans/:id</span>
              </div>
              <div className="p-2 bg-slate-900/50 rounded flex items-center gap-3">
                <span className="text-blue-400 font-mono text-sm">GET</span>
                <span className="text-slate-300 font-mono text-sm">/api/v1/projects/:id/findings</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mt-3">
              Full API docs: docs.anchoraiguard.com/api
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'troubleshooting',
      icon: '🔧',
      title: 'Troubleshooting',
      description: 'Common issues and solutions',
      content: (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white">Troubleshooting</h2>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-red-400 mb-3">Scan Not Starting</h3>
            <p className="text-slate-300 mb-2">Check the following:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>Verify your subscription has remaining scans</li>
              <li>Check if target URL is accessible</li>
              <li>Ensure project isn't archived</li>
              <li>Clear browser cache and retry</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-red-400 mb-3">GitHub Integration Not Working</h3>
            <p className="text-slate-300 mb-2">Try these steps:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>Re-authorize the GitHub app</li>
              <li>Check repository permissions</li>
              <li>Verify webhook is active in GitHub settings</li>
              <li>Ensure Anchor app is installed on the repo</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-red-400 mb-3">Profile/Settings Not Saving</h3>
            <p className="text-slate-300 mb-2">Common fixes:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>Check for validation errors in form fields</li>
              <li>Ensure all required fields are filled</li>
              <li>Try logging out and back in</li>
              <li>Clear browser storage and re-authenticate</li>
            </ul>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-red-400 mb-3">Dashboard Loading Slowly</h3>
            <p className="text-slate-300 mb-2">Performance tips:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>Use date filters to limit data range</li>
              <li>Archive completed projects</li>
              <li>Check network connection</li>
              <li>Try a different browser</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-3">Need More Help?</h3>
            <p className="text-slate-300 mb-3">If you're still having issues:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
              <li>Use the AI Help Desk for instant assistance</li>
              <li>Email support@anchoraiguard.com</li>
              <li>Check status.anchoraiguard.com for outages</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  const filteredSections = sections.filter(
    section =>
      section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeContent = sections.find(s => s.id === activeSection);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">📚</span>
          How-To Guide
        </h1>
        <p className="text-slate-400 mt-1">
          Learn how to use all features of Anchor Security
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4 sticky top-6">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Guide Sections
            </h2>
            <nav className="space-y-1">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${
                    activeSection === section.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            {activeContent ? activeContent.content : (
              <p className="text-slate-400">Select a section from the sidebar.</p>
            )}
          </div>

          {/* Navigation Footer */}
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => {
                const idx = sections.findIndex(s => s.id === activeSection);
                if (idx > 0) setActiveSection(sections[idx - 1].id);
              }}
              disabled={sections.findIndex(s => s.id === activeSection) === 0}
              className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={() => {
                const idx = sections.findIndex(s => s.id === activeSection);
                if (idx < sections.length - 1) setActiveSection(sections[idx + 1].id);
              }}
              disabled={sections.findIndex(s => s.id === activeSection) === sections.length - 1}
              className="px-4 py-2 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
            >
              Next
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToGuide;
