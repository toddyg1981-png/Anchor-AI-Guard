import React, { useEffect, useState } from 'react';

interface AuthCallbackProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onError }) => {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const isNewUser = params.get('isNewUser') === 'true';
    const error = params.get('error');

    if (error) {
      setStatus('error');
      const errorMessages: Record<string, string> = {
        'github_auth_failed': 'GitHub authentication failed',
        'github_token_failed': 'Failed to get GitHub access token',
        'github_no_email': 'No email found on your GitHub account',
        'google_auth_failed': 'Google authentication failed',
        'google_token_failed': 'Failed to get Google access token',
        'google_no_email': 'No email found on your Google account',
      };
      setMessage(errorMessages[error] || 'Authentication failed');
      onError(error);
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      setStatus('success');
      setMessage(isNewUser ? 'Account created! Redirecting...' : 'Signed in! Redirecting...');
      
      // Clean URL and redirect
      window.history.replaceState({}, '', '/');
      
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setStatus('error');
      setMessage('No authentication token received');
      onError('no_token');
    }
  }, [onSuccess, onError]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-slate-800/80 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 shadow-2xl text-center">
          {status === 'processing' && (
            <>
              <svg className="animate-spin h-12 w-12 mx-auto text-cyan-400 mb-6" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <h2 className="text-xl font-semibold text-white mb-2">Processing</h2>
              <p className="text-slate-400">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Success!</h2>
              <p className="text-slate-400">{message}</p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
              <p className="text-slate-400 mb-6">{message}</p>
              <a
                href="/login"
                className="inline-block w-full py-3 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 transition-all"
              >
                Back to Login
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
