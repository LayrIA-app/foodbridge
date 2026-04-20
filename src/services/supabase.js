import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  // Se detectará al intentar hacer login; el mensaje deja claro qué falta.
  console.warn(
    '[supabase] Faltan env vars VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
    'La autenticación no funcionará hasta que se configuren en Vercel (prod) ' +
    'o en .env.local (desarrollo).'
  )
}

export const supabase = createClient(url ?? '', key ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
