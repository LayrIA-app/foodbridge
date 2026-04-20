export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, ref, prod, fab, qty, pvp, margen } = req.body
  const apiKey = process.env.RESEND_API_KEY

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'FoodBridge IA <noreply@layria.app>',
      to: [to],
      subject: `Cotización ${ref} — FoodBridge IA`,
      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#1A2F4A;padding:24px;text-align:center;border-radius:12px 12px 0 0">
          <span style="font-size:24px;font-weight:900;color:#fff">Food<span style="color:#E87420">Bridge IA</span></span>
        </div>
        <div style="border:1px solid #E8D5C0;border-top:none;border-radius:0 0 12px 12px;padding:28px">
          <p style="color:#7a8899">Estimado cliente, le enviamos la cotización <b style="color:#1A2F4A">${ref}</b> generada por FoodBridge IA.</p>
          <div style="background:#FFF8F0;border:1.5px solid rgba(232,116,32,.25);border-radius:10px;padding:20px;margin:16px 0">
            <div style="display:flex;justify-content:space-between;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid rgba(232,116,32,.15)">
              <span style="font-size:18px;font-weight:900;color:#E87420">${ref}</span>
              <span style="font-size:22px;font-weight:900;color:#1A2F4A">${pvp}</span>
            </div>
            <table style="width:100%;font-size:13px;border-collapse:collapse">
              <tr><td style="padding:7px 0;color:#7a8899">📦 Producto</td><td style="text-align:right;font-weight:600;color:#1A2F4A">${prod}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8899">🏭 Fabricante</td><td style="text-align:right;font-weight:600;color:#1A2F4A">${fab}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8899">⚖️ Cantidad</td><td style="text-align:right;font-weight:600;color:#1A2F4A">${qty}</td></tr>
              <tr><td style="padding:7px 0;color:#7a8899">💰 Precio total</td><td style="text-align:right;font-weight:700;color:#E87420">${pvp} (IVA no incluido)</td></tr>
              <tr><td style="padding:7px 0;color:#7a8899">📊 Margen</td><td style="text-align:right;font-weight:600;color:#2D8A30">${margen}</td></tr>
            </table>
          </div>
          <div style="background:#F0FFF4;border-left:3px solid #2D8A30;padding:12px 16px;font-size:12px;color:#2D8A30;margin-bottom:16px">
            ✓ Cotización generada automáticamente por FoodBridge IA
          </div>
          <p style="font-size:12px;color:#7a8899">Quedamos a su disposición.<br><br><b style="color:#1A2F4A">FoodBridge IA</b> · Powered by COAXIONIA</p>
        </div>
      </div>`
    })
  })

  const data = await response.json()
  if (!response.ok) return res.status(500).json({ error: data })
  return res.status(200).json({ success: true })
}
