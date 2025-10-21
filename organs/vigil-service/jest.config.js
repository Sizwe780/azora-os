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