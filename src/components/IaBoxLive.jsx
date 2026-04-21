import { useIaInsight } from '../hooks/useIaInsight'

/**
 * Caja de insight IA proactivo — usa el endpoint /api/insight con un contexto
 * cerrado + datos reales de la seccion. Mantiene el look de los IABox
 * existentes (fondo naranja claro, borde izquierdo naranja).
 *
 * Props:
 *   - context: una de las claves definidas en api/insight.js
 *   - data: objeto con los datos reales a analizar
 *   - fallback: texto HTML que se muestra si la IA no responde (env var
 *               ANTHROPIC_API_KEY faltante, error 500, etc.)
 *   - accent / navy: colores para adaptar al sector (por defecto FoodBridge)
 */
export default function IaBoxLive({ context, data, fallback = '', accent = '#E87420', navy = '#1A2F4A', style }) {
  const { text, loading, error } = useIaInsight(context, data)
  const shown = text || (error ? fallback : '')

  const wrapStyle = {
    marginTop: 10,
    padding: '10px 14px',
    background: `linear-gradient(135deg,${accent}0D,${accent}14)`,
    border: `1px solid ${accent}33`,
    borderRadius: 8,
    fontSize: '.72rem',
    color: '#3a4a5a',
    lineHeight: 1.5,
    ...style,
  }

  if (loading && !shown) {
    return (
      <div style={wrapStyle}>
        <span style={{ fontSize:'.55rem', fontWeight:700, color:accent, letterSpacing:'.1em', textTransform:'uppercase', marginRight:6 }}>IA analizando…</span>
        <span style={{ color:'#7a8899' }}>Procesando datos de la sección…</span>
      </div>
    )
  }

  if (!shown) {
    return null
  }

  return (
    <div style={wrapStyle}>
      <span style={{ fontSize:'.55rem', fontWeight:700, color:accent, letterSpacing:'.1em', textTransform:'uppercase', marginRight:6 }}>Insight IA</span>
      <span dangerouslySetInnerHTML={{ __html: shown }} />
    </div>
  )
}
