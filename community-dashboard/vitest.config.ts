// This is a simplified configuration file that doesn't require external testing libraries
// In a real application, you would use Vitest or Jest for testing

import { resolve } from 'path';

// Simple test runner configuration
export default {
  // Define test directories
  testDir: './src',
  // Test file pattern
  testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
  // Setup files
  setupFiles: ['./src/test/setup.ts'],
  // Path aliases
  alias: {
    '@': resolve(__dirname, './src'),
  },
  // Run tests in Node.js environment
  environment: 'node',
};