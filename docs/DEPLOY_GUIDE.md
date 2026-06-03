# Guía de Deploy a Vercel — Paso a paso

> Versión: 1.0
> Fecha: 2026-06-03

## Resumen de configuración actual

| Servicio | Estado | Nota |
|---|---|---|
| Supabase | ✅ Listo | Usando proyecto existente |
| OpenAI | ✅ Listo | API key configurada |
| Resend | ✅ Listo | API key configurada |
| Stripe | ⚠️ Test keys | Necesita switch a LIVE para cobrar real |
| Printify | ❌ Sin cuenta | App funciona pero órdenes quedan en "pendiente" |
| Webhook Stripe | ❌ Sin configurar | Necesita crear endpoint en producción |

---

## Paso 1: Crear cuenta Vercel e importar repo

1. Ir a [vercel.com](https://vercel.com)
2. Click "Sign Up" → elegir "Continue with GitHub"
3. Autorizar Vercel a acceder a tus repos
4. Click "Add New Project"
5. Buscar y seleccionar el repo `experimentoprompt`
6. Vercel detectará automáticamente que es Next.js 16
7. Click "Deploy"

**Resultado esperado:** Deploy inicial exitoso con URL tipo `experimentoprompt-xxx.vercel.app`

---

## Paso 2: Configurar variables de entorno en Vercel

Ir a Vercel Dashboard → Project → Settings → Environment Variables

Agregar TODAS estas variables (copiar valores de `.env.local`):

### Supabase (ya los tienes)
```
NEXT_PUBLIC_SUPABASE_URL=https://vtsriycjpvzcjxikhmnw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[tu anon key]
SUPABASE_SERVICE_ROLE_KEY=[tu service role key]
```

### Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[TUS TEST KEYS por ahora]
STRIPE_SECRET_KEY=[TUS TEST KEYS por ahora]
STRIPE_WEBHOOK_SECRET=[se obtiene en Paso 3]
```

> ⚠️ **Importante:** Por ahora usa tus TEST keys. Cuando quieras cobrar real, cambias a LIVE keys.

### AI
```
OPENAI_API_KEY=[tu key]
```

### Email
```
RESEND_API_KEY=[tu key]
```

### Printify (opcional por ahora)
```
PRINTIFY_API_KEY=[tu key cuando tengas]
PRINTIFY_SHOP_ID=[tu shop id cuando tengas]
```

### Site URL
```
NEXT_PUBLIC_SITE_URL=https://[TU-DOMINIO].vercel.app
```

> Reemplaza `[TU-DOMINIO]` con el que Vercel te asignó en el Paso 1.

---

## Paso 3: Configurar webhook de Stripe

1. Ir a [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Endpoint URL: `https://[TU-DOMINIO].vercel.app/api/webhooks/stripe`
4. Seleccionar evento: `checkout.session.completed`
5. Click "Add endpoint"
6. Copiar el "Signing secret" (empieza con `whsec_`)
7. Agregarlo como `STRIPE_WEBHOOK_SECRET` en Vercel

---

## Paso 4: Actualizar Supabase Auth (Google OAuth)

1. Ir a Supabase Dashboard → Authentication → Providers → Google
2. En "Redirect URL", agregar:
   ```
   https://[TU-DOMINIO].vercel.app/auth/callback
   ```
3. Guardar

---

## Paso 5: Redeploy

1. En Vercel Dashboard → Project → Deployments
2. Click en los tres puntos del último deploy → "Redeploy"
3. Esto aplica las nuevas env vars

---

## Paso 6: Verificar

Abrir `https://[TU-DOMINIO].vercel.app` y verificar:
- [ ] Landing page carga
- [ ] Login con Google funciona
- [ ] `/generar` carga el selector de productos
- [ ] `/disenos` muestra diseños (si hay)
- [ ] `/ordenes` carga

---

## Cuando quieras cobrar dinero real (Stripe LIVE)

1. Vercel → Settings → Environment Variables
2. Cambiar:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` → `pk_live_...`
   - `STRIPE_SECRET_KEY` → `sk_live_...`
3. Stripe Dashboard → switch a "Live mode"
4. Crear nuevo webhook endpoint con dominio de producción
5. Actualizar `STRIPE_WEBHOOK_SECRET` en Vercel
6. Redeploy

---

## Cuando tengas Printify

1. Crear cuenta en [printify.com](https://printify.com)
2. Settings → API → Generar key
3. Settings → Store details → Copiar Shop ID
4. Agregar ambos a Vercel env vars
5. Ejecutar: `GET https://[TU-DOMINIO].vercel.app/api/printify/configure`
6. Copiar los `variantMapping` a `lib/pricing.ts`
7. Commit, push, redeploy

---

## Nota sobre Printify sin cuenta

Si no tienes Printify configurado, la app **funciona completamente** excepto:
- Las órdenes se guardan en la BD con status `pending`
- No se envían a Printify automáticamente
- Puedes ver las órdenes en `/ordenes` y procesarlas manualmente después

Esto permite lanzar y empezar a cobrar, mientras configuras Printify en paralelo.

---

## Comandos útiles

```bash
# Verificar build local antes de deploy
npm run build

# Verificar tests
npm run test:run

# Push a GitHub (Vercel deploy automático)
git add -A
git commit -m "fix: ready for production"
git push origin master
```

---

*Guía creada para deploy de pod-ia-platform*
