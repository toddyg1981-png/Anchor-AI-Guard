import React, { useState, useRef, useEffect } from 'react';
import { env } from '../config/env';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface HelpTopic {
  id: string;
  icon: string;
  title: string;
  description: string;
  query: string;
}

const AIHelpDesk: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTopics, setShowTopics] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const token = localStorage.getItem('anchor_auth_token');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const helpTopics: HelpTopic[] = [
    {
      id: 'getting-started',
      icon: '🚀',
      title: 'Getting Started',
      description: 'Learn how to set up your first security scan',
      query: 'How do I get started with Anchor Security? Walk me through creating my first project and running a scan.',
    },
    {
      id: 'create-project',
      icon: '📁',
      title: 'Create a Project',
      description: 'Steps to create and configure a security project',
      query: 'How do I create a new project in Anchor? What settings should I configure?',
    },
    {
      id: 'run-scan',
      icon: '🔍',
      title: 'Running Scans',
      description: 'How to scan your code for vulnerabilities',
      query: 'How do I run a security scan? What types of scans are available?',
    },
    {
      id: 'understand-findings',
      icon: '📊',
      title: 'Understanding Findings',
      description: 'Learn to interpret and prioritize security findings',
      query: 'How do I understand the security findings? What do the severity levels mean?',
    },
    {
      id: 'fix-vulnerabilities',
      icon: '🔧',
      title: 'Fixing Vulnerabilities',
      description: 'Detailed guidance on resolving security issues',
      query: 'How do I fix vulnerabilities found by Anchor? Can I get remediation guidance?',
    },
    {
      id: 'team-management',
      icon: '👥',
      title: 'Team Management',
      description: 'Invite members and manage roles',
      query: 'How do I invite team members? What are the different roles and permissions?',
    },
    {
      id: 'integrations',
      icon: '🔗',
      title: 'Integrations',
      description: 'Connect Anchor with GitHub, Slack, Jira',
      query: 'How do I integrate Anchor with my tools like GitHub, Slack, or Jira? What integrations are available?',
    },
    {
      id: 'billing',
      icon: '💳',
      title: 'Billing & Plans',
      description: 'Manage subscription and payments',
      query: 'How do I manage my subscription? What is included in each plan?',
    },
    {
      id: 'api-usage',
      icon: '🔌',
      title: 'API & CI/CD',
      description: 'Integrate Anchor into your pipeline',
      query: 'How do I use the Anchor API? How can I integrate security scanning into my CI/CD pipeline?',
    },
  ];

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setShowTopics(false);
    setIsLoading(true);

    try {
      const res = await fetch(`${env.apiBaseUrl}/ai/helpdesk`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: content.trim() }),
      });

      let assistantContent = '';
      
      if (res.ok) {
        const data = await res.json();
        assistantContent = data.answer || data.response || 'I apologize, but I couldn\'t generate a response. Please try again.';
      } else {
        // Fallback to local knowledge base if API isn't available
        assistantContent = generateLocalResponse(content.trim());
      }

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Help desk error:', error);
      
      // Provide helpful fallback response
      const fallbackMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: generateLocalResponse(content.trim()),
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLocalResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes('get started') || q.includes('start') || q.includes('begin')) {
      return `**Getting Started with Anchor Security**

Welcome to Anchor! Here's how to get started:

1. **Create a Project**
   - Go to the Dashboard and click "New Project"
   - Enter a name and description for your project
   - Select the scope (web app, API, mobile, etc.)

2. **Run Your First Scan**
   - From your project page, click "New Scan"
   - Choose the scan type (SAST, DAST, or full security audit)
   - Configure scan settings and start the scan

3. **Review Findings**
   - Once complete, view findings sorted by severity
   - Click any finding for detailed remediation guidance
   - Use AI-powered autofix for quick resolutions

4. **Set Up Integrations** (Optional)
   - Connect GitHub for automatic PR scanning
   - Add Slack for real-time notifications
   - Configure Jira for issue tracking

Need more help? Click any topic on the left or ask me a specific question!`;
    }
    
    if (q.includes('project') || q.includes('create')) {
      return `**Creating a Project in Anchor**

To create a new security project:

1. From the Dashboard, click **"+ New Project"**
2. Fill in the project details:
   - **Name**: A descriptive name (e.g., "API Gateway", "Customer Portal")
   - **Description**: Brief overview of what this project covers
   - **Scope**: Define what assets to scan
   
3. Configure settings:
   - **Auto-scan**: Enable to scan on every code push
   - **Notifications**: Choose who gets alerts
   - **Severity threshold**: Set minimum severity for notifications

4. Click **"Create Project"** to finish

Your project is now ready for scanning! You can start a manual scan or configure CI/CD integration for automated scanning.`;
    }
    
    if (q.includes('scan') || q.includes('scanning')) {
      return `**Running Security Scans**

Anchor offers several scan types:

**1. SAST (Static Analysis)**
- Analyzes source code without execution
- Finds SQL injection, XSS, hardcoded secrets
- Best for: Finding vulnerabilities early in development

**2. DAST (Dynamic Analysis)**
- Tests running applications
- Simulates attacker behavior
- Best for: Pre-deployment security testing

**3. SCA (Software Composition Analysis)**
- Scans dependencies for known CVEs
- Checks license compliance
- Best for: Supply chain security

**To run a scan:**
1. Select your project
2. Click "New Scan"
3. Choose scan type(s)
4. Click "Start Scan"

Scans typically complete in 5-30 minutes depending on project size.`;
    }
    
    if (q.includes('finding') || q.includes('vulnerability') || q.includes('severity')) {
      return `**Understanding Security Findings**

Anchor categorizes findings by severity:

🔴 **CRITICAL** - Immediate action required
- Exploitable with severe impact
- Example: Remote code execution, SQL injection
- SLA: Fix within 24 hours

🟠 **HIGH** - Address promptly  
- Significant security risk
- Example: Authentication bypass, sensitive data exposure
- SLA: Fix within 7 days

🟡 **MEDIUM** - Plan remediation
- Moderate risk, needs context
- Example: CSRF, missing headers
- SLA: Fix within 30 days

🟢 **LOW** - Best practice improvements
- Minimal direct risk
- Example: Verbose errors, outdated libraries
- SLA: Fix within 90 days

Each finding includes:
- Detailed description
- Steps to reproduce
- Remediation guidance
- Code examples for fixes`;
    }
    
    if (q.includes('fix') || q.includes('remediat') || q.includes('autofix')) {
      return `**Fixing Vulnerabilities**

Anchor helps you fix issues quickly:

**1. AI-Powered Autofix**
- Click "Autofix" on any finding
- Review the suggested code changes
- Apply directly or create a PR

**2. Manual Remediation**
- Each finding has detailed guidance
- Code examples for common frameworks
- Links to OWASP and security resources

**3. Bulk Operations**
- Select multiple findings
- Apply fixes in batch
- Export to Jira/GitHub issues

**Best Practices:**
- Prioritize Critical and High findings
- Review autofix suggestions before applying
- Run a verification scan after fixes
- Document any false positives

Need help with a specific vulnerability type? Just ask!`;
    }
    
    if (q.includes('team') || q.includes('member') || q.includes('invite') || q.includes('role')) {
      return `**Team Management**

**Inviting Team Members:**
1. Go to Team → Invite Member
2. Enter their email and name
3. Select a role
4. Click "Send Invite"

**Available Roles:**
- **Owner**: Full access, can delete organization
- **Admin**: Manage projects, team, settings
- **Member**: View and fix findings, run scans
- **Viewer**: Read-only access to findings

**Managing Members:**
- Change roles from Team settings
- Remove members when needed
- View activity in Audit Log

**Tips:**
- Limit admin access to senior team members
- Use viewer role for stakeholders who need reports
- Review team access quarterly`;
    }
    
    if (q.includes('integrat') || q.includes('github') || q.includes('slack') || q.includes('jira')) {
      return `**Anchor Integrations**

**GitHub**
- Auto-scan on every PR
- Block merges with critical findings
- Add security comments to PRs
- Setup: Integrations → GitHub → Connect

**Slack**
- Real-time vulnerability alerts
- Daily/weekly security digests
- Team notifications
- Setup: Integrations → Slack → Add to Workspace

**Jira**
- Create issues from findings
- Sync status updates
- Custom field mapping
- Setup: Integrations → Jira → Connect

**CI/CD Integration**
- GitHub Actions, GitLab CI, Jenkins, CircleCI
- Use API key in your pipeline
- Fail builds on critical findings
- View results in PR comments

Need help with a specific integration? Just ask!`;
    }
    
    if (q.includes('billing') || q.includes('plan') || q.includes('subscription') || q.includes('price')) {
      return `**Billing & Plans**

**Available Plans:**

🆓 **Starter** (Free)
- 2 projects, 10 scans/month
- Basic vulnerability detection
- Community support

💎 **Pro** ($4,990/month)
- Unlimited projects, 100 scans/month
- AI autofix, SBOM analysis
- Priority support

🏢 **Team** ($14,990/month)
- Everything in Pro
- 10 team seats, SSO
- Custom integrations

🏛️ **Enterprise** (Custom)
- Unlimited everything
- On-premise option
- Dedicated support

**Managing Your Subscription:**
1. Go to Billing → Manage
2. View usage and invoices
3. Upgrade/downgrade anytime
4. Update payment methods

Questions about pricing? Contact sales@anchoraiguard.com`;
    }
    
    if (q.includes('api') || q.includes('ci/cd') || q.includes('pipeline') || q.includes('automat')) {
      return `**API & CI/CD Integration**

**Using the Anchor API:**
1. Generate API key: Settings → API Keys → Create
2. Store key securely (environment variable)
3. Use in your scripts and pipelines

**Example API Call:**
\`\`\`bash
curl -X POST https://api.anchoraiguard.com/v1/scans \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"projectId": "...", "scanType": "sast"}'
\`\`\`

**CI/CD Examples:**

**GitHub Actions:**
\`\`\`yaml
- name: Anchor Security Scan
  uses: anchor-security/scan-action@v1
  with:
    api-key: \${{ secrets.ANCHOR_API_KEY }}
    fail-on: critical
\`\`\`

**GitLab CI:**
\`\`\`yaml
anchor-scan:
  script:
    - anchor-cli scan --api-key $ANCHOR_API_KEY
\`\`\`

Full API documentation: https://docs.anchoraiguard.com/api`;
    }
    
    // Default response
    return `I'm here to help you with Anchor Security! Here are some things I can assist with:

- **Getting Started** - First steps with Anchor
- **Creating Projects** - Setting up security projects
- **Running Scans** - How to scan for vulnerabilities
- **Understanding Findings** - Interpreting scan results
- **Fixing Issues** - Remediation guidance and autofix
- **Team Management** - Inviting and managing users
- **Integrations** - Connecting GitHub, Slack, Jira
- **Billing** - Plans and subscription management
- **API Usage** - CI/CD and automation

Just ask a specific question and I'll provide detailed guidance!

For complex issues, you can also:
- Check our documentation at docs.anchoraiguard.com
- Contact support at support@anchoraiguard.com`;
  };

  const handleTopicClick = (topic: HelpTopic) => {
    sendMessage(topic.query);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const clearChat = () => {
    setMessages([]);
    setShowTopics(true);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          AI Help Desk
        </h1>
        <p className="text-slate-400 mt-1">
          Get instant help with setting up and using Anchor Security. Ask any question!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Topics Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
              Quick Topics
            </h2>
            <div className="space-y-2">
              {helpTopics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic)}
                  className="w-full text-left p-3 rounded-xl bg-slate-700/30 hover:bg-slate-700/60 border border-slate-600/30 hover:border-cyan-500/30 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl">{topic.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-cyan-300">
                        {topic.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl flex flex-col h-[600px]">
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </div>
                <div>
                  <p className="text-white font-medium">Anchor AI Assistant</p>
                  <p className="text-xs text-slate-400">Always here to help</p>
                </div>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clearChat}
                  className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors"
                >
                  Clear Chat
                </button>
              )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {showTopics && messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-3xl">👋</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    How can I help you today?
                  </h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Ask me anything about Anchor Security. I can help you get started, 
                    explain features, troubleshoot issues, and more.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                        : 'bg-slate-700/50 text-slate-200 border border-slate-600/30'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap prose prose-invert prose-sm max-w-none">
                      {message.content.split('**').map((part, i) => 
                        i % 2 === 0 ? part : <strong key={i}>{part}</strong>
                      )}
                    </div>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-cyan-100' : 'text-slate-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/50 rounded-2xl px-4 py-3 border border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span className="text-sm text-slate-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="px-6 py-4 border-t border-slate-700/50">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about Anchor..."
                  className="flex-1 px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl font-medium hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Support Contact */}
      <div className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📧</span>
          <div>
            <p className="text-white font-medium">Need more help?</p>
            <p className="text-sm text-slate-400">Contact our support team for complex issues</p>
          </div>
        </div>
        <a
          href="mailto:support@anchoraiguard.com"
          className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default AIHelpDesk;
