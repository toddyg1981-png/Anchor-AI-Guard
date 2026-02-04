import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock environment variables for tests
process.env.GEMINI_API_KEY = 'test-api-key';
process.env.VITE_APP_ENV = 'test';
