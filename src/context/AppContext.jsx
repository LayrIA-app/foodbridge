import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'

const AppContext = createContext()

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
    let mounted = true
    const bootstrap = async () => {
      const { data: { session: initial } } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(initial)
      if (initial?.user) {
        const p = await loadProfile(initial.user.id)
        if (mounted) setProfile(p)
      }
      if (mounted) setInitializing(false)
    }
    bootstrap()

    const { data: authSub } = supabase.auth.onAuthStateChange(async (_event, next) => {
      setSession(next)
      if (next?.user) {
        const p = await loadProfile(next.user.id)
        setProfile(p)
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
