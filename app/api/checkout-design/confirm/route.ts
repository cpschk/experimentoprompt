import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { generateImage } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { session_id } = body

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json({ error: 'session_id requerido' }, { status: 400 })
    }

    const session = await getStripe().checkout.sessions.retrieve(session_id)

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'El pago no está completo' }, { status: 400 })
    }

    const prompt = session.metadata?.prompt
    const productType = session.metadata?.product_type
    const userId = session.metadata?.user_id

    if (!prompt || !productType || !userId) {
      return NextResponse.json({ error: 'Metadatos de sesión inválidos' }, { status: 400 })
    }

    const result = await generateImage({ prompt, productType })

    const imageResponse = await fetch(result.imageUrl)
    if (!imageResponse.ok) {
      throw new Error('No se pudo descargar la imagen generada')
    }

    const blob = await imageResponse.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())
    const fileName = `${userId}/${Date.now()}.png`

    const supabase = await createClient()
    const { error: uploadError } = await supabase.storage
      .from('designs')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
      })

    if (uploadError) {
      throw new Error(`Error al guardar imagen: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('designs')
      .getPublicUrl(fileName)

    const { error: dbError, data: design } = await supabase
      .from('designs')
      .insert({
        user_id: userId,
        prompt,
        image_url: publicUrl,
        product_type: productType,
        status: 'generated',
      })
      .select('id, image_url, prompt, product_type, created_at')
      .single()

    if (dbError) {
      throw new Error(`Error al registrar diseño: ${dbError.message}`)
    }

    return NextResponse.json({ data: { design } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'

    if (message.includes('API key') || message.includes('no configurada')) {
      return NextResponse.json(
        { error: 'La API de IA no está configurada. Contacta al administrador.' },
        { status: 500 }
      )
    }

    if (message.includes('rate limit') || message.includes('429')) {
      return NextResponse.json(
        { error: 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.' },
        { status: 429 }
      )
    }

    if (message.includes('content_policy')) {
      return NextResponse.json(
        { error: 'El prompt fue rechazado por las políticas de contenido. Intenta con una descripción diferente.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
