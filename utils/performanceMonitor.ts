/**
 * Performance Monitoring Service
 * Tracks and reports application performance metrics
 */

import { logger } from './logger';
import { env } from '../config/env';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeWebVitals();
      this.initializeNavigationTiming();
    }
  }

  /**
   * Track Core Web Vitals
   */
  private initializeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        this.recordMetric({
          name: 'LCP',
          value: entry.startTime,
          unit: 'ms',
          timestamp: Date.now(),
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const fidEntry = entry as PerformanceEventTiming;
        const fid = fidEntry.processingStart - fidEntry.startTime;
        this.recordMetric({
          name: 'FID',
          value: fid,
          unit: 'ms',
          timestamp: Date.now(),
        });
      }
    }).observe({ type: 'first-input', buffered: true });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        const layoutShift = entry as LayoutShift;
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value;
        }
      }
      this.recordMetric({
        name: 'CLS',
        value: clsValue,
        unit: 'count',
        timestamp: Date.now(),
      });
    }).observe({ type: 'layout-shift', buffered: true });
  }

  /**
   * Track navigation timing
   */
  private initializeNavigationTiming(): void {
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.recordMetric({
          name: 'DOM_Content_Loaded',
          value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          unit: 'ms',
          timestamp: Date.now(),
        });

        this.recordMetric({
          name: 'Load_Complete',
          value: navigation.loadEventEnd - navigation.loadEventStart,
          unit: 'ms',
          timestamp: Date.now(),
        });

        this.recordMetric({
          name: 'Total_Load_Time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: 'ms',
          timestamp: Date.now(),
        });
      }
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log in development
    if (env.debugMode) {
      logger.debug(`📊 Performance: ${metric.name} = ${metric.value}${metric.unit}`);
    }

    // Send to analytics
    this.sendToAnalytics(metric);
  }

  /**
   * Send metric to analytics services
   */
  private sendToAnalytics(metric: PerformanceMetric): void {
    // Google Analytics
    if (env.gaId && typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'performance_metric', {
        metric_name: metric.name,
        value: metric.value,
        metric_unit: metric.unit,
      });
    }

    // Custom analytics endpoint
    if (env.apiBaseUrl) {
      // Could send to your backend analytics endpoint
      logger.debug('Would send performance metric to backend', { metric });
    }
  }

  /**
   * Mark a custom timing
   */
  mark(name: string): void {
    if (typeof performance !== 'undefined') {
      performance.mark(name);
    }
  }

  /**
   * Measure between two marks
   */
  measure(name: string, startMark: string, endMark: string): number {
    if (typeof performance !== 'undefined') {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name, 'measure');
      
      if (entries.length > 0) {
        const duration = entries[0].duration;
        this.recordMetric({
          name,
          value: duration,
          unit: 'ms',
          timestamp: Date.now(),
        });
        return duration;
      }
    }
    return 0;
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics summary
   */
  getSummary(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};

    for (const metric of this.metrics) {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          avg: 0,
          min: Infinity,
          max: -Infinity,
          count: 0,
        };
      }

      const stat = summary[metric.name];
      stat.count++;
      stat.min = Math.min(stat.min, metric.value);
      stat.max = Math.max(stat.max, metric.value);
      stat.avg = (stat.avg * (stat.count - 1) + metric.value) / stat.count;
    }

    return summary;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * Get memory usage (if available)
   */
  getMemoryUsage(): Record<string, number> | null {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  }
}

// Export singleton
export const performanceMonitor = new PerformanceMonitor();

// Declare types for Web Vitals
interface PerformanceEventTiming extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}
