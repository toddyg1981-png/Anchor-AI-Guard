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
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'anchor_auth_token';
const USER_KEY = 'anchor_auth_user';
const ORG_KEY = 'anchor_auth_org';

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
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const { token, user, organization } = getStoredAuth();
    return {
      user,
      organization,
      token,
      isAuthenticated: !!token && !!user,
      isLoading: !!token, // Will verify token on mount
    };
  });

  // Ref to abort verifyToken if login() is called while verify is in-flight
  const verifyAbortRef = useRef<AbortController | null>(null);

  // Verify token on mount
  useEffect(() => {
    if (state.token) {
      verifyToken();
    }
    return () => {
      // Abort any pending verify on unmount
      verifyAbortRef.current?.abort();
    };
  }, []);

  const verifyToken = async () => {
    const controller = new AbortController();
    verifyAbortRef.current = controller;

    try {
      const response = await fetch(`${env.apiBaseUrl}/auth/me`, {
        headers: {
          Authorization: `Bearer ${state.token}`,
        },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Token invalid');
      }

      const data = await response.json();

      // Bail out if login() was called while we were verifying
      if (controller.signal.aborted) return;

      setState((prev) => ({
        ...prev,
        user: data.user,
        organization: data.organization,
        isAuthenticated: true,
        isLoading: false,
      }));
      setStoredAuth(state.token, data.user, data.organization);
    } catch {
      // Bail out if aborted (e.g. login() was called)
      if (controller.signal.aborted) return;

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

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`${env.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();
      
      setStoredAuth(data.token, data.user, data.organization);
      setState({
        user: data.user,
        organization: data.organization,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, organizationName?: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch(`${env.apiBaseUrl}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, organizationName }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Signup failed');
      }

      const data = await response.json();
      
      setStoredAuth(data.token, data.user, data.organization);
      setState({
        user: data.user,
        organization: data.organization,
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
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

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      setStoredAuth(data.token, state.user, state.organization);
      setState((prev) => ({ ...prev, token: data.token }));
    } catch {
      logout();
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
