import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

const mockCreateSession = vi.fn()

// Mock external services before importing route
vi.mock('@/lib/stripe', () => ({
  getStripe: vi.fn(() => ({
    checkout: {
      sessions: {
        create: mockCreateSession,
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

describe('POST /api/checkout', () => {
  const mockUser = { id: 'user-123', email: 'user@example.com' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('crea Stripe Checkout Session con datos válidos', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
      },
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const mockSession = { url: 'https://checkout.stripe.com/session/test' }
    ;(mockCreateSession as any).mockResolvedValue(mockSession)

    const request = createMockRequest({
      design_id: 'design-456',
      product_type: 't-shirt',
      variant_id: 'variant-789',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.url).toBe('https://checkout.stripe.com/session/test')
    expect(mockCreateSession).toHaveBeenCalledOnce()

    const callArgs = (mockCreateSession as any).mock.calls[0][0]
    expect(callArgs.mode).toBe('payment')
    expect(callArgs.metadata.design_id).toBe('design-456')
    expect(callArgs.metadata.user_id).toBe('user-123')
    expect(callArgs.metadata.product_type).toBe('t-shirt')
    expect(callArgs.line_items[0].price_data.currency).toBe('usd')
    expect(callArgs.shipping_address_collection.allowed_countries).toContain('US')
  })

  it('retorna 401 si usuario no está autenticado', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
      },
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const request = createMockRequest({
      design_id: 'design-456',
      product_type: 't-shirt',
      variant_id: 'variant-789',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('No autorizado')
    expect(mockCreateSession).not.toHaveBeenCalled()
  })

  it('retorna 400 si faltan campos requeridos', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
      },
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const request = createMockRequest({
      design_id: 'design-456',
      // falta product_type y variant_id
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('Faltan campos requeridos')
    expect(mockCreateSession).not.toHaveBeenCalled()
  })

  it('retorna 400 si product_type no existe', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
      },
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const request = createMockRequest({
      design_id: 'design-456',
      product_type: 'nonexistent-product',
      variant_id: 'variant-789',
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Producto no encontrado')
    expect(mockCreateSession).not.toHaveBeenCalled()
  })

  it('retorna 500 si Stripe arroja error', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
      },
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    ;(mockCreateSession as any).mockRejectedValue(new Error('Stripe API Error'))

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
      auth: {
        getUser: vi.fn(() => Promise.resolve({ data: { user: mockUser }, error: null })),
      },
    }
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const mockSession = { url: 'https://checkout.stripe.com/session/test' }
    ;(mockCreateSession as any).mockResolvedValue(mockSession)

    const request = createMockRequest({
      design_id: 'design-456',
      product_type: 't-shirt',
      variant_id: 'variant-789',
    })

    await POST(request)

    const callArgs = (mockCreateSession as any).mock.calls[0][0]
    expect(callArgs.success_url).toBe('https://pod-ia.example.com/ordenes?success=true')
    expect(callArgs.cancel_url).toBe('https://pod-ia.example.com/generar')

    process.env.NEXT_PUBLIC_SITE_URL = originalEnv
  })
})
