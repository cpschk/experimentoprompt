import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const supabase = await createClient()
    const { data: design, error } = await supabase
      .from('designs')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !design) {
      return NextResponse.json({ error: 'Diseño no encontrado' }, { status: 404 })
    }

    const imageRes = await fetch(design.image_url)
    if (!imageRes.ok) {
      return NextResponse.json({ error: 'No se pudo descargar la imagen' }, { status: 502 })
    }

    const blob = await imageRes.blob()
    const ext = design.image_url.endsWith('.png') ? 'png' : 'jpg'
    const filename = `diseno-${id.slice(0, 8)}.${ext}`

    return new NextResponse(blob, {
      headers: {
        'Content-Type': blob.type || 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(blob.size),
      },
    })
  } catch {
    return NextResponse.json({ error: 'Error al descargar' }, { status: 500 })
  }
}
