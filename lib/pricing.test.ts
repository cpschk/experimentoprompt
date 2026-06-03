import { describe, it, expect } from 'vitest'
import { calculatePrice, calculateProfit, PRODUCTS } from '@/lib/pricing'

describe('Pricing', () => {
  describe('calculatePrice', () => {
    it('calcula precio correcto para camiseta', () => {
      const price = calculatePrice('t-shirt')
      // baseCost 7.32 + shipping 4.99 + designFee 0.99 = 13.30
      // * 1.6 markup = 21.28 → rounded to 21.28
      expect(price).toBe(21.28)
    })

    it('calcula precio correcto para hoodie', () => {
      const price = calculatePrice('hoodie')
      // 15.89 + 5.99 + 0.99 = 22.87 * 1.6 = 36.592 → 36.59
      expect(price).toBe(36.59)
    })

    it('calcula precio correcto para taza', () => {
      const price = calculatePrice('mug')
      // 5.12 + 5.99 + 0.99 = 12.10 * 1.6 = 19.36
      expect(price).toBe(19.36)
    })

    it('retorna 0 para producto inexistente', () => {
      const price = calculatePrice('nonexistent' as any)
      expect(price).toBe(0)
    })

    it('todos los productos tienen precio > 0', () => {
      for (const product of PRODUCTS) {
        const price = calculatePrice(product.id)
        expect(price).toBeGreaterThan(0)
      }
    })
  })

  describe('calculateProfit', () => {
    it('calcula profit para camiseta', () => {
      const { retail, stripeFee, profit } = calculateProfit('t-shirt')
      expect(retail).toBe(21.28)
      expect(stripeFee).toBeGreaterThan(0)
      // profit = retail - baseCost - shipping - stripeFee - aiCost
      // 21.28 - 7.32 - 4.99 - stripeFee - 0.06
      expect(profit).toBeGreaterThan(0)
    })

    it('profit es menor que precio retail', () => {
      const { retail, profit } = calculateProfit('t-shirt')
      expect(profit).toBeLessThan(retail)
    })

    it('retorna 0 para producto inexistente', () => {
      const result = calculateProfit('nonexistent' as any)
      expect(result.retail).toBe(0)
      expect(result.profit).toBe(0)
    })
  })

  describe('PRODUCTS config', () => {
    it('cada producto tiene variantes', () => {
      for (const product of PRODUCTS) {
        expect(product.variants.length).toBeGreaterThan(0)
      }
    })

    it('cada producto tiene printify config', () => {
      for (const product of PRODUCTS) {
        expect(product.printify).toBeDefined()
        expect(product.printify?.blueprintId).toBeGreaterThan(0)
      }
    })
  })
})
