import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigured = Boolean(url && key)

if (!supabaseConfigured) {
  console.error(
    '[supabase] Faltan env vars VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
    'Añádelas en Vercel (Settings → Environment Variables) y haz Redeploy SIN build cache.'
  )
}

// createClient con strings vacios funciona (no tira error sincrono), pero cualquier
// llamada real fallara. Exponemos supabaseConfigured para que el resto del codigo
// muestre un mensaje claro en vez de una pantalla de carga infinita.
export const supabase = createClient(url ?? 'http://localhost', key ?? 'anon', {
  auth: {
    persistSession: supabaseConfigured,
    autoRefreshToken: supabaseConfigured,
    detectSessionInUrl: supabaseConfigured,
  },
})
