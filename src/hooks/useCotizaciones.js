import { useCallback } from 'react'
import { useSupabaseList } from './useSupabaseList'
import { supabase } from '../services/supabase'

const SELECT =
  'id, ref, status, cliente_name, product_name, quantity, unit, unit_price, ' +
  'total_price, margin_pct, notes, created_at, comercial_id, cliente_id, ' +
  'product_id, fabricante_id'

export function useCotizaciones({ profile } = {}) {
  const enabled = !!profile?.id
  const { rows, loading, error, refresh } = useSupabaseList({
    table: 'cotizaciones',
    select: SELECT,
    enabled,
    filter: (q) => q.order('created_at', { ascending: false }),
  })

  const createCotizacion = useCallback(async (input) => {
    if (!profile) return { error: new Error('no profile') }
    const { data, error } = await supabase
      .from('cotizaciones')
      .insert({ ...input, comercial_id: profile.id })
      .select('id')
      .single()
    if (error) return { error }
    await refresh()
    return { data }
  }, [profile, refresh])

  const updateCotizacion = useCallback(async (id, patch) => {
    const { error } = await supabase.from('cotizaciones').update(patch).eq('id', id)
    if (error) return { error }
    await refresh()
    return {}
  }, [refresh])

  const deleteCotizacion = useCallback(async (id) => {
    const { error } = await supabase.from('cotizaciones').delete().eq('id', id)
    if (error) return { error }
    await refresh()
    return {}
  }, [refresh])

  return { cotizaciones: rows, loading, error, refresh, createCotizacion, updateCotizacion, deleteCotizacion }
}
