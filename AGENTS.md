<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# AGENTS.md — pod-ia-platform

## Descripción del proyecto
Plataforma web donde un usuario describe una idea, la IA genera un diseño personalizado, y el sistema lo imprime y envía automáticamente vía Printify, sin intervención humana.

Modelo de negocio: $0.99 por generar diseño (se descuenta si compra) + markup 60% sobre costo de producción.

## Stack tecnológico
- **Frontend/Backend:** Next.js 16 (App Router), TypeScript
- **Base de datos:** Supabase (PostgreSQL) + Supabase Storage
- **Autenticación:** Supabase Auth (Google OAuth)
- **Pagos:** Stripe (Checkout Sessions + Webhooks)
- **POD:** Printify API (REST)
- **IA:** OpenAI DALL-E 3 / Replicate (SDXL)
- **Hosting:** Vercel
- **Emails:** Resend

## Estructura del proyecto
```
pod-ia-platform/
├── app/
│   ├── (marketing)/        # Landing page
│   ├── (dashboard)/        # Dashboard protegido (auth)
│   │   ├── generar/        # Input + pago $0.99 + IA genera
│   │   ├── disenos/        # Historial de diseños
│   │   └── ordenes/        # Estado de órdenes
│   ├── api/
│   │   ├── generate/       # POST → OpenAI/Replicate
│   │   ├── checkout/       # POST → Stripe Session
│   │   ├── webhooks/
│   │   │   └── stripe/     # POST → Confirma pago
│   │   └── printify/
│   │       └── order/      # POST → Printify API
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                 # Componentes base (Button, Input, Card)
│   ├── products/           # ProductCard, ProductSelector
│   ├── design/             # DesignPreview, MockupViewer
│   └── checkout/           # StripePayment, CheckoutForm
├── lib/
│   ├── stripe.ts           # Cliente Stripe
│   ├── supabase.ts         # Cliente Supabase
│   ├── printify.ts         # Cliente Printify API
│   ├── pricing.ts          # Config de productos + precios
│   └── ai.ts               # Cliente OpenAI/Replicate
├── types/
│   └── index.ts            # Tipos compartidos
├── public/
│   └── images/             # Assets estáticos
├── docs/
│   └── playbook-pod-ia.md  # Base de conocimiento del proyecto
├── .opencode/
│   └── skills/email/       # Skill para enviar emails
├── AGENTS.md               # Este archivo
└── package.json
```

## Comandos
```bash
npm run dev        # Iniciar servidor de desarrollo (localhost:3000)
npm run build      # Build de producción
npm run start      # Servir build de producción
npm run lint       # ESLint
npm run typecheck  # TypeScript check (tsc --noEmit)
```

## Convenciones de código

### Estilo general
- TypeScript estricto, evitar `any`
- Componentes funcionales con arrow functions
- Nombres en inglés para código, español para contenido visible al usuario
- Props tipadas con interface (no type)
- Un componente por archivo
- Archivos en kebab-case, componentes en PascalCase

### Componentes
```typescript
// Preferir Server Components por defecto, Client Components solo cuando
// se necesita interactividad, hooks, o useEffect
// Marcar Client Components con "use client" al inicio del archivo

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return <button className={...} onClick={onClick}>{children}</button>
}
```

### API Routes
- Validar input siempre (Zod recomendado)
- Manejar errores con try/catch
- Responder con `{ data }` o `{ error }` consistente
- Usar HTTP status codes correctos (200, 201, 400, 401, 500)

### Base de datos
- Tablas: users, designs, orders (ver docs/playbook-pod-ia.md)
- Usar RLS (Row Level Security) en Supabase
- Políticas RLS por user_id

### IA
- Prompt engineering: pedir fondos transparentes, 3-4 colores máximo, centrado
- Cachear prompts exitosos para reuso
- Rate limiting: max 5 generaciones por minuto por usuario

### Pagos
- Stripe en modo test para desarrollo
- Webhooks verificados con firma HMAC
- Idempotencia en webhooks (evitar órdenes duplicadas)

## Flujo de resolución autónoma

Ante cualquier problema técnico u obstáculo durante el desarrollo:

1. **Intentar resolver con chrome-devtools** — navegar, inspeccionar, diagnosticar errores visualmente.
2. **Si lo resuelvo** → Enviar email de aprobación explicando la solución encontrada y esperar respuesta antes de ejecutar cambios importantes.
3. **Si no lo resuelvo** → Enviar email de bloqueo explicando qué intenté, qué falló, y qué necesito del usuario.

## Variables de entorno requeridas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PRINTIFY_API_KEY`
- `PRINTIFY_SHOP_ID`
- `OPENAI_API_KEY` (o `REPLICATE_API_TOKEN`)
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Reglas para la IA
- Preguntar antes de crear/eliminar archivos importantes
- No modificar .env.local sin aprobación
- Mantener el playbook en docs/ actualizado
- Todas las API keys van en .env.local, nunca hardcodeadas
- Preferir Server Components sobre Client Components
- Al agregar dependencias, justificar por qué se necesita
