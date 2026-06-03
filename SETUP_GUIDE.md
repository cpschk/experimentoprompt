# Configuración de Supabase - Próximos pasos

1. **Ejecutar migración SQL:**
   - Ve a https://vtsriycjpvzcjxikhmnw.supabase.co/project/_/sql
   - Nueva consulta
   - Copia y pega el contenido de: supabase/migrations/001_initial_schema.sql
   - Ejecuta

2. **Crear bucket de Storage:**
   - Ve a https://vtsriycjpvzcjxikhmnw.supabase.co/project/_/storage
   - Nuevo bucket
   - Nombre: `designs`
   - Tipo: Público (o Privado con políticas RLS - las políticas ya están configuradas)
   - Copia la política RLS del archivo SQL si necesitas ajustarla

3. **Configurar Google OAuth:**
   - Ve a https://vtsriycjpvzcjxikhmnw.supabase.co/project/_/settings/auth/providers
   - Habilita Google
   - Necesitas crear un proyecto en Google Cloud Console:
     * https://console.cloud.google.com/
     * Credenciales → Crear credenciales → ID de cliente OAuth
     * Tipo de aplicación: Aplicación web
     * URL de redirección autorizada: https://vtsriycjpvzcjxikhmnw.supabase.co/auth/v1/callback
   - Copia Client ID y Client Secret a Supabase

4. **Configurar Stripe webhook:**
   - Ve a https://dashboard.stripe.com/test/webhooks
   - Añadir endpoint
   - URL: http://localhost:3000/api/webhooks/stripe (desarrollo)
   - En producción: https://tudominio.vercel.app/api/webhooks/stripe
   - Selecciona eventos: checkout.session.completed
   - Copia el "Signing secret" y ponlo en .env.local como STRIPE_WEBHOOK_SECRET
   - Para testing local: stripe listen --forward-to localhost:3000/api/webhooks/stripe

5. **Crear cuenta Printify:**
   - Ve a https://printify.com
   - Regístrate/ingresa
   - Ve a Settings → API
   - Genera API key
   - Copia a .env.local como PRINTIFY_API_KEY
   - Tu Shop ID se encuentra en Settings → Store details

6. **API keys restantes:**
   - OpenAI: https://platform.openai.com/api-keys
   - Resend: https://resend.com/api-keys

7. **Probar conexión:**
   - Ejecuta: npm run dev
   - Ve a http://localhost:3000
   - Regístrate con Google
   - Prueba generar un diseño (debería funcionar con las keys de Stripe de test)