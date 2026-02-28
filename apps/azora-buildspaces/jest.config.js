/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests', '<rootDir>/app', '<rootDir>/lib'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@azora/components/(.*)$': '<rootDir>/../../packages/azora-ui/src/$1',
    '^@prisma/client$': '<rootDir>/tests/__mocks__/prisma-client.js',
    '^@prisma/client/runtime/library$': '<rootDir>/tests/__mocks__/prisma-runtime-library.js',
    '^next/server$': '<rootDir>/tests/__mocks__/next-server.js',
    '^next-auth$': '<rootDir>/tests/__mocks__/next-auth.js',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.ts'],
  // Ensure essential shims run before modules are imported
  setupFiles: ['<rootDir>/tests/setupEnv.ts'],
  // Some libraries (e.g. jose) ship ESM syntax; allow transforming them for Jest
  transformIgnorePatterns: ['node_modules/(?!(jose)/)'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    '!**/*.d.ts',
  ],
};