import { NextResponse } from 'next/server'

interface ProcessRequest {
  imageUrl: string
  productType: string
}

const MIN_FILE_SIZE = 500 * 1024 // 500KB

export async function POST(request: Request) {
  try {
    const body: ProcessRequest = await request.json()
    const { imageUrl, productType } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'URL de imagen requerida' }, { status: 400 })
    }

    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error('No se pudo descargar la imagen')
    }

    const blob = await response.blob()
    const contentType = response.headers.get('content-type') || 'image/png'
    const fileSize = blob.size

    const warnings: string[] = []
    if (fileSize < MIN_FILE_SIZE) {
      warnings.push('La imagen es pequeña. La calidad de impresión podría verse afectada.')
    }

    return NextResponse.json({
      data: {
        imageUrl,
        fileSize,
        contentType,
        productType,
        printReady: true,
        warnings,
        instructions: [
          'Usar la imagen directamente para impresión DTG',
          'No redimensionar - mantener 1024x1024',
        ],
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al procesar la imagen'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
