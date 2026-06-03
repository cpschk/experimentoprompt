<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure
may all differ from your training data. Read the relevant guide in
`node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# pod-ia-platform

Plataforma POD: usuario describe idea → IA genera diseño → Printify imprime/envía.
Business model: $0.99 por generar (se descuenta si compra) + 60% markup.

**Stack:** Next.js 16 (App Router) · Supabase (PG + Auth + Storage) · Stripe ·
OpenAI DALL-E 3 · Printify API · Resend · Tailwind v4 · Zod · Vitest

## Comandos

```bash
npm run dev           # next dev (Turbopack, localhost:3000)
npm run build         # next build
npm run start         # next start
npm run lint          # ESLint flat config (eslint.config.mjs)
npm run typecheck     # tsc --noEmit
npm run test:run      # vitest run (no watch)
npm run test          # vitest (watch mode)
npm run test:coverage # vitest run --coverage (v8)
npm run test:ui       # vitest --ui
```

**Orden de verificación:** `lint → typecheck → test:run`

## Next.js 16 — Quirks específicos

- **`proxy.ts`** reemplaza `middleware.ts`; export `proxy` no `middleware`.
- **`params` es `Promise`** en route handlers: `const { id } = await params`.
- **Server Components por defecto.** `'use client'` solo cuando necesitas interactividad, hooks, o useEffect.
- **Tailwind v4** vía `@tailwindcss/postcss` (no tailwind.config.js).
- **ESLint flat config** en `eslint.config.mjs`.

## Supabase SSR — 3 clientes distintos

| Contexto | Archivo | API de cookies |
|---|---|---|
| Browser (Client Components) | `lib/supabase/client.ts` | `createBrowserClient` |
| Server Component / Route Handler | `lib/supabase/server.ts` | `cookies()` de next/headers |
| proxy.ts | `lib/supabase/middleware.ts` | `request.cookies` |

`proxy.ts` usa `getUser()` (no `getSession()`) — valida el token contra Supabase en cada request.

**Auth chain:** `proxy.ts` redirige a `/login` si no hay sesión → Dashboard layout hace segundo `getUser()` como doble protección → API routes verifican ownership individualmente.

## Testing — Patrones y mocks

- **Vitest** con `globals: true`, entorno `node`. Setup en `vitest.setup.ts` mockea `next/headers` globalmente.
- **Mocks compartidos** en `__tests__/__mocks__/services.ts`:
  `createMockStripe()`, `createMockSupabaseClient()`, `createMockOpenAI()`, `createMockFetch()`
- **Patrón para route tests:** importar `POST` y llamar con `new Request()`:
  ```ts
  vi.mock('@/lib/stripe')
  const response = await POST(new Request('http://localhost:3000/api/...', {
    method: 'POST',
    body: JSON.stringify({ ... }),
  }))
  ```
- **Env vars** se manipulan con `process.env.X = '...'` y se restauran en afterEach.

## Arquitectura clave

- **Precios centralizados** en `lib/pricing.ts` — única fuente de verdad para frontend y backend.
- **12 API routes** en `app/api/` — 11 POST, 1 GET. Flujo principal: `checkout-design` → `checkout-design/confirm` → `generate` → `checkout` → webhook Stripe → `printify/create-order`.
- **Stripe webhook** (`/api/webhooks/stripe`): verifica HMAC, maneja `checkout.session.completed`. Idempotencia via upsert en BD.
- **Printify orden**: crear producto en shop → crear orden referenciándolo. Fallback: orden queda `pending` en BD si faltan keys.
- **Emails silenciosos**: try/catch en todos los envíos — no bloquean el flujo principal.
- **Diseños en Supabase Storage**: bucket `designs`, path `{user_id}/{timestamp}.png`, RLS por carpeta.

## Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY / STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET
PRINTIFY_API_KEY / PRINTIFY_SHOP_ID
OPENAI_API_KEY (o REPLICATE_API_TOKEN)
RESEND_API_KEY
NEXT_PUBLIC_SITE_URL
```

## Referencias

- `docs/playbook-pod-ia.md` — documentación detallada del proyecto, schema BD, pricing, flujo UX
- `.env.example` — template completo con placeholders
- `SETUP_GUIDE.md` — pasos para configurar Supabase + Stripe + Printify
