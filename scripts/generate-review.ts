import fs from 'node:fs/promises'
import path from 'node:path'

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'validacion')
const RESULTS_FILE = path.join(OUTPUT_DIR, 'resultados.json')
const REVIEW_HTML = path.join(OUTPUT_DIR, 'index.html')

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

async function generateReviewPage() {
  let results: GenerationResult[] = []

  try {
    const data = await fs.readFile(RESULTS_FILE, 'utf-8')
    results = JSON.parse(data)
  } catch {
    console.error('❌ No se encontró resultados.json. Ejecuta primero: npm run validate:batch')
    process.exit(1)
  }

  const successful = results.filter((r) => r.success)
  const failed = results.filter((r) => !r.success)

  const rows = results
    .map((r) => {
      if (!r.success) {
        return `
        <tr class="failed">
          <td>#${r.id}</td>
          <td>${r.category}</td>
          <td>${r.productType}</td>
          <td colspan="5" class="error">❌ ${r.error}</td>
        </tr>`
      }

      const fileName = r.filePath?.split('/').pop() || ''

      return `
        <tr>
          <td>#${r.id}</td>
          <td>${r.category}</td>
          <td>${r.productType}</td>
          <td>
            <img src="${fileName}" alt="Diseño #${r.id}" loading="lazy" />
            <div class="prompt">"${r.prompt}"</div>
          </td>
          <td>
            <select name="calidad-${r.id}">
              <option value="">—</option>
              <option value="5">5 Excelente</option>
              <option value="4">4 Muy buena</option>
              <option value="3">3 Aceptable</option>
              <option value="2">2 Deficiente</option>
              <option value="1">1 Inusable</option>
            </select>
          </td>
          <td>
            <select name="print-${r.id}">
              <option value="">—</option>
              <option value="5">5 Perfecto</option>
              <option value="4">4 Bueno</option>
              <option value="3">3 Aceptable</option>
              <option value="2">2 Problemático</option>
              <option value="1">1 No print-safe</option>
            </select>
          </td>
          <td>
            <select name="alineacion-${r.id}">
              <option value="">—</option>
              <option value="5">5 Exacto</option>
              <option value="4">4 Muy cercano</option>
              <option value="3">3 Similar</option>
              <option value="2">2 Poco relacionado</option>
              <option value="1">1 Nada que ver</option>
            </select>
          </td>
          <td>
            <select name="venta-${r.id}">
              <option value="">—</option>
              <option value="5">5 Lo compraría</option>
              <option value="4">4 Probablemente</option>
              <option value="3">3 Quizás</option>
              <option value="2">2 No</option>
              <option value="1">1 Definitivamente no</option>
            </select>
          </td>
        </tr>`
    })
    .join('')

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validación IA — Día 11</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #f5f5f5;
      color: #1a1a1a;
      padding: 2rem;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    h1 { font-size: 1.75rem; margin-bottom: 0.5rem; }
    .subtitle { color: #666; margin-bottom: 2rem; }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 1.25rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .stat-card .number { font-size: 2rem; font-weight: bold; color: #111; }
    .stat-card .label { color: #666; font-size: 0.875rem; margin-top: 0.25rem; }
    table {
      width: 100%;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border-collapse: collapse;
    }
    th {
      background: #111;
      color: white;
      padding: 0.75rem 1rem;
      text-align: left;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    td {
      padding: 1rem;
      border-bottom: 1px solid #eee;
      vertical-align: top;
    }
    tr:hover { background: #fafafa; }
    img {
      max-width: 180px;
      max-height: 180px;
      border-radius: 4px;
      display: block;
    }
    .prompt {
      margin-top: 0.5rem;
      font-size: 0.75rem;
      color: #666;
      font-style: italic;
      max-width: 180px;
    }
    select {
      padding: 0.375rem 0.5rem;
      border-radius: 4px;
      border: 1px solid #ddd;
      font-size: 0.875rem;
      min-width: 120px;
    }
    .error {
      color: #dc2626;
      font-size: 0.875rem;
    }
    .failed { background: #fef2f2; }
    .actions {
      margin-top: 2rem;
      text-align: center;
    }
    .btn {
      display: inline-block;
      background: #111;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      text-decoration: none;
      font-size: 0.875rem;
      margin: 0 0.5rem;
    }
    .btn:hover { background: #333; }
    .legend {
      margin-top: 1.5rem;
      padding: 1rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      font-size: 0.875rem;
    }
    .legend h3 { margin-bottom: 0.5rem; font-size: 1rem; }
    .legend p { margin: 0.25rem 0; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Validación IA — Día 11</h1>
    <p class="subtitle">Revisa cada diseño generado y califícalo en los 4 ejes</p>

    <div class="stats">
      <div class="stat-card">
        <div class="number">${results.length}</div>
        <div class="label">Total diseños</div>
      </div>
      <div class="stat-card">
        <div class="number">${successful.length}</div>
        <div class="label">Generados exitosamente</div>
      </div>
      <div class="stat-card">
        <div class="number">${failed.length}</div>
        <div class="label">Fallidos</div>
      </div>
      <div class="stat-card">
        <div class="number">$${(results.length * 0.04).toFixed(2)}</div>
        <div class="label">Costo estimado</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Categoría</th>
          <th>Producto</th>
          <th>Vista previa</th>
          <th>Calidad visual</th>
          <th>Print-ready</th>
          <th>Alineación</th>
          <th>Vendibilidad</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="legend">
      <h3>Cómo calificar</h3>
      <p><strong>Calidad visual:</strong> Nitidez, colores, composición general</p>
      <p><strong>Print-ready:</strong> Contraste, edges limpios, sin degradados problemáticos</p>
      <p><strong>Alineación:</strong> ¿La imagen refleja fielmente el prompt?</p>
      <p><strong>Vendibilidad:</strong> ¿Lo comprarías? ¿Se ve bien en el producto?</p>
      <p style="margin-top:0.75rem;color:#999;font-size:0.75rem;">
        Luego de calificar, copia tus puntuaciones a <code>scripts/review-template.md</code>
      </p>
    </div>

    <div class="actions">
      <a class="btn" href="/validacion/resultados.json" download>📥 Descargar JSON</a>
      <a class="btn" href="/validacion/review-template.md">📝 Plantilla de review</a>
    </div>
  </div>
</body>
</html>`

  await fs.writeFile(REVIEW_HTML, html)

  console.log('✅ Página de review generada:')
  console.log(`   ${REVIEW_HTML}`)
  console.log(`\nAbre este archivo en tu navegador para revisar las imágenes:`)
  console.log(`   file://${REVIEW_HTML}`)
}

generateReviewPage().catch((err) => {
  console.error(err)
  process.exit(1)
})
