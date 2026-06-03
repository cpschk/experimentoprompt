import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  createPrintifyProduct,
  createOrder,
  type PrintifyCreatedProduct,
  type PrintifyOrder,
} from '@/lib/printify'
import { PRODUCTS } from '@/lib/pricing'
import { sendOrderShipped } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { design_id, stripe_session_id } = body

    if (!design_id || !stripe_session_id) {
      return NextResponse.json(
        { error: 'Faltan campos: design_id, stripe_session_id' },
        { status: 400 }
      )
    }

    const { data: design, error: designError } = await supabase
      .from('designs')
      .select('*')
      .eq('id', design_id)
      .single()

    if (designError || !design) {
      return NextResponse.json({ error: 'Diseño no encontrado' }, { status: 404 })
    }

    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, printify_order_id')
      .eq('design_id', design_id)
      .single()

    if (existingOrder?.printify_order_id) {
      return NextResponse.json({ data: { order: existingOrder } })
    }

    const productConfig = PRODUCTS.find((p) => p.id === design.product_type)
    if (!productConfig?.printify) {
      return NextResponse.json({ error: 'Producto sin config Printify' }, { status: 400 })
    }

    const shopId = Number(process.env.PRINTIFY_SHOP_ID)
    if (!shopId) {
      return NextResponse.json({ error: 'PRINTIFY_SHOP_ID no configurado' }, { status: 500 })
    }

    if (!productConfig.printify.printProviderId) {
      return NextResponse.json(
        { error: 'printProviderId no configurado. Ejecuta GET /api/printify/configure primero' },
        { status: 400 }
      )
    }

    const variantIds = Object.values(productConfig.printify.variantMapping)
    if (variantIds.length === 0) {
      return NextResponse.json(
        { error: 'variantMapping vacío. Ejecuta GET /api/printify/configure primero' },
        { status: 400 }
      )
    }

    let printifyProduct: PrintifyCreatedProduct
    try {
      printifyProduct = await createPrintifyProduct({
        shopId,
        title: `Diseño personalizado - ${productConfig.label}`,
        description: `Diseño generado por IA: ${design.prompt}`,
        blueprintId: productConfig.printify.blueprintId,
        printProviderId: productConfig.printify.printProviderId,
        variantIds,
        imageUrl: design.image_url,
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al crear producto en Printify'
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    let printifyOrder: PrintifyOrder
    try {
      printifyOrder = await createOrder({
        shopId,
        lineItems: [{ productId: printifyProduct.id, variantId: variantIds[0], quantity: 1 }],
        shippingAddress: {
          first_name: user.email?.split('@')[0] || 'Cliente',
          last_name: '',
          address1: 'Dirección pendiente',
          city: 'Ciudad',
          country: 'US',
          zip: '00000',
        },
      })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al crear orden en Printify'
      return NextResponse.json({ error: msg }, { status: 502 })
    }

    const { error: dbError } = await supabase.from('orders').upsert({
      design_id: design_id,
      user_id: user.id,
      stripe_session_id,
      printify_order_id: printifyOrder.id,
      status: 'pending',
    })

    if (dbError) {
      return NextResponse.json({ error: `Error al guardar orden: ${dbError.message}` }, { status: 500 })
    }

    await supabase.from('designs').update({ status: 'ordered' }).eq('id', design_id)

    if (process.env.RESEND_API_KEY && user.email) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

      if (printifyOrder.tracking_number) {
        await sendOrderShipped(user.email, printifyOrder.id, printifyOrder.tracking_number, siteUrl)
      }
    }

    return NextResponse.json({
      data: {
        order_id: printifyOrder.id,
        status: printifyOrder.status,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
