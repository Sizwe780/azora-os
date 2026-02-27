/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
See LICENSE file for details. 
*/ 
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Ensure Node test environment has Web Fetch API + OpenAI shims
import 'openai/shims/node'
try {
  // Try to load node-fetch if available to polyfill `fetch` in Node
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const nodeFetch = require('node-fetch')
  if (!globalThis.fetch) globalThis.fetch = nodeFetch
  if (!globalThis.Request && nodeFetch && nodeFetch.Request) globalThis.Request = nodeFetch.Request
} catch (e) {
  // node-fetch not installed — the openai shims may already provide fetch
}

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Set test environment variables
process.env.NEXT_PUBLIC_APP_NAME = 'Azora OS'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// --------------------------------------------------
// Polyfills needed by various browser-like libraries (indexedDB, structuredClone)
// See: 2026 standard test environment for Citadel
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { indexedDB, IDBKeyRange } = require('fake-indexeddb')
  global.indexedDB = indexedDB
  global.IDBKeyRange = IDBKeyRange
} catch (e) {
  // if fake-indexeddb isn't installed, tests needing indexedDB will fail
}

if (typeof global.structuredClone !== 'function') {
  global.structuredClone = (obj) => JSON.parse(JSON.stringify(obj))
}
