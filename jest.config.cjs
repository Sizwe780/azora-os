/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: [
    '**/azora-*/**/__tests__/**/*.test.ts',
    '**/azora-*/**/__tests__/**/*.spec.ts',
    '**/azora-*/**/?(*.)+(spec|test).ts',
    '**/azora-*/**/?(*.)+(spec|test).js',
    '**/organs/**/__tests__/**/*.test.ts',
    '**/organs/**/__tests__/**/*.spec.ts',
    '**/organs/**/?(*.)+(spec|test).ts',
    '**/organs/**/?(*.)+(spec|test).js'
  ],
  collectCoverageFrom: [
    'azora-*/**/*.js',
    'organs/**/*.js',
    '!azora-*/**/*.d.ts',
    '!organs/**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testTimeout: 10000,
  verbose: true
};