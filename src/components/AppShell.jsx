import { useApp } from '../context/AppContext'

const NAV_FABRICANTE = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'catalogo', label: 'Catálogo', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { id: 'clientes', label: 'Clientes', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'pedidos', label: 'Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'analisis', label: 'Análisis', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
]

const NAV_CLIENTE = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'buscar', label: 'Buscar', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { id: 'matching', label: 'Matching IA', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'pedidos', label: 'Mis Pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'favoritos', label: 'Favoritos', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
]

const NAV_ADMIN = [
  { id: 'dashboard', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'usuarios', label: 'Usuarios', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'matching', label: 'Motor Matching', icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
  { id: 'metricas', label: 'Métricas', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'config', label: 'Config', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

function NavIcon({ d }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

export default function AppShell({ children, activeSection, setActiveSection }) {
  const { roleData, goHome } = useApp()
  if (!roleData) return null

  const { id: role, user, label } = roleData
  const accent = role === 'fabricante' ? '#E87420' : role === 'cliente' ? '#1A2F4A' : '#22A06B'
  const navItems = role === 'fabricante' ? NAV_FABRICANTE : role === 'cliente' ? NAV_CLIENTE : NAV_ADMIN

  return (
    <div className="fixed inset-0 flex" style={{ background: '#F5F6F8' }}>
      {/* Sidebar */}
      <aside className="flex flex-col w-52 h-full flex-shrink-0" style={{ background: '#1A2F4A' }}>
        {/* Logo */}
        <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#E87420,#F5A623)', boxShadow: '0 4px 12px rgba(232,116,32,.35)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-display text-white" style={{ fontSize: 22, fontWeight: 900, letterSpacing: '.04em' }}>
              Food<span style={{ color: '#F5A623' }}>Bridge</span>
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 px-1">
            <div className="w-1.5 h-1.5 rounded-full animate-dotPulse" style={{ background: accent }} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.35)' }}>
              {label}
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(item => {
            const isActive = activeSection === item.id
            return (
              <button key={item.id} onClick={() => setActiveSection(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all text-sm font-medium"
                style={{
                  background: isActive ? `${accent}20` : 'transparent',
                  color: isActive ? '#fff' : 'rgba(255,255,255,.45)',
                }}>
                <span style={{ color: isActive ? accent : 'rgba(255,255,255,.35)' }}>
                  <NavIcon d={item.icon} />
                </span>
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* User + back */}
        <div className="p-3 border-t space-y-2" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,.04)' }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: accent }}>
              {user.avatar}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] truncate" style={{ color: 'rgba(255,255,255,.35)' }}>{user.company}</div>
            </div>
          </div>
          <button onClick={goHome}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-80"
            style={{ background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.4)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
            Cambiar rol
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>


    </div>
  )
}
