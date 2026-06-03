import { NextRequest, NextResponse } from 'next/server'
import { getCatalogBlueprints, getBlueprintVariants } from '@/lib/printify'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const blueprintId = searchParams.get('blueprintId')
    const printProviderId = searchParams.get('printProviderId')

    if (blueprintId && printProviderId) {
      const data = await getBlueprintVariants(Number(blueprintId), Number(printProviderId))
      return NextResponse.json({ data })
    }

    const blueprints = await getCatalogBlueprints()
    return NextResponse.json({ data: blueprints })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
