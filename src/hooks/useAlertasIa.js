import { useEffect, useRef, useState } from 'react'

const CACHE_VERSION = 'v1'
const TTL_MS = 30 * 60 * 1000  // 30 min (alertas se refrescan mas a menudo que insights)

function stable(obj) {
  if (obj == null || typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) return '[' + obj.map(stable).join(',') + ']'
  return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k) + ':' + stable(obj[k])).join(',') + '}'
}
function cacheKey(role, data) { return `fb_alertas_${CACHE_VERSION}_${role}_${stable(data)}` }

const FALLBACK = [{ sec: 'Sin conexión', tipo: 'amber', txt: 'No se pudieron cargar alertas IA. Reintenta más tarde.' }]

export function useAlertasIa({ role, data, enabled = true }) {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const key = role && data ? cacheKey(role, data) : null

  useEffect(() => {
    if (!enabled || !key) return

    try {
      const raw = localStorage.getItem(key)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && parsed.expires > Date.now() && Array.isArray(parsed.alertas)) {
          setAlertas(parsed.alertas)
          setLoading(false)
          return
        }
      }
    } catch { /* noop */ }

    setLoading(true)
    setError(null)
    const ctrl = new AbortController()
    abortRef.current?.abort?.()
    abortRef.current = ctrl

    fetch('/api/alertas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, data }),
      signal: ctrl.signal,
    })
      .then(async r => {
        const payload = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(payload.error || `HTTP ${r.status}`)
        const arr = Array.isArray(payload.alertas) ? payload.alertas : []
        setAlertas(arr)
        try {
          localStorage.setItem(key, JSON.stringify({ alertas: arr, expires: Date.now() + TTL_MS }))
        } catch { /* noop */ }
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setError(err)
        setAlertas(FALLBACK)
      })
      .finally(() => setLoading(false))

    return () => ctrl.abort()
  }, [key, enabled, role])

  return { alertas, loading, error }
}
