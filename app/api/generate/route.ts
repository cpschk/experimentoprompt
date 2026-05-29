import { NextResponse } from 'next/server'
import { generateImage } from '@/lib/ai'

export async function POST(request: Request) {
  try {
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

    const result = await generateImage({
      prompt: prompt.trim(),
      productType: product_type,
    })

    return NextResponse.json({ data: result })
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

    return NextResponse.json(
      { error: 'Error al generar el diseño. Intenta de nuevo.' },
      { status: 500 }
    )
  }
}
