module.exports = {
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@packages/(.*)$': '<rootDir>/packages/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
  },
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  },
  collectCoverageFrom: [
    'services/**/*.{js,ts}',
    'packages/**/*.{js,ts}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/tests/**',
    '!**/dist/**',
    '!**/.next/**',
    '!**/build/**',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  testMatch: [
    '**/tests/**/*.test.{js,ts}',
    '**/services/**/tests/**/*.test.{js,ts}',
    '**/__tests__/**/*.test.{js,ts}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/build/',
    '/.next/',
    '/.archive/',
    '<rootDir>/.archive/',
  ],
  modulePathIgnorePatterns: [
    '<rootDir>/.archive/',
    '<rootDir>/dist/',
    '<rootDir>/build/',
  ],
  testTimeout: 30000,
  verbose: true,
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: '<rootDir>/tests/coverage',
  // Optimized parallelization settings
  maxWorkers: process.env.CI ? 4 : '75%',
  // Cache test results for faster subsequent runs
  cache: true,
  cacheDirectory: '<rootDir>/.jest-cache',
  // Bail after first failure in CI to save time
  bail: process.env.CI ? 1 : 0,
  // Force exit after tests complete
  forceExit: false
};