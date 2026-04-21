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

  /**
   * Acepta una cotizacion (cliente) y genera el pedido automaticamente.
   * - Cotizacion pasa a status 'accepted'
   * - Se inserta pedido con ref PED-YYYY-NNNNN y 1 linea que refleja la cotizacion
   */
  const acceptCotizacion = useCallback(async (cotId) => {
    if (!profile || profile.role !== 'cliente') {
      return { error: new Error('solo el cliente puede aceptar cotizaciones') }
    }
    const { data: cot, error: fetchErr } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', cotId)
      .single()
    if (fetchErr) return { error: fetchErr }
    if (!cot) return { error: new Error('cotizacion no encontrada') }

    const { error: updateErr } = await supabase
      .from('cotizaciones')
      .update({ status: 'accepted' })
      .eq('id', cotId)
    if (updateErr) return { error: updateErr }

    const year = new Date().getFullYear()
    const suffix = Math.floor(Math.random() * 90000 + 10000)
    const pedidoRef = `PED-${year}-${suffix}`
    const total = Number(cot.quantity) * Number(cot.unit_price)

    const { data: pedido, error: pedidoErr } = await supabase
      .from('pedidos')
      .insert({
        ref: pedidoRef,
        cliente_id: profile.id,
        fabricante_id: cot.fabricante_id,
        cotizacion_id: cot.id,
        total_amount: total,
        status: 'placed',
        expected_date: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
      })
      .select('id')
      .single()
    if (pedidoErr) { await refresh(); return { error: pedidoErr } }

    if (cot.product_id || cot.product_name) {
      await supabase.from('pedido_lines').insert({
        pedido_id: pedido.id,
        product_id: cot.product_id,
        product_name: cot.product_name || 'Producto',
        quantity: cot.quantity,
        unit: cot.unit || 'kg',
        unit_price: cot.unit_price,
      })
    }

    await refresh()
    return { data: { pedidoId: pedido.id, pedidoRef } }
  }, [profile, refresh])

  const rejectCotizacion = useCallback(async (cotId) => {
    const { error } = await supabase
      .from('cotizaciones')
      .update({ status: 'rejected' })
      .eq('id', cotId)
    if (error) return { error }
    await refresh()
    return {}
  }, [refresh])

  const sendCotizacion = useCallback(async (cotId) => {
    const { error } = await supabase
      .from('cotizaciones')
      .update({ status: 'sent' })
      .eq('id', cotId)
    if (error) return { error }
    await refresh()
    return {}
  }, [refresh])

  return {
    cotizaciones: rows, loading, error, refresh,
    createCotizacion, updateCotizacion, deleteCotizacion,
    acceptCotizacion, rejectCotizacion, sendCotizacion,
  }
}
