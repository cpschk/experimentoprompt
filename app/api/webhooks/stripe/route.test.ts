import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

const mockConstructEvent = vi.fn()

vi.mock('@/lib/stripe', () => ({
  getStripe: vi.fn(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/ai', () => ({
  generateImage: vi.fn(),
}))

vi.mock('@/lib/email', () => ({
  sendDesignReady: vi.fn(),
  sendOrderReceived: vi.fn(),
}))

import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/ai'
import { sendDesignReady, sendOrderReceived } from '@/lib/email'

function createWebhookRequest(body: any, signature?: string) {
  const request = new Request('http://localhost:3000/api/webhooks/stripe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(signature ? { 'stripe-signature': signature } : {}),
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  return request
}

describe('POST /api/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('retorna 400 si falta firma Stripe', async () => {
    const request = createWebhookRequest({})
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Falta firma Stripe')
  })

  it('retorna 500 si STRIPE_WEBHOOK_SECRET no está configurado', async () => {
    const originalSecret = process.env.STRIPE_WEBHOOK_SECRET
    delete process.env.STRIPE_WEBHOOK_SECRET

    const request = createWebhookRequest({}, 'sig-123')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('STRIPE_WEBHOOK_SECRET no configurado')

    process.env.STRIPE_WEBHOOK_SECRET = originalSecret
  })

  it('retorna 400 si la firma es inválida', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

    ;(mockConstructEvent as any).mockImplementation(() => {
      throw new Error('Firma inválida')
    })

    const request = createWebhookRequest({}, 'invalid-sig')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Firma inválida')
  })

  it('procesa checkout.session.completed para diseño (design payment)', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    process.env.RESEND_API_KEY = 'resend_test'
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_123',
          metadata: {
            prompt: 'Un gato astronauta',
            product_type: 't-shirt',
            user_id: 'user-123',
          },
          payment_status: 'paid',
          customer_details: { email: 'user@example.com' },
        },
      },
    }

    ;(mockConstructEvent as any).mockReturnValue(mockEvent)

    const mockUpload = vi.fn(() => Promise.resolve({ error: null }))
    const mockPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://mock.design.png' } }))
    const mockInsert = vi.fn(() => Promise.resolve({ error: null }))

    const mockSupabase = {
      storage: {
        from: vi.fn(() => ({
          upload: mockUpload,
          getPublicUrl: mockPublicUrl,
        })),
      },
      from: vi.fn(() => ({
        insert: mockInsert,
      })),
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    ;(generateImage as any).mockResolvedValue({
      imageUrl: 'https://openai.com/image.png',
      revisedPrompt: 'A cat astronaut in space',
    })

    // Mock global fetch for image download
    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        blob: vi.fn(() =>
          Promise.resolve({
            arrayBuffer: vi.fn(() => Promise.resolve(new ArrayBuffer(8))),
          })
        ),
      })
    ) as any

    const request = createWebhookRequest('body-string', 'valid-sig')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(generateImage).toHaveBeenCalledWith({ prompt: 'Un gato astronauta', productType: 't-shirt' })
    expect(mockUpload).toHaveBeenCalled()
    expect(mockInsert).toHaveBeenCalled()
    expect(sendDesignReady).toHaveBeenCalled()

    globalThis.fetch = originalFetch
  })

  it('procesa checkout.session.completed para producto (product payment)', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
    process.env.RESEND_API_KEY = 'resend_test'
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_456',
          metadata: {
            design_id: 'design-789',
            user_id: 'user-123',
            product_type: 't-shirt',
            total_paid: '20.29',
          },
          payment_status: 'paid',
          customer_details: { email: 'user@example.com' },
          shipping: {
            address: {
              line1: '123 Main St',
              line2: null,
              city: 'Ciudad',
              state: 'Estado',
              postal_code: '12345',
              country: 'MX',
            },
            name: 'Juan Pérez',
          },
        },
      },
    }

    ;(mockConstructEvent as any).mockReturnValue(mockEvent)

    const mockInsert = vi.fn(() => Promise.resolve({ error: null }))
    const mockUpdate = vi.fn(() => Promise.resolve({ error: null }))
    const mockSelectEqSingle = vi.fn(() =>
      Promise.resolve({ data: { image_url: 'https://design.png', product_type: 't-shirt' }, error: null })
    )
    const mockSelectEqSingleOrder = vi.fn(() =>
      Promise.resolve({ data: { id: 'order-001' }, error: null })
    )

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'orders') {
          return {
            insert: mockInsert,
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: mockSelectEqSingleOrder,
              })),
            })),
          }
        }
        if (table === 'designs') {
          return {
            update: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ error: null })),
            })),
            select: vi.fn(() => ({
              eq: vi.fn(() => ({
                single: mockSelectEqSingle,
              })),
            })),
          }
        }
        return { insert: vi.fn() }
      }),
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const request = createWebhookRequest('body-string', 'valid-sig')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      design_id: 'design-789',
      user_id: 'user-123',
      stripe_session_id: 'cs_test_456',
      status: 'pending',
    }))
    expect(sendOrderReceived).toHaveBeenCalled()
  })

  it('ignora eventos que no son checkout.session.completed', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

    const mockEvent = {
      type: 'invoice.payment_failed',
      data: { object: {} },
    }

    ;(mockConstructEvent as any).mockReturnValue(mockEvent)

    const request = createWebhookRequest('body-string', 'valid-sig')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(generateImage).not.toHaveBeenCalled()
  })

  it('no genera diseño si payment_status no es paid', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'

    const mockEvent = {
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: { prompt: 'test', product_type: 't-shirt', user_id: 'user-123' },
          payment_status: 'unpaid',
        },
      },
    }

    ;(mockConstructEvent as any).mockReturnValue(mockEvent)

    const request = createWebhookRequest('body-string', 'valid-sig')
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.received).toBe(true)
    expect(generateImage).not.toHaveBeenCalled()
  })
})
