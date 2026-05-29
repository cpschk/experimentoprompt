'use client'

import { ProductCard } from './ProductCard'
import { PRODUCTS } from '@/lib/pricing'
import type { ProductType } from '@/lib/pricing'

interface ProductSelectorProps {
  selected: ProductType | null
  onSelect: (product: ProductType) => void
}

export function ProductSelector({ selected, onSelect }: ProductSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {PRODUCTS.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          selected={selected === product.id}
          onSelect={() => onSelect(product.id)}
        />
      ))}
    </div>
  )
}
