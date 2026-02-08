import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { env } from '../config/env';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, signup, isLoading } = useAuth();

  // Check for OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const oauthError = params.get('error');
    
    if (token) {
      // Use the same key as useAuth hook
      localStorage.setItem('anchor_auth_token', token);
      window.history.replaceState({}, '', window.location.pathname);
      // Force a page reload to ensure auth state is picked up correctly
      window.location.href = '/';
      return;
    }
    
    if (oauthError) {
      const errorMessages: Record<string, string> = {
        'github_auth_failed': 'GitHub authentication failed. Please try again.',
        'github_token_failed': 'Failed to get GitHub token. Please try again.',
        'github_no_email': 'No email found on GitHub account. Please add a public email.',
        'google_auth_failed': 'Google authentication failed. Please try again.',
        'google_token_failed': 'Failed to get Google token. Please try again.',
        'google_no_email': 'No email found on Google account.',
      };
      setError(errorMessages[oauthError] || 'Authentication failed. Please try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && !acceptedTerms) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(email, password, name, organizationName || undefined);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    }
  };

  const handleOAuthLogin = (provider: 'github' | 'google') => {
    // Use backend URL for OAuth flow (backend handles the OAuth dance)
    const backendUrl = env.apiBaseUrl.replace('/api', '');
    window.location.href = `${backendUrl}/api/auth/${provider}`;
  };

  // Terms of Service Modal
  const TermsModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl max-h-[80vh] overflow-y-auto p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Terms of Service</h2>
          <button onClick={() => setShowTerms(false)} className="text-slate-400 hover:text-white" aria-label="Close terms">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-slate-300 space-y-4">
          <p className="text-sm text-slate-400">Last updated: February 1, 2026</p>
          
          <h3 className="text-lg font-semibold text-white">1. Acceptance of Terms</h3>
          <p>By accessing or using Anchor Security (&quot;Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service.</p>
          
          <h3 className="text-lg font-semibold text-white">2. Description of Service</h3>
          <p>Anchor Security provides automated security scanning, vulnerability detection, and AI-powered security analysis for software projects. The Service includes web-based dashboards, CLI tools, and API access.</p>
          
          <h3 className="text-lg font-semibold text-white">3. User Accounts</h3>
          <p>You must provide accurate information when creating an account. You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorized access.</p>
          
          <h3 className="text-lg font-semibold text-white">4. Acceptable Use</h3>
          <p>You agree not to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Use the Service for any illegal purpose</li>
            <li>Attempt to gain unauthorized access to any systems</li>
            <li>Interfere with or disrupt the Service</li>
            <li>Reverse engineer or attempt to extract source code</li>
            <li>Resell or redistribute the Service without authorization</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-white">5. Subscription and Billing</h3>
          <p>Paid subscriptions are billed in advance on a monthly or yearly basis. Refunds are available within 30 days of initial purchase. Subscription cancellations take effect at the end of the billing period.</p>
          
          <h3 className="text-lg font-semibold text-white">6. Data and Security</h3>
          <p>We scan your code to identify security vulnerabilities. We do not store your source code beyond the duration of the scan. Scan results and metadata are retained according to your plan&apos;s data retention policy.</p>
          
          <h3 className="text-lg font-semibold text-white">7. Intellectual Property</h3>
          <p>The Service and its original content, features, and functionality are owned by Anchor Security and are protected by international copyright, trademark, and other intellectual property laws.</p>
          
          <h3 className="text-lg font-semibold text-white">8. Limitation of Liability</h3>
          <p>Anchor Security shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the Service. Our total liability shall not exceed the amount paid by you in the past 12 months.</p>
          
          <h3 className="text-lg font-semibold text-white">9. Disclaimer</h3>
          <p>The Service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that the Service will identify all security vulnerabilities in your code.</p>
          
          <h3 className="text-lg font-semibold text-white">10. Changes to Terms</h3>
          <p>We reserve the right to modify these terms at any time. We will notify users of significant changes via email or in-app notification.</p>
          
          <h3 className="text-lg font-semibold text-white">11. Contact</h3>
          <p>For questions about these Terms, contact us at legal@anchor-security.com</p>
        </div>
        <button
          onClick={() => setShowTerms(false)}
          className="mt-6 w-full py-3 bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] text-white rounded-lg hover:brightness-110 transition-all shadow-lg shadow-cyan-500/25"
        >
          Close
        </button>
      </div>
    </div>
  );

  // Privacy Policy Modal
  const PrivacyModal = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl max-w-2xl max-h-[80vh] overflow-y-auto p-8 border border-slate-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
          <button onClick={() => setShowPrivacy(false)} className="text-slate-400 hover:text-white" aria-label="Close privacy policy">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="text-slate-300 space-y-4">
          <p className="text-sm text-slate-400">Last updated: February 1, 2026</p>
          
          <h3 className="text-lg font-semibold text-white">1. Information We Collect</h3>
          <p><strong>Account Information:</strong> Email address, name, organization name, and password (hashed).</p>
          <p><strong>Usage Data:</strong> Scan history, feature usage, and interaction with the Service.</p>
          <p><strong>Technical Data:</strong> IP address, browser type, device information, and cookies.</p>
          
          <h3 className="text-lg font-semibold text-white">2. How We Use Your Information</h3>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and maintain the Service</li>
            <li>Process security scans and generate reports</li>
            <li>Send important notifications and updates</li>
            <li>Improve and personalize the Service</li>
            <li>Detect and prevent fraud or abuse</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-white">3. Code Scanning</h3>
          <p>When you scan code, we temporarily process it to identify security vulnerabilities. We do NOT:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Store your source code after scanning is complete</li>
            <li>Share your code with third parties</li>
            <li>Use your code to train AI models</li>
          </ul>
          <p>Scan results and vulnerability metadata are stored according to your plan&apos;s retention policy.</p>
          
          <h3 className="text-lg font-semibold text-white">4. Data Sharing</h3>
          <p>We do not sell your personal information. We may share data with:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Service providers (hosting, payment processing, email)</li>
            <li>Legal authorities when required by law</li>
            <li>Business transfers (in case of merger or acquisition)</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-white">5. Data Security</h3>
          <p>We implement industry-standard security measures including:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
            <li>Regular security audits and penetration testing</li>
            <li>Access controls and monitoring</li>
            <li>SOC 2 Type II compliance (Enterprise plans)</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-white">6. Your Rights</h3>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access and export your data</li>
            <li>Correct inaccurate information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of marketing communications</li>
            <li>Request data portability</li>
          </ul>
          
          <h3 className="text-lg font-semibold text-white">7. Cookies</h3>
          <p>We use essential cookies for authentication and session management. Analytics cookies are optional and can be disabled in your account settings.</p>
          
          <h3 className="text-lg font-semibold text-white">8. Data Retention</h3>
          <p>We retain your data for as long as your account is active. Upon account deletion, we remove personal data within 30 days, except where required by law.</p>
          
          <h3 className="text-lg font-semibold text-white">9. International Transfers</h3>
          <p>Your data may be processed in the United States. We ensure appropriate safeguards for international data transfers.</p>
          
          <h3 className="text-lg font-semibold text-white">10. Contact</h3>
          <p>For privacy inquiries, contact us at privacy@anchor-security.com</p>
        </div>
        <button
          onClick={() => setShowPrivacy(false)}
          className="mt-6 w-full py-3 bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] text-white rounded-lg hover:brightness-110 transition-all shadow-lg shadow-cyan-500/25"
        >
          Close
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {showTerms && <TermsModal />}
      {showPrivacy && <PrivacyModal />}
      
      <div className="w-full max-w-md">
        <div className="glass-bubble p-8 shadow-2xl">
          {/* Welcome Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome to Anchor</h1>
            <p className="text-slate-400">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-slate-900 border border-slate-600 text-white hover:bg-slate-700 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Continue with GitHub
            </button>
            
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white text-gray-700 hover:bg-gray-100 transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800 text-slate-400">or continue with email</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 bg-slate-900/50 rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Organization Name</label>
                  <input
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    placeholder="Acme Corp (optional)"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                placeholder="you@company.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-lg bg-slate-900/50 border border-slate-600/50 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                placeholder="••••••••"
              />
              {mode === 'signup' && (
                <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
              )}
            </div>

            {/* Terms Checkbox - Only for signup */}
            {mode === 'signup' && (
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500/30"
                />
                <label htmlFor="terms" className="text-sm text-slate-400">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-[#ff4fa3] hover:text-[#ff7ab8] underline"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    onClick={() => setShowPrivacy(true)}
                    className="text-[#ff4fa3] hover:text-[#ff7ab8] underline"
                  >
                    Privacy Policy
                  </button>
                </label>
              </div>
            )}

            {/* Forgot Password - Only for login */}
            {mode === 'login' && (
              <div className="text-right">
                <a href="/forgot-password" className="text-sm text-[#ff4fa3] hover:text-[#ff7ab8]">
                  Forgot password?
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (mode === 'signup' && !acceptedTerms)}
              className="w-full py-3 px-4 rounded-lg bg-linear-to-r from-[#35c6ff] via-[#7a3cff] to-[#ff4fa3] text-white font-semibold hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-pink-500/25"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-slate-500 text-xs mt-6">
            By signing in, you agree to our{' '}
            <button onClick={() => setShowTerms(true)} className="text-[#ff4fa3] hover:underline">
              Terms
            </button>{' '}
            and{' '}
            <button onClick={() => setShowPrivacy(true)} className="text-[#ff4fa3] hover:underline">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
