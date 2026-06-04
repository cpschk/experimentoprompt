'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ProductSelector } from '@/components/products/ProductSelector'
import { DesignPreview } from '@/components/design/DesignPreview'
import { Button } from '@/components/ui/Button'
import type { ProductType } from '@/lib/pricing'

function PaymentConfirmer({
  sessionId,
  onDone,
  onError,
}: {
  sessionId: string
  onDone: (design: { id: string; image_url: string }) => void
  onError: (msg: string) => void
}) {
  const called = useRef(false)

  useEffect(() => {
    if (called.current) return
    called.current = true

    fetch('/api/checkout-design/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.data?.design) {
          onDone(json.data.design)
        } else {
          onError(json.error || 'Error al confirmar el diseño')
        }
      })
      .catch(() => onError('Error al confirmar el pago'))
  }, [sessionId, onDone, onError])

  return (
    <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-600">
      Pago confirmado. Generando tu diseño...
    </p>
  )
}

export default function GenerarPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [product, setProduct] = useState<ProductType | null>(null)
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [designId, setDesignId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ensureSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        await supabase.auth.signInAnonymously()
      }
    }
    ensureSession()
  }, [])

  const sessionId = searchParams.get('session_id')
  const needsConfirmation = searchParams.get('success') === 'true' && !!sessionId && !imageUrl

  const handleConfirmDone = useCallback(
    (design: { id: string; image_url: string }) => {
      setImageUrl(design.image_url)
      setDesignId(design.id)
      router.replace('/generar')
    },
    [router]
  )

  const handleConfirmError = useCallback(
    (msg: string) => {
      setError(msg)
      router.replace('/generar')
    },
    [router]
  )

  const handleGenerate = async () => {
    if (!product || !prompt.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), product_type: product }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Error al iniciar pago')
      }

      window.location.href = json.data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar el pago')
      setLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!designId || !product) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          design_id: designId,
          product_type: product,
          variant_id: 'default',
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json.error || 'Error al crear checkout')
      }

      window.location.href = json.data.url
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar compra')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Generar diseño</h2>
        <p className="mt-1 text-sm text-gray-500">
          Elige un producto, describe tu idea y la IA creará un diseño único.
        </p>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">1. Elige tu producto</h3>
        <ProductSelector selected={product} onSelect={setProduct} />
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-gray-700">
          2. Describe tu idea
          {product && (
            <span className="ml-2 font-normal text-gray-400">
              para {PRODUCT_LABELS[product]}
            </span>
          )}
        </h3>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ej: Un sol con gafas de sol en estilo minimalista, colores cálidos, centrado..."
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 p-4 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        <p className="mt-1 text-xs text-gray-400">
          Sé descriptivo: estilo, colores, elementos, posición.
        </p>
      </section>

      <section className="grid gap-8 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-gray-700">3. Vista previa</h3>
          <DesignPreview imageUrl={imageUrl} loading={loading} />

          {error && (
            <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {needsConfirmation && sessionId && (
            <PaymentConfirmer
              sessionId={sessionId}
              onDone={handleConfirmDone}
              onError={handleConfirmError}
            />
          )}
        </div>

        <div className="flex flex-col justify-end space-y-4">
          <Button
            onClick={handleGenerate}
            loading={loading}
            disabled={!product || !prompt.trim() || loading || needsConfirmation}
            className="w-full"
          >
            {loading ? 'Redirigiendo a pago...' : 'Generar diseño — $0.99'}
          </Button>

          {imageUrl && !loading && designId && (
            <Button
              onClick={handleBuy}
              loading={loading}
              variant="secondary"
              className="w-full"
            >
              Comprar este diseño
            </Button>
          )}

          <p className="text-center text-xs text-gray-400">
            $0.99 por generar. Si compras el producto, se descuenta del total.
          </p>
        </div>
      </section>
    </div>
  )
}

const PRODUCT_LABELS: Record<ProductType, string> = {
  't-shirt': 'camiseta',
  hoodie: 'hoodie',
  mug: 'taza',
  'phone-case': 'funda',
  poster: 'póster',
}
