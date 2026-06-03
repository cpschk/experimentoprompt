import { NextRequest, NextResponse } from 'next/server'
import { getCatalogBlueprints, getBlueprintVariants, getShops } from '@/lib/printify'
import { PRODUCTS } from '@/lib/pricing'

export async function GET(request: NextRequest) {
  try {
    const shops = await getShops()
    if (shops.length === 0) {
      return NextResponse.json({ error: 'No hay shops en tu cuenta Printify' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const shopId = searchParams.get('shopId') ? Number(searchParams.get('shopId')) : shops[0].id

    const blueprints = await getCatalogBlueprints()
    const result: Record<string, unknown> = {}

    for (const product of PRODUCTS) {
      if (!product.printify) continue

      const bp = blueprints.find((b) => b.id === product.printify!.blueprintId)
      if (!bp) {
        result[product.id] = { error: 'Blueprint no encontrado en catálogo' }
        continue
      }

      try {
        const data = await getBlueprintVariants(
          product.printify.blueprintId,
          product.printify.printProviderId
        )

        const variantMapping: Record<string, number> = {}
        for (const variant of product.variants) {
          const match = data.variants.find((v) => {
            const sizeMatch = !variant.size || v.title.toLowerCase().includes(variant.size.toLowerCase())
            const colorMatch = !variant.color || v.title.toLowerCase().includes(variant.color.toLowerCase())
            return sizeMatch && colorMatch
          })
          if (match) {
            const key = `${variant.size}|${variant.color}`
            variantMapping[key] = match.id
          }
        }

        result[product.id] = {
          blueprintId: product.printify.blueprintId,
          printProviderId: product.printify.printProviderId,
          variantMapping,
          printProviders: data,
        }
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Error'
        result[product.id] = {
          error: `No se pudieron obtener variantes: ${message}`,
          blueprintId: product.printify.blueprintId,
          printProviderId: product.printify.printProviderId,
        }
      }
    }

    return NextResponse.json({
      data: {
        shopId,
        shops: shops.map((s) => ({ id: s.id, title: s.title })),
        configuration: result,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
