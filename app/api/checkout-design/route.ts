import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { prompt, product_type } = body

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'El prompt debe tener al menos 3 caracteres' },
        { status: 400 }
      )
    }

    if (!product_type || typeof product_type !== 'string') {
      return NextResponse.json(
        { error: 'Debes especificar un tipo de producto' },
        { status: 400 }
      )
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: 'Generar diseño con IA' },
            unit_amount: 99,
          },
          quantity: 1,
        },
      ],
      metadata: {
        prompt: prompt.trim(),
        product_type,
        user_id: user.id,
      },
      success_url: `${siteUrl}/generar?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/generar`,
    })

    return NextResponse.json({ data: { url: session.url, session_id: session.id } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
