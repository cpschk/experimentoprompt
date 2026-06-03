# Día 12 — QA / Testing End-to-End

> Estado: Documento preparado. Ejecución real requiere API keys configuradas.

## Bugs críticos corregidos en este día

### ✅ 1. Dirección de envío hardcodeada (CORREGIDO)
**Archivo:** `app/api/printify/create-order/route.ts`
**Problema:** El endpoint usaba valores ficticios (`Dirección pendiente`, `Ciudad`, `US`, `00000`) para todas las órdenes Printify.
**Solución:** Ahora lee `shipping_address` de la tabla `orders` (donde el webhook de Stripe la guarda) y la usa en la llamada a Printify.
**Fallback:** Si no hay dirección guardada, usa valores por defecto pero lo reporta.

---

## Flujo de QA completo (requiere API keys)

### Pre-requisitos
```bash
# .env.local debe tener:
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Paso 1: Stripe CLI para webhooks locales
```bash
# Instalar Stripe CLI si no lo tienes
# https://stripe.com/docs/stripe-cli

# En una terminal aparte:
stripe login
stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copia el webhook signing secret y ponlo en .env.local
```

### Paso 2: Test flujo completo — Diseño $0.99

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1 | Ir a `/generar` | Selector de producto + textarea |
| 2 | Elegir "Camiseta", escribir prompt | Botón "Generar" se activa |
| 3 | Click "Generar diseño — $0.99" | Redirect a Stripe Checkout |
| 4 | Pagar con tarjeta test `4242 4242 4242 4242` | Redirect a `/generar?success=true&session_id=...` |
| 5 | Esperar confirmación | Diseño generado con IA, guardado en Storage |
| 6 | Ver `/disenos` | Nuevo diseño aparece con status "Listo" |

### Paso 3: Test flujo completo — Compra producto

| Paso | Acción | Resultado esperado |
|------|--------|-------------------|
| 1 | En `/disenos`, click "Comprar este diseño" | Redirect a Stripe Checkout con precio descontado |
| 2 | Completar dirección de envío + pagar | Redirect a confirmación |
| 3 | Webhook Stripe dispara | Orden creada en BD con `shipping_address` |
| 4 | Si Printify configurado | Producto + orden creados en Printify |
| 5 | Ver `/ordenes` | Orden aparece con status "Pendiente" o "En producción" |

### Paso 4: Casos borde a probar

| Caso | Input esperado | Resultado esperado |
|------|---------------|-------------------|
| Prompt vacío | `""` o `"   "` | Error 400: "El prompt debe tener al menos 3 caracteres" |
| Producto inválido | `product_type: "zapatos"` | Error 400: "Producto no soportado" |
| Sin autenticación | Sin cookie de sesión | Error 401 en todas las rutas protegidas |
| Tarjeta rechazada | `4000 0000 0000 0002` | Stripe muestra error de pago |
| Webhook inválido | Firma HMAC incorrecta | Error 400: "Firma inválida" |
| Prompt content policy | Prompt violando políticas | Error 400 con mensaje amigable |
| Diseño no existe | `design_id` inexistente | Error 404 |
| Orden ya existe | Duplicar `design_id` | Idempotencia: no crear duplicado |

### Paso 5: Tarjetas de test de Stripe

| Número | Escenario |
|--------|-----------|
| `4242 4242 4242 4242` | Pago exitoso |
| `4000 0000 0000 0002` | Tarjeta rechazada (declinada) |
| `4000 0000 0000 9995` | Fondos insuficientes |
| `4000 0000 0000 9987` | CVV incorrecto |
| `4000 0000 0000 0127` | Dirección incorrecta |

---

## Checklist de verificación pre-lanzamiento

### Autenticación
- [ ] Login con Google OAuth funciona
- [ ] Logout funciona
- [ ] Rutas protegidas redirigen a `/login` sin sesión
- [ ] Landing page `/` es accesible sin sesión
- [ ] Proxy no bloquea archivos estáticos (`_next/`, imágenes)

### Generación de diseños
- [ ] Validación de prompt (min 3 chars)
- [ ] Validación de product_type
- [ ] Error amigable si API key no configurada
- [ ] Imagen se guarda en Supabase Storage
- [ ] Registro se crea en tabla `designs`
- [ ] URL pública funciona

### Pagos
- [ ] Checkout $0.99 funciona
- [ ] Checkout producto funciona con precio descontado
- [ ] Dirección de envío se recolecta en Stripe
- [ ] Webhook confirma pago y genera diseño
- [ ] Webhook maneja shipping address correctamente

### Printify
- [ ] Config endpoint descubre variantes
- [ ] Create-order usa dirección real de BD
- [ ] Idempotencia: no duplicar órdenes
- [ ] Error graceful si Printify no configurado

### Emails
- [ ] Email de diseño listo enviado (si Resend configurado)
- [ ] Email de orden recibida enviada
- [ ] Emails no bloquean flujo principal (try/catch silencioso)

### Dashboard
- [ ] `/disenos` muestra diseños del usuario logueado
- [ ] `/ordenes` muestra órdenes con tracking
- [ ] Descarga de imagen funciona
- [ ] Compra desde historial funciona

---

## Estado actual de tests automatizados

```
Test Files  4 passed (4)
Tests      33 passed (33)
```

**Cobertura actual:**
- ✅ `lib/pricing.test.ts` — 10 tests (cálculos de precios)
- ✅ `app/api/generate/route.test.ts` — 10 tests (validaciones, auth, errores)
- ✅ `app/api/checkout/route.test.ts` — 8 tests (creación de session)
- ✅ `app/api/webhooks/stripe/route.test.ts` — 5 tests (firma, eventos)

**Tests pendientes (requieren infraestructura):**
- ⬜ Test de upload a Supabase Storage
- ⬜ Test de integración Printify (requiere mock HTTP)
- ⬜ Test de flujo end-to-end (E2E con Playwright)

---

## Notas

- El bug crítico de dirección de envío ya está corregido en `97dafae`
- Los tests existentes pasan al 100%
- El build y typecheck pasan sin errores
- Para ejecutar QA real se necesitan API keys de OpenAI + Stripe test
- Printify puede testearse sin cuenta real usando el endpoint `/api/printify/configure`
