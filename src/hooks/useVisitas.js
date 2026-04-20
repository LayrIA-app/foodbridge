import { useCallback } from 'react'
import { useSupabaseList } from './useSupabaseList'
import { supabase } from '../services/supabase'

const SELECT =
  'id, cliente_id, cliente_name, location, scheduled_at, status, ' +
  'checkin_at, checkin_lat, checkin_lng, outcome, notes, created_at'

export function useVisitas({ profile, fromDate, toDate } = {}) {
  const enabled = !!profile?.id
  const { rows, loading, error, refresh } = useSupabaseList({
    table: 'visitas',
    select: SELECT,
    enabled,
    filter: (q) => {
      let x = q.order('scheduled_at', { ascending: true })
      if (fromDate) x = x.gte('scheduled_at', fromDate)
      if (toDate) x = x.lte('scheduled_at', toDate)
      return x
    },
  })

  const createVisita = useCallback(async (input) => {
    if (!profile) return { error: new Error('no profile') }
    const { data, error } = await supabase
      .from('visitas')
      .insert({ ...input, comercial_id: profile.id })
      .select('id')
      .single()
    if (error) return { error }
    await refresh()
    return { data }
  }, [profile, refresh])

  const checkIn = useCallback(async (id, { lat, lng } = {}) => {
    const { error } = await supabase
      .from('visitas')
      .update({
        status: 'checked_in',
        checkin_at: new Date().toISOString(),
        checkin_lat: lat ?? null,
        checkin_lng: lng ?? null,
      })
      .eq('id', id)
    if (error) return { error }
    await refresh()
    return {}
  }, [refresh])

  const completeVisita = useCallback(async (id, { outcome, notes } = {}) => {
    const { error } = await supabase
      .from('visitas')
      .update({ status: 'completed', outcome, notes })
      .eq('id', id)
    if (error) return { error }
    await refresh()
    return {}
  }, [refresh])

  return { visitas: rows, loading, error, refresh, createVisita, checkIn, completeVisita }
}
