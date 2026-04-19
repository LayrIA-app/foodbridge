const SYSTEM_FABRICANTE = `Eres el asistente de IA de FoodBridge para fabricantes de alimentos.
Ayudas a fabricantes a optimizar su catálogo, encontrar clientes, analizar tendencias del mercado alimentario y mejorar sus estrategias de venta.
Responde siempre en español, de forma concisa y profesional. Máximo 3-4 frases por respuesta.
Contexto: el usuario es un fabricante de productos lácteos llamado Martín Larrea de "Lácteos Larrea S.L."`

const SYSTEM_CLIENTE = `Eres el asistente de IA de FoodBridge para compradores y distribuidores de alimentación.
Ayudas a encontrar los mejores fabricantes según necesidades específicas, comparar productos, analizar precios y optimizar cadenas de suministro.
Responde siempre en español, de forma concisa y profesional. Máximo 3-4 frases por respuesta.
Contexto: el usuario es Sara Gómez de "Distribuciones SG", una distribuidora de alimentación.`

const SYSTEM_ADMIN = `Eres el asistente de IA de FoodBridge para administradores de la plataforma.
Ayudas a analizar métricas globales, detectar oportunidades de mejora, gestionar usuarios y optimizar el matching entre fabricantes y clientes.
Responde siempre en español, de forma concisa y profesional. Máximo 3-4 frases por respuesta.`

export async function askIA(message, role, history = []) {
  const systemPrompts = {
    fabricante: SYSTEM_FABRICANTE,
    cliente: SYSTEM_CLIENTE,
    admin: SYSTEM_ADMIN
  }

  const messages = [
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ]

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompts[role] || systemPrompts.fabricante,
      messages
    })
  })

  const data = await response.json()
  if (data.error) throw new Error(data.error.message)
  return data.content[0].text
}
