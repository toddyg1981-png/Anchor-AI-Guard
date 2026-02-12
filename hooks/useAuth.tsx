import { useState, useEffect, useCallback, useRef, createContext, useContext, ReactNode } from 'react';
import { env } from '../config/env';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface Organization {
  id: string;
  name: string;
}

interface AuthState {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, organizationName?: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  loginLoading: boolean;
  isDemoMode: boolean;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'anchor_auth_token';
const USER_KEY = 'anchor_auth_user';
const ORG_KEY = 'anchor_auth_org';
const DEMO_KEY = 'anchor_demo_mode';

function getStoredAuth(): { token: string | null; user: User | null; organization: Organization | null } {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const orgStr = localStorage.getItem(ORG_KEY);
    
    return {
      token,
      user: userStr ? JSON.parse(userStr) : null,
      organization: orgStr ? JSON.parse(orgStr) : null,
    };
  } catch {
    return { token: null, user: null, organization: null };
  }
}

function setStoredAuth(token: string | null, user: User | null, organization: Organization | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
  
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
  
  if (organization) {
    localStorage.setItem(ORG_KEY, JSON.stringify(organization));
  } else {
    localStorage.removeItem(ORG_KEY);
  }
}

function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ORG_KEY);
  localStorage.removeItem(DEMO_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const { token, user, organization } = getStoredAuth();
    const hasToken = !!token && !!user;
    return {
      user: hasToken ? user : null,
      organization: hasToken ? organization : null,
      token: hasToken ? token : null,
      // Never trust localStorage alone — always start as unauthenticated
      // Token will be verified on mount before granting access
      isAuthenticated: false,
      isLoading: hasToken, // Will verify token on mount
    };
  });

  // Separate loading state for login/signup (doesn't affect global authLoading)
  const [loginLoading, setLoginLoading] = useState(false);

  // Demo mode
  const [isDemoMode, setIsDemoMode] = useState(() => localStorage.getItem(DEMO_KEY) === 'true');

  const demoLogin = useCallback(() => {
    const demoUser: User = {
      id: 'demo-user-001',
      email: 'demo@anchoraiguard.com',
      name: 'Demo Viewer',
      role: 'viewer',  // Read-only demo access — no admin/owner privileges
    };
    const demoOrg: Organization = {
      id: 'demo-org-001',
      name: 'Anchor AI Guard — Demo',
    };
    // Generate a unique demo session token (not a static string)
    const demoToken = `demo-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    localStorage.setItem(DEMO_KEY, 'true');
    localStorage.setItem('onboarding_complete', 'true');
    setStoredAuth(demoToken, demoUser, demoOrg);
    setIsDemoMode(true);
    setState({
      user: demoUser,
      organization: demoOrg,
      token: demoToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  // Ref to abort verifyToken if login() is called while verify is in-flight
  const verifyAbortRef = useRef<AbortController | null>(null);

  // Verify token on mount
  useEffect(() => {
    if (isDemoMode) {
      // Demo mode: restore demo session from localStorage
      const { token, user, organization } = getStoredAuth();
      if (token && user && token.startsWith('demo-')) {
        setState({
          user,
          organization,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        // Invalid demo state — clear and reset
        clearStoredAuth();
        localStorage.removeItem(DEMO_KEY);
        setIsDemoMode(false);
        setState({ user: null, organization: null, token: null, isAuthenticated: false, isLoading: false });
      }
      return;
    }
    if (state.token) {
      verifyToken();
    }
    return () => {
      // Abort any pending verify on unmount
      verifyAbortRef.current?.abort();
    };
  }, []);

  const verifyToken = async (attempt = 1): Promise<void> => {
    const controller = new AbortController();
    verifyAbortRef.current = controller;
    const MAX_RETRIES = 3;

    try {
      const response = await fetch(`${env.apiBaseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
        signal: controller.signal,
      });

      if (controller.signal.aborted) return;

      if (response.status === 401 || response.status === 403) {
        // Token is explicitly invalid/expired — clear auth
        clearStoredAuth();
        setState({
          user: null,
          organization: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (controller.signal.aborted) return;

      setState((prev) => ({
        ...prev,
        user: data.user,
        organization: data.organization,
        isAuthenticated: true,
        isLoading: false,
      }));
      setStoredAuth(state.token, data.user, data.organization);
    } catch (err) {
      if (controller.signal.aborted) return;

      // Network error or server error (not 401) — backend might be cold-starting
      // Retry with exponential backoff before giving up
      if (attempt < MAX_RETRIES) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise(resolve => setTimeout(resolve, delay));
        if (!controller.signal.aborted) {
          return verifyToken(attempt + 1);
        }
        return;
      }

      // After all retries failed: clear auth and require re-login
      // Never trust cached tokens — if backend can't verify, user must re-authenticate
      clearStoredAuth();
      setState({
        user: null,
        organization: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    // Abort any in-flight token verification to prevent it from clobbering this login
    verifyAbortRef.current?.abort();

    setLoginLoading(true);

    // Retry logic for Railway cold starts
    const MAX_ATTEMPTS = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(`${env.apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Login failed' }));
          // Don't retry on auth errors (wrong credentials, rate limit, etc.)
          if (response.status === 401 || response.status === 409 || response.status === 429 || response.status === 400) {
            setLoginLoading(false);
            throw new Error(error.error || 'Login failed');
          }
          // Server error — retry
          throw new Error(`Server error (${response.status})`);
        }

        const data = await response.json();
        
        setStoredAuth(data.token, data.user, data.organization);
        setLoginLoading(false);
        setState({
          user: data.user,
          organization: data.organization,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return; // Success — exit
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Login failed');
        // If it's a known auth error (thrown above with specific status), don't retry
        if (lastError.message.includes('Invalid') || lastError.message.includes('already exists') || lastError.message.includes('rate') || lastError.message === 'Login failed') {
          setLoginLoading(false);
          throw lastError;
        }
        // Network/server error — retry with backoff
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    setLoginLoading(false);
    throw new Error(
      lastError?.message?.includes('Server error')
        ? 'Server is starting up, please try again in a few seconds'
        : 'Unable to connect to server. Please check your internet connection and try again.'
    );
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, organizationName?: string) => {
    setLoginLoading(true);

    const MAX_ATTEMPTS = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const response = await fetch(`${env.apiBaseUrl}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name, organizationName }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ error: 'Signup failed' }));
          if (response.status === 400 || response.status === 409 || response.status === 429) {
            setLoginLoading(false);
            throw new Error(error.error || 'Signup failed');
          }
          throw new Error(`Server error (${response.status})`);
        }

        const data = await response.json();
        
        setStoredAuth(data.token, data.user, data.organization);
        setLoginLoading(false);
        setState({
          user: data.user,
          organization: data.organization,
          token: data.token,
          isAuthenticated: true,
          isLoading: false,
        });
        return; // Success
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Signup failed');
        if (lastError.message.includes('already exists') || lastError.message.includes('Invalid') || lastError.message === 'Signup failed') {
          setLoginLoading(false);
          throw lastError;
        }
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    setLoginLoading(false);
    throw new Error(
      lastError?.message?.includes('Server error')
        ? 'Server is starting up, please try again in a few seconds'
        : 'Unable to connect to server. Please check your internet connection and try again.'
    );
  }, []);

  const logout = useCallback(() => {
    clearStoredAuth();
    setState({
      user: null,
      organization: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshToken = useCallback(async () => {
    if (!state.token) return;

    try {
      const response = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        // Token is explicitly invalid — log out
        logout();
        return;
      }

      if (!response.ok) {
        // Server error — don't log out, token might still be valid
        return;
      }

      const data = await response.json();
      setStoredAuth(data.token, state.user, state.organization);
      setState((prev) => ({ ...prev, token: data.token }));
    } catch {
      // Network error — don't log out the user
      // Token might still be valid, backend is just temporarily unreachable
    }
  }, [state.token, state.user, state.organization, logout]);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        refreshToken,
        loginLoading,
        isDemoMode,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for making authenticated API calls
export function useAuthenticatedFetch() {
  const { token, logout } = useAuth();

  return useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers);
      
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      if (!headers.has('Content-Type') && options.body) {
        headers.set('Content-Type', 'application/json');
      }

      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        logout();
        throw new Error('Session expired');
      }

      return response;
    },
    [token, logout]
  );
}
