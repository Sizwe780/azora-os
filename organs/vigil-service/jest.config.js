/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/../../jest.setup.js'],
  extensionsToTreatAsEsm: [],
  globals: {},
  transform: {},
  transformIgnorePatterns: [
    'node_modules/(?!(@azure|cloudevents)/)'
  ]
};