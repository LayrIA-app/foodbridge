import Anthropic from '@anthropic-ai/sdk'

const SYSTEM =
  `Eres la IA proactiva de FoodBridge IA (ecosistema COAXIONIA, 4a generacion) ` +
  `redactando emails transaccionales en espanol para el sector alimentacion. ` +
  `Tono profesional, directo, sin humo, sin saludos genericos largos. Siempre ` +
  `incluye los datos concretos que se te pasan (referencia, cifras, nombre de ` +
  `cliente). Maximo 180 palabras. Devuelves SIEMPRE un JSON valido sin markdown ` +
  `con la forma: { "subject": "string max 90 chars", "html": "string html ` +
  `formateado con div, p, strong, table etc; estilo inline en cada tag" }. ` +
  `El HTML debe usar la paleta FoodBridge: navy #1A2F4A (cabecera), naranja ` +
  `#E87420 (resaltes y boton), crema #FFF8F0 (bloques informativos). Sin JS, ` +
  `sin scripts. Incluye al final una nota pequena: ` +
  `"From FoodBridge IA - Soluciones inteligentes by COAXIONIA".`

const TIPO_GUIDES = {
  tarifas:
    `Email de notificacion de cambio de tarifas a un cliente distribuidor. ` +
    `Incluye la lista concreta de productos afectados con precio antes/despues ` +
    `y la fecha efectiva. Mensaje corto, informativo, sin tono comercial agresivo.`,
  cotizacion:
    `Email enviando una cotizacion formal a un cliente. Incluye referencia, ` +
    `producto, cantidad, precio total. Tono profesional cercano. El subject ` +
    `empieza por "Cotizacion <REF>" ej. "Cotizacion COT-2026-00123 - Harina W-280".`,
  pedido_confirmado:
    `Email al cliente confirmando que su pedido ha sido aceptado por el ` +
    `fabricante. Incluye referencia del pedido y fecha de entrega estimada.`,
  seguimiento:
    `Email de seguimiento corto despues de una visita comercial. Agradece, ` +
    `resume compromisos y propone proximos pasos concretos.`,
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { tipo, datos } = req.body || {}
    const guide = TIPO_GUIDES[tipo] || TIPO_GUIDES.cotizacion

    const client = new Anthropic()
    const systemText = SYSTEM + '\n\nGuia por tipo:\n' + guide
    const userText = `TIPO: ${tipo}\nDATOS JSON:\n${JSON.stringify(datos ?? {}, null, 2)}\n\nDevuelve el email como JSON sin markdown.`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1200,
      system: [
        { type: 'text', text: systemText, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: userText }],
    })

    const raw = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/g, '').trim()
    let parsed = { subject: '', html: '' }
    try { parsed = JSON.parse(cleaned) } catch {}
    const subject = typeof parsed?.subject === 'string' ? parsed.subject.slice(0, 120) : ''
    const html = typeof parsed?.html === 'string' ? parsed.html : ''
    if (!subject || !html) {
      return res.status(502).json({ error: 'IA no devolvio subject/html validos', raw: raw.slice(0, 400) })
    }
    return res.status(200).json({ subject, html })
  } catch (err) {
    console.error('[api/email-borrador]', err?.message || err)
    return res.status(err?.status || 500).json({ error: err?.message || 'Internal error' })
  }
}
