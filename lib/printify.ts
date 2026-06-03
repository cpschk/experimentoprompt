const BASE_URL = 'https://api.printify.com/v1'

function getHeaders() {
  const apiKey = process.env.PRINTIFY_API_KEY
  if (!apiKey) throw new Error('PRINTIFY_API_KEY no configurada')
  return {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'User-Agent': 'pod-ia-platform',
  }
}

export interface PrintifyShop {
  id: number
  title: string
  sales_channel: string
}

export interface PrintifyBlueprint {
  id: number
  title: string
  brand: string
  model: string
  images: string[]
}

export interface PrintifyVariant {
  id: number
  title: string
  options: Record<string, string>
  placeholders: { position: string; height: number; width: number }[]
}

export interface PrintifyProduct {
  id: string
  title: string
  description: string
  variants: { id: number; sku: string; cost: number; price: number }[]
  images: { src: string }[]
}

export interface PrintifyOrder {
  id: string
  status: string
  shipping_cost: number
  tracking_number: string | null
}

export async function getShops(): Promise<PrintifyShop[]> {
  const res = await fetch(`${BASE_URL}/shops.json`, { headers: getHeaders() })
  if (!res.ok) throw new Error(`Error al obtener shops: ${res.status}`)
  return res.json()
}

export async function getCatalogBlueprints(): Promise<PrintifyBlueprint[]> {
  const res = await fetch(`${BASE_URL}/catalog/blueprints.json`, { headers: getHeaders() })
  if (!res.ok) throw new Error(`Error al obtener catálogo: ${res.status}`)
  return res.json()
}

export async function getBlueprintVariants(
  blueprintId: number,
  printProviderId: number
): Promise<{ variants: PrintifyVariant[] }> {
  const res = await fetch(
    `${BASE_URL}/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`,
    { headers: getHeaders() }
  )
  if (!res.ok) throw new Error(`Error al obtener variantes: ${res.status}`)
  return res.json()
}

export async function getShopProducts(shopId: number): Promise<PrintifyProduct[]> {
  const res = await fetch(`${BASE_URL}/shops/${shopId}/products.json`, { headers: getHeaders() })
  if (!res.ok) throw new Error(`Error al obtener productos: ${res.status}`)
  return res.json()
}

export interface CreatePrintifyProductParams {
  shopId: number
  title: string
  description: string
  blueprintId: number
  printProviderId: number
  variantIds: number[]
  imageUrl: string
}

export interface PrintifyCreatedProduct {
  id: string
  title: string
  variants: { id: number; sku: string; cost: number; price: number }[]
}

export async function createPrintifyProduct(
  params: CreatePrintifyProductParams
): Promise<PrintifyCreatedProduct> {
  const { shopId, title, description, blueprintId, printProviderId, variantIds, imageUrl } = params

  const body = {
    title,
    description,
    blueprint_id: blueprintId,
    print_provider_id: printProviderId,
    variants: variantIds.map((id) => ({ id, price: 0 })),
    print_areas: [
      {
        variant_ids: variantIds,
        placeholders: [
          {
            position: 'front',
            images: [{ src: imageUrl }],
          },
        ],
      },
    ],
  }

  const res = await fetch(`${BASE_URL}/shops/${shopId}/products.json`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error al crear producto Printify: ${res.status} - ${err}`)
  }

  return res.json()
}

export interface CreateOrderParams {
  shopId: number
  lineItems: {
    productId: string
    variantId: number
    quantity: number
  }[]
  shippingAddress: {
    first_name: string
    last_name: string
    address1: string
    city: string
    country: string
    zip: string
  }
}

export async function createOrder(params: CreateOrderParams): Promise<PrintifyOrder> {
  const { shopId, lineItems, shippingAddress } = params

  const body = {
    line_items: lineItems.map((item) => ({
      product_id: item.productId,
      variant_id: item.variantId,
      quantity: item.quantity,
    })),
    shipping_method: 1,
    address_to: shippingAddress,
  }

  const res = await fetch(`${BASE_URL}/shops/${shopId}/orders.json`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Error al crear orden Printify: ${res.status} - ${err}`)
  }

  return res.json()
}

export async function getOrder(shopId: number, orderId: string): Promise<PrintifyOrder> {
  const res = await fetch(`${BASE_URL}/shops/${shopId}/orders/${orderId}.json`, {
    headers: getHeaders(),
  })
  if (!res.ok) throw new Error(`Error al obtener orden: ${res.status}`)
  return res.json()
}
