import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY || '')

const FROM = 'onboarding@resend.dev'

function wrapTemplate(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden">
<tr><td style="background:#111;padding:32px;text-align:center">
<h1 style="margin:0;font-size:20px;color:#fff;font-weight:700">POD IA</h1>
</td></tr>
<tr><td style="padding:32px">
${bodyHtml}
</td></tr>
<tr><td style="background:#fafafa;padding:24px 32px;text-align:center">
<p style="margin:0;font-size:12px;color:#a1a1aa">POD IA Platform — Tu idea, impresa.</p>
</td></tr>
</table>
</td></tr></table>
</body>
</html>`
}

export async function sendDesignReady(
  to: string,
  designImageUrl: string,
  prompt: string,
  siteUrl: string
) {
  const html = wrapTemplate(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111">¡Tu diseño está listo! 🎨</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.5">
      Tu diseño generado por IA ya está disponible. Aquí tienes una vista previa:
    </p>
    <img src="${designImageUrl}" alt="Diseño generado" style="width:100%;border-radius:8px;margin-bottom:24px" />
    <p style="margin:0 0 8px;font-size:13px;color:#71717a">
      <strong style="color:#111">Prompt:</strong> ${prompt}
    </p>
    <a href="${siteUrl}/disenos" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;margin-top:16px">
      Ver mis diseños
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa">
      ¿Te gusta? Puedes comprarlo impreso en una camiseta, hoodie, taza o más.
    </p>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Tu diseño IA está listo — POD IA',
      html,
    })
  } catch {
    // El email no debe bloquear el flujo principal
  }
}

export async function sendOrderReceived(
  to: string,
  orderId: string,
  designImageUrl: string,
  productName: string,
  siteUrl: string
) {
  const html = wrapTemplate(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111">¡Pedido recibido! 🎉</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.5">
      Gracias por tu compra. Hemos recibido tu pedido y estamos preparándolo para impresión.
    </p>
    <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:13px;color:#71717a">
        <strong style="color:#111">Producto:</strong> ${productName}
      </p>
      <p style="margin:0 0 4px;font-size:13px;color:#71717a">
        <strong style="color:#111">Pedido:</strong> #${orderId.slice(0, 8)}
      </p>
    </div>
    <img src="${designImageUrl}" alt="Diseño" style="width:100%;border-radius:8px;margin-bottom:24px" />
    <a href="${siteUrl}/ordenes" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;margin-top:16px">
      Ver estado del pedido
    </a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Pedido recibido — POD IA',
      html,
    })
  } catch {
    // Silencioso
  }
}

export async function sendOrderShipped(
  to: string,
  orderId: string,
  trackingNumber: string,
  siteUrl: string
) {
  const html = wrapTemplate(`
    <h2 style="margin:0 0 8px;font-size:18px;color:#111">¡Tu pedido está en camino! 🚚</h2>
    <p style="margin:0 0 24px;font-size:14px;color:#52525b;line-height:1.5">
      Buenas noticias: tu pedido ya fue enviado y pronto llegará a tu domicilio.
    </p>
    <div style="background:#f4f4f5;border-radius:8px;padding:16px;margin-bottom:24px">
      <p style="margin:0 0 4px;font-size:13px;color:#71717a">
        <strong style="color:#111">Pedido:</strong> #${orderId.slice(0, 8)}
      </p>
      <p style="margin:0 0 4px;font-size:13px;color:#71717a">
        <strong style="color:#111">Número de rastreo:</strong> ${trackingNumber}
      </p>
    </div>
    <a href="https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}" target="_blank" style="display:inline-block;background:#111;color:#fff;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;margin-top:16px">
      Rastrear pedido
    </a>
    <p style="margin:24px 0 0;font-size:12px;color:#a1a1aa">
      También puedes ver el estado actualizado en tu dashboard.
    </p>
    <a href="${siteUrl}/ordenes" style="display:inline-block;margin-top:12px;font-size:13px;color:#111;text-decoration:underline">Ir a mis órdenes</a>
  `)

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'Tu pedido está en camino — POD IA',
      html,
    })
  } catch {
    // Silencioso
  }
}
