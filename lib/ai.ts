export interface GenerateImageParams {
  prompt: string
  productType: string
}

export interface GenerateImageResult {
  imageUrl: string
  revisedPrompt: string
}

const PRODUCT_COLORS: Record<string, { from: string; to: string; emoji: string }> = {
  't-shirt': { from: '#1e3a5f', to: '#2d5a8e', emoji: '👕' },
  hoodie: { from: '#2d1b4e', to: '#5b3a8c', emoji: '🧥' },
  mug: { from: '#1b4e3a', to: '#3a8c6e', emoji: '☕' },
  'phone-case': { from: '#4e1b2d', to: '#8c3a5a', emoji: '📱' },
  poster: { from: '#4e3a1b', to: '#8c6e3a', emoji: '🖼️' },
}

function generateSvgPlaceholder(prompt: string, productType: string): string {
  const colors = PRODUCT_COLORS[productType] || PRODUCT_COLORS['t-shirt']
  const wrapper = (svg: string) =>
    `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`

  const lines = prompt
    .split(' ')
    .reduce<string[]>((acc, word) => {
      const last = acc[acc.length - 1]
      if (last && (last + ' ' + word).length <= 40) {
        acc[acc.length - 1] = last + ' ' + word
      } else {
        acc.push(word)
      }
      return acc
    }, [])
    .slice(0, 4)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${colors.from}"/>
      <stop offset="100%" stop-color="${colors.to}"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.12)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0.06)"/>
    </linearGradient>
    <filter id="shadow">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="rgba(0,0,0,0.3)"/>
    </filter>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Background gradient -->
  <rect width="1024" height="1024" fill="url(#bg)"/>

  <!-- Decorative circles -->
  <circle cx="200" cy="150" r="180" fill="rgba(255,255,255,0.03)"/>
  <circle cx="850" cy="850" r="250" fill="rgba(255,255,255,0.03)"/>
  <circle cx="800" cy="200" r="120" fill="rgba(255,255,255,0.02)"/>

  <!-- Dots pattern -->
  <g fill="rgba(255,255,255,0.04)">
    ${Array.from({ length: 8 }, (_, i) =>
      Array.from({ length: 8 }, (_, j) =>
        `<circle cx="${64 + j * 128}" cy="${64 + i * 128}" r="3"/>`
      ).join('\n    ')
    ).join('\n    ')}
  </g>

  <!-- Card background -->
  <rect x="112" y="212" width="800" height="600" rx="32" fill="url(#card)" stroke="rgba(255,255,255,0.15)" stroke-width="1" filter="url(#shadow)"/>

  <!-- Product emoji -->
  <text x="512" y="400" font-size="120" text-anchor="middle" filter="url(#glow)">${colors.emoji}</text>

  <!-- Product type tag -->
  <rect x="412" y="440" width="200" height="40" rx="20" fill="rgba(255,255,255,0.15)"/>
  <text x="512" y="468" font-size="18" fill="rgba(255,255,255,0.8)" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="600">${productType.toUpperCase()}</text>

  <!-- Prompt lines -->
  <g text-anchor="middle" font-family="system-ui, sans-serif" fill="rgba(255,255,255,0.9)">
    ${lines.map((line, i) =>
      `<text x="512" y="${540 + i * 38}" font-size="${i === 0 ? 24 : 20}" font-weight="${i === 0 ? '700' : '400'}">${escapeXml(line)}</text>`
    ).join('\n    ')}
  </g>

  <!-- Placeholder badge -->
  <rect x="362" y="720" width="300" height="36" rx="18" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
  <text x="512" y="744" font-size="14" fill="rgba(255,255,255,0.6)" text-anchor="middle" font-family="system-ui, sans-serif">⚡ Preview UI · Placeholder</text>
</svg>`

  return wrapper(svg)
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  const { prompt, productType } = params
  const imageUrl = generateSvgPlaceholder(prompt, productType)

  return { imageUrl, revisedPrompt: prompt }
}
