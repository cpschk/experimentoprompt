export type ProductType = 't-shirt' | 'hoodie' | 'mug' | 'phone-case' | 'poster'

export interface PrintifyConfig {
  blueprintId: number
  printProviderId: number
  variantMapping: Record<string, number>
}

export interface ProductConfig {
  id: ProductType
  label: string
  description: string
  emoji: string
  baseCost: number
  shipping: number
  variants: { size: string; color: string }[]
  printify?: PrintifyConfig
}

export const PRODUCTS: ProductConfig[] = [
  {
    id: 't-shirt',
    label: 'Camiseta',
    description: 'Premium unisex, 100% algodón',
    emoji: '👕',
    baseCost: 7.32,
    shipping: 4.99,
    variants: [
      { size: 'S', color: 'Black' },
      { size: 'M', color: 'Black' },
      { size: 'L', color: 'Black' },
      { size: 'XL', color: 'Black' },
      { size: 'S', color: 'White' },
      { size: 'M', color: 'White' },
      { size: 'L', color: 'White' },
      { size: 'XL', color: 'White' },
    ],
    printify: { blueprintId: 6, printProviderId: 0, variantMapping: {} },
  },
  {
    id: 'hoodie',
    label: 'Hoodie',
    description: 'Premium unisex con capucha',
    emoji: '🧥',
    baseCost: 15.89,
    shipping: 5.99,
    variants: [
      { size: 'S', color: 'Black' },
      { size: 'M', color: 'Black' },
      { size: 'L', color: 'Black' },
      { size: 'XL', color: 'Black' },
    ],
    printify: { blueprintId: 37, printProviderId: 0, variantMapping: {} },
  },
  {
    id: 'mug',
    label: 'Taza',
    description: 'Cerámica 11oz, apta microondas',
    emoji: '☕',
    baseCost: 5.12,
    shipping: 5.99,
    variants: [{ size: '11oz', color: 'White' }],
    printify: { blueprintId: 2, printProviderId: 0, variantMapping: {} },
  },
  {
    id: 'phone-case',
    label: 'Funda',
    description: 'Silicone para iPhone/Samsung',
    emoji: '📱',
    baseCost: 10.73,
    shipping: 4.99,
    variants: [
      { size: 'iPhone 15', color: 'Clear' },
      { size: 'iPhone 16', color: 'Clear' },
      { size: 'Samsung S24', color: 'Clear' },
    ],
    printify: { blueprintId: 36, printProviderId: 0, variantMapping: {} },
  },
  {
    id: 'poster',
    label: 'Póster',
    description: 'Papel mate premium 40x50cm',
    emoji: '🖼️',
    baseCost: 6.50,
    shipping: 4.99,
    variants: [{ size: '40x50cm', color: 'Matte' }],
    printify: { blueprintId: 25, printProviderId: 0, variantMapping: {} },
  },
]

const DESIGN_FEE = 0.99
const MARKUP = 0.6

export function calculatePrice(productType: ProductType): number {
  const product = PRODUCTS.find((p) => p.id === productType)
  if (!product) return 0
  return Math.round((product.baseCost + product.shipping + DESIGN_FEE) * (1 + MARKUP) * 100) / 100
}

export function calculateProfit(productType: ProductType): { retail: number; stripeFee: number; profit: number } {
  const retail = calculatePrice(productType)
  const product = PRODUCTS.find((p) => p.id === productType)
  if (!product) return { retail: 0, stripeFee: 0, profit: 0 }
  const stripeFee = Math.round(retail * 0.029 * 100 + 30) / 100
  const aiCost = 0.06
  const profit = Math.round((retail - product.baseCost - product.shipping - stripeFee - aiCost) * 100) / 100
  return { retail, stripeFee, profit }
}
