import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface GenerateImageParams {
  prompt: string
  productType: string
}

export interface GenerateImageResult {
  imageUrl: string
  revisedPrompt: string
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

export async function generateImage({ prompt, productType }: GenerateImageParams): Promise<GenerateImageResult> {
  if (!openai.apiKey) {
    throw new Error('OPENAI_API_KEY no configurada')
  }

  const fullPrompt = `Create a print-ready design for a ${productType} based on this description: "${prompt}".${STYLE_GUIDE}`

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
    throw new Error('No se pudo generar la imagen')
  }

  return { imageUrl, revisedPrompt }
}
