import { describe, it, expect } from 'vitest';
import {
  AppError,
  NetworkError,
  APIError,
  ValidationError,
  ErrorSeverity,
  errorHandler,
} from '../utils/errorHandler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('creates an app error with correct properties', () => {
      const error = new AppError('Test error', 'TEST_ERROR', ErrorSeverity.HIGH, {
        foo: 'bar',
      });

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.context).toEqual({ foo: 'bar' });
      expect(error.timestamp).toBeDefined();
    });

    it('converts to JSON correctly', () => {
      const error = new AppError('Test error', 'TEST_ERROR', ErrorSeverity.LOW);
      const json = error.toJSON();

      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('code');
      expect(json).toHaveProperty('severity');
      expect(json).toHaveProperty('timestamp');
    });
  });

  describe('Specific Error Types', () => {
    it('creates NetworkError', () => {
      const error = new NetworkError('Connection failed');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('creates APIError with status code', () => {
      const error = new APIError('API failed', 404);
      expect(error.code).toBe('API_ERROR');
      expect(error.context).toHaveProperty('statusCode', 404);
    });

    it('creates ValidationError', () => {
      const error = new ValidationError('Invalid input');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('Error Handler', () => {
    it('handles errors without throwing', () => {
      expect(() => {
        errorHandler.handle(new Error('Test error'));
      }).not.toThrow();
    });

    it('provides user-friendly messages', () => {
      const fetchError = new Error('fetch failed');
      const message = errorHandler.getUserMessage(fetchError);
      expect(message).toContain('connect to the server');
    });

    it('normalizes standard errors', () => {
      const standardError = new Error('Standard error');
      expect(() => {
        errorHandler.handle(standardError);
      }).not.toThrow();
    });
  });
});
