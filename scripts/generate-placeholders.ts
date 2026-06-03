import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'validacion')

interface DesignConfig {
  id: number
  category: string
  productType: string
  prompt: string
  bgColor: string
  primaryColor: string
  secondaryColor: string
  pattern: 'circles' | 'lines' | 'waves' | 'grid' | 'triangles' | 'dots'
}

const DESIGNS: DesignConfig[] = [
  { id: 1, category: 'Minimalista', productType: 't-shirt', prompt: 'Círculo concéntrico en tonos grises', bgColor: '#f5f5f5', primaryColor: '#2d2d2d', secondaryColor: '#8c8c8c', pattern: 'circles' },
  { id: 2, category: 'Minimalista', productType: 'poster', prompt: 'Línea continua de una montaña', bgColor: '#fafafa', primaryColor: '#1a1a1a', secondaryColor: '#666666', pattern: 'lines' },
  { id: 3, category: 'Minimalista', productType: 'mug', prompt: 'Tres barras verticales degradadas', bgColor: '#ffffff', primaryColor: '#c41e3a', secondaryColor: '#e8b4b8', pattern: 'grid' },
  { id: 4, category: 'Abstracto', productType: 't-shirt', prompt: 'Explosión de colores acuarela', bgColor: '#1a1a2e', primaryColor: '#e94560', secondaryColor: '#f39c12', pattern: 'waves' },
  { id: 5, category: 'Abstracto', productType: 'hoodie', prompt: 'Formas geométricas flotando', bgColor: '#0f3460', primaryColor: '#16c79a', secondaryColor: '#e7d9ea', pattern: 'triangles' },
  { id: 6, category: 'Abstracto', productType: 'poster', prompt: 'Manchas de tinta Rorschach', bgColor: '#ffffff', primaryColor: '#000000', secondaryColor: '#333333', pattern: 'dots' },
  { id: 7, category: 'Geek', productType: 't-shirt', prompt: 'Dragón minimalista enroscado', bgColor: '#1e1e2f', primaryColor: '#c9b037', secondaryColor: '#8b4513', pattern: 'lines' },
  { id: 8, category: 'Geek', productType: 'phone-case', prompt: 'Pixel art zorro espacial', bgColor: '#0c1445', primaryColor: '#ff6b6b', secondaryColor: '#4ecdc4', pattern: 'grid' },
  { id: 9, category: 'Geek', productType: 'hoodie', prompt: 'Caballero con espada láser', bgColor: '#000000', primaryColor: '#00ff88', secondaryColor: '#0066ff', pattern: 'circles' },
  { id: 10, category: 'Naturaleza', productType: 't-shirt', prompt: 'Montañas al atardecer', bgColor: '#ffecd2', primaryColor: '#fcb69f', secondaryColor: '#667eea', pattern: 'waves' },
  { id: 11, category: 'Naturaleza', productType: 'poster', prompt: 'Hoja de monstera lineal', bgColor: '#f0fff4', primaryColor: '#2d6a4f', secondaryColor: '#52b788', pattern: 'lines' },
  { id: 12, category: 'Naturaleza', productType: 'mug', prompt: 'Olas del mar estilo ukiyo-e', bgColor: '#e8f4f8', primaryColor: '#1e3a5f', secondaryColor: '#87ceeb', pattern: 'waves' },
  { id: 13, category: 'Tipográfico', productType: 't-shirt', prompt: 'Formas que evocan creatividad', bgColor: '#faf5ff', primaryColor: '#6c5ce7', secondaryColor: '#a29bfe', pattern: 'dots' },
  { id: 14, category: 'Tipográfico', productType: 'hoodie', prompt: 'Líneas y símbolos decorativos', bgColor: '#fff5f5', primaryColor: '#e17055', secondaryColor: '#fdcb6e', pattern: 'grid' },
  { id: 15, category: 'Tipográfico', productType: 'poster', prompt: 'Caos de letras artístico', bgColor: '#f8f9fa', primaryColor: '#2d3436', secondaryColor: '#636e72', pattern: 'triangles' },
  { id: 16, category: 'Bold', productType: 't-shirt', prompt: 'Tigre con rayas de fuego', bgColor: '#2d0a0a', primaryColor: '#ff4757', secondaryColor: '#ffa502', pattern: 'circles' },
  { id: 17, category: 'Bold', productType: 'hoodie', prompt: 'Calavera chicano dorada', bgColor: '#0a0a0a', primaryColor: '#ffd700', secondaryColor: '#ff6b6b', pattern: 'dots' },
  { id: 18, category: 'Bold', productType: 'phone-case', prompt: 'Rayo eléctrico neón', bgColor: '#0f0f23', primaryColor: '#ff00ff', secondaryColor: '#00ffff', pattern: 'lines' },
  { id: 19, category: 'Mixed', productType: 'poster', prompt: 'Mapa del tesoro vintage', bgColor: '#f4e4bc', primaryColor: '#8b6914', secondaryColor: '#cd853f', pattern: 'grid' },
  { id: 20, category: 'Mixed', productType: 'mug', prompt: 'Constelación astronómica', bgColor: '#0b0b1f', primaryColor: '#ffffff', secondaryColor: '#ffd700', pattern: 'dots' },
]

