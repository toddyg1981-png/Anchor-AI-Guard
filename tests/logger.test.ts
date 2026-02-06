import { describe, it, expect, beforeEach } from 'vitest';
import { logger, LogLevel } from '../utils/logger';

describe('Logger', () => {
  beforeEach(() => {
    logger.clearLogs();
    logger.setLogLevel(LogLevel.INFO);
  });

  it('logs debug messages', () => {
    logger.setLogLevel(LogLevel.DEBUG);
    logger.debug('Debug message', { foo: 'bar' });
    
    const logs = logger.getRecentLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[logs.length - 1].message).toBe('Debug message');
  });

  it('logs info messages', () => {
    logger.info('Info message');
    
    const logs = logger.getRecentLogs();
    expect(logs.some((log) => log.message === 'Info message')).toBe(true);
  });

  it('logs warning messages', () => {
    logger.warn('Warning message');
    
    const logs = logger.getRecentLogs();
    expect(logs.some((log) => log.level === LogLevel.WARN)).toBe(true);
  });

  it('logs error messages', () => {
    logger.error('Error message');
    
    const logs = logger.getRecentLogs();
    expect(logs.some((log) => log.level === LogLevel.ERROR)).toBe(true);
  });

  it('filters logs by level', () => {
    logger.setLogLevel(LogLevel.WARN);
    logger.debug('Debug');
    logger.info('Info');
    logger.warn('Warning');
    
    const logs = logger.getRecentLogs();
    expect(logs.some((log) => log.message === 'Debug')).toBe(false);
    expect(logs.some((log) => log.message === 'Info')).toBe(false);
    expect(logs.some((log) => log.message === 'Warning')).toBe(true);
  });

  it('measures performance timing', () => {
    const endTimer = logger.time('test operation');
    endTimer();
    
    const logs = logger.getRecentLogs();
    expect(logs.some((log) => log.message.includes('test operation'))).toBe(true);
  });

  it('exports logs as JSON', () => {
    logger.info('Test log');
    const exported = logger.exportLogs();
    
    expect(() => JSON.parse(exported)).not.toThrow();
    const parsed = JSON.parse(exported);
    expect(Array.isArray(parsed)).toBe(true);
  });

  it('clears logs', () => {
    logger.info('Test');
    logger.clearLogs();
    
    const logs = logger.getRecentLogs();
    expect(logs.length).toBe(0);
  });
});
