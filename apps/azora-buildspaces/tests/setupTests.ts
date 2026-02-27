import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Provide a lightweight virtual mock for Prisma runtime Decimal used in tests
// Some modules import Decimal from '@prisma/client/runtime/library'. If the
// generated Prisma runtime is not resolvable in the test environment, this
// virtual mock supplies a minimal Decimal implementation so unit tests can run.
// @ts-ignore
jest.mock('@prisma/client/runtime/library', () => {
	class Decimal {
		value: any
		constructor(v?: any) { this.value = v }
		toNumber() { return Number(this.value) }
		toString() { return String(this.value) }
	}
	return { Decimal }
}, { virtual: true })

// Mock canvas to prevent jsdom loading issues
// @ts-ignore
jest.mock('canvas', () => ({}), { virtual: true })

// Polyfill explicit globals if missing (Node 22 usually has it, but Jest environment might vary)
if (typeof global.structuredClone === 'undefined') {
  global.structuredClone = (val: any) => JSON.parse(JSON.stringify(val));
}