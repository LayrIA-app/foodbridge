import { useEffect, useRef, useState } from 'react'

function stable(obj) {
  if (obj == null || typeof obj !== 'object') return JSON.stringify(obj)
  if (Array.isArray(obj)) return '[' + obj.map(stable).join(',') + ']'
  return '{' + Object.keys(obj).sort().map(k => JSON.stringify(k) + ':' + stable(obj[k])).join(',') + '}'
}

/**
 * Pide a /api/email-borrador un subject+html redactado por IA (Sonnet 4).
 * No cachea — cada apertura del modal debe regenerar porque los datos cambian.
 * enabled=false evita disparar la llamada hasta que el usuario abre el modal.
 */
export function useEmailBorrador({ tipo, datos, enabled = true }) {
  const [subject, setSubject] = useState('')
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)
  const key = enabled && tipo && datos ? `${tipo}::${stable(datos)}` : null

  useEffect(() => {
    if (!key) return
    setLoading(true)
    setError(null)
    const ctrl = new AbortController()
    abortRef.current?.abort?.()
    abortRef.current = ctrl
    fetch('/api/email-borrador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, datos }),
      signal: ctrl.signal,
    })
      .then(async r => {
        const payload = await r.json().catch(() => ({}))
        if (!r.ok) throw new Error(payload.error || `HTTP ${r.status}`)
        setSubject(typeof payload.subject === 'string' ? payload.subject : '')
        setHtml(typeof payload.html === 'string' ? payload.html : '')
      })
      .catch(err => {
        if (err?.name === 'AbortError') return
        setError(err)
      })
      .finally(() => setLoading(false))
    return () => ctrl.abort()
  }, [key])

  return { subject, html, loading, error }
}
