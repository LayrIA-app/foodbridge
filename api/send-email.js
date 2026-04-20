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
      from: 'onboarding@resend.dev',
      to: [to],
      subject: `Cotización ${ref} — FoodBridge IA`,
      html: `<h2>FoodBridge IA</h2><p><b>Ref:</b> ${ref}</p><p><b>Producto:</b> ${prod}</p><p><b>Fabricante:</b> ${fab}</p><p><b>Cantidad:</b> ${qty}</p><p><b>Total:</b> ${pvp}</p>`
    })
  })

  const data = await response.json()
  if (!response.ok) return res.status(500).json({ error: data })
  return res.status(200).json({ success: true })
}
