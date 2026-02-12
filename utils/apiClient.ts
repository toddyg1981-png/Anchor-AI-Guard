/**
 * Enhanced API Client with retry logic, caching, and error recovery
 */

import { logger } from './logger';
import { APIError, NetworkError } from './errorHandler';
import { env } from '../config/env';

const AUTH_TOKEN_KEY = 'anchor_auth_token';

// Safely pull the auth token from localStorage when running in the browser
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    logger.warn('Unable to read auth token from storage', { error });
    return null;
  }
}

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheDuration?: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class APIClient {
  private cache = new Map<string, CacheEntry<unknown>>();
  private pendingRequests = new Map<string, Promise<unknown>>();

  /**
   * Check if application is running in demo mode (no backend required)
   */
  private isDemoMode(): boolean {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem('anchor_demo_mode') === 'true';
    } catch {
      return false;
    }
  }

  /**
   * Make an API request with retry logic and caching
   */
  async request<T>(url: string, config: RequestConfig = {}): Promise<T> {
    // In demo mode, skip all network requests — components use local mock data
    if (this.isDemoMode()) {
      throw new NetworkError('Demo mode — no backend required');
    }

    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
      retries = 3,
      retryDelay = 1000,
      cache = method === 'GET',
      cacheDuration = env.cacheDuration * 1000,
    } = config;

    const cacheKey = this.getCacheKey(url, method, body);

    // Check cache for GET requests
    if (cache && method === 'GET') {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        logger.debug(`Cache hit for ${url}`);
        return cached;
      }
    }

    // Check for pending request (request deduplication)
    if (this.pendingRequests.has(cacheKey)) {
      logger.debug(`Reusing pending request for ${url}`);
      return this.pendingRequests.get(cacheKey) as Promise<T>;
    }

    // Make the request
    const requestPromise = this.executeRequest<T>(
      url,
      method,
      headers,
      body,
      timeout,
      retries,
      retryDelay
    );

    this.pendingRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;

      // Cache successful GET requests
      if (cache && method === 'GET') {
        this.setCache(cacheKey, result, cacheDuration);
      }

      return result;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  /**
   * Execute HTTP request with retry logic
   */
  private async executeRequest<T>(
    url: string,
    method: string,
    headers: Record<string, string>,
    body: unknown,
    timeout: number,
    retries: number,
    retryDelay: number
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        if (attempt > 0) {
          logger.debug(`Retry attempt ${attempt} for ${url}`);
          await this.sleep(retryDelay * Math.pow(2, attempt - 1)); // Exponential backoff
        }

        const endTimer = logger.time(`API Request: ${method} ${url}`);

        const baseHeaders: Record<string, string> = {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...headers,
        };

        const authToken = getAuthToken();
        if (authToken && !baseHeaders.Authorization && !baseHeaders.authorization) {
          baseHeaders.Authorization = `Bearer ${authToken}`;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          method,
          headers: baseHeaders,
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        endTimer();

        if (!response.ok) {
          throw new APIError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            { url, method }
          );
        }

        const data = await response.json();
        logger.debug(`API request successful: ${method} ${url}`);
        return data as T;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof Error && error.name === 'AbortError') {
          logger.warn(`Request timeout for ${url}`);
          lastError = new NetworkError('Request timeout', { url, method });
        }

        // Don't retry on client errors (4xx)
        if (error instanceof APIError && error.context?.statusCode) {
          const statusCode = error.context.statusCode as number;
          if (statusCode >= 400 && statusCode < 500) {
            logger.error(`Client error ${statusCode}, not retrying: ${url}`);
            throw error;
          }
        }

        // Last attempt failed
        if (attempt === retries) {
          logger.error(`All retry attempts failed for ${url}`, {
            error: lastError.message,
            attempts: retries + 1,
          });
          throw lastError;
        }
      }
    }

    throw lastError || new NetworkError('Request failed');
  }

  /**
   * GET request
   */
  async get<T>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(url: string, body: unknown, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(url, { ...config, method: 'POST', body, cache: false });
  }

  /**
   * PUT request
   */
  async put<T>(url: string, body: unknown, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PUT', body, cache: false });
  }

  /**
   * DELETE request
   */
  async delete<T>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE', cache: false });
  }

  /**
   * PATCH request
   */
  async patch<T>(url: string, body: unknown, config?: Omit<RequestConfig, 'method'>): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PATCH', body, cache: false });
  }

  /**
   * Generate cache key
   */
  private getCacheKey(url: string, method: string, body?: unknown): string {
    const bodyStr = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyStr}`;
  }

  /**
   * Get from cache
   */
  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set cache entry
   */
  private setCache<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('API cache cleared');
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache(): void {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      logger.info(`Cleared ${cleared} expired cache entries`);
    }
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Auto-clear expired cache every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    apiClient.clearExpiredCache();
  }, 5 * 60 * 1000);
}
