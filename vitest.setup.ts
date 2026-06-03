import { vi } from 'vitest'

// Mock next/headers cookies globally for all API route tests
vi.mock('next/headers', () => ({
  cookies: vi.fn(() =>
    Promise.resolve({
      getAll: vi.fn(() => []),
      set: vi.fn(),
      get: vi.fn(),
    })
  ),
}))

// Suppress console errors during tests unless explicitly testing error paths
const originalConsoleError = console.error
beforeAll(() => {
  console.error = (...args: any[]) => {
    // Only log if it's not a test-related error we expect
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Test') || args[0].includes('mock'))
    ) {
      originalConsoleError.apply(console, args)
    }
  }
})

afterAll(() => {
  console.error = originalConsoleError
})
