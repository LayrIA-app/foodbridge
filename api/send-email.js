export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const body = req.body || {}
  const { to, tipo, ref, prod, fab, qty, pvp } = body
  const apiKey = process.env.RESEND_API_KEY
  const appUrl = 'https://foodbridge-ochre.vercel.app'

  let subject, html

  // Si el frontend pasa subject+html (generados por IA en /api/email-borrador)
  // los usamos directamente y saltamos el template hardcoded.
  if (body.subject && body.html) {
    subject = String(body.subject).slice(0, 200)
    html = String(body.html)
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: 'FoodBridge IA <noreply@layria.app>', to: [to], subject, html }),
    })
    const data = await response.json()
    if (!response.ok) return res.status(500).json({ error: data })
    return res.status(200).json({ success: true, via: 'custom' })
  }

  if (tipo === 'tarifas') {
    subject = 'Actualización de tarifas — FoodBridge IA'
    html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1A2F4A;padding:24px;text-align:center;border-radius:12px 12px 0 0">
          <span style="font-size:24px;font-weight:900;color:#fff">Food<span style="color:#E87420">Bridge IA</span></span>
        </div>
        <div style="border:1px solid #E8D5C0;border-top:none;border-radius:0 0 12px 12px;padding:28px">
          <p style="font-size:14px;color:#1A2F4A;margin-bottom:20px">Estimado cliente,</p>
          <p style="font-size:13px;color:#3a4a5a;margin-bottom:20px">Le informamos de los siguientes cambios de tarifa efectivos desde el <strong>01/05/2026</strong>:</p>
          <div style="background:#FFF8F0;border:1.5px solid rgba(232,116,32,.25);border-radius:10px;padding:20px;margin-bottom:20px">
            <table style="width:100%;font-size:13px;border-collapse:collapse">
              <tr style="border-bottom:1px solid rgba(232,116,32,.1)"><td style="padding:8px 0;color:#7a8899">Harina W-280</td><td style="text-align:right;font-weight:700;color:#e03030">0,85€ → 0,91€/kg (+7.1%)</td></tr>
              <tr style="border-bottom:1px solid rgba(232,116,32,.1)"><td style="padding:8px 0;color:#7a8899">Harina W-380</td><td style="text-align:right;font-weight:700;color:#e03030">1,15€ → 1,22€/kg (+6.1%)</td></tr>
              <tr><td style="padding:8px 0;color:#7a8899">Harina Eco T-110</td><td style="text-align:right;font-weight:700;color:#e03030">1,33€ → 1,40€/kg (+5.3%)</td></tr>
            </table>
            <p style="font-size:11px;color:#7a8899;margin-top:10px">Solo se muestran los productos que usted compra habitualmente.</p>
          </div>
          <div style="text-align:center;margin-bottom:24px">
            <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#E87420,#D06A1C);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700">
              Ver mi panel →
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #E8D5C0;margin:20px 0"/>
          <p style="font-size:11px;color:#aab5c0;text-align:center">
            <em>From FoodBridge IA · Soluciones inteligentes by COAXIONIA</em><br>
            <em>www.coaxionia.com · © Todos los derechos reservados</em>
          </p>
        </div>
      </div>`
  } else {
    subject = `Cotización ${ref} — FoodBridge IA`
    html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1A2F4A;padding:24px;text-align:center;border-radius:12px 12px 0 0">
          <span style="font-size:24px;font-weight:900;color:#fff">Food<span style="color:#E87420">Bridge IA</span></span>
        </div>
        <div style="border:1px solid #E8D5C0;border-top:none;border-radius:0 0 12px 12px;padding:28px">
          <p style="font-size:14px;color:#1A2F4A">Hola, te hago llegar la cotización solicitada <strong>${ref}</strong>:</p>
          <div style="background:#FFF8F0;border:1.5px solid rgba(232,116,32,.25);border-radius:10px;padding:20px;margin:16px 0">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(232,116,32,.15)">
              <span style="font-size:18px;font-weight:900;color:#E87420">${ref}</span>
              <span style="font-size:22px;font-weight:900;color:#1A2F4A">${pvp}</span>
            </div>
            <table style="width:100%;font-size:13px;border-collapse:collapse">
              <tr><td style="padding:7px 0;color:#7a8899">Producto</td><td style="text-align:right;font-weight:600;color:#1A2F4A">${prod}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8899">Fabricante</td><td style="text-align:right;font-weight:600;color:#1A2F4A">${fab}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8899">Cantidad</td><td style="text-align:right;font-weight:600;color:#1A2F4A">${qty}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8899">Precio total</td><td style="text-align:right;font-weight:700;color:#E87420">${pvp} (IVA no incluido)</td></tr>
            </table>
          </div>
          <div style="text-align:center;margin-bottom:24px">
            <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#E87420,#D06A1C);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700">Aceptar cotización →</a>
          </div>
          <hr style="border:none;border-top:1px solid #E8D5C0;margin:20px 0"/>
          <p style="font-size:11px;color:#aab5c0;text-align:center">
            <em>From FoodBridge IA · Soluciones inteligentes by COAXIONIA</em><br>
            <em>www.coaxionia.com · © Todos los derechos reservados</em>
          </p>
        </div>
      </div>`
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'FoodBridge IA <noreply@layria.app>', to: [to], subject, html })
  })

  const data = await response.json()
  if (!response.ok) return res.status(500).json({ error: data })
  return res.status(200).json({ success: true })
}
