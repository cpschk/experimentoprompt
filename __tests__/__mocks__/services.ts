import { vi } from 'vitest'

export function createMockStripe() {
  return {
    checkout: {
      sessions: {
        create: vi.fn(),
      },
    },
    webhooks: {
      constructEvent: vi.fn(),
    },
  }
}

export function createMockSupabaseClient(overrides?: any) {
  const mockStorage = {
    upload: vi.fn(() => Promise.resolve({ error: null })),
    getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://mock.supabase.co/designs/test.png' } })),
  }

  const mockFrom = {
    insert: vi.fn(() => Promise.resolve({ error: null })),
    update: vi.fn(() => Promise.resolve({ error: null })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ data: null, error: null })),
      })),
    })),
    eq: vi.fn(() => Promise.resolve({ error: null })),
  }

  return {
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: {
            user: overrides?.user || { id: 'test-user-id', email: 'test@example.com' },
          },
          error: null,
        })
      ),
    },
    storage: {
      from: vi.fn(() => mockStorage),
    },
    from: vi.fn(() => mockFrom),
  }
}

export function createMockOpenAI() {
  return {
    images: {
      generate: vi.fn(() =>
        Promise.resolve({
          data: [
            {
              url: 'https://mock.openai.com/image.png',
              revised_prompt: 'Mock revised prompt',
            },
          ],
        })
      ),
    },
  }
}

export function createMockFetch(responseOverrides?: any) {
  return vi.fn(() =>
    Promise.resolve({
      ok: true,
      blob: vi.fn(() =>
        Promise.resolve({
          arrayBuffer: vi.fn(() =>
            Promise.resolve(new ArrayBuffer(8))
          ),
        })
      ),
      ...responseOverrides,
    })
  )
}
