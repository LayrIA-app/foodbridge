export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, ref, prod, fab, qty, pvp } = req.body
  const apiKey = process.env.RESEND_API_KEY
  const appUrl = 'https://foodbridge-ochre.vercel.app'

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'FoodBridge IA <noreply@layria.app>',
      to: [to],
      subject: `Cotización ${ref} — FoodBridge IA`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">

          <div style="background:#1A2F4A;padding:24px;text-align:center;border-radius:12px 12px 0 0">
            <span style="font-size:26px;font-weight:900;color:#fff;letter-spacing:2px">Food<span style="color:#E87420">Bridge IA</span></span>
          </div>

          <div style="border:1px solid #E8D5C0;border-top:none;border-radius:0 0 12px 12px;padding:32px">

            <p style="font-size:15px;color:#1A2F4A;margin-bottom:24px">
              Hola, te hago llegar la cotización solicitada <strong>${ref}</strong>:
            </p>

            <div style="background:#FFF8F0;border:1.5px solid rgba(232,116,32,.25);border-radius:10px;padding:24px;margin-bottom:24px">
              <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:1px solid rgba(232,116,32,.15);margin-bottom:16px">
                <span style="font-size:20px;font-weight:900;color:#E87420">${ref}</span>
                <span style="font-size:26px;font-weight:900;color:#1A2F4A">${pvp}</span>
              </div>
              <table style="width:100%;font-size:14px;border-collapse:collapse">
                <tr style="border-bottom:1px solid rgba(232,116,32,.1)">
                  <td style="padding:10px 0;color:#7a8899;width:40%">Producto</td>
                  <td style="padding:10px 0;font-weight:600;color:#1A2F4A">${prod}</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(232,116,32,.1)">
                  <td style="padding:10px 0;color:#7a8899">Fabricante</td>
                  <td style="padding:10px 0;font-weight:600;color:#1A2F4A">${fab}</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(232,116,32,.1)">
                  <td style="padding:10px 0;color:#7a8899">Cantidad</td>
                  <td style="padding:10px 0;font-weight:600;color:#1A2F4A">${qty}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;color:#7a8899">Precio total</td>
                  <td style="padding:10px 0;font-weight:700;color:#E87420;font-size:16px">${pvp} <span style="font-size:12px;color:#7a8899">(IVA no incluido)</span></td>
                </tr>
              </table>
            </div>

            <div style="text-align:center;margin-bottom:28px">
              <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#E87420,#D06A1C);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:1px">
                Aceptar cotización →
              </a>
            </div>

            <hr style="border:none;border-top:1px solid #E8D5C0;margin:24px 0"/>

            <p style="font-size:11px;color:#aab5c0;text-align:center;line-height:1.8;margin:0">
              <em>From FoodBridge IA · Soluciones inteligentes by COAXIONIA</em><br>
              <em>www.coaxionia.com · © Todos los derechos reservados</em>
            </p>

          </div>
        </div>
      `
    })
  })

  const data = await response.json()
  if (!response.ok) return res.status(500).json({ error: data })
  return res.status(200).json({ success: true })
}
