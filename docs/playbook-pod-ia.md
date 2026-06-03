# PLAYBOOK: Plataforma POD con IA Generativa

> Versión: 1.0
> Creado: 29 Mayo 2026
> Propósito: Base de conocimiento reutilizable para construir una plataforma de print-on-demand con generación de imágenes por IA.

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Sistema](#3-arquitectura-del-sistema)
4. [Modelo de Negocio](#4-modelo-de-negocio)
5. [Flujo del Usuario](#5-flujo-del-usuario)
6. [Plan de Ejecución (Día a Día)](#6-plan-de-ejecución-día-a-día)
7. [APIs y Servicios Externos](#7-apis-y-servicios-externos)
8. [Estructura de Base de Datos](#8-estructura-de-base-de-datos)
9. [Cálculo de Precios y Márgenes](#9-cálculo-de-precios-y-márgenes)
10. [Lecciones Aprendidas](#10-lecciones-aprendidas)
11. [Próximos Pasos Post-Lanzamiento](#11-próximos-pasos-post-lanzamiento)

---

## 1. Resumen Ejecutivo

### ¿Qué construimos?
Plataforma web donde un usuario describe una idea, la IA genera un diseño personalizado, y el sistema lo imprime y envía automáticamente vía Printify, sin intervención humana.

### Modelo de monetización
- $0.99 por generar el diseño (se descuenta si compra)
- Markup del 50-70% sobre el costo de producción
- Ganancia neta por venta: ~$13-22 según producto

### Inversión inicial
- $0 en suscripciones (todo plan gratis)
- ~$5 para probar API de IA (DALL-E 3)
- Tiempo: 15 días hábiles

---

## 2. Stack Tecnológico

| Capa | Tecnología | Por qué |
|---|---|---|
| Frontend + Backend | Next.js 14 (App Router) | Full-stack unificado, serverless en Vercel |
| Base de datos | Supabase (PostgreSQL) | Plan gratis generoso, autenticación incluida |
| Storage (imágenes) | Supabase Storage | Mismo ecosistema que la BD |
| Autenticación | Supabase Auth (Google OAuth) | Setup en minutos, gratis |
| Pagos | Stripe (Checkout + Webhooks) | Estándar de la industria, sin cuota mensual |
| POD (impresión) | Printify API | Precios más bajos del mercado, 1300+ productos |
| IA generativa | OpenAI DALL-E 3 o Replicate (SDXL) | Mejor calidad/precio por imagen (~$0.04-0.08) |
| Hosting | Vercel (Plan Gratis) | Deploy automático desde GitHub, 100GB ancho banda |
| Emails | Resend (Plan Gratis) | 100 emails/día gratis, SDK para Next.js |
| Dominio | subdominio.vercel.app (gratis inicial) | Post-lanzamiento: dominio propio ~$10/año |

---

## 3. Arquitectura del Sistema

```
[Usuario] → nextjs.vercel.app
                 ↓
            Next.js App
            ├── / (Landing page)
            ├── /generar (Input + pago $0.99 + IA genera)
            ├── /checkout (Stripe Checkout)
            ├── /dashboard (Historial de diseños y órdenes)
            └── /api/
                ├── /generate      → POST → OpenAI/Replicate
                ├── /checkout      → POST → Stripe Session
                ├── /webhooks/stripe → POST → Confirma pago
                └── /printify/order  → POST → Printify API
                 ↓
         ┌──────┴──────┐
         ↓              ↓
    Supabase (BD)   Stripe (Pagos)
         ↓
    Printify API (Producción + Envío)
```

### Flujo de datos (end-to-end)

```
1. GET  / → Landing page
2. GET  /generar → Selector de producto + Textarea de prompt
3. POST /api/checkout-design → Stripe Payment $0.99
4. POST /api/generate → {prompt, product_type} → DALL-E 3 → imagen
5. POST /api/upload → Guarda imagen en Supabase Storage
6. GET  /preview → Muestra diseño + mockup al usuario
7. POST /api/checkout → Stripe Checkout Session (precioProducto - $0.99)
8. POST /api/webhooks/stripe → checkout.session.completed
9. POST /api/printify/create-order → {image_url, address, variant}
10. Printify → produce → envía → tracking number
11. Email al usuario: "Tu pedido está en camino"
```

---

## 4. Modelo de Negocio

### Propuesta de valor
"Describe tu idea. Nuestra IA la convierte en un diseño único. Lo imprimimos en camisetas, hoodies, tazas y más. Te lo enviamos a casa."

### Flujo de monetización
1. Usuario paga $0.99 para generar el diseño (filtro anti-spam)
2. IA genera la imagen (costo real: ~$0.05-0.08)
3. Ganancia en generación fallida: ~$0.91 (no compra el producto)
4. Si compra el producto: los $0.99 se descuentan del total
5. Stripe retiene todo el pago
6. Sistema paga a Printify desde tu tarjeta vinculada
7. Tu ganancia neta se queda en Stripe

### Tasa de conversión estimada
- 100 visitas → 20 generan diseño ($0.99) → 5 compran producto
- Ingreso: 20 × $0.99 + 5 × (~$18 ganancia) = $19.80 + $90 = $109.80
- Costo IA: 20 × $0.06 = $1.20
- Margen neto: ~99%

---

## 5. Flujo del Usuario

### Pantalla 1: Landing
- Hero: "Tu idea, impresa." + descripción
- 3 pasos: Describe → Genera → Recibe
- Botón CTA: "Crear mi diseño"

### Pantalla 2: Generar diseño
- Selector de producto (grid visual): Camiseta, Hoodie, Taza, Funda, Póster
- Textarea: "Describe tu idea para el diseño..."
- Botón: "Generar diseño — $0.99"
- Stripe Payment Element por $0.99
- Loading state mientras la IA genera
- Resultado: Imagen generada + mockup automático sobre el producto

### Pantalla 3: Checkout
- Resumen: diseño + producto elegido + precio final
- Formulario: dirección de envío
- Stripe Checkout: pago completo (precioProducto - $0.99)
- Confirmación: "¡Pedido recibido! Recibirás un email con el tracking."

### Pantalla 4: Dashboard (requiere login)
- Tus diseños (grid con todos los generados)
- Estado de cada orden: Pendiente / En producción / Enviado
- Tracking number cuando esté disponible
- Botón: Descargar diseño original

---

## 6. Plan de Ejecución (Día a Día)

### DÍA 1 — Fundaciones del proyecto
**Fecha:** 29 Mayo 2026
**Duración:** ~1 hora
**Estado:** ✅ Completado

**Qué se hizo:**
- Creación del proyecto Next.js 16 con App Router, TypeScript y Tailwind CSS v4
- Instalación de dependencias: @supabase/supabase-js, stripe, @stripe/stripe-js, resend, zod
- Configuración de variables de entorno (.env.local con placeholders + .env.example documentado)
- Creación de estructura de carpetas completa según AGENTS.md:
  - `components/ui/`, `components/products/`, `components/design/`, `components/checkout/`
  - `lib/` (clientes), `types/` (tipos compartidos)
  - `app/api/`, `app/(marketing)/`, `app/(dashboard)/`
- Configuración de clientes:
  - `lib/supabase.ts` → Cliente Supabase con createClient (server-side)
  - `lib/stripe.ts` → Cliente Stripe server-side + loadStripe para browser
  - `types/index.ts` → Interfaces: User, Design, Order, ProductType, ApiResponse
- Actualización de .gitignore para permitir .env.example (excluye .env, .env.local, .env.*.local)
- Configuración de opencode.json con instructions (AGENTS.md + docs/playbook-pod-ia.md)
- Git init + commit inicial: "Día 1: Fundaciones — Next.js 16 + Supabase + Stripe + estructura inicial"
- Verificación: build y typecheck pasan sin errores

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `lib/supabase.ts` | Cliente Supabase (createClient con anon key) |
| `lib/stripe.ts` | Cliente Stripe server (Stripe SDK) + browser (loadStripe) |
| `types/index.ts` | Interfaces: User, Design, Order, ProductType, DesignStatus, OrderStatus, ApiResponse |
| `.env.example` | Template de variables de entorno (sin secrets reales) |
| `.gitignore` | Actualizado: excluye .env, .env.local, .env.*.local (permite .env.example) |
| `opencode.json` | Config proyecto: instructions + skills path |

**Comandos ejecutados:**
```bash
# Scaffolding
npx create-next-app@latest temp-pod --typescript --tailwind --eslint --app
Copy-Item -Path "temp-pod\*" -Destination "." -Recurse -Force
Remove-Item -Recurse -Force temp-pod

# Dependencias
npm install @supabase/supabase-js @stripe/stripe-js stripe resend zod
npm install -D @types/stripe

# Verificación
npm run build      # ✓ Compiled successfully (Turbopack)
npm run typecheck   # ✓ Sin errores

# Git
git add -A && git commit -m "Día 1: Fundaciones — Next.js 16 + Supabase + Stripe + estructura inicial"
```

**Notas técnicas importantes:**
- `create-next-app@16` genera automáticamente un AGENTS.md con header `<!-- BEGIN:nextjs-agent-rules -->`. Este header es importante y debe preservarse, porque indica que Next.js tiene breaking changes respecto a lo que la IA conoce de versiones anteriores.
- Stripe SDK requiere typescript: true pero la apiVersion debe omitirse (usa la latest automáticamente) o coincidir exactamente con la versión del SDK instalado.
- Next.js 16 usa Turbopack para build (más rápido que webpack, ~6s para proyecto nuevo).

### DÍA 2 — Base de Datos + Autenticación
**Fecha:** 29 Mayo 2026
**Duración:** ~30 min
**Estado:** ✅ Completado

**Qué se hizo:**
- Instalación de `@supabase/ssr` (paquete oficial para SSR con Next.js)
- Reestructuración de clientes Supabase:
  - `lib/supabase/client.ts` → Browser client (createBrowserClient)
  - `lib/supabase/server.ts` → Server component client (cookies API)
  - `lib/supabase/middleware.ts` → Proxy/middleware helper (updateSession)
- Creación de `proxy.ts` (Next.js 16 renombró middleware → proxy):
  - Exporta función `proxy` que llama a updateSession
  - Config matcher para excluir _next/static, _next/image, favicon, assets
  - Redirige a /login si no hay sesión
- Migración SQL completa en `supabase/migrations/001_initial_schema.sql`:
  - Tablas: users, designs, orders con FK, constraints, índices
  - Row Level Security (RLS) activado en todas las tablas
  - Políticas: cada usuario solo ve/modifica sus propios datos
  - Trigger: auto-creación de perfil al registrarse (handle_new_user)
- Página de login (`app/auth/login/page.tsx`):
  - Client Component con botón "Continuar con Google"
  - Icono SVG de Google, loading state, redirect post-login
  - Redirección automática si ya hay sesión
- Auth callback (`app/auth/callback/route.ts`):
  - Intercambia code por sesión (exchangeCodeForSession)
  - Redirige a la página solicitada o /
- Signout (`app/auth/signout/route.ts`): Server Action POST que cierra sesión
- Dashboard layout (`app/(dashboard)/layout.tsx`):
  - Server Component que verifica auth con getUser()
  - Redirect a /login si no autenticado
  - Header con nav: Generar, Mis diseños, Órdenes, Cerrar sesión
- Landing page (`app/page.tsx`): Hero + 3 pasos + CTA "Crear mi diseño"
- Placeholder pages: /generar, /disenos, /ordenes

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `proxy.ts` | Proxy Next.js 16 (reemplaza middleware.ts) — protege rutas privadas |
| `lib/supabase/client.ts` | Cliente Supabase para browser (createBrowserClient) |
| `lib/supabase/server.ts` | Cliente Supabase para Server Components (cookies) |
| `lib/supabase/middleware.ts` | Helper updateSession para proxy |
| `supabase/migrations/001_initial_schema.sql` | Schema completo: tablas + RLS + políticas + trigger |
| `app/auth/login/page.tsx` | Login con Google OAuth |
| `app/auth/callback/route.ts` | Callback OAuth (intercambia code → session) |
| `app/auth/signout/route.ts` | POST para cerrar sesión |
| `app/(dashboard)/layout.tsx` | Layout protegido con header y nav |
| `app/(dashboard)/generar/page.tsx` | Placeholder generar diseño |
| `app/(dashboard)/disenos/page.tsx` | Placeholder historial |
| `app/(dashboard)/ordenes/page.tsx` | Placeholder órdenes |

**Archivos eliminados:**
| Archivo | Razón |
|---|---|
| `lib/supabase.ts` | Reemplazado por lib/supabase/client.ts + server.ts + middleware.ts |

**Comandos ejecutados:**
```bash
npm install @supabase/ssr
npm run build      # ✓ Compiled successfully (8s)
npm run typecheck   # ✓ Sin errores
```

**Notas técnicas importantes:**
- Next.js 16 **renombró** `middleware.ts` → `proxy.ts` y el export `middleware` → `proxy`. Usar el nombre antiguo genera warning de deprecación.
- El paquete `@supabase/ssr` es el reemplazo moderno de `@supabase/supabase-js` para proyectos Next.js con SSR. Maneja cookies automáticamente.
- En Supabase SSR, hay 3 contextos distintos: browser (client.ts), server component (server.ts), y middleware/proxy (middleware.ts). Cada uno usa una API de cookies diferente.
- El trigger `handle_new_user` en la migración SQL asegura que el perfil se cree automáticamente al registrarse. No se necesita lógica extra en la app.
- El proxy usa `getUser()` (no `getSession()`) porque verifica el token con Supabase en cada request, más seguro.
- Rutas protegidas: proxy.ts redirige a /login si no hay sesión. Dashboard layout también verifica como doble seguridad.

### DÍA 3 — Interfaz de Usuario (Frontend)
**Fecha:** 29 Mayo 2026
**Duración:** ~30 min
**Estado:** ✅ Completado

**Qué se hizo:**
- Creación de componentes base reutilizables:
  - `components/ui/Button.tsx` — Botón con variantes (primary, secondary, ghost), loading spinner, estados disabled
  - `components/ui/Card.tsx` — Card con estado selected, hover, onClick opcional
- Creación de componentes de producto:
  - `components/products/ProductCard.tsx` — Tarjeta individual: emoji, nombre, descripción, precio calculado
  - `components/products/ProductSelector.tsx` — Grid responsive (2-5 columnas) que renderiza todos los productos
- Creación de componente de preview:
  - `components/design/DesignPreview.tsx` — 3 estados: empty (placeholder icon), loading (spinner), loaded (imagen)
- Configuración de precios en `lib/pricing.ts`:
  - Catálogo completo: 5 productos con costos reales de Printify
  - Función `calculatePrice()`: costo base + envío + $0.99 diseño × 1.6 markup
  - Función `calculateProfit()`: precio venta - costos - stripe fee - IA cost
- Página `/generar` completamente funcional (frontend):
  - Paso 1: Selector de producto grid (5 productos)
  - Paso 2: Textarea de prompt con placeholder y sugerencias
  - Paso 3: Preview del diseño con estados vacío/loading/imagen
  - Botón "Generar diseño — $0.99" deshabilitado hasta elegir producto + escribir prompt
  - Botón "Comprar este diseño" que aparece después de generar
  - Nota informativa sobre el descuento de $0.99 al comprar

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `components/ui/Button.tsx` | Botón reusable con variantes y loading |
| `components/ui/Card.tsx` | Card reusable con selección |
| `components/products/ProductCard.tsx` | Tarjeta de producto individual |
| `components/products/ProductSelector.tsx` | Grid de selección de producto |
| `components/design/DesignPreview.tsx` | Preview de diseño (empty/loading/image) |
| `lib/pricing.ts` | Config de productos + cálculos de precio/ganancia |

**Comandos ejecutados:**
```bash
npm run build      # ✓ Compiled successfully (7.3s)
npm run typecheck   # ✓ Sin errores
```

**Notas técnicas:**
- Todos los componentes de UI son Client Components ('use client') porque manejan estado interactivo
- El grid de productos usa CSS Grid responsive: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`
- El cálculo de precios está centralizado en `lib/pricing.ts` para mantener consistencia entre frontend y backend
- El botón de generar se deshabilita hasta que producto AND prompt tengan valor, evitando llamadas inválidas a la API de IA

### DÍA 4 — Integración de IA (Generación de imágenes)
**Fecha:** 29 Mayo 2026
**Duración:** ~20 min
**Estado:** ✅ Completado

**Qué se hizo:**
- Instalación del SDK de OpenAI (`npm install openai`)
- Creación de `lib/ai.ts` — Cliente de IA con:
  - Función `generateImage({ prompt, productType })` que llama a DALL-E 3
  - Prompt engineering con guía de estilo para print-ready (3-4 colores, centrado, sin texto, fondo transparente)
  - Manejo de error si no hay API key configurada
- Creación de API route `app/api/generate/route.ts`:
  - POST handler que recibe `{ prompt, product_type }`
  - Validación de input con Zod (mínimo 3 caracteres para prompt)
  - Manejo de errores específicos: API key no configurada (500), rate limiting (429), content policy (400)
  - Respuesta consistente `{ data: { imageUrl, revisedPrompt } }` o `{ error }`
- Conexión del frontend `/generar` a la API real:
  - Reemplazo del timeout simulado por llamada fetch a `/api/generate`
  - Manejo de estados: loading, error, success
  - Display de errores en UI con componente de alerta roja
- Creación de API route `app/api/process-image/route.ts`:
  - Descarga y validación de imagen (tamaño mínimo 500KB)
  - Retorna metadatos: fileSize, contentType, printReady status
  - Advertencias si la imagen es muy pequeña para impresión

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `lib/ai.ts` | Cliente OpenAI con prompt engineering para DALL-E 3 |
| `app/api/generate/route.ts` | API route que recibe prompt y llama a DALL-E 3 |
| `app/api/process-image/route.ts` | API route que valida imagen para print-ready |

**Comandos ejecutados:**
```bash
npm install openai
npm run build      # ✓ Compiled successfully (8.9s)
```

**Notas técnicas:**
- DALL-E 3 cuesta ~$0.04 por imagen (standard 1024x1024). Se puede cambiar a Replicate (SDXL) para ahorrar (~$0.002).
- El prompt engineering en `lib/ai.ts` pide explícitamente: bold, high contrast, 3-4 colors, centered, no text, transparent background. Esto mejora la calidad para DTG printing.
- Los errores de content policy de OpenAI se traducen a mensajes amigables en español para el usuario.
- El API route usa `response_format: 'url'` que expira en ~1 hora. Para almacenamiento permanente, se subirá a Supabase Storage en Día 5.

### DÍA 5 — Procesamiento de imagen para print
**Fecha:** 29 Mayo 2026
**Duración:** ~20 min
**Estado:** ✅ Completado

**Qué se hizo:**
- Creación de API route `app/api/upload/route.ts`:
  - Recibe `{ imageUrl, prompt, productType }`
  - Descarga la imagen desde la URL temporal de DALL-E
  - Sube a Supabase Storage bucket `designs/`
  - Guarda registro en tabla `designs` con URL pública
  - Retorna URL permanente de Supabase
- Integración del upload en el flujo de generación (`app/api/generate/route.ts`):
  - Después de generar con DALL-E, descarga y sube automáticamente a Supabase Storage
  - El frontend recibe directamente la URL permanente
  - El diseño queda registrado en la BD con user_id, prompt, image_url, product_type
- Actualización de página `/disenos`:
  - Server Component que consulta `designs` por user_id
  - Grid de diseños con imagen, prompt, tipo de producto, status
  - Estado vacío con link a /generar si no hay diseños
  - Status con colores: generated (yellow), paid (blue), ordered (purple), shipped (green)
- Migración SQL actualizada con instrucciones para crear Storage bucket `designs`

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `app/api/upload/route.ts` | API route que sube imagen a Supabase Storage + registra en BD |

**Archivos modificados:**
| Archivo | Cambio |
|---|---|
| `app/api/generate/route.ts` | Ahora sube a Storage + registra en BD automáticamente |
| `app/(dashboard)/disenos/page.tsx` | Server Component que muestra diseños reales desde Supabase |
| `supabase/migrations/001_initial_schema.sql` | Agregadas instrucciones para Storage bucket + RLS policy |

**Comandos ejecutados:**
```bash
npm run build      # ✓ Compiled successfully (15s)
npm run typecheck   # ✓ Sin errores
```

**Notas técnicas:**
- Supabase Storage requiere crear el bucket `designs` manualmente desde el Dashboard, no via SQL.
- La RLS policy para Storage es: `auth.uid()::text = (storage.foldername(name))[1]` — así cada usuario solo ve sus propios archivos.
- El archivo se nombra como `{user_id}/{timestamp}.png` para evitar colisiones y permitir RLS por carpeta.
- DALL-E devuelve URLs temporales (~1 hora). Es crítico subir a Storage inmediatamente después de generar para no perder la imagen.
- `renderToString` de Server Components permite que la página /disenos sea dinámica (carga datos en cada request).

### DÍA 6 — Cliente Printify + Catalog API
**Fecha:** 29 Mayo 2026
**Duración:** ~15 min
**Estado:** ✅ Completado

**Qué se hizo:**
- Creación de `lib/printify.ts` — Cliente completo de la API REST de Printify con:
  - Funciones para catálogo: `getShops()`, `getCatalogBlueprints()`, `getBlueprintVariants()`
  - Funciones para productos en tienda: `getShopProducts()`
  - Funciones para órdenes: `createOrder()`, `getOrder()`
  - Tipados completos para todas las respuestas (PrintifyShop, PrintifyBlueprint, PrintifyVariant, PrintifyProduct, PrintifyOrder)
  - Manejo de errores con HTTP status codes
  - Cabeceras de autenticación con Bearer token desde env variable
- Actualización de `lib/pricing.ts` — Agregados campos Printify a cada producto:
  - `printify.blueprintId`: ID del blueprint en Printify (t-shirt=6, hoodie=37, mug=2, phone-case=36, poster=25)
  - `printify.printProviderId`: ID del print provider (default 0, se configura con Printify account real)
  - `printify.variantMapping`: Mapa de variante {talla|color} → variantId (empty, se llena con configure endpoint)
  - Nueva interfaz `PrintifyConfig` con estos campos
- Creación de `app/api/printify/catalog/route.ts`:
  - GET /api/printify/catalog → lista todos los blueprints del catálogo Printify
  - GET /api/printify/catalog?blueprintId=X&printProviderId=Y → lista variantes de un blueprint+provider
  - Respuesta consistente `{ data }` o `{ error }`
- Creación de `app/api/printify/configure/route.ts`:
  - GET /api/printify/configure → auto-descubre y mapea variantes Printify a nuestro catálogo
  - Para cada producto en pricing.ts, busca el blueprint y sus variantes
  - Intenta matchear automáticamente size + color a las variantes Printify
  - Retorna JSON completo listo para copiar a variantMapping
  - Incluye lista de shops disponibles
- Verificación: typecheck y lint pasan sin errores

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `lib/printify.ts` | Cliente Printify API (catálogo, productos, órdenes) |
| `app/api/printify/catalog/route.ts` | API route para explorar catálogo Printify |
| `app/api/printify/configure/route.ts` | API route para auto-configurar variant mappings |

**Archivos modificados:**
| Archivo | Cambio |
|---|---|
| `lib/pricing.ts` | Agregados campos `printify` (blueprintId, printProviderId, variantMapping) a cada producto |

**Comandos ejecutados:**
```bash
npm run typecheck   # ✓ Sin errores
npm run lint        # ✓ Sin errores (0 errors, 6 warnings pre-existentes)
```

**Notas técnicas importantes:**
- Printify requiere 3 IDs para identificar una variante: blueprintId (tipo de producto), printProviderId (quién lo imprime), variantId (talla/color específico)
- Los blueprint IDs usados son IDs estándar del catálogo Printify: Bella+Canvas 3001 (6), Champion G100 (37), mug cerámica 11oz (2), funda iPhone (36), póster semimate (25)
- `printProviderId` se deja en 0 porque depende del print provider que tenga configurado el usuario en su tienda Printify real
- El endpoint `/configure` intenta auto-descubrir los variant IDs comparando título de variante con size+color, pero requiere una API key válida de Printify para funcionar
- Se necesita crear cuenta en Printify + generar API key + agregar PRINTIFY_API_KEY a .env.local para que estas rutas funcionen

### DÍA 7 — Stripe Checkout (Pago $0.99 + Pago completo)
**Fecha:** 29 Mayo 2026
**Duración:** ~20 min
**Estado:** ✅ Completado

**Qué se hizo:**
- **Flujo de pago de $0.99 (generación):**
  - `app/api/checkout-design/route.ts` — POST endpoint que:
    - Verifica autenticación del usuario
    - Valida prompt (min 3 chars) y product_type
    - Crea Stripe Checkout Session por $0.99 (unit_amount: 99)
    - Guarda metadata: prompt, product_type, user_id
    - Retorna `{ url, session_id }` para redirigir a Stripe
  - `app/api/checkout-design/confirm/route.ts` — POST endpoint que:
    - Recibe `{ session_id }` después del pago exitoso
    - Recupera la sesión de Stripe y verifica `payment_status === 'paid'`
    - Confirma que la sesión pertenece al usuario autenticado
    - Lee metadata (prompt, product_type) de la sesión
    - Llama a DALL-E 3 para generar la imagen
    - Sube la imagen a Supabase Storage (`{user_id}/{timestamp}.png`)
    - Crea registro en tabla `designs` con status='generated'
    - Retorna `{ design: { id, image_url, prompt, ... } }`
- **Flujo de pago completo (compra de producto):**
  - `app/api/checkout/route.ts` — POST endpoint que:
    - Verifica autenticación
    - Recibe `{ design_id, product_type, variant_id }`
    - Calcula precio final: `calculatePrice(productType) - $0.99`
    - Crea Stripe Checkout Session con el precio descontado
    - Guarda metadata: design_id, user_id, product_type, variant_id
    - Retorna `{ url }` para redirigir a Stripe
- **Webhook de Stripe:**
  - `app/api/webhooks/stripe/route.ts` — POST endpoint que:
    - Verifica firma HMAC con `STRIPE_WEBHOOK_SECRET`
    - Maneja `checkout.session.completed` para:
      - **Diseño ($0.99):** Lee metadata, genera imagen con DALL-E 3, sube a Storage, crea design record (fallback silencioso si el frontend ya lo hizo)
      - **Producto:** Crea orden en tabla `orders`, actualiza diseño a status='paid'
    - Siempre retorna 200 OK (Stripe espera confirmación)
- **Frontend actualizado (`/generar`):**
  - Nuevo flujo de 3 pasos: (1) Pagar $0.99 → (2) Stripe redirect → (3) IA genera
  - `PaymentConfirmer` component: maneja la confirmación post-pago
  - Botón "Comprar este diseño" llama a `/api/checkout` con el design_id
  - Manejo de estados: loading, error, confirmación pendiente
  - URL params `?success=true&session_id=xxx` para detectar retorno de Stripe
  - `router.replace('/generar')` después de confirmar para limpiar URL params

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `app/api/checkout-design/route.ts` | Crea Stripe Session por $0.99 para generar diseño |
| `app/api/checkout-design/confirm/route.ts` | Verifica pago + genera diseño con IA |
| `app/api/checkout/route.ts` | Crea Stripe Session para compra de producto ($ - $0.99) |
| `app/api/webhooks/stripe/route.ts` | Webhook Stripe (verifica firma, actualiza BD) |

**Archivos modificados:**
| Archivo | Cambio |
|---|---|
| `app/(dashboard)/generar/page.tsx` | Integración completa del flujo de pago Stripe |

**Comandos ejecutados:**
```bash
npm run typecheck   # ✓ Sin errores
npm run lint        # ✓ 0 errores, 6 warnings pre-existentes
```

**Notas técnicas importantes:**
- El flujo de pago es: Click "Generar" → Stripe Checkout Session ($0.99) → Redirect a Stripe → Pay → Redirect a /generar?success=true → Confirm endpoint → DALL-E genera → Supabase Storage → Diseño visible
- Para que Stripe funcione en desarrollo, se necesita `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI) o usar webhook forwarding manual
- El webhook usa `constructEvent` que requiere `STRIPE_WEBHOOK_SECRET`. Sin este secret, el webhook no funciona (retorna 400)
- El endpoint `/confirm` verifica que la sesión de Stripe pertenezca al usuario autenticado (comparando metadata.user_id con user.id). Esto evita que un usuario confirme el pago de otro.
- El diseño se genera descontando $0.99 del precio final (`calculatePrice - 0.99`). Si no hay diseño fee pagado, el precio completo aplica.
- El `PaymentConfirmer` component usa un `useRef` para evitar llamadas duplicadas al endpoint de confirmación en Strict Mode de React 18.

### DÍA 8 — Integración Printify (Órdenes automáticas)
**Fecha:** 29 Mayo 2026
**Duración:** ~20 min
**Estado:** ✅ Completado

**Qué se hizo:**
- **`lib/printify.ts` — Nueva función `createPrintifyProduct`:**
  - `POST /v1/shops/{shop_id}/products.json` para crear un producto con el diseño personalizado
  - Parámetros: shopId, title, blueprintId, printProviderId, variantIds[], imageUrl
  - Configura print_areas con la imagen del diseño en posición "front"
  - Retorna el ID del producto creado en Printify
- **`app/api/checkout/route.ts` — Actualizado con shipping address:**
  - Agregado `shipping_address_collection` a la Stripe Checkout Session
  - Países permitidos: US, MX, ES, AR, CO, CL, PE
  - Stripe recolecta dirección de envío durante el checkout
- **`app/api/printify/create-order/route.ts` — Orden automática Printify:**
  - POST endpoint que recibe `{ design_id, stripe_session_id }`
  - Verifica autenticación + que el diseño existe y pertenece al usuario
  - Busca orden existente (idempotencia — no duplicar)
  - Valida config Printify (printProviderId, variantMapping)
  - Crea producto en Printify con la imagen del diseño via API
  - Crea orden en Printify con el producto + variante por defecto
  - Guarda `printify_order_id` en la tabla orders (upsert)
  - Actualiza diseño a status='ordered'
  - Manejo de errores: Printify API key, shop ID, provider config
- **`app/api/webhooks/stripe/route.ts` — Webhook mejorado:**
  - Al recibir `checkout.session.completed` para producto:
    - Extrae dirección de envío del campo `shipping` de Stripe
    - Almacena `shipping_address` como JSONB en la tabla orders
    - Actualiza diseño a status='paid'
    - Llama a `/api/printify/create-order` para crear la orden Printify automáticamente
    - Si Printify falla, la orden queda en BD para reintento manual
- **`app/(dashboard)/ordenes/page.tsx` — Página de órdenes real:**
  - Server Component que consulta orders + designs (join) desde Supabase
  - Muestra: imagen del diseño, nombre del producto, prompt, estado
  - Estados con colores: pending (yellow), processing (blue), shipped (purple), delivered (green)
  - Muestra ID de Printify y número de tracking cuando están disponibles
  - Link de rastreo para USPS cuando hay tracking
  - Estado vacío cuando no hay órdenes

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `app/api/printify/create-order/route.ts` | Crea producto + orden en Printify automáticamente |

**Archivos modificados:**
| Archivo | Cambio |
|---|---|
| `lib/printify.ts` | Nueva función `createPrintifyProduct` + interfaces |
| `app/api/checkout/route.ts` | Agregado `shipping_address_collection` |
| `app/api/webhooks/stripe/route.ts` | Manejo de shipping address + trigger Printify order |
| `app/(dashboard)/ordenes/page.tsx` | Server Component con órdenes reales desde BD |

**Comandos ejecutados:**
```bash
npm run typecheck   # ✓ Sin errores
npm run lint        # ✓ 0 errores, 7 warnings pre-existentes
```

**Notas técnicas importantes:**
- Printify requiere 2 pasos para una orden con diseño personalizado: (1) crear producto en la tienda con la imagen, (2) crear orden referenciando ese producto. No es posible crear orden directamente con una imagen sin producto.
- El producto se crea con `price: 0` porque Printify cobra el costo base + envío automáticamente al crear la orden. El precio de venta lo manejamos nosotros via Stripe.
- `shipping_method: 1` = Standard (el más común en Printify). Puede cambiar según la configuración del shop.
- El webhook llama a `/api/printify/create-order` mediante un fetch interno (desde el servidor). Esto mantiene la lógica de Printify encapsulada en su propio endpoint.
- Se usa `upsert` en la tabla orders para evitar duplicados si el webhook se dispara múltiples veces (idempotencia de Stripe).
- Si `PRINTIFY_API_KEY` o `PRINTIFY_SHOP_ID` no están configurados, la orden se crea en BD con status 'pending' sin enviar a Printify. Se puede procesar manualmente después.

### DÍA 9 — Dashboard del usuario
**Fecha:** 29 Mayo 2026
**Duración:** ~15 min
**Estado:** ✅ Completado

**Qué se hizo:**
- **`app/api/download-design/[id]/route.ts` — Descarga de imagen original:**
  - GET endpoint que recibe el ID del diseño
  - Verifica autenticación y ownership (solo el dueño puede descargar)
  - Fetch de la imagen desde Supabase Storage
  - Retorna la imagen como archivo descargable con Content-Disposition: attachment
  - Nombre de archivo: `diseno-{id}.png`
- **`app/api/buy-design/[id]/route.ts` — Compra directa desde historial:**
  - POST endpoint (form action, sin JS requerido)
  - Verifica que el diseño existe y pertenece al usuario
  - Valida que el diseño está en status 'generated' (no comprado aún)
  - Crea Stripe Checkout Session con shipping_address_collection
  - Redirige directamente a Stripe
  - Si hay error, redirige a /disenos?error=... con mensaje descriptivo
- **`app/(dashboard)/disenos/page.tsx` — Página de diseños mejorada:**
  - Status labels en español: Listo / Comprado / En producción / Enviado
  - Status con badges de colores (yellow/blue/purple/green)
  - Nombres de productos en español (Camiseta, Hoodie, Taza, Funda, Póster)
  - Botón "Comprar este diseño" solo para diseños en status 'generated'
  - Botón de descarga (ícono SVG) para todos los diseños
  - Fecha formateada en español (ej: "29 may 2026")
  - Diseño de tarjeta mejorado con layout flex

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `app/api/download-design/[id]/route.ts` | Descarga de imagen original como archivo |
| `app/api/buy-design/[id]/route.ts` | Compra directa desde el historial |

**Archivos modificados:**
| Archivo | Cambio |
|---|---|
| `app/(dashboard)/disenos/page.tsx` | Diseño mejorado + estado español + botones comprar/descargar |

**Comandos ejecutados:**
```bash
npm run typecheck   # ✓ Sin errores
npm run lint        # ✓ 0 errores, 7 warnings pre-existentes
```

**Notas técnicas importantes:**
- El endpoint de descarga usa `fetch(design.image_url)` para obtener la imagen desde Supabase Storage y retornarla como attachment. Esto evita exponer la URL de Storage directamente.
- El endpoint de compra (`/api/buy-design/[id]`) usa `NextResponse.redirect()` en lugar de `NextResponse.json()` porque recibe un form POST del Server Component. El navegador sigue la redirección a Stripe automáticamente.
- Los Server Components pueden renderizar forms HTML que POST a API routes. Esto permite interacciones sin JavaScript del lado del cliente.
- `params` en Next.js 16 App Router es una Promise. Se debe usar `const { id } = await params` en route handlers.

### DÍA 10 — Notificaciones por email
**Fecha:** 29 Mayo 2026
**Duración:** ~15 min
**Estado:** ✅ Completado

**Qué se hizo:**
- **`lib/email.ts` — Cliente Resend completo:**
  - Cliente inicializado con API key desde env (`RESEND_API_KEY`)
  - Template HTML responsivo base con `wrapTemplate()`: header (POD IA), body, footer
  - 3 funciones de envío:
    - `sendDesignReady(to, imageUrl, prompt, siteUrl)` → "Tu diseño IA está listo"
      - Muestra preview de la imagen generada, el prompt usado
      - CTA: "Ver mis diseños" (link a /disenos)
      - Footer: "Puedes comprarlo impreso en una camiseta, hoodie, taza o más"
    - `sendOrderReceived(to, orderId, imageUrl, productName, siteUrl)` → "Pedido recibido"
      - Muestra resumen del pedido (producto, ID), preview del diseño
      - CTA: "Ver estado del pedido" (link a /ordenes)
    - `sendOrderShipped(to, orderId, trackingNumber, siteUrl)` → "Tu pedido está en camino"
      - Muestra número de rastreo, enlace directo a USPS
      - CTA: "Rastrear pedido", "Ir a mis órdenes"
  - Todos los catch son silenciosos (el email no debe bloquear el flujo principal)
- **Webhook Stripe actualizado (`app/api/webhooks/stripe/route.ts`):**
  - En `handleDesignPayment`: después de generar + subir diseño, envía `sendDesignReady` al email del usuario (desde `session.customer_details.email`)
  - En `handleProductPayment`: después de insertar orden, busca diseño + order en BD, envía `sendOrderReceived` con el nombre del producto y preview
  - Extracción de `customer_details.email` del evento Stripe
- **Printify create-order actualizado (`app/api/printify/create-order/route.ts`):**
  - Después de crear orden Printify, si `printifyOrder.tracking_number` está disponible, envía `sendOrderShipped` con tracking link

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `lib/email.ts` | Cliente Resend + 3 funciones de email + templates HTML |

**Archivos modificados:**
| Archivo | Cambio |
|---|---|
| `app/api/webhooks/stripe/route.ts` | Email diseño listo + email pedido recibido |
| `app/api/printify/create-order/route.ts` | Email tracking cuando Printify lo devuelve |

**Comandos ejecutados:**
```bash
npm run typecheck   # ✓ Sin errores
npm run lint        # ✓ 0 errores, 7 warnings pre-existentes
```

**Notas técnicas importantes:**
- Resend SDK v6 usa `resend.emails.send()` con objeto: `{ from, to, subject, html }`. El `from` por defecto en plan gratis es `onboarding@resend.dev`.
- `customer_details.email` está disponible en el evento `checkout.session.completed` de Stripe cuando el usuario proporciona su email durante el checkout. Stripe recolecta email automáticamente si no se especifica `customer_creation: 'always'`.
- Los templates HTML son responsivos (tabla centrada, max-width 480px) con diseño minimalista: fondo gris claro, tarjeta blanca, header negro, footer gris.
- Todos los envíos de email tienen try/catch silencioso para no bloquear el flujo principal (pago, generación, creación de orden).
- El tracking number de Printify generalmente no está disponible inmediatamente al crear la orden. Se actualiza asincrónicamente cuando Printify procesa el envío. Para tracking completo, se necesita un webhook de Printify o polling periódico.

### DÍA 11 — Validación de IA (20 diseños de prueba)
**Qué se hizo:**
- Generación de 20 diseños con prompts variados
- Evaluación de calidad visual de cada resultado
- Ajuste de prompt engineering para mejorar resultados
- Prueba de diferentes modelos: DALL-E 3 vs Replicate (SDXL)
- Selección del modelo ganador basado en: calidad, velocidad, costo
- Creación de ejemplos para la galería de la landing page

**Resultados de validación:**
- 20/20 diseños generados exitosamente
- 16/20 con calidad aceptable para impresión
- 12/20 con calidad "lista para vender"
- Mejor modelo: [registrar aquí]
- Ajustes realizados al prompt: [registrar aquí]

### DÍA 12 — Testing completo del flujo (QA)
**Qué se hizo:**
- Stripe en modo test: tarjeta 4242 4242 4242 4242
- Prueba de 3 flujos completos: Camiseta, Hoodie, Taza
- Verificación de: generación → pago → webhook → orden Printify
- Prueba de casos borde: tarjeta rechazada, prompt vacío, producto sin stock
- Corrección de bugs encontrados

### DÍA 13 — Landing page finalizada + SEO
**Fecha:** 29 Mayo 2026
**Duración:** ~15 min
**Estado:** ✅ Completado

**Qué se hizo:**
- **Hero section pulida:** "Tu idea, impresa." con gradiente, badge de tecnología, subtítulo claro, y dos CTAs (Crear + Cómo funciona)
- **Sección "Cómo funciona"** con 3 pasos visuales (Describe → Genera → Recibe) en cards con sombra y números
- **Sección de productos:** Grid de 5 productos con emoji y descripción
- **Galería de estilos:** 6 categorías visuales (Minimalista, Abstracto, Geek, Naturaleza, Tipográfico, Bold) con emojis
- **CTA final:** Sección oscura con llamado a la acción
- **Meta tags completos:**
  - title template, description, metadataBase
  - Open Graph (title, description, locale es_MX, type website, image)
  - Twitter Cards (summary_large_image)
  - Robots (index, follow)
  - JSON-LD structured data (Product schema)
- **sitemap.xml** con rutas principales + prioridades
- **robots.txt** que permite /, bloquea /api/ y /auth/, apunta a sitemap
- **Header sticky** con backdrop blur
- **Footer** con créditos y badges de tecnología
- **Idioma:** `<html lang="es">` (era "en")
- OG image placeholder en `public/images/og.svg`

**Archivos creados:**
| Archivo | Propósito |
|---|---|
| `app/sitemap.ts` | Sitemap XML dinámico |
| `app/robots.ts` | Robots.txt dinámico |
| `public/images/og.svg` | OG image placeholder para redes sociales |

**Archivos modificados:**
| Archivo | Cambio |
|---|---|
| `app/layout.tsx` | Metadata completa (OG, Twitter, JSON-LD), lang="es" |
| `app/page.tsx` | Landing completa: hero, pasos, productos, galería, CTA, footer, schema |

**Comandos ejecutados:**
```bash
npm run typecheck   # ✓ Sin errores
npm run lint        # ✓ 0 errores, 7 warnings pre-existentes
```

### DÍA 14 — Lanzamiento en producción
**Qué se hizo:**
- Deploy a Vercel (producción)
- Cambio de Stripe test → live keys
- Configuración de dominio (`tudominio.vercel.app` o dominio propio)
- Prueba completa en producción con tarjeta real
- Configuración de monitoreo: Vercel Analytics + Stripe Dashboard
- Verificación de webhooks en producción (endpoint público)

### DÍA 15 — Post-lanzamiento y monitoreo
**Qué se hizo:**
- Publicación en redes sociales y comunidades
- Monitoreo de primeras órdenes
- Verificación de calidad de Printify (producto real)
- Medición de tiempo de envío
- Recolección de feedback de primeros usuarios
- Plan de iteración basado en datos reales

---

## 7. APIs y Servicios Externos

### Supabase (Base de datos + Auth + Storage)
- **URL del proyecto:** [registrar]
- **Anon key:** [registrar]
- **Service role key:** [registrar — NUNCA compartir]
- **Plan:** Free (500MB BD, 1GB storage, 50K MAUs)

### Stripe (Pagos)
- **Publishable key:** [registrar]
- **Secret key:** [registrar — NUNCA compartir]
- **Webhook secret:** [registrar]
- **Plan:** Sin cuota mensual, 2.9% + $0.30 por transacción

### Printify (Impresión y envío)
- **API key:** [registrar — NUNCA compartir]
- **Shop ID:** [registrar]
- **Plan:** Free (5 tiendas, productos ilimitados)
- **Documentación:** https://developers.printify.com/

### OpenAI (Generación de imágenes)
- **API key:** [registrar — NUNCA compartir]
- **Modelo usado:** DALL-E 3
- **Costo:** ~$0.04 por imagen (standard 1024x1024)

### Resend (Emails)
- **API key:** [registrar — NUNCA compartir]
- **Plan:** Free (100 emails/día)

---

## 8. Estructura de Base de Datos

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE designs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_variant_id TEXT,
  status TEXT DEFAULT 'generated'
    CHECK (status IN ('generated', 'paid', 'ordered', 'shipped')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  design_id UUID REFERENCES designs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  printify_order_id TEXT,
  shipping_address JSONB,
  total_paid DECIMAL(10,2),
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered')),
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_designs_user ON designs(user_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_stripe ON orders(stripe_session_id);
```

---

## 9. Cálculo de Precios y Márgenes

### Fórmula general
```
Precio venta = (Costo Printify + Envío promedio + $0.99 diseño) × 1.6 (60% markup)

Ganancia neta = Precio venta - Costo Printify - Envío - Comisión Stripe - Costo IA

Comisión Stripe = Precio venta × 0.029 + 0.30
```

### Tabla de productos

| Producto | Costo Printify | Envío | $0.99 diseño | Markup 60% | Precio venta | Stripe fee | Costo IA | **Ganancia neta** |
|---|---|---|---|---|---|---|---|---|
| Camiseta | $7.32 | $4.99 | $0.99 | $8.00 | **$24.99** | $0.87 | $0.06 | **$15.75** |
| Hoodie | $15.89 | $5.99 | $0.99 | $13.70 | **$39.99** | $1.16 | $0.06 | **$21.88** |
| Taza | $5.12 | $5.99 | $0.99 | $7.20 | **$19.99** | $0.72 | $0.06 | **$13.10** |
| Funda phone | $10.73 | $4.99 | $0.99 | $10.10 | **$29.99** | $0.96 | $0.06 | **$17.24** |
| Póster | $6.50 | $4.99 | $0.99 | $7.50 | **$19.99** | $0.72 | $0.06 | **$11.72** |

---

## 10. Lecciones Aprendidas

> *(Esta sección se llena durante la ejecución con errores, ajustes, descubrimientos y optimizaciones en tiempo real)*

### DÍA 1 — Fundaciones
- `create-next-app@16` genera automáticamente AGENTS.md con header `<!-- BEGIN:nextjs-agent-rules -->`. Ese header es importante para que la IA sepa que Next.js tiene breaking changes. No eliminarlo.
- Next.js 16 usa Turbopack por defecto (build ~6s vs ~15s con webpack).
- Stripe SDK requiere omitir `apiVersion` a menos que se use una versión exacta. Si se especifica, debe coincidir con la versión del SDK instalado.
- El `.gitignore` por defecto de Next.js excluye `.env*` (todo), lo que incluye `.env.example`. Si quieres trackear `.env.example`, hay que cambiar el patrón a `.env`, `.env.local`, `.env.*.local`.
- `create-next-app -Force` sobrescribe archivos existentes. Crear en subdirectorio temporal y mover después es la estrategia correcta cuando el directorio ya tiene config (AGENTS.md, opencode.json, docs/).

### DÍA 2 — Base de Datos + Auth
- En Next.js 16, `middleware.ts` está deprecated y se renombró a `proxy.ts`. El export también cambia de `middleware` a `proxy`. Ignorar esto genera advertencias de deprecación en build.
- Supabase SSR requiere 3 clientes distintos: browser (createBrowserClient), server (createServerClient con cookies de next/headers), y middleware/proxy (createServerClient con cookies de request).
- El trigger `handle_new_user` en SQL es la forma más limpia de sincronizar perfiles. Evita lógica extra en la app.
- `getUser()` en el proxy es más seguro que `getSession()` porque valida el token contra Supabase. `getSession()` solo lee la cookie local.
- El dashboard layout con Server Component + getUser() sirve como doble protección incluso si el proxy falla.
- Los route groups (parentheses) en Next.js son útiles para separar landing pública (marketing) de dashboard privado sin afectar la URL.

### DÍA 3 — Frontend
- Los componentes interactivos deben marcarse con `'use client'`. Next.js 16 Server Components son el default.
- Tailwind CSS v4 funciona igual que v3 para utilitarias básicas. No hay cambios de sintaxis para el uso común.
- El grid responsive con `grid-cols-2 sm:grid-cols-3 lg:grid-cols-5` funciona muy bien para selectores de producto.
- Centralizar la lógica de precios en `lib/pricing.ts` evita duplicación entre frontend (UI) y backend (API routes).
- Los placeholders visuales (empty state, loading state, error state) mejoran la UX cuando la API de IA tarda ~2-5s en responder.
- El hook `useState` de React es suficiente para el estado local del formulario de generación. No necesita estado global (Context/Redux).

### DÍA 4 — Integración IA
- El SDK de OpenAI (`openai`) es el más simple para DALL-E 3. `response.data` puede ser `undefined` según TypeScript, usar optional chaining.
- DALL-E 3 con `response_format: 'url'` devuelve URLs temporales (~1 hora). Para persistencia, se necesita subir a Supabase Storage (Día 5).
- El prompt engineering es crítico para calidad print-ready. Especificar: colores limitados, centrado, sin texto, fondo transparente.
- OpenAI puede rechazar prompts por content policy. Tener un mensaje de error amigable mejora la UX.
- La validación de input en API routes con condiciones simples funciona, pero Zod es mejor para producción.

### DÍA 5 — Procesamiento de imagen
- El bucket de Storage debe crearse manualmente en el Dashboard de Supabase (no via SQL). Incluir instrucciones claras en la migración SQL.
- La RLS policy para Storage es clave: cada usuario solo debe ver sus propios archivos. Usar `storage.foldername(name)[1]` para extraer user_id del path.
- La URL de DALL-E expira en ~1 hora. Siempre subir a Storage inmediatamente después de generar.
- El nombrado `{user_id}/{timestamp}.png` asegura unicidad y permite RLS por carpeta.
- Server Components con `async` pueden hacer fetch directo a Supabase sin necesidad de API route intermedia. La BD se mantiene segura porque el server component se ejecuta del lado del servidor.

### DÍA 6 — Cliente Printify + Catalog API
- Printify API usa blueprintId (global, fijo) + printProviderId (varía por tienda) + variantId (varía por proveedor). Se necesitan los 3 para crear una orden.
- La API de Printify no tiene un endpoint directo de "print providers por blueprint" en el plan gratuito. Se necesita inspeccionar el catálogo manualmente o tener un producto ya configurado en la tienda.
- El `variantMapping` en pricing.ts es específico de cada shop + print provider. No se puede hardcodear de forma universal. Por eso se deja vacío y se llena con el endpoint /configure cuando el usuario tenga su Printify account.
- Printify catalog usa IDs numéricos para blueprints (ej: Bella+Canvas 3001 = 6). Estos IDs son estables entre tiendas y se pueden hardcodear.
- La función `createOrder` requiere el shipping_method como ID numérico. En Printify, 1 = Standard.

### DÍA 7 — Stripe Checkout
- El nuevo ESLint plugin de React Compiler (`react-hooks/set-state-in-effect`) incluido en Next.js 16 prohíbe llamar `setState` directamente dentro de `useEffect`. Para flujos post-pago, es mejor extraer la lógica a un componente hijo separado y usar `useRef` para evitar llamadas duplicadas.
- Stripe Checkout Session es más simple que PaymentElement para el MVP: solo requiere `line_items`, `success_url`, `cancel_url`. No necesita manejar inputs de tarjeta.
- El flow de redirect a Stripe y vuelta requiere manejar URL params (`?success=true&session_id=xxx`). `router.replace()` limpia los params después de procesar.
- Para desarrollo local, Stripe webhooks requieren `stripe listen --forward-to` o un túnel (ngrok). Sin el webhook funcionando, la generación solo ocurre vía el endpoint `/confirm` que llama el frontend.
- El precio descontado ($0.99) se calcula en el backend. Stripe maneja centavos (unit_amount en cents). `$0.99 = 99 cents`.
- Es importante verificar que la sesión de Stripe pertenece al usuario autenticado para evitar que un usuario usurpe el pago de otro.

### DÍA 8 — Printify API
- Printify requiere 2 pasos para una orden personalizada: crear producto (POST /products.json) → crear orden (POST /orders.json). No es posible saltarse el paso de creación de producto.
- El producto Printify necesita `print_areas` con `variant_ids` y `placeholders` para asignar la imagen a las variantes correctas. Cada placeholder tiene una posición (front, back, etc).
- Al crear el producto en Printify, `price: 0` es válido para productos que solo se usarán en órdenes (el costo se maneja al crear la orden).
- Para idempotencia con webhooks de Stripe, usar `upsert` en lugar de `insert` en la tabla orders. Stripe puede enviar el mismo evento múltiples veces.
- Stripe Checkout Session tiene un campo `shipping` que contiene la dirección recolectada durante el checkout. Se puede acceder como `session.shipping.address`.
- El endpoint de create-order puede fallar si Printify no está configurado. Es mejor crear la orden en BD primero (status='pending') y actualizar después con el printify_order_id.
- El tipo `Session` de Stripe SDK no incluye `shipping` en su definición TypeScript. Para acceder a `event.data.object.shipping`, se debe castear a `unknown` primero y luego al tipo deseado.
- En Next.js App Router, los Server Components pueden hacer joins en consultas Supabase: `supabase.from('orders').select('*, designs(*)')`.

### DÍA 9 — Dashboard
- Next.js 16 App Router route handlers con `params` dinámicos requieren `Promise<{ id: string }>` y `await params`. Es un cambio de Next.js 15 donde params era sincrónico.
- Los Server Components pueden renderizar forms con `action="/api/..."` y method POST que funcionan sin JavaScript. El API route recibe el form submission y puede responder con `NextResponse.redirect()`.
- Para descargar archivos desde API routes, se usa `new NextResponse(blob, { headers: { 'Content-Disposition': 'attachment; filename=...' } })`. Esto funciona tanto para imágenes como PDFs.
- Es buena práctica verificar ownership (design.user_id === user.id) en endpoints de descarga y compra. El proxy.ts y dashboard layout ya verifican auth, pero los endpoints deben verificar ownership también.

### DÍA 10 — Emails
- Resend SDK v6 usa `new Resend(apiKey)` y `resend.emails.send()`. El método es síncrono y devuelve una Promise con `{ data, error }`.
- `send()` falla silenciosamente si no hay API key configurada. Es mejor verificar `process.env.RESEND_API_KEY` antes de llamar para evitar errores innecesarios.
- Stripe devuelve `customer_details.email` en `checkout.session.completed` si el usuario ingresó email durante el checkout. Esto es más confiable que buscar el email en la tabla users.
- Los templates HTML para emails deben ser inline styles (no CSS externo) porque la mayoría de clientes de email (Gmail, Outlook) ignoran `<style>` en el `<head>`.
- Es buena práctica tener una función `wrapTemplate()` que envuelve el contenido en el layout base (header + footer). Así los templates individuales solo definen el body.

### DÍA 11 — Validación IA (20 diseños)
- [Pendiente]

### DÍA 12 — Testing
- [Pendiente]

### DÍA 13 — Landing + SEO
- [Pendiente]

### DÍA 14 — Lanzamiento
- [Pendiente]

### DÍA 15 — Post-lanzamiento
- [Pendiente]

---

## 11. Próximos Pasos Post-Lanzamiento

Prioridad de reinversión de ganancias:

1. **Printify Premium ($24.99/mes)** — Hasta 20% descuento en productos base
2. **Dominio personalizado (~$10/año)** — Profesionalizar la marca
3. **Plan Growth de Printful ($24.99/mes)** — Segundo proveedor para comparar calidad
4. **Google Ads / Meta Ads** — Tráfico pago para escalar
5. **Más productos** — Expandir catálogo (gorras, leggings, loncheras)
6. **Suscripción mensual** — Diseños ilimitados por $9.99/mes (recurrencia)

---

> *Este playbook es propiedad intelectual reusable. Cada vez que se ejecute para un nuevo proyecto, se ajustan: prompts de IA, productos, precios y diseño de landing page.*
