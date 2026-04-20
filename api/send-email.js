const https = require('https')

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { to, ref, prod, fab, qty, pvp, margen } = req.body
    if (!to) return res.status(400).json({ error: 'Falta email destino' })
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) return res.status(500).json({ error: 'API key no configurada' })

    const body = JSON.stringify({
      from: 'onboarding@resend.dev',
      to: [to],
      subject: `Cotización ${ref} — FoodBridge IA`,
      html: `<h2>FoodBridge IA — ${ref}</h2><p>Producto: ${prod}</p><p>Fabricante: ${fab}</p><p>Cantidad: ${qty}</p><p>Total: ${pvp}</p>`
    })

    await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.resend.com',
        path: '/emails',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      }
      const request = https.request(options, (response) => {
        let data = ''
        response.on('data', chunk => data += chunk)
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve(JSON.parse(data))
          } else {
            reject(new Error(`Resend error ${response.statusCode}: ${data}`))
          }
        })
      })
      request.on('error', reject)
      request.write(body)
      request.end()
    })

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
