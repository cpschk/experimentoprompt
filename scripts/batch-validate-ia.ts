import 'dotenv/config'
import OpenAI from 'openai'
import fs from 'node:fs/promises'
import path from 'node:path'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'validacion')
const RESULTS_FILE = path.join(OUTPUT_DIR, 'resultados.json')

interface PromptEntry {
  id: number
  category: string
  productType: string
  prompt: string
  fullPrompt: string
}

interface GenerationResult {
  id: number
  category: string
  productType: string
  prompt: string
  success: boolean
  imageUrl?: string
  revisedPrompt?: string
  filePath?: string
  error?: string
  generatedAt: string
}

const STYLE_GUIDE = `
Style guidelines for the design:
- Bold, high contrast, suitable for apparel/textile printing
- Vibrant colors but limited to 3-4 colors maximum for cost-effective DTG printing
- Centered composition
- No text or letters unless specified in the description
- Clean edges, no fading or gradients if possible
- The design should look good as a standalone graphic
- Transparent or solid light background
- Suitable for print-on-demand products
`

const PROMPTS: PromptEntry[] = [
  { id: 1, category: 'Minimalista', productType: 't-shirt', prompt: 'Un círculo concéntrico en tonos grises, estilo moderno' },
  { id: 2, category: 'Minimalista', productType: 'poster', prompt: 'Línea continua de una montaña, estilo one-line art' },
  { id: 3, category: 'Minimalista', productType: 'mug', prompt: 'Tres barras verticales degradadas, estilo Bauhaus minimalista' },
  { id: 4, category: 'Abstracto', productType: 't-shirt', prompt: 'Explosión de colores acuarela, estilo abstracto fluido' },
  { id: 5, category: 'Abstracto', productType: 'hoodie', prompt: 'Formas geométricas flotando en caos organizado, estilo constructivista' },
  { id: 6, category: 'Abstracto', productType: 'poster', prompt: 'Manchas de tinta negra sobre blanco, estilo Rorschach inkblot' },
  { id: 7, category: 'Geek', productType: 't-shirt', prompt: 'Un dragón minimalista enroscado en forma de círculo, estilo lineal' },
  { id: 8, category: 'Geek', productType: 'phone-case', prompt: 'Un pixel art de un zorro espacial con casco retro' },
  { id: 9, category: 'Geek', productType: 'hoodie', prompt: 'Silueta de un caballero con espada láser, estilo silhouette monocromo' },
  { id: 10, category: 'Naturaleza', productType: 't-shirt', prompt: 'Montañas al atardecer con picos nevados, silueta vectorial' },
  { id: 11, category: 'Naturaleza', productType: 'poster', prompt: 'Hoja de monstera en estilo lineal botánico, elegante' },
  { id: 12, category: 'Naturaleza', productType: 'mug', prompt: 'Olas del mar en estilo japonés ukiyo-e, simple y elegante' },
  { id: 13, category: 'Tipográfico', productType: 't-shirt', prompt: 'Diseño abstracto con formas que evocan creatividad e innovación' },
  { id: 14, category: 'Tipográfico', productType: 'hoodie', prompt: 'Patrón de líneas y símbolos formando un diseño decorativo abstracto' },
  { id: 15, category: 'Tipográfico', productType: 'poster', prompt: 'Caos de letras y símbolos formando una composición artística abstracta' },
  { id: 16, category: 'Bold', productType: 't-shirt', prompt: 'Un tigre con rayas de fuego, alto contraste, look agresivo y potente' },
  { id: 17, category: 'Bold', productType: 'hoodie', prompt: 'Calavera con detalles dorados, estilo chicano tradicional' },
  { id: 18, category: 'Bold', productType: 'phone-case', prompt: 'Rayo eléctrico cruzando un círculo, colores neón sobre fondo oscuro' },
  { id: 19, category: 'Mixed', productType: 'poster', prompt: 'Mapa del tesoro vintage con brújula y ruta punteada, estilo antiguo' },
  { id: 20, category: 'Mixed', productType: 'mug', prompt: 'Constelación de estrellas unidas por líneas finas, estilo astronómico' },
]

