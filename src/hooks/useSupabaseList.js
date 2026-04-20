import { useCallback, useEffect, useRef, useState } from 'react'
import { supabase } from '../services/supabase'

/**
 * Hook generico para leer y suscribirse a una tabla/vista de Supabase.
 *
 *   const { rows, loading, error, refresh } = useSupabaseList({
 *     table: 'pedidos',
 *     select: 'id, ref, status, total_amount, created_at',
 *     filter: (q) => q.eq('cliente_id', userId).order('created_at', { ascending: false }),
 *     enabled: !!userId,
 *   })
 *
 * Parametros:
 *   - table:   nombre de tabla o vista
 *   - select:  string de columnas
 *   - filter:  funcion que recibe un query builder y devuelve otro (order/eq/in/limit...)
 *   - enabled: si false no ejecuta el fetch (util mientras cargan dependencias)
 *
 * Devuelve: { rows, loading, error, refresh }
 *   - rows es siempre array (nunca null)
 *   - refresh() re-ejecuta la query manualmente
 */
export function useSupabaseList({ table, select = '*', filter, enabled = true }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)

  // Serializamos filter a string para poder detectar cambios en deps
  const filterRef = useRef(filter)
  filterRef.current = filter

  const fetchRows = useCallback(async () => {
    if (!enabled) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      let q = supabase.from(table).select(select)
      if (filterRef.current) q = filterRef.current(q)
      const { data, error: err } = await q
      if (err) throw err
      setRows(data || [])
    } catch (e) {
      console.error(`[supabase] list ${table}:`, e?.message || e)
      setError(e)
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [table, select, enabled])

  useEffect(() => { fetchRows() }, [fetchRows])

  return { rows, loading, error, refresh: fetchRows }
}
