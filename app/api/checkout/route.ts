import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { calculatePrice, PRODUCTS } from '@/lib/pricing'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { design_id, product_type, variant_id } = body

    if (!design_id || !product_type || !variant_id) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos: design_id, product_type, variant_id' },
        { status: 400 }
      )
    }

    const product = PRODUCTS.find((p) => p.id === product_type)
    if (!product) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 400 })
    }

    const fullPrice = calculatePrice(product_type)
    const priceAfterDiscount = Math.round((fullPrice - 0.99) * 100)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${product.label} personalizada`,
              description: `Diseño generado por IA`,
            },
            unit_amount: priceAfterDiscount,
          },
          quantity: 1,
        },
      ],
      shipping_address_collection: {
        allowed_countries: ['US', 'MX', 'ES', 'AR', 'CO', 'CL', 'PE'],
      },
      metadata: {
        design_id,
        user_id: user.id,
        product_type,
        variant_id,
        total_paid: String(priceAfterDiscount / 100),
      },
      success_url: `${siteUrl}/ordenes?success=true`,
      cancel_url: `${siteUrl}/generar`,
    })

    return NextResponse.json({ data: { url: session.url } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