function generateSVG(config: DesignConfig): string {
  const width = 1024
  const height = 1024
  let pattern = ''

  switch (config.pattern) {
    case 'circles':
      pattern = generateCircles(config, width, height)
      break
    case 'lines':
      pattern = generateLines(config, width, height)
      break
    case 'waves':
      pattern = generateWaves(config, width, height)
      break
    case 'grid':
      pattern = generateGrid(config, width, height)
      break
    case 'triangles':
      pattern = generateTriangles(config, width, height)
      break
    case 'dots':
      pattern = generateDots(config, width, height)
      break
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${config.bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${config.primaryColor};stop-opacity:0.1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  ${pattern}
</svg>`
}

function generateCircles(config: DesignConfig, w: number, h: number): string {
  let circles = ''
  for (let i = 5; i >= 1; i--) {
    const radius = i * 80
    const color = i % 2 === 0 ? config.primaryColor : config.secondaryColor
    const opacity = 0.6 + (i * 0.08)
    circles += `<circle cx="${w/2}" cy="${h/2}" r="${radius}" fill="none" stroke="${color}" stroke-width="8" opacity="${opacity}" />\n`
  }
  return circles
}

function generateLines(config: DesignConfig, w: number, h: number): string {
  let lines = ''
  const spacing = 60
  for (let i = 0; i < 20; i++) {
    const y = i * spacing + 40
    const color = i % 3 === 0 ? config.primaryColor : config.secondaryColor
    const strokeWidth = i % 4 === 0 ? 6 : 3
    lines += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${color}" stroke-width="${strokeWidth}" opacity="0.7" />\n`
  }
  // Add a mountain-like shape
  const peakX = w / 2
  const peakY = h / 3
  lines += `<polygon points="0,${h} ${peakX},${peakY} ${w},${h}" fill="none" stroke="${config.primaryColor}" stroke-width="8" opacity="0.8" />`
  return lines
}

function generateWaves(config: DesignConfig, w: number, h: number): string {
  let waves = ''
  for (let i = 0; i < 8; i++) {
    const y = i * 100 + 80
    const amplitude = 30 + (i * 5)
    let d = `M 0 ${y}`
    for (let x = 0; x <= w; x += 20) {
      const waveY = y + Math.sin((x / 100) + i) * amplitude
      d += ` L ${x} ${waveY}`
    }
    const color = i % 2 === 0 ? config.primaryColor : config.secondaryColor
    waves += `<path d="${d}" fill="none" stroke="${color}" stroke-width="4" opacity="0.6" />\n`
  }
  return waves
}

function generateGrid(config: DesignConfig, w: number, h: number): string {
  let grid = ''
  const cols = 5
  const rows = 5
  const cellW = w / cols
  const cellH = h / rows

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellW
      const y = row * cellH
      const color = (row + col) % 2 === 0 ? config.primaryColor : config.secondaryColor
      const opacity = 0.4 + (Math.random() * 0.4)
      grid += `<rect x="${x + 10}" y="${y + 10}" width="${cellW - 20}" height="${cellH - 20}" fill="${color}" opacity="${opacity}" rx="8" />\n`
    }
  }
  return grid
}

function generateTriangles(config: DesignConfig, w: number, h: number): string {
  let triangles = ''
  for (let i = 0; i < 30; i++) {
    const cx = Math.random() * w
    const cy = Math.random() * h
    const size = 40 + Math.random() * 80
    const points = [
      [cx, cy - size],
      [cx - size * 0.866, cy + size * 0.5],
      [cx + size * 0.866, cy + size * 0.5],
    ]
    const color = Math.random() > 0.5 ? config.primaryColor : config.secondaryColor
    const opacity = 0.3 + Math.random() * 0.4
    triangles += `<polygon points="${points.map(p => p.join(',')).join(' ')}" fill="${color}" opacity="${opacity}" />\n`
  }
  return triangles
}

function generateDots(config: DesignConfig, w: number, h: number): string {
  let dots = ''
  for (let i = 0; i < 50; i++) {
    const cx = Math.random() * w
    const cy = Math.random() * h
    const r = 5 + Math.random() * 20
    const color = Math.random() > 0.5 ? config.primaryColor : config.secondaryColor
    const opacity = 0.3 + Math.random() * 0.5
    dots += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" opacity="${opacity}" />\n`
  }
  return dots
}

