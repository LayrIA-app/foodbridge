import Anthropic from '@anthropic-ai/sdk'

// Contextos soportados. CLAVE: no es un chat libre — solo responde a contextos
// predefinidos con datos cerrados. Coherente con filosofia COAXIONIA (IA
// proactiva integrada en cada seccion, sin chat reactivo).
const CONTEXTS = {
  fabricante_dashboard: {
    system:
      `Eres el asistente de analisis integrado del dashboard CEO de un fabricante ` +
      `de alimentacion en FoodBridge IA. Recibes KPIs agregados y devuelves UN ` +
      `unico insight de 2-3 frases con la conclusion mas relevante, accionable ` +
      `y coherente con los datos. Nunca inventes cifras. Tono profesional, directo, ` +
      `sin humo. Sin tratamiento al usuario. Sin preguntas. Sin saludos. Solo el ` +
      `insight como si fuera el bloque "Alerta IA" de la seccion.`,
  },
  fabricante_ventas_cliente: {
    system:
      `Analizas la concentracion de ventas por cliente del fabricante. En 2-3 frases ` +
      `detecta si hay riesgo de concentracion (>40% un cliente), oportunidades de ` +
      `crecer o clientes que han dejado de comprar. Datos reales, sin invenciones. ` +
      `Formato directo para bloque IABox.`,
  },
  fabricante_rentabilidad: {
    system:
      `Analizas rentabilidad por producto del fabricante. En 2-3 frases destaca el ` +
      `producto top por facturacion, productos sin ventas y posibles palancas. ` +
      `Sin inventar precios ni margenes. Formato IABox.`,
  },
  fabricante_catalogo: {
    system:
      `Analizas el catalogo del fabricante. En 2-3 frases destaca productos ` +
      `sin certificaciones, desequilibrios de precio o huecos del catalogo. Sin ` +
      `inventar datos. Formato IABox.`,
  },
  comercial_pedidos: {
    system:
      `Analizas el estado de los pedidos del comercial. En 2-3 frases destaca ` +
      `los pedidos en riesgo (retrasados, sin confirmar), ritmo y volumen. ` +
      `Sin inventar. Formato IABox.`,
  },
  comercial_cotizaciones: {
    system:
      `Analizas la conversion de cotizaciones del comercial. En 2-3 frases con ` +
      `tasa de conversion, volumen cotizado, y recomendacion concreta (ej. revisar ` +
      `margenes, reactivar borradores). Formato IABox.`,
  },
  comercial_ruta: {
    system:
      `Analizas la ruta del comercial. En 2-3 frases destaca la urgencia del dia, ` +
      `riesgos de solapamiento horario, y la visita mas critica. Formato IABox.`,
  },
  cliente_pedidos: {
    system:
      `Analizas los pedidos activos del cliente distribuidor. En 2-3 frases ` +
      `destaca los que estan en transito, retrasos, y pedidos proximos a entregar. ` +
      `Formato IABox.`,
  },
  cliente_cotizaciones: {
    system:
      `Analizas las cotizaciones recibidas del cliente. En 2-3 frases prioriza ` +
      `cuales aceptar (margen, precio, plazo), cuales caducar. Formato IABox.`,
  },
}

const BASE_SYSTEM =
  `Eres la IA proactiva integrada de FoodBridge IA (ecosistema COAXIONIA de IA ` +
  `adaptativa 4a generacion). No eres un chatbot reactivo: no respondes preguntas, ` +
  `solo generas insights basados en los datos que te paso. Siempre en espanol, ` +
  `sin emojis, sin saludos, sin tratamiento al usuario, sin firma. Maximo 3 frases. ` +
  `Puedes usar marcado HTML minimo: <strong>...</strong> para resaltar 1 cifra clave.`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { context, data } = req.body || {}
    const ctx = CONTEXTS[context]
    if (!ctx) return res.status(400).json({ error: `unknown context: ${context}` })

    const client = new Anthropic()
    const systemText = BASE_SYSTEM + '\n\n' + ctx.system

    const userText = `CONTEXTO: ${context}\nDATOS JSON:\n${JSON.stringify(data ?? {}, null, 2)}\n\nDevuelve el insight en 2-3 frases.`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: [
        { type: 'text', text: systemText, cache_control: { type: 'ephemeral' } },
      ],
      messages: [{ role: 'user', content: userText }],
    })

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()

    return res.status(200).json({ text, usage: response.usage })
  } catch (err) {
    const status = err?.status || 500
    const message = err?.message || 'Internal error'
    console.error('[api/insight]', message)
    return res.status(status).json({ error: message })
  }
}
