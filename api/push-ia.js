import Anthropic from '@anthropic-ai/sdk'

const SYSTEM =
  `Eres la IA proactiva de FoodBridge IA (ecosistema COAXIONIA, 4a generacion). ` +
  `Generas notificaciones push (toasts) que describen acciones que la IA YA HA ` +
  `EJECUTADO en segundo plano, sin intervencion del usuario. Nunca son sugerencias, ` +
  `nunca son preguntas. Siempre en pasado ("generado", "enviado", "detectado", ` +
  `"ajustado") o presente progresivo ("monitorizando", "gestionando"). ` +
  `\n\n` +
  `Devuelves SIEMPRE un JSON array de EXACTAMENTE 6 objetos con los 6 tipos ` +
  `de notificacion en este orden estricto:\n` +
  `  1. Accion comercial/aprovisionamiento autonoma (generar pedido, propuesta, campana)\n` +
  `  2. Alerta operativa critica con accion ejecutada (detecto X e hizo Y)\n` +
  `  3. Gestion de riesgo o seguimiento automatico (envio aviso, reconfirmo, escalo)\n` +
  `  4. Ajuste automatico de recurso (modifico asignacion, amplio/redujo turno)\n` +
  `  5. Generacion automatica de documento (informe, factura, briefing, resumen)\n` +
  `  6. Deteccion proactiva o prediccion (anticipa situacion futura y prepara respuesta)\n\n` +
  `Cada objeto: { "label": "string en mayusculas max 22 chars", ` +
  `"text": "string 1 frase max 110 chars con un dato concreto de los datos recibidos", ` +
  `"type": "one of: orange|green|blue|red|amber" }\n\n` +
  `Reglas estrictas: sin markdown, sin emojis, espanol, sin firmar, sin saludos, ` +
  `sin preguntas al usuario. Los textos usan el vocabulario del sector alimentacion. ` +
  `Nunca inventes cifras que no aparecen en los datos.`

const TYPE_TO_BAR = {
  orange: '#E87420',
  green:  '#2D8A30',
  blue:   '#1A78FF',
  red:    '#e03030',
  amber:  '#e8a010',
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { role, data } = req.body || {}
    const client = new Anthropic()
    const userText = `ROL: ${role}\nDATOS JSON:\n${JSON.stringify(data ?? {}, null, 2)}\n\nDevuelve EXACTAMENTE 6 notificaciones como JSON array sin markdown.`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 800,
      system: [
        { type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: userText }],
    })

    const raw = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim()
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```$/g, '').trim()
    let arr = []
    try { arr = JSON.parse(cleaned) } catch { arr = [] }
    if (!Array.isArray(arr)) arr = []

    const mensajes = arr
      .filter(m => m && typeof m.text === 'string' && typeof m.label === 'string')
      .map(m => ({
        label: m.label.toUpperCase().slice(0, 26),
        text: m.text.slice(0, 140),
        bar: TYPE_TO_BAR[m.type] || '#1A78FF',
      }))
      .slice(0, 6)

    return res.status(200).json({ mensajes })
  } catch (err) {
    console.error('[api/push-ia]', err?.message || err)
    return res.status(err?.status || 500).json({ error: err?.message || 'Internal error' })
  }
}
