import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { imageUrl, prompt, productType } = await request.json()

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL de imagen requerida' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const imageResponse = await fetch(imageUrl)
    if (!imageResponse.ok) {
      throw new Error('No se pudo descargar la imagen')
    }

    const blob = await imageResponse.blob()
    const buffer = Buffer.from(await blob.arrayBuffer())
    const fileName = `${user.id}/${Date.now()}.png`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('designs')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      throw new Error(`Error al subir: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase.storage
      .from('designs')
      .getPublicUrl(fileName)

    const { error: dbError } = await supabase
      .from('designs')
      .insert({
        user_id: user.id,
        prompt,
        image_url: publicUrl,
        product_type: productType,
        status: 'generated',
      })

    if (dbError) {
      throw new Error(`Error al guardar: ${dbError.message}`)
    }

    return NextResponse.json({
      data: {
        imageUrl: publicUrl,
        designId: uploadData?.id,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al subir la imagen'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