function buildFullPrompt(entry: PromptEntry): string {
  return `Create a print-ready design for a ${entry.productType} based on this description: "${entry.prompt}".${STYLE_GUIDE}`
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function generateSingle(entry: PromptEntry, openai: OpenAI): Promise<GenerationResult> {
  const fullPrompt = buildFullPrompt(entry)
  const startTime = Date.now()

  try {
    console.log(`\n[${entry.id}/20] Generando: ${entry.prompt.slice(0, 50)}...`)

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url',
    })

    const imageData = response.data?.[0]
    const imageUrl = imageData?.url
    const revisedPrompt = imageData?.revised_prompt || fullPrompt

    if (!imageUrl) {
      throw new Error('No URL returned from OpenAI')
    }

    // Download image
    const fetchResponse = await fetch(imageUrl)
    if (!fetchResponse.ok) {
      throw new Error(`Failed to download: ${fetchResponse.status}`)
    }

    const buffer = Buffer.from(await fetchResponse.arrayBuffer())
    const fileName = `${String(entry.id).padStart(2, '0')}-${entry.category.toLowerCase().replace(/\s/g, '-')}-${entry.productType}.png`
    const filePath = path.join(OUTPUT_DIR, fileName)

    await fs.writeFile(filePath, buffer)

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`  ✅ Listo en ${elapsed}s → ${fileName}`)

    return {
      id: entry.id,
      category: entry.category,
      productType: entry.productType,
      prompt: entry.prompt,
      success: true,
      imageUrl,
      revisedPrompt,
      filePath: `/validacion/${fileName}`,
      generatedAt: new Date().toISOString(),
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.log(`  ❌ Error: ${message}`)

    return {
      id: entry.id,
      category: entry.category,
      productType: entry.productType,
      prompt: entry.prompt,
      success: false,
      error: message,
      generatedAt: new Date().toISOString(),
    }
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('BATCH VALIDACIÓN IA — Día 11')
  console.log('Generando 20 diseños con DALL-E 3')
  console.log('='.repeat(60))

  if (!OPENAI_API_KEY) {
    console.error('\n❌ ERROR: OPENAI_API_KEY no está configurada')
    console.error('Agrega tu API key en .env.local:')
    console.error('  OPENAI_API_KEY=sk-...')
    process.exit(1)
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

  // Ensure output directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  // Check for existing results to resume
  let existingResults: GenerationResult[] = []
  try {
    const existing = await fs.readFile(RESULTS_FILE, 'utf-8')
    existingResults = JSON.parse(existing)
    console.log(`\n📁 Encontrados ${existingResults.length} resultados previos. Se reanudará.`)
  } catch {
    console.log('\n📁 Iniciando desde cero...')
  }

  const completedIds = new Set(existingResults.filter((r) => r.success).map((r) => r.id))
  const results: GenerationResult[] = [...existingResults]

  let totalCost = 0
  const COST_PER_IMAGE = 0.04 // DALL-E 3 standard 1024x1024

  for (const entry of PROMPTS) {
    if (completedIds.has(entry.id)) {
      console.log(`\n[${entry.id}/20] ⏭️  Saltado (ya generado)`)
      continue
    }

      const result = await generateSingle(entry, openai)
    results.push(result)
    totalCost += COST_PER_IMAGE

    // Save progress after each generation
    await fs.writeFile(RESULTS_FILE, JSON.stringify(results, null, 2))

    // Delay to avoid rate limiting
    if (entry.id < PROMPTS.length) {
      await delay(1000)
    }
  }

  // Summary
  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  console.log('\n' + '='.repeat(60))
  console.log('RESUMEN')
  console.log('='.repeat(60))
  console.log(`Total generados: ${successful.length}/${PROMPTS.length}`)
  console.log(`Fallidos: ${failed.length}`)
  console.log(`Costo estimado: $${totalCost.toFixed(2)} USD`)
  console.log(`\nArchivos guardados en: ${OUTPUT_DIR}`)
  console.log(`Resultados JSON: ${RESULTS_FILE}`)

  if (failed.length > 0) {
    console.log('\n❌ Fallos:')
    for (const f of failed) {
      console.log(`  #${f.id}: ${f.error}`)
    }
  }

  console.log('\n📋 Próximo paso:')
  console.log('  1. Revisa cada imagen en public/validacion/')
  console.log('  2. Completa la plantilla de review en scripts/review-template.md')
  console.log('  3. Ejecuta npm run validate:review para ver el reporte')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
