module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { to, ref, prod, fab, qty, pvp, margen } = req.body

    if (!to || !ref) return res.status(400).json({ error: 'Faltan datos: to y ref son obligatorios' })

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY no está configurada en el entorno' })

    const payload = {
      from: 'onboarding@resend.dev',
      to: [to],
      subject: `Cotización ${ref} — FoodBridge IA`,
      html: `<div style="font-family:Arial,sans-serif;padding:24px;max-width:600px">
        <h2 style="color:#1A2F4A">FoodBridge IA — ${ref}</h2>
        <p>Estimado cliente, le enviamos la cotización generada automáticamente.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;border:1px solid #ddd;color:#666">Producto</td><td style="padding:8px;border:1px solid #ddd;font-weight:bold">${prod || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;color:#666">Fabricante</td><td style="padding:8px;border:1px solid #ddd;font-weight:bold">${fab || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;color:#666">Cantidad</td><td style="padding:8px;border:1px solid #ddd;font-weight:bold">${qty || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;color:#666">Precio total</td><td style="padding:8px;border:1px solid #ddd;font-weight:bold;color:#E87420">${pvp || '—'} (IVA no incluido)</td></tr>
          <tr><td style="padding:8px;border:1px solid #ddd;color:#666">Margen</td><td style="padding:8px;border:1px solid #ddd;font-weight:bold;color:#2D8A30">${margen || '—'}</td></tr>
        </table>
        <p style="color:#666;font-size:12px">Generada por FoodBridge IA · Powered by COAXIONIA</p>
      </div>`
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    const text = await response.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Error de Resend', details: data, status: response.status })
    }

    return res.status(200).json({ success: true, id: data.id })

  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack })
  }
}
