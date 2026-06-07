'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductSelector } from '@/components/products/ProductSelector'
import { DesignPreview } from '@/components/design/DesignPreview'
import { Button } from '@/components/ui/Button'
import type { ProductType } from '@/lib/pricing'

const STEPS = [
  { n: 1, label: 'Producto' },
  { n: 2, label: 'Idea' },
  { n: 3, label: 'Preview' },
]

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
    <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
      <svg className="h-5 w-5 flex-shrink-0 animate-spin text-blue-500" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>Pago confirmado. Generando tu diseño...</span>
    </div>
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
  const sessionId = searchParams.get('session_id')
  const needsConfirmation = searchParams.get('success') === 'true' && !!sessionId && !imageUrl
  const isGeneratingPreview = needsConfirmation

  const currentStep = imageUrl ? 3 : product && prompt.trim() ? 2 : product ? 2 : 1

  const handleConfirmDone = useCallback(
    (design: { id: string; image_url: string }) => {
      setImageUrl(design.image_url)
      setDesignId(design.id)
      setLoading(false)
      router.replace('/generar')
    },
    [router]
  )

  const handleConfirmError = useCallback(
    (msg: string) => {
      setError(msg)
      setLoading(false)
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
    <div className="mx-auto max-w-4xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Crear diseño</h1>
        <p className="mt-2 text-gray-500">
          Elegí un producto, describí tu idea y generá un diseño único.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 sm:gap-4">
        {STEPS.map((step, i) => (
          <div key={step.n} className="flex items-center gap-2 sm:gap-4 flex-1">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  currentStep >= step.n
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {currentStep > step.n ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.n
                )}
              </div>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  currentStep >= step.n ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px flex-1 transition-colors ${
                  currentStep > step.n ? 'bg-gray-900' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Product */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">1. Elegí tu producto</h2>
        <ProductSelector selected={product} onSelect={setProduct} />
      </section>

      {/* Step 2: Prompt */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">
          2. Describí tu idea
          {product && (
            <span className="ml-2 font-normal text-gray-400">
              para {PRODUCT_LABELS[product]}
            </span>
          )}
        </h2>
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Un sol con gafas en estilo minimalista, colores cálidos, centrado..."
            rows={4}
            className="w-full resize-none rounded-xl border border-gray-200 p-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
          />
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Sé descriptivo: estilo, colores, elementos, posición.
            </p>
            <span className="text-xs text-gray-300">{prompt.length} caracteres</span>
          </div>
        </div>
      </section>

      {/* Step 3: Preview + Actions */}
      <section className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">3. Vista previa</h2>
          <DesignPreview
            imageUrl={imageUrl}
            loading={loading || isGeneratingPreview}
            productType={product}
          />

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {needsConfirmation && sessionId && (
            <PaymentConfirmer
              sessionId={sessionId}
              onDone={handleConfirmDone}
              onError={handleConfirmError}
            />
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col justify-end space-y-4">
          <Button
            onClick={handleGenerate}
            loading={loading}
            disabled={!product || !prompt.trim() || loading || isGeneratingPreview}
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

          <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 space-y-2">
            <p className="text-xs text-gray-500 leading-relaxed">
              <strong className="text-gray-700">$0.99</strong> por generar. Si comprás el producto,{' '}
              <strong className="text-gray-700">se descuenta del total</strong>.
              Pagos seguros vía Stripe.
            </p>
          </div>
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
