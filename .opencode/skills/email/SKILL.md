---
name: email
description: Envía emails al usuario usando la API de Resend. Actívala cuando necesites notificar, pedir aprobación, o reportar un bloqueo. Úsala también para enviar reportes de avance al cliente.
---

# Skill: Email

## Destinatario
cpeschke.samsung@gmail.com

## API Key
La API key de Resend se lee desde `~/.opencode/email-key.txt`

## Comando para enviar email (PowerShell)

```powershell
$apiKey = Get-Content "$env:USERPROFILE\.opencode\email-key.txt" -Raw
$subject = "Asunto del email"
$html = "<h1>Título</h1><p>Contenido del mensaje</p>"

$body = @{
  from = "onboarding@resend.dev"
  to = @("cpeschke.samsung@gmail.com")
  subject = $subject
  html = $html
} | ConvertTo-Json

curl.exe -s -X POST "https://api.resend.com/emails" `
  -H "Authorization: Bearer $apiKey" `
  -H "Content-Type: application/json" `
  -d $body
```

## Tipos de email

### 1. Aprobación (resolví el problema)
**Subject:** `[APROBACIÓN] <título del problema>`
**Body:** Explicar qué encontré, qué solución propongo, y pedir aprobación explícita para ejecutar.

### 2. Bloqueo (no pude resolver)
**Subject:** `[BLOQUEADO] <título del problema>`
**Body:** Explicar qué intenté (con chrome-devtools), por qué falló, qué necesito del usuario.

### 3. Reporte de avance
**Subject:** `[AVANCE] <título>`
**Body:** Resumen de lo que hice, resultados, y próximos pasos.

## Reglas
- No enviar emails sin un motivo claro
- Incluir siempre contexto suficiente para que el usuario entienda sin preguntar
- En emails de aprobación, esperar respuesta antes de ejecutar
