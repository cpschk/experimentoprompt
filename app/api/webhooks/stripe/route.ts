import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/ai'
import { sendDesignReady, sendOrderReceived } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Falta firma Stripe' }, { status: 400 })
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    if (!webhookSecret) {
      return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET no configurado' }, { status: 500 })
    }

    let event
    try {
      event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
    } catch {
      return NextResponse.json({ error: 'Firma inválida' }, { status: 400 })
    }

    if (event.type === 'checkout.session.completed') {
      const raw = event.data.object as unknown as {
        id: string
        metadata: Record<string, string> | null
        payment_status: string
        customer_details: { email: string | null } | null
        shipping: {
          address: {
            line1: string
            line2: string | null
            city: string
            state: string
            postal_code: string
            country: string
          }
          name: string | null
        } | null
      }
      const session = raw

      if (session.metadata?.prompt && session.metadata?.product_type) {
        await handleDesignPayment(session)
      }

      if (session.metadata?.design_id) {
        await handleProductPayment(session)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function handleDesignPayment(session: {
  id: string
  metadata: Record<string, string> | null
  payment_status: string
  customer_details: { email: string | null } | null
}) {
  if (session.payment_status !== 'paid') return

  const prompt = session.metadata?.prompt
  const productType = session.metadata?.product_type
  const userId = session.metadata?.user_id
  const userEmail = session.customer_details?.email

  if (!prompt || !productType || !userId) return

  try {
    const result = await generateImage({ prompt, productType })

    const imageResponse = await fetch(result.imageUrl)
    if (!imageResponse.ok) return

    const blob = await imageResponse.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())
    const fileName = `${userId}/${Date.now()}.png`

    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from('designs')
      .upload(fileName, buffer, { contentType: 'image/png', cacheControl: '3600' })

    if (uploadError) return

    const { data: { publicUrl } } = supabase.storage.from('designs').getPublicUrl(fileName)

    await supabase.from('designs').insert({
      user_id: userId,
      prompt,
      image_url: publicUrl,
      product_type: productType,
      status: 'generated',
    })

    if (userEmail && process.env.RESEND_API_KEY) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      await sendDesignReady(userEmail, publicUrl, prompt, siteUrl)
    }
  } catch {
    // Silencioso — el frontend puede reintentar
  }
}

async function handleProductPayment(session: {
  id: string
  metadata: Record<string, string> | null
  payment_status: string
  customer_details: { email: string | null } | null
  shipping: {
    address: {
      line1: string
      line2: string | null
      city: string
      state: string
      postal_code: string
      country: string
    }
    name: string | null
  } | null
}) {
  const designId = session.metadata?.design_id
  const userId = session.metadata?.user_id
  const productType = session.metadata?.product_type
  const totalPaid = session.metadata?.total_paid
  const userEmail = session.customer_details?.email

  if (!designId || !userId) return

  try {
    const supabase = await createClient()

    const shippingAddress = session.shipping?.address
      ? {
          line1: session.shipping.address.line1,
          line2: session.shipping.address.line2,
          city: session.shipping.address.city,
          state: session.shipping.address.state,
          postal_code: session.shipping.address.postal_code,
          country: session.shipping.address.country,
          name: session.shipping.name,
        }
      : null

    const { error: insertError } = await supabase
      .from('orders')
      .insert({
        design_id: designId,
        user_id: userId,
        stripe_session_id: session.id,
        shipping_address: shippingAddress,
        total_paid: totalPaid ? parseFloat(totalPaid) : null,
        status: 'pending',
      })

    if (insertError) return

    await supabase.from('designs').update({ status: 'paid' }).eq('id', designId)

    if (userEmail && process.env.RESEND_API_KEY) {
      const { data: design } = await supabase
        .from('designs')
        .select('image_url, product_type')
        .eq('id', designId)
        .single()

      if (design) {
        const { data: order } = await supabase
          .from('orders')
          .select('id')
          .eq('design_id', designId)
          .single()

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const PRODUCT_LABELS: Record<string, string> = {
          't-shirt': 'Camiseta', hoodie: 'Hoodie', mug: 'Taza',
          'phone-case': 'Funda', poster: 'Póster',
        }

        await sendOrderReceived(
          userEmail,
          order?.id || designId,
          design.image_url,
          PRODUCT_LABELS[design.product_type] || design.product_type,
          siteUrl
        )
      }
    }

    if (process.env.PRINTIFY_API_KEY && process.env.PRINTIFY_SHOP_ID && productType) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/printify/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            design_id: designId,
            stripe_session_id: session.id,
          }),
        })
      } catch {
        // La orden Printify se reintentará manualmente
      }
    }
  } catch {
    // Log silencioso
  }
}
