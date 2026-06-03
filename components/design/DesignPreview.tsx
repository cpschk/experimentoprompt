'use client'

import Image from 'next/image'

interface DesignPreviewProps {
  imageUrl: string | null
  loading: boolean
}

export function DesignPreview({ imageUrl, loading }: DesignPreviewProps) {
  if (loading) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 animate-spin text-gray-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">Generando diseño con IA...</p>
        </div>
      </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
        <div className="text-center text-gray-400">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="mt-3 text-sm">Tu diseño aparecerá aquí</p>
          <p className="mt-1 text-xs">Describe tu idea arriba y genera</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-gray-200 bg-white">
      <Image
        src={imageUrl}
        alt="Diseño generado"
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  )
}
