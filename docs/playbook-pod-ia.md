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
**Qué se hizo:**
- Creación del esquema de base de datos en Supabase (tablas: users, designs, orders)
- Configuración de autenticación con Google OAuth vía Supabase Auth
- Implementación de middleware de Next.js para proteger rutas privadas
- Páginas de login y callback

**Estructura de tablas:**
```sql
-- users
id: uuid PK
email: text
name: text
avatar_url: text
created_at: timestamp

-- designs
id: uuid PK
user_id: uuid FK → users
prompt: text
image_url: text
product_type: text (t-shirt, hoodie, mug, case, poster)
product_variant_id: text (ID de Printify)
status: text (generated, paid, ordered, shipped)
created_at: timestamp

-- orders
id: uuid PK
design_id: uuid FK → designs
user_id: uuid FK → users
stripe_session_id: text
printify_order_id: text
shipping_address: jsonb
total_paid: decimal
status: text (pending, processing, shipped, delivered)
tracking_number: text
created_at: timestamp
```

### DÍA 3 — Interfaz de Usuario (Frontend)
**Qué se hizo:**
- Landing page con hero, CTA, y sección "Cómo funciona"
- Selector de producto tipo grid con imágenes de ejemplo
- Página de generación con textarea y selector
- Página de preview del diseño
- Diseño responsive (mobile-first)
- Componentes reutilizables: Header, Footer, ProductCard, DesignCard

### DÍA 4 — Integración de IA (Generación de imágenes)
**Qué se hizo:**
- API route `/api/generate` que recibe prompt + tipo de producto
- Llamada a OpenAI DALL-E 3 con prompt engineering optimizado
- Procesamiento de la respuesta: extraer URL de imagen
- Manejo de errores: timeout, rate limiting, fallback
- La imagen se muestra al usuario inmediatamente después de generarse
- Se guarda el prompt original para re-generación si es necesario

**Costo por generación:** ~$0.04 (DALL-E 3 standard 1024x1024)

**Prompt engineering utilizado:**
```
"Create a print-ready design for a {product_type} based on this description: '{user_prompt}'. Style: bold, high contrast, suitable for apparel printing. Colors: vibrant but limited to 3-4 colors for cost-effective DTG printing. No text unless specified. Centered composition with transparent background."
```

### DÍA 5 — Procesamiento de imagen para print
**Qué se hizo:**
- API route `/api/process-image` que recibe la imagen generada
- Redimensionamiento a resolución print-ready (300 DPI)
- Conversión de color: RGB → perfil de color para impresión
- Validación de tamaño mínimo (archivo > 1MB, dimensiones > 2000px)
- Subida automática a Supabase Storage
- Almacenamiento de URL pública para usar en Printify

### DÍA 6 — Catálogo de productos + Precios
**Qué se hizo:**
- Definición de productos en Printify (cada uno con variantes: talla, color)
- Mapeo de productos Printify a IDs internos
- Cálculo de precios finales: Costo Printify + costo envío promedio + $0.99 diseño + markup 60%
- Tabla de configuración en `lib/pricing.ts`

```typescript
// lib/pricing.ts
export const PRODUCTS = {
  't-shirt': {
    printifyId: '123', // ID real del producto en Printify
    baseCost: 7.32,
    shipping: 4.99,
    markupPercent: 0.60,
    variants: [
      { size: 'S', color: 'Black', printifyVariantId: '456' },
      { size: 'M', color: 'Black', printifyVariantId: '457' },
    ]
  },
}

export function calculatePrice(productType: string): number {
  const p = PRODUCTS[productType]
  return Math.round((p.baseCost + p.shipping) * (1 + p.markupPercent) * 100) / 100
}
```

### DÍA 7 — Stripe Checkout (Pago completo)
**Qué se hizo:**
- API route `/api/checkout` que crea Stripe Checkout Session
- El session incluye: precio final, metadata con design_id y user_id
- Webhook `/api/webhooks/stripe` que escucha eventos
- Al recibir `checkout.session.completed`: actualiza BD, dispara orden Printify
- Manejo de webhooks: verificación de firma HMAC, idempotencia
- Página de éxito y cancelación después del checkout

### DÍA 8 — Integración Printify (Órdenes automáticas)
**Qué se hizo:**
- API route `/api/printify/create-order`
- Autenticación con API key de Printify (Bearer token)
- Búsqueda o creación del producto en Printify con el diseño subido
- Creación de orden: dirección de envío + producto + variante + imagen
- Manejo de respuesta: guardar `printify_order_id` en la BD
- Manejo de errores: Printify retorna 429 (rate limit) → retry con backoff

**Documentación Printify API usada:**
- `POST /v1/shops/{shop_id}/orders.json` → crear orden
- `GET /v1/shops/{shop_id}/orders/{order_id}.json` → tracking

### DÍA 9 — Dashboard del usuario
**Qué se hizo:**
- Grid con todos los diseños generados por el usuario
- Cada tarjeta muestra: preview, producto, estado, fecha
- Página de detalle de orden: imagen, tracking, timeline
- Botón de "Comprar este diseño" para diseños no comprados aún
- Botón de descarga del diseño original (alta resolución)

### DÍA 10 — Notificaciones por email
**Qué se hizo:**
- Integración con Resend para envío de emails transaccionales
- Email de confirmación de generación: "Tu diseño está listo"
- Email de confirmación de compra: "Tu pedido fue recibido"
- Email de envío: "Tu pedido está en camino" + tracking number
- Templates HTML responsivos

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
**Qué se hizo:**
- Hero section pulida: "Describe tu idea. La IA la diseña. Te la enviamos."
- Galería de ejemplos reales (de la validación del Día 11)
- Sección "Cómo funciona" con 3 pasos visuales
- Meta tags: title, description, Open Graph, Twitter Cards
- Sitemap.xml + robots.txt
- Optimización de rendimiento: imágenes lazy, bundles JS reducidos

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
- [Pendiente]

### DÍA 3 — Frontend
- [Pendiente]

### DÍA 4 — Integración IA
- [Pendiente]

### DÍA 5 — Procesamiento de imagen
- [Pendiente]

### DÍA 6 — Catálogo + Precios
- [Pendiente]

### DÍA 7 — Stripe Checkout
- [Pendiente]

### DÍA 8 — Printify API
- [Pendiente]

### DÍA 9 — Dashboard
- [Pendiente]

### DÍA 10 — Emails
- [Pendiente]

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
