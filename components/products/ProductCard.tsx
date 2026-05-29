'use client'

import type { ProductConfig } from '@/lib/pricing'
import { calculatePrice } from '@/lib/pricing'

interface ProductCardProps {
  product: ProductConfig
  selected: boolean
  onSelect: () => void
}

export function ProductCard({ product, selected, onSelect }: ProductCardProps) {
  const price = calculatePrice(product.id)

  return (
    <button
      onClick={onSelect}
      className={`rounded-xl border-2 p-4 text-left transition ${
        selected
          ? 'border-gray-900 bg-gray-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-gray-100 text-4xl">
        {product.emoji}
      </div>
      <h3 className="font-semibold text-gray-900">{product.label}</h3>
      <p className="mt-1 text-xs text-gray-500">{product.description}</p>
      <p className="mt-2 text-lg font-bold text-gray-900">${price.toFixed(2)}</p>
    </button>
  )
}