async function main() {
  console.log('='.repeat(60))
  console.log('GENERACIÓN DE PLACEHOLDERS — Día 11')
  console.log('Creando 20 diseños placeholder sin costo API')
  console.log('='.repeat(60))

  await fs.mkdir(OUTPUT_DIR, { recursive: true })

  const results = []
  let successCount = 0

  for (const design of DESIGNS) {
    try {
      const svg = generateSVG(design)
      const fileName = `${String(design.id).padStart(2, '0')}-${design.category.toLowerCase().replace(/\s/g, '-')}-${design.productType}.png`
      const filePath = path.join(OUTPUT_DIR, fileName)

      // Convert SVG to PNG using Sharp
      const pngBuffer = await sharp(Buffer.from(svg))
        .png({ quality: 95 })
        .toBuffer()

      await fs.writeFile(filePath, pngBuffer)

      results.push({
        id: design.id,
        category: design.category,
        productType: design.productType,
        prompt: design.prompt,
        success: true,
        filePath: `/validacion/${fileName}`,
        generatedAt: new Date().toISOString(),
      })

      successCount++
      console.log(`✅ #${design.id} — ${design.category} (${design.productType})`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      results.push({
        id: design.id,
        category: design.category,
        productType: design.productType,
        prompt: design.prompt,
        success: false,
        error: message,
        generatedAt: new Date().toISOString(),
      })
      console.log(`❌ #${design.id} — ${message}`)
    }
  }

  // Save results JSON
  const resultsFile = path.join(OUTPUT_DIR, 'resultados.json')
  await fs.writeFile(resultsFile, JSON.stringify(results, null, 2))

  // Generate HTML review page
  await generateReviewPage(results)

  console.log('\n' + '='.repeat(60))
  console.log('RESUMEN')
  console.log('='.repeat(60))
  console.log(`Total generados: ${successCount}/${DESIGNS.length}`)
  console.log(`Costo API: $0.00 (placeholders locales)`)
  console.log(`\nArchivos en: ${OUTPUT_DIR}`)
  console.log(`Review: ${path.join(OUTPUT_DIR, 'index.html')}`)
}

async function generateReviewPage(results: any[]) {
  const rows = results
    .map((r) => {
      if (!r.success) {
        return `
        <tr class="failed">
          <td>#${r.id}</td>
          <td>${r.category}</td>
          <td>${r.productType}</td>
          <td colspan="4" class="error">❌ ${r.error}</td>
        </tr>`
      }

      const fileName = r.filePath?.split('/').pop() || ''

      return `
        <tr>
          <td>#${r.id}</td>
          <td>${r.category}</td>
          <td>${r.productType}</td>
          <td><img src="${fileName}" alt="Diseño #${r.id}" loading="lazy" /></td>
          <td><input type="number" min="1" max="5" placeholder="1-5" /></td>
          <td><input type="number" min="1" max="5" placeholder="1-5" /></td>
          <td><input type="number" min="1" max="5" placeholder="1-5" /></td>
          <td><input type="number" min="1" max="5" placeholder="1-5" /></td>
        </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validación Placeholders — Día 11</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; color: #1a1a1a; padding: 2rem; }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .subtitle { color: #666; margin-bottom: 2rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
    .stat-card { background: white; border-radius: 8px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .stat-card .number { font-size: 2rem; font-weight: bold; color: #111; }
    .stat-card .label { color: #666; font-size: 0.875rem; margin-top: 0.25rem; }
    table { width: 100%; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-collapse: collapse; }
    th { background: #111; color: white; padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 1rem; border-bottom: 1px solid #eee; vertical-align: top; }
    tr:hover { background: #fafafa; }
    img { max-width: 180px; max-height: 180px; border-radius: 4px; display: block; }
    input { padding: 0.375rem 0.5rem; border-radius: 4px; border: 1px solid #ddd; font-size: 0.875rem; width: 60px; }
    .error { color: #dc2626; font-size: 0.875rem; }
    .failed { background: #fef2f2; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Validación Placeholders — Día 11</h1>
    <p class="subtitle">20 diseños placeholder generados localmente (sin costo API)</p>
    <div class="stats">
      <div class="stat-card"><div class="number">${results.length}</div><div class="label">Total diseños</div></div>
      <div class="stat-card"><div class="number">${results.filter(r => r.success).length}</div><div class="label">Generados</div></div>
      <div class="stat-card"><div class="number">${results.filter(r => !r.success).length}</div><div class="label">Fallidos</div></div>
      <div class="stat-card"><div class="number">$0.00</div><div class="label">Costo API</div></div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Categoría</th><th>Producto</th><th>Vista previa</th><th>Calidad</th><th>Print</th><th>Alineación</th><th>Venta</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</body>
</html>`

  await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), html)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
