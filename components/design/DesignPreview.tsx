'use client'

import Image from 'next/image'
import { type ProductType } from '@/lib/pricing'

interface DesignPreviewProps {
  imageUrl: string | null
  loading: boolean
  productType?: ProductType | null
}

const MOCKUP_LABELS: Record<string, { frame: string; label: string }> = {
  't-shirt': { frame: 'rounded-t-[60px] rounded-b-lg', label: 'Camiseta' },
  hoodie: { frame: 'rounded-t-[60px] rounded-b-lg', label: 'Hoodie' },
  mug: { frame: 'rounded-full', label: 'Taza' },
  'phone-case': { frame: 'rounded-2xl', label: 'Funda' },
  poster: { frame: 'rounded-sm', label: 'Póster' },
}

export function DesignPreview({ imageUrl, loading, productType }: DesignPreviewProps) {
  if (loading) {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
        {/* Skeleton pulse */}
        <div className="absolute inset-0 animate-pulse">
          <div className="h-full w-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
        </div>

        {/* Spinner overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/5">
          <div className="rounded-xl bg-white/90 px-5 py-3 shadow-lg backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 animate-spin text-gray-700" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Generando diseño...</span>
            </div>
          </div>
        </div>

        {/* Skeleton details */}
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          <div className="h-3 w-24 rounded-full bg-gray-200" />
          <div className="h-2 w-full rounded-full bg-gray-100" />
        </div>
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 transition-colors">
        <div className="px-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-500">Tu diseño aparecerá aquí</p>
          <p className="mt-1 text-xs text-gray-400">
            {productType ? `Preview para ${MOCKUP_LABELS[productType]?.label || productType}` : 'Selecciona un producto y describe tu idea'}
          </p>
        </div>
      </div>
    )
  }

  const mockup = productType ? MOCKUP_LABELS[productType] : null

  return (
    <div className="group relative">
      {/* Product mockup frame */}
      <div className={`relative aspect-square w-full overflow-hidden border border-gray-200 bg-gray-50 ${mockup?.frame || 'rounded-xl'}`}>
        <Image
          src={imageUrl}
          alt="Diseño generado"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Product type badge */}
        {mockup && (
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 shadow-sm backdrop-blur-sm">
            {mockup.label}
          </div>
        )}

        {/* Prompt tooltip on hover */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-xs text-white/90 line-clamp-2">
            { /* prompt is passed via alt, but we can show a generic label */ }
            Diseño generado — click para ampliar
          </p>
        </div>
      </div>
    </div>
  )
}
