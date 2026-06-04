import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

const { mockCreateCheckoutSession } = vi.hoisted(() => ({
  mockCreateCheckoutSession: vi.fn(),
}))

vi.mock('@/lib/stripe', () => ({
  getStripe: vi.fn(() => ({
    checkout: {
      sessions: {
        create: mockCreateCheckoutSession,
      },
    },
  })),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

function createMockRequest(body: any, headers?: Record<string, string>) {
  return new Request('http://localhost:3000/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  })
}

function mockDesignSelect(userId: string) {
  return vi.fn(() => ({
    eq: vi.fn(() => ({
      single: vi.fn(() =>
        Promise.resolve({ data: { user_id: userId }, error: null })
      ),
    })),
  }))
}

describe('POST /api/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('crea Stripe Checkout Session con datos válidos', async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'designs') {
          return { select: mockDesignSelect('user-123') }
        }
        return {}
      }),
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const mockSession = { url: 'https://checkout.stripe.com/session/test' }
    ;(mockCreateCheckoutSession as any).mockResolvedValue(mockSession)

    const request = createMockRequest({
      design_id: 'design-456',
      product_type: 't-shirt',
      variant_id: 'variant-789',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.url).toBe('https://checkout.stripe.com/session/test')
    expect(mockCreateCheckoutSession).toHaveBeenCalledOnce()

    const callArgs = (mockCreateCheckoutSession as any).mock.calls[0][0]
    expect(callArgs.mode).toBe('payment')
    expect(callArgs.metadata.design_id).toBe('design-456')
    expect(callArgs.metadata.user_id).toBe('user-123')
    expect(callArgs.metadata.product_type).toBe('t-shirt')
    expect(callArgs.line_items[0].price_data.currency).toBe('usd')
    expect(callArgs.shipping_address_collection.allowed_countries).toContain('US')
  })

  it('retorna 400 si faltan campos requeridos', async () => {
    const request = createMockRequest({
      design_id: 'design-456',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Faltan campos requeridos')
    expect(mockCreateCheckoutSession).not.toHaveBeenCalled()
  })

  it('retorna 400 si product_type no existe', async () => {
    const request = createMockRequest({
      design_id: 'design-456',
      product_type: 'nonexistent-product',
      variant_id: 'variant-789',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Producto no encontrado')
    expect(mockCreateCheckoutSession).not.toHaveBeenCalled()
  })

  it('retorna 500 si Stripe arroja error', async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'designs') {
          return { select: mockDesignSelect('user-123') }
        }
        return {}
      }),
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    ;(mockCreateCheckoutSession as any).mockRejectedValue(new Error('Stripe API Error'))

    const request = createMockRequest({
      design_id: 'design-456',
      product_type: 't-shirt',
      variant_id: 'variant-789',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Stripe API Error')
  })

  it('usa NEXT_PUBLIC_SITE_URL para success/cancel URLs', async () => {
    const originalEnv = process.env.NEXT_PUBLIC_SITE_URL
    process.env.NEXT_PUBLIC_SITE_URL = 'https://pod-ia.example.com'

    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'designs') {
          return { select: mockDesignSelect('user-123') }
        }
        return {}
      }),
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const mockSession = { url: 'https://checkout.stripe.com/session/test' }
    ;(mockCreateCheckoutSession as any).mockResolvedValue(mockSession)

    const request = createMockRequest({
      design_id: 'design-456',
      product_type: 't-shirt',
      variant_id: 'variant-789',
    })

    await POST(request)

    const callArgs = (mockCreateCheckoutSession as any).mock.calls[0][0]
    expect(callArgs.success_url).toBe('https://pod-ia.example.com/ordenes?success=true')
    expect(callArgs.cancel_url).toBe('https://pod-ia.example.com/generar')

    process.env.NEXT_PUBLIC_SITE_URL = originalEnv
  })

  it('asigna un user_id de guest cuando el diseño no tiene user_id', async () => {
    const mockSupabase = {
      from: vi.fn((table: string) => {
        if (table === 'designs') {
          return { select: mockDesignSelect(null) }
        }
        return {}
      }),
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const mockSession = { url: 'https://checkout.stripe.com/session/test' }
    ;(mockCreateCheckoutSession as any).mockResolvedValue(mockSession)

    const request = createMockRequest({
      design_id: 'design-456',
      product_type: 't-shirt',
      variant_id: 'variant-789',
    })

    await POST(request)

    const callArgs = (mockCreateCheckoutSession as any).mock.calls[0][0]
    expect(callArgs.metadata.user_id).toBeTruthy()
  })
})
