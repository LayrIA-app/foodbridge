import { useEffect, useRef, useState } from 'react'

const CACHE_VERSION = 'v1'
const TTL_MS = 60 * 60 * 1000  // 1 hora

function stableStringify(obj) {
  if (obj == null || typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) return '[' + obj.map(stableStringify).join(',') + ']'
  const keys = Object.keys(obj).sort()
  return '{' + keys.map(k => JSON.stringify(k) + ':' + stableStringify(obj[k])).join(',') + '}'
}

function cacheKey(context, data) {
  return `fb_insight_${CACHE_VERSION}_${context}_${stableStringify(data)}`
}

/**
 * Hook para obtener un insight IA para una seccion, con cache en localStorage (1h).
 *
 *   const { text, loading, error } = useIaInsight('fabricante_dashboard', { pedidos_activos: 5 })
 *
 * - Si los datos cambian, se refetch. Mientras tanto el texto anterior sigue visible.
 * - Si el endpoint falla, devuelve texto vacio y error; la UI puede ocultar el IABox.
 * - Si data es null/undefined o ya hay un fetch en curso, no refetch.
 */
export function useIaInsight(context, data, { enabled = true } = {}) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const key = context && data ? cacheKey(context, data) : null

  useEffect(() => {
    if (!enabled || !key) return

    // Primero, probamos cache localStorage
    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.expires > Date.now() && typeof parsed.text === 'string') {
          setText(parsed.text)
          setLoading(false)
          setError(null)
          return
        }
      }
    } catch { /* ignorar */ }

    // Fetch fresh
    setLoading(true)
    setError(null)
    const ctrl = new AbortController()
    abortRef.current?.abort?.()
    abortRef.current = ctrl

    fetch('/api/insight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ context, data }),
      signal: ctrl.signal,
    })
      .then(async r => {
        const payload = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(payload.error || `HTTP ${r.status}`)
        const t = typeof payload.text === 'string' ? payload.text : ''
        setText(t)
        try {
          localStorage.setItem(key, JSON.stringify({ text: t, expires: Date.now() + TTL_MS }))
        } catch { /* storage lleno o denegado: ignorar */ }
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setError(err)
      })
      .finally(() => setLoading(false))

    return () => ctrl.abort()
  }, [key, enabled, context])

  return { text, loading, error }
}
