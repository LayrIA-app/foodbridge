import Anthropic from '@anthropic-ai/sdk'

const ROLE_GUIDES = {
  fabricante:
    `Alertas para un fabricante de alimentacion. Secciones posibles: Dashboard, ` +
    `Ventas, Rentabilidad, Certificaciones, Catalogo, Comunicaciones, Operaciones, ` +
    `Fichas, Lotes, Alergenos, Trazabilidad. Ejemplos de alertas buenas: ` +
    `"Lote LXX con fecha caducidad proxima", "Tarifa W-280 no se actualiza hace 90d", ` +
    `"Cliente X dejo de comprar hace 45d", "3 pedidos retrasados".`,
  comercial:
    `Alertas para un comercial de alimentacion. Secciones: Ruta, Visitas, Pedidos, ` +
    `Cotizaciones, CRM. Ejemplos: "Cotizacion COT-092 sin respuesta 7d", ` +
    `"Visita Leopold programada hoy 10:30", "Pedido retrasado requiere llamada".`,
  cliente:
    `Alertas para un cliente distribuidor de alimentacion. Secciones: Pedidos, ` +
    `Cotizaciones, Busqueda, Trazabilidad. Ejemplos: "Cotizacion COT-091 vence en 2d", ` +
    `"Pedido PED-387 retrasado", "Nueva cotizacion recibida de comercial".`,
}

const SYSTEM =
  `Eres la IA proactiva de FoodBridge IA (ecosistema COAXIONIA, 4a generacion). ` +
  `Tu trabajo es priorizar alertas del dia para el usuario segun los datos que te paso. ` +
  `Devuelves SIEMPRE un JSON valido sin markdown. Estructura: un array de entre 3 y 6 ` +
  `objetos, cada uno con: ` +
  `"sec" (nombre corto de la seccion destino, string), ` +
  `"tipo" (uno de: "red" | "amber" | "green" | "blue"), ` +
  `"txt" (texto corto, maximo 110 caracteres, sin emojis). ` +
  `Ordenadas de mayor a menor urgencia. Nunca inventes referencias ni cifras que no ` +
  `aparezcan en los datos. Si no hay datos suficientes, devuelve un array con 1 alerta ` +
  `green tipo "Todo en orden · sin incidencias detectadas".`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { role, data } = req.body || {}
    const guide = ROLE_GUIDES[role] || ROLE_GUIDES.fabricante

    const client = new Anthropic()
    const systemText = SYSTEM + '\n\nContexto de rol:\n' + guide

    const userText = `ROL: ${role}\nDATOS JSON:\n${JSON.stringify(data ?? {}, null, 2)}\n\nDevuelve el array JSON sin markdown.`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 600,
      system: [
        { type: 'text', text: systemText, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: userText }],
    })

    const raw = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
    // Intentar parsear JSON (si viene envuelto en ```json ... ``` lo limpio)
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/g, '').trim()
    let alertas = []
    try { alertas = JSON.parse(cleaned) } catch { alertas = [{ sec: 'General', tipo: 'green', txt: 'Todo en orden · sin incidencias detectadas' }] }
    if (!Array.isArray(alertas)) alertas = []

    // Sanitizar
    alertas = alertas
      .filter(a => a && typeof a.txt === 'string' && typeof a.sec === 'string')
      .map(a => ({
        sec: a.sec.slice(0, 40),
        tipo: ['red','amber','green','blue'].includes(a.tipo) ? a.tipo : 'blue',
        txt: a.txt.slice(0, 140),
      }))
      .slice(0, 8)

    return res.status(200).json({ alertas })
  } catch (err) {
    const status = err?.status || 500
    console.error('[api/alertas]', err?.message || err)
    return res.status(status).json({ error: err?.message || 'Internal error' })
  }
}
