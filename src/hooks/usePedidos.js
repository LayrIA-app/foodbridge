import { useCallback, useEffect, useState } from 'react'
import { useSupabaseList } from './useSupabaseList'
import { supabase } from '../services/supabase'

const SELECT =
  'id, ref, status, total_amount, expected_date, delivered_at, created_at, ' +
  'cliente_id, cliente_name, fabricante_id, cotizacion_id, ' +
  'lines:pedido_lines(id, product_id, product_name, quantity, unit, unit_price, line_total)'

/**
 * Pedidos visibles para el usuario actual segun RLS:
 *  - cliente: los que le tocan como cliente_id
 *  - fabricante: los que le tocan como fabricante_id
 *  - comercial: lectura via cotizaciones (RLS lo filtra)
 */
export function usePedidos({ profile } = {}) {
  const enabled = !!profile?.id
  const { rows, loading, error, refresh } = useSupabaseList({
    table: 'pedidos',
    select: SELECT,
    enabled,
    filter: (q) => q.order('created_at', { ascending: false }),
  })

  const countByStatus = rows.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1
    return acc
  }, {})

  const createPedido = useCallback(async ({ ref, fabricanteId, totalAmount, expectedDate, cotizacionId, lines }) => {
    if (!profile) return { error: new Error('no profile') }
    const { data, error } = await supabase
      .from('pedidos')
      .insert({
        ref,
        cliente_id: profile.id,
        fabricante_id: fabricanteId,
        total_amount: totalAmount,
        expected_date: expectedDate,
        cotizacion_id: cotizacionId,
      })
      .select('id')
      .single()
    if (error) return { error }
    if (lines?.length) {
      const { error: linesErr } = await supabase
        .from('pedido_lines')
        .insert(lines.map((l) => ({ ...l, pedido_id: data.id })))
      if (linesErr) return { error: linesErr }
    }
    await refresh()
    return { data }
  }, [profile, refresh])

  const updateStatus = useCallback(async (id, newStatus) => {
    const patch = { status: newStatus }
    if (newStatus === 'delivered') patch.delivered_at = new Date().toISOString()
    const { error } = await supabase.from('pedidos').update(patch).eq('id', id)
    if (error) return { error }
    await refresh()
    return {}
  }, [refresh])

  return { pedidos: rows, loading, error, refresh, countByStatus, createPedido, updateStatus }
}

/** Lineas de un pedido concreto. */
export function usePedidoLines(pedidoId) {
  const { rows, loading, error, refresh } = useSupabaseList({
    table: 'pedido_lines',
    select: 'id, product_id, product_name, quantity, unit, unit_price, line_total',
    enabled: !!pedidoId,
    filter: (q) => q.eq('pedido_id', pedidoId),
  })
  return { lines: rows, loading, error, refresh }
}

/**
 * Devuelve un mapa cotizacion_id -> cliente_name para un set de pedidos.
 * RLS filtrara a las cotizaciones que el usuario puede leer; el resto quedan sin match.
 * Pensado para que el comercial muestre el cliente en su lista de pedidos.
 */
export function useCotizacionClientesMap(pedidos) {
  const [map, setMap] = useState({})
  const ids = (pedidos || []).map(p => p.cotizacion_id).filter(Boolean)
  const key = ids.sort().join(',')

  useEffect(() => {
    if (!ids.length) { setMap({}); return }
    let cancelled = false
    ;(async () => {
      const { data, error } = await supabase
        .from('cotizaciones')
        .select('id, cliente_name, product_name, margin_pct')
        .in('id', ids)
      if (cancelled) return
      if (error) { console.warn('[supabase] cotizaciones lookup:', error.message); return }
      const m = {}
      for (const r of data || []) m[r.id] = r
      setMap(m)
    })()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return map
}
