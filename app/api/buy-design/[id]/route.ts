import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { calculatePrice, PRODUCTS } from '@/lib/pricing'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.redirect(new URL('/auth/login', _request.url))
    }

    const { data: design, error } = await supabase
      .from('designs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !design) {
      return NextResponse.redirect(new URL('/disenos?error=not-found', _request.url))
    }

    if (design.user_id !== user.id) {
      return NextResponse.redirect(new URL('/disenos?error=unauthorized', _request.url))
    }

    if (design.status !== 'generated') {
      return NextResponse.redirect(new URL('/disenos?error=already-purchased', _request.url))
    }

    const productConfig = PRODUCTS.find((p) => p.id === design.product_type)
    if (!productConfig) {
      return NextResponse.redirect(new URL('/disenos?error=invalid-product', _request.url))
    }

    const fullPrice = calculatePrice(design.product_type)
    const priceAfterDiscount = Math.round((fullPrice - 0.99) * 100)

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${productConfig.label} personalizada`,
              description: design.prompt,
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
        design_id: design.id,
        user_id: user.id,
        product_type: design.product_type,
        variant_id: 'default',
        total_paid: String(priceAfterDiscount / 100),
      },
      success_url: `${siteUrl}/ordenes?success=true`,
      cancel_url: `${siteUrl}/disenos`,
    })

    return NextResponse.redirect(session.url!)
  } catch {
    return NextResponse.redirect(new URL('/disenos?error=checkout', _request.url))
  }
}
