import { useCallback } from 'react'
import { useSupabaseList } from './useSupabaseList'
import { supabase } from '../services/supabase'

const SELECT =
  'id, fabricante_id, sku, name, description, unit, price_current, ' +
  'price_currency, certifications, allergens, active, created_at, updated_at'

/**
 * Productos.
 *  - Si profile.role === 'fabricante', muestra SOLO los suyos.
 *  - Resto de roles: catalogo completo.
 */
export function useProducts({ profile, onlyActive = true } = {}) {
  const enabled = !!profile?.id
  const { rows, loading, error, refresh } = useSupabaseList({
    table: 'products',
    select: SELECT,
    enabled,
    filter: (q) => {
      let x = q.order('name', { ascending: true })
      if (onlyActive) x = x.eq('active', true)
      if (profile?.role === 'fabricante') x = x.eq('fabricante_id', profile.id)
      return x
    },
  })

  const upsertProduct = useCallback(async (input) => {
    if (!profile || profile.role !== 'fabricante') {
      return { error: new Error('solo fabricante puede crear/editar productos') }
    }
    const row = { ...input, fabricante_id: profile.id }
    const { data, error } = await supabase
      .from('products')
      .upsert(row, { onConflict: 'fabricante_id,sku' })
      .select('id')
      .single()
    if (error) return { error }
    await refresh()
    return { data }
  }, [profile, refresh])

  const deactivateProduct = useCallback(async (id) => {
    const { error } = await supabase.from('products').update({ active: false }).eq('id', id)
    if (error) return { error }
    await refresh()
    return {}
  }, [refresh])

  return { products: rows, loading, error, refresh, upsertProduct, deactivateProduct }
}

/** Historico de tarifas. Si se pasa fabricanteId, filtra; si no, todas las visibles por RLS. */
export function useTarifas({ profile, productId } = {}) {
  const enabled = !!profile?.id
  const { rows, loading, error, refresh } = useSupabaseList({
    table: 'tarifas',
    select: 'id, product_id, fabricante_id, price_before, price_after, pct_change, effective_date, reason, notified_at, created_at',
    enabled,
    filter: (q) => {
      let x = q.order('effective_date', { ascending: false }).limit(200)
      if (productId) x = x.eq('product_id', productId)
      return x
    },
  })

  return { tarifas: rows, loading, error, refresh }
}
