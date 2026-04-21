import { useEffect, useRef, useState } from 'react'

const CACHE_VERSION = 'v1'
const TTL_MS = 60 * 60 * 1000  // 1 hora

function stable(obj) {
  if (obj == null || typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) return '[' + obj.map(stable).join(',') + ']'
  return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k) + ':' + stable(obj[k])).join(',') + '}'
}
function cacheKey(role, data) { return `fb_pushia_${CACHE_VERSION}_${role}_${stable(data)}` }

/**
 * Descarga una sola vez (por combinacion role+data) un array de 6 mensajes
 * push generados por la IA. El componente que los use los itera a su ritmo.
 */
export function usePushIa({ role, data, enabled = true }) {
  const [mensajes, setMensajes] = useState([])
  const [loading, setLoading] = useState(false)
  const abortRef = useRef(null)
  const key = role && data ? cacheKey(role, data) : null

  useEffect(() => {
    if (!enabled || !key) return

    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.expires > Date.now() && Array.isArray(parsed.mensajes)) {
          setMensajes(parsed.mensajes)
          return
        }
      }
    } catch { /* noop */ }

    setLoading(true)
    const ctrl = new AbortController()
    abortRef.current?.abort?.()
    abortRef.current = ctrl

    fetch('/api/push-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, data }),
      signal: ctrl.signal,
    })
      .then(async r => {
        const payload = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(payload.error || `HTTP ${r.status}`)
        const m = Array.isArray(payload.mensajes) ? payload.mensajes : []
        setMensajes(m)
        try {
          localStorage.setItem(key, JSON.stringify({ mensajes: m, expires: Date.now() + TTL_MS }))
        } catch { /* noop */ }
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        console.warn('[push-ia]', err?.message || err)
      })
      .finally(() => setLoading(false))

    return () => ctrl.abort()
  }, [key, enabled, role])

  return { mensajes, loading }
}
