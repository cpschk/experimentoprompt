import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

vi.mock('@/lib/ai', () => ({
  generateImage: vi.fn(),
}))

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { generateImage } from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'

function createMockRequest(body: any) {
  return new Request('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/generate', () => {
  const mockUser = { id: 'user-123' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function createMockSupabase(overrides?: any) {
    const mockUpload = vi.fn(() => Promise.resolve({ error: null }))
    const mockPublicUrl = vi.fn(() => ({ data: { publicUrl: 'https://mock.design.png' } }))
    const mockInsert = vi.fn(() => Promise.resolve({ error: null }))

    return {
      auth: {
        getUser: vi.fn(() =>
          Promise.resolve({
            data: { user: overrides?.user !== undefined ? overrides.user : mockUser },
            error: null,
          })
        ),
      },
      storage: {
        from: vi.fn(() => ({
          upload: mockUpload,
          getPublicUrl: mockPublicUrl,
        })),
      },
      from: vi.fn(() => ({
        insert: mockInsert,
      })),
      _upload: mockUpload,
      _publicUrl: mockPublicUrl,
      _insert: mockInsert,
    }
  }

  it('genera imagen y guarda diseño con datos válidos', async () => {
    const mockSupabase = createMockSupabase()
    ;(createClient as any).mockResolvedValue(mockSupabase)

    ;(generateImage as any).mockResolvedValue({
      imageUrl: 'https://openai.com/image.png',
      revisedPrompt: 'A beautiful design',
    })

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

    const request = createMockRequest({ prompt: 'Un gato astronauta', product_type: 't-shirt' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.data.imageUrl).toBe('https://mock.design.png')
    expect(data.data.revisedPrompt).toBe('A beautiful design')
    expect(generateImage).toHaveBeenCalledWith({ prompt: 'Un gato astronauta', productType: 't-shirt' })

    globalThis.fetch = originalFetch
  })

  it('retorna 400 si prompt tiene menos de 3 caracteres', async () => {
    const request = createMockRequest({ prompt: 'ab', product_type: 't-shirt' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('El prompt debe tener al menos 3 caracteres')
    expect(generateImage).not.toHaveBeenCalled()
  })

  it('retorna 400 si prompt es solo espacios', async () => {
    const request = createMockRequest({ prompt: '   ', product_type: 't-shirt' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('El prompt debe tener al menos 3 caracteres')
  })

  it('retorna 400 si falta product_type', async () => {
    const request = createMockRequest({ prompt: 'Un gato astronauta' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Debes especificar un tipo de producto')
  })

  it('retorna 401 si usuario no está autenticado', async () => {
    const mockSupabase = createMockSupabase({ user: null })
    ;(createClient as any).mockResolvedValue(mockSupabase)

    const request = createMockRequest({ prompt: 'Un gato astronauta', product_type: 't-shirt' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('No autorizado')
    expect(generateImage).not.toHaveBeenCalled()
  })

  it('retorna 500 si OPENAI_API_KEY no está configurada', async () => {
    const mockSupabase = createMockSupabase()
    ;(createClient as any).mockResolvedValue(mockSupabase)

    ;(generateImage as any).mockRejectedValue(new Error('OPENAI_API_KEY no configurada'))

    const request = createMockRequest({ prompt: 'Un gato astronauta', product_type: 't-shirt' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('La API de IA no está configurada. Contacta al administrador.')
  })

  it('retorna 429 si se alcanza el rate limit', async () => {
    const mockSupabase = createMockSupabase()
    ;(createClient as any).mockResolvedValue(mockSupabase)

    ;(generateImage as any).mockRejectedValue(new Error('Rate limit exceeded: 429'))

    const request = createMockRequest({ prompt: 'Un gato astronauta', product_type: 't-shirt' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('Demasiadas solicitudes. Espera un momento e intenta de nuevo.')
  })

  it('retorna 400 si el prompt viola políticas de contenido', async () => {
    const mockSupabase = createMockSupabase()
    ;(createClient as any).mockResolvedValue(mockSupabase)

    ;(generateImage as any).mockRejectedValue(new Error('content_policy violation'))

    const request = createMockRequest({ prompt: 'Contenido prohibido', product_type: 't-shirt' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toContain('políticas de contenido')
  })

  it('retorna 500 si no se puede descargar la imagen generada', async () => {
    const mockSupabase = createMockSupabase()
    ;(createClient as any).mockResolvedValue(mockSupabase)

    ;(generateImage as any).mockResolvedValue({
      imageUrl: 'https://broken.url/image.png',
      revisedPrompt: 'Test',
    })

    const originalFetch = globalThis.fetch
    globalThis.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    ) as any

    const request = createMockRequest({ prompt: 'Un gato astronauta', product_type: 't-shirt' })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toContain('Error al generar')

    globalThis.fetch = originalFetch
  })

  it('trimmea el prompt antes de procesar', async () => {
    const mockSupabase = createMockSupabase()
    ;(createClient as any).mockResolvedValue(mockSupabase)

    ;(generateImage as any).mockResolvedValue({
      imageUrl: 'https://openai.com/image.png',
      revisedPrompt: 'Test',
    })

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

    const request = createMockRequest({ prompt: '  Un gato astronauta  ', product_type: 't-shirt' })
    await POST(request)

    expect(generateImage).toHaveBeenCalledWith({
      prompt: 'Un gato astronauta',
      productType: 't-shirt',
    })

    globalThis.fetch = originalFetch
  })
})
