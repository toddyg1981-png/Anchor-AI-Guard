/**
 * Environment Configuration Manager
 * Validates and provides type-safe access to environment variables
 */

interface EnvironmentConfig {
  // Application Settings
  appEnv: 'development' | 'staging' | 'production';
  appName: string;
  apiBaseUrl: string;

  // Feature Flags
  enableAIAnalysis: boolean;
  enableSecurityHooks: boolean;
  useMockData: boolean;

  // Security Settings
  rateLimitRpm: number;
  sessionTimeout: number;
  enableCSP: boolean;

  // Monitoring
  sentryDsn?: string;
  gaId?: string;
  logRocketId?: string;

  // Performance
  enableServiceWorker: boolean;
  cacheDuration: number;

  // Development
  debugMode: boolean;
  enableDevTools: boolean;
}

/**
 * Parse boolean from environment variable
 */
function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Parse number from environment variable
 */
function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Validate required environment variables
 */
function validateEnvironment(): void {
  const errors: string[] = [];

  // In production, certain variables are required
  if (import.meta.env.VITE_APP_ENV === 'production') {
    // Note: GEMINI_API_KEY is handled by the backend for security reasons
    // Frontend should not have direct access to API keys
    if (import.meta.env.VITE_USE_MOCK_DATA === 'true') {
      errors.push('VITE_USE_MOCK_DATA must be false in production');
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`
    );
  }
}

/**
 * Load and validate environment configuration
 */
export function loadEnvironmentConfig(): EnvironmentConfig {
  // Validate environment first
  if (import.meta.env.PROD) {
    validateEnvironment();
  }

  const config: EnvironmentConfig = {
    // Application Settings
    appEnv: (import.meta.env.VITE_APP_ENV || 'development') as EnvironmentConfig['appEnv'],
    appName: import.meta.env.VITE_APP_NAME || 'Anchor Security Dashboard',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',

    // Feature Flags
    enableAIAnalysis: parseBoolean(import.meta.env.VITE_ENABLE_AI_ANALYSIS, true),
    enableSecurityHooks: parseBoolean(import.meta.env.VITE_ENABLE_SECURITY_HOOKS, true),
    // Default to live data; enable mocks explicitly via VITE_USE_MOCK_DATA=true
    useMockData: parseBoolean(import.meta.env.VITE_USE_MOCK_DATA, false),

    // Security Settings
    rateLimitRpm: parseNumber(import.meta.env.VITE_RATE_LIMIT_RPM, 60),
    sessionTimeout: parseNumber(import.meta.env.VITE_SESSION_TIMEOUT, 30),
    enableCSP: parseBoolean(import.meta.env.VITE_ENABLE_CSP, true),

    // Monitoring
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    gaId: import.meta.env.VITE_GA_ID,
    logRocketId: import.meta.env.VITE_LOGROCKET_ID,

    // Performance
    enableServiceWorker: parseBoolean(import.meta.env.VITE_ENABLE_SERVICE_WORKER, false),
    cacheDuration: parseNumber(import.meta.env.VITE_CACHE_DURATION, 3600),

    // Development
    debugMode: parseBoolean(import.meta.env.VITE_DEBUG_MODE, false),
    enableDevTools: parseBoolean(import.meta.env.VITE_ENABLE_DEVTOOLS, true),
  };

  // Log configuration in development
  if (config.debugMode && config.appEnv === 'development') {
    console.log('🔧 Environment Configuration:', config);
  }

  return config;
}

// Export singleton instance
export const env = loadEnvironmentConfig();

// Export helper functions
export function isDevelopment(): boolean {
  return env.appEnv === 'development';
}

export function isProduction(): boolean {
  return env.appEnv === 'production';
}

export function isStaging(): boolean {
  return env.appEnv === 'staging';
}
