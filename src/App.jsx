import { Component, useEffect, useState } from 'react'
import { AppProvider, useApp } from './context/AppContext'
import HomeScreen from './pages/HomeScreen'
import LoginScreen from './pages/LoginScreen'
import FabricantePage from './pages/fabricante/FabricantePage'
import ComercialPage from './pages/comercial/ComercialPage'
import ClientePage from './pages/cliente/ClientePage'

const SCREEN_BG = '#FFF8F0'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack)
  }
  render() {
    if (!this.state.error) return this.props.children
    const err = this.state.error
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: SCREEN_BG, color: '#1A2F4A',
        padding: 24, overflow: 'auto', fontFamily: 'DM Sans',
      }}>
        <div style={{
          maxWidth: 720, margin: '0 auto', padding: 24,
          background: '#fff', borderRadius: 16,
          border: '1px solid #E8D5C0', boxShadow: '0 20px 60px rgba(26,47,74,.08)'
        }}>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.2rem', fontWeight: 900, color: '#e03030', marginBottom: 10, letterSpacing: '.04em', textTransform: 'uppercase' }}>
            Error de renderizado
          </div>
          <div style={{ fontSize: '.8rem', color: '#3a4a5a', marginBottom: 12 }}>
            <strong>{err?.name || 'Error'}:</strong> {err?.message || String(err)}
          </div>
          {err?.stack && (
            <pre style={{
              fontSize: '.65rem', background: '#F5F6F8', padding: 12, borderRadius: 8,
              color: '#1A2F4A', overflow: 'auto', maxHeight: 320, whiteSpace: 'pre-wrap'
            }}>{err.stack}</pre>
          )}
          <button onClick={() => location.reload()} style={{
            marginTop: 14, padding: '10px 18px', background: '#1A2F4A', color: '#fff',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '.82rem',
            letterSpacing: '.08em', textTransform: 'uppercase'
          }}>
            Recargar
          </button>
        </div>
      </div>
    )
  }
}

function Splash({ message }) {
  const [slow, setSlow] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000)
    return () => clearTimeout(t)
  }, [])
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: SCREEN_BG, color: '#1A2F4A',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 12, fontFamily: 'DM Sans', padding: 16
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(232,116,32,.18)',
        borderTopColor: '#E87420',
        animation: 'spin 1s linear infinite'
      }}/>
      <div style={{ fontSize: '.78rem', color: '#7A8899', letterSpacing: '.08em' }}>{message}</div>
      {slow && (
        <div style={{ marginTop: 14, textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: '.7rem', color: '#7A8899', lineHeight: 1.5, marginBottom: 10 }}>
            Está tardando más de lo normal. Si persiste, prueba a recargar o limpiar sesión guardada.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => location.reload()} style={{
              padding: '8px 16px', background: '#E87420', color: '#fff', border: 'none',
              borderRadius: 8, cursor: 'pointer', fontFamily: 'Barlow Condensed', fontWeight: 700,
              fontSize: '.78rem', letterSpacing: '.08em', textTransform: 'uppercase'
            }}>Recargar</button>
            <button onClick={() => {
              try {
                Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k) })
              } catch { /* noop */ }
              location.reload()
            }} style={{
              padding: '8px 16px', background: 'transparent', color: '#1A2F4A',
              border: '1.5px solid rgba(26,47,74,.3)', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '.78rem',
              letterSpacing: '.08em', textTransform: 'uppercase'
            }}>Limpiar sesión</button>
          </div>
        </div>
      )}
    </div>
  )
}

function RolePending() {
  const { signOut, profile } = useApp()
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: SCREEN_BG, color: '#1A2F4A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'DM Sans'
    }}>
      <div style={{
        maxWidth: 440, padding: 32, borderRadius: 16, background: '#fff',
        boxShadow: '0 20px 60px rgba(26,47,74,.08)', border: '1px solid #E8D5C0'
      }}>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '.04em', textTransform: 'uppercase' }}>
          Cuenta pendiente de activación
        </div>
        <div style={{ fontSize: '.85rem', color: '#3a4a5a', lineHeight: 1.5, marginBottom: 18 }}>
          Tu acceso ({profile?.email}) está creado pero aún no tiene rol asignado. Contacta con el administrador para activarlo.
        </div>
        <button onClick={signOut} style={{
          padding: '10px 18px', background: '#1A2F4A', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer',
          fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: '.82rem',
          letterSpacing: '.08em', textTransform: 'uppercase'
        }}>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

function ConfigMissing() {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: SCREEN_BG, color: '#1A2F4A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'DM Sans'
    }}>
      <div style={{
        maxWidth: 520, padding: 32, borderRadius: 16, background: '#fff',
        boxShadow: '0 20px 60px rgba(26,47,74,.08)', border: '1px solid #E8D5C0'
      }}>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.2rem', fontWeight: 900, marginBottom: 10, letterSpacing: '.04em', textTransform: 'uppercase', color: '#E87420' }}>
          Configuración incompleta
        </div>
        <div style={{ fontSize: '.85rem', color: '#3a4a5a', lineHeight: 1.55, marginBottom: 14 }}>
          Faltan las variables de entorno de Supabase. Añádelas en Vercel → Settings → Environment Variables:
        </div>
        <ul style={{ fontSize: '.78rem', color: '#1A2F4A', lineHeight: 1.8, paddingLeft: 18, marginBottom: 14 }}>
          <li><code>VITE_SUPABASE_URL</code></li>
          <li><code>VITE_SUPABASE_ANON_KEY</code></li>
        </ul>
        <div style={{ fontSize: '.78rem', color: '#3a4a5a', lineHeight: 1.55 }}>
          Después <strong>Redeploy sin caché de build</strong> (desmarca "Use existing Build Cache") para que las variables entren en el bundle.
        </div>
      </div>
    </div>
  )
}

function Router() {
  const { initializing, session, profile, currentRole, inPanel, supabaseConfigured } = useApp()

  if (!supabaseConfigured) return <ConfigMissing/>
  if (initializing) return <Splash message="Cargando…"/>

  // Con sesión: la lógica la manda profile.role
  if (session) {
    if (!profile) return <Splash message="Cargando perfil…"/>
    if (!profile.role) return <RolePending/>
    if (profile.role === 'fabricante') return <FabricantePage/>
    if (profile.role === 'comercial') return <ComercialPage/>
    if (profile.role === 'cliente') return <ClientePage/>
    return <RolePending/>
  }

  // Sin sesión: flujo público HomeScreen → LoginScreen
  if (!currentRole) return <HomeScreen/>
  if (!inPanel) return <LoginScreen/>
  return <LoginScreen/>
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider><Router/></AppProvider>
    </ErrorBoundary>
  )
}
