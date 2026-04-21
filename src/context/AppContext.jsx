import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from '../services/supabase'

const AppContext = createContext()

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timeout ${ms}ms`)), ms)),
  ])
}

async function loadProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, company_name')
    .eq('id', userId)
    .single()
  if (error) {
    console.warn('[supabase] profile fetch error:', error.message)
    return null
  }
  return data
}

export function AppProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [initializing, setInitializing] = useState(true)

  // Estado pre-login (HomeScreen selector) — se ignora cuando hay sesión+profile.role.
  const [currentRole, setCurrentRole] = useState(null)
  const [inPanel, setInPanel] = useState(false)
  const [fabProfile, setFabProfile] = useState('directivo')

  useEffect(() => {
    // Si no hay env vars, no intentamos hablar con Supabase — el router mostrará
    // la pantalla de configuración faltante.
    if (!supabaseConfigured) {
      setInitializing(false)
      return
    }

    let mounted = true
    const bootstrap = async () => {
      const t0 = Date.now()
      console.log('[bootstrap] start', new Date().toISOString())
      try {
        // Timeout de seguridad: si getSession o loadProfile no resuelven en 10s,
        // abortamos y dejamos que el router muestre LoginScreen.
        const { data, error } = await withTimeout(
          supabase.auth.getSession(),
          10000,
          'getSession'
        )
        if (error) throw error
        if (!mounted) return
        const initial = data?.session ?? null
        console.log('[bootstrap] getSession OK', { hasSession: !!initial, ms: Date.now() - t0 })
        setSession(initial)
        if (initial?.user) {
          const p = await withTimeout(
            loadProfile(initial.user.id),
            10000,
            'loadProfile'
          )
          if (mounted) {
            setProfile(p)
            console.log('[bootstrap] loadProfile OK', { role: p?.role, ms: Date.now() - t0 })
          }
        }
      } catch (err) {
        console.error('[bootstrap] error/timeout:', err?.message || err, 'ms:', Date.now() - t0)
      } finally {
        if (mounted) {
          setInitializing(false)
          console.log('[bootstrap] end', { ms: Date.now() - t0 })
        }
      }
    }
    bootstrap()

    const { data: authSub } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next)
      if (next?.user) {
        try {
          const p = await loadProfile(next.user.id)
          setProfile(p)
        } catch (err) {
          console.error('[supabase] profile load on auth change:', err?.message || err)
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      authSub?.subscription?.unsubscribe()
    }
  }, [])

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setCurrentRole(null)
    setInPanel(false)
    setFabProfile('directivo')
  }

  return (
    <AppContext.Provider value={{
      // Auth real
      session,
      profile,
      initializing,
      supabaseConfigured,
      signIn,
      signOut,

      // Estado pre-login (HomeScreen + LoginScreen sin sesión)
      currentRole,
      inPanel,
      fabProfile,
      enterAs: (id) => { setCurrentRole(id); setInPanel(false) },
      enterPanel: (fp) => { if (fp) setFabProfile(fp); setInPanel(true) },
      goHome: () => { setCurrentRole(null); setInPanel(false); setFabProfile('directivo') },
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
