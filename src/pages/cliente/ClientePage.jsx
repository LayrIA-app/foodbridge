import { useState } from 'react'
import AppShell from '../../components/AppShell'

const FABRICANTES = [
  { name: 'Lácteos Larrea S.L.', loc: 'País Vasco', cat: 'Quesos y lácteos', score: 96, cert: ['BIO', 'DOP'], precio: '€€', entrega: '48h', rating: 4.9 },
  { name: 'Conservas Ortiz', loc: 'Cantabria', cat: 'Conservas de pescado', score: 91, cert: ['MSC'], precio: '€€€', entrega: '72h', rating: 4.8 },
  { name: 'Aceites Núñez de Prado', loc: 'Andalucía', cat: 'Aceite de oliva virgen', score: 88, cert: ['BIO', 'DOP'], precio: '€€€', entrega: '5 días', rating: 4.7 },
  { name: 'Embutidos Revilla', loc: 'Burgos', cat: 'Embutidos y charcutería', score: 82, cert: ['IGP'], precio: '€€', entrega: '48h', rating: 4.6 },
  { name: 'Verduras Mendiondo', loc: 'Navarra', cat: 'Verduras ecológicas', score: 79, cert: ['BIO'], precio: '€', entrega: '24h', rating: 4.8 },
]

const MIS_PEDIDOS = [
  { id: 'PED-2847', fab: 'Lácteos Larrea', producto: 'Queso Idiazabal DOP 40kg', total: '€ 740', estado: 'En camino', eta: 'Mañana' },
  { id: 'PED-2831', fab: 'Conservas Ortiz', producto: 'Bonito del Norte pack 24ud', total: '€ 312', estado: 'Entregado', eta: '14 abr' },
  { id: 'PED-2819', fab: 'Verduras Mendiondo', producto: 'Verduras eco caja semana', total: '€ 145', estado: 'Entregado', eta: '10 abr' },
]

function Badge({ text }) {
  const colors = {
    'En camino': { bg: 'rgba(46,90,140,.1)', color: '#2E5A8C' },
    Entregado: { bg: 'rgba(26,47,74,.07)', color: '#7A8899' },
    Confirmado: { bg: 'rgba(34,160,107,.1)', color: '#22A06B' },
  }
  const c = colors[text] || { bg: 'rgba(26,47,74,.07)', color: '#7A8899' }
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.color }}>{text}</span>
}

const SECTIONS = {
  dashboard: DashboardView,
  buscar: BuscarView,
  matching: MatchingView,
  pedidos: PedidosView,
  favoritos: FavoritosView,
}

function DashboardView({ setSection }) {
  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Gasto mensual', value: '€ 2.840', delta: '-8%', up: false, sub: 'optimizado por IA' },
          { label: 'Fabricantes activos', value: '7', delta: '+2', up: true, sub: 'en tu red' },
          { label: 'Pedidos en curso', value: '3', delta: '', sub: 'en seguimiento' },
          { label: 'Ahorro IA', value: '€ 340', delta: '+12%', up: true, sub: 'vs precio mercado' },
        ].map((k, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: '#7A8899' }}>{k.label}</div>
            <div className="font-display text-2xl font-black mb-1" style={{ color: '#1A2F4A' }}>{k.value}</div>
            <div className="flex items-center gap-1.5">
              {k.delta && <span className="text-xs font-bold" style={{ color: k.up ? '#22A06B' : '#C65D4A' }}>{k.delta}</span>}
              <span className="text-[10px]" style={{ color: '#7A8899' }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Matching IA top picks */}
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-5 h-5 rounded-md ia-gradient flex items-center justify-center">
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <h3 className="text-sm font-bold" style={{ color: '#1A2F4A' }}>Top Matches IA · Para ti hoy</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {FABRICANTES.slice(0, 3).map((f, i) => (
            <div key={i} className="rounded-xl p-3 cursor-pointer transition-all hover:shadow-md" style={{ border: '1px solid rgba(26,47,74,.07)', background: 'rgba(26,47,74,.01)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white" style={{ background: '#1A2F4A' }}>
                  {f.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-black" style={{ color: '#E87420' }}>{f.score}%</span>
              </div>
              <div className="text-xs font-bold mb-0.5" style={{ color: '#1A2F4A' }}>{f.name}</div>
              <div className="text-[10px] mb-2" style={{ color: '#7A8899' }}>{f.cat}</div>
              <div className="flex gap-1 flex-wrap">
                {f.cert.map(c => (
                  <span key={c} className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,160,107,.1)', color: '#22A06B' }}>{c}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mis pedidos */}
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: '#1A2F4A' }}>Últimos pedidos</h3>
        <div className="space-y-3">
          {MIS_PEDIDOS.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(26,47,74,.05)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold" style={{ color: '#1A2F4A' }}>{p.id}</span>
                  <Badge text={p.estado} />
                </div>
                <div className="text-xs mt-0.5" style={{ color: '#7A8899' }}>{p.fab} · {p.producto}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold" style={{ color: '#1A2F4A' }}>{p.total}</div>
                <div className="text-[10px]" style={{ color: '#7A8899' }}>{p.eta}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function BuscarView() {
  const [q, setQ] = useState('')
  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex gap-3 mb-5">
        <input value={q} onChange={e => setQ(e.target.value)}
          placeholder="Busca por producto, categoría o fabricante..."
          className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: '#fff', border: '1px solid rgba(26,47,74,.12)', color: '#1A2F4A' }} />
        <button className="px-5 py-2.5 rounded-xl text-sm font-bold text-white" style={{ background: '#1A2F4A' }}>Buscar</button>
      </div>
      <div className="space-y-3">
        {FABRICANTES.map((f, i) => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ background: '#1A2F4A' }}>
              {f.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-bold" style={{ color: '#1A2F4A' }}>{f.name}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(232,116,32,.1)', color: '#E87420' }}>⚡ {f.score}% match</span>
              </div>
              <div className="text-xs mb-1" style={{ color: '#7A8899' }}>{f.cat} · {f.loc}</div>
              <div className="flex gap-1">
                {f.cert.map(c => <span key={c} className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,160,107,.1)', color: '#22A06B' }}>{c}</span>)}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-semibold mb-1" style={{ color: '#1A2F4A' }}>Entrega {f.entrega}</div>
              <div className="text-sm font-bold" style={{ color: '#1A2F4A' }}>{f.precio}</div>
            </div>
            <button className="px-4 py-2 rounded-xl text-xs font-bold text-white ml-2" style={{ background: '#1A2F4A' }}>Contactar →</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function MatchingView() {
  return (
    <div className="p-6 animate-fadeIn">
      <div className="rounded-2xl p-5 mb-5" style={{ background: 'linear-gradient(135deg,#1A2F4A,#2E5A8C)', border: '1px solid rgba(255,255,255,.05)' }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl ia-gradient flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <div className="text-sm font-bold text-white">Motor de Matching IA</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,.5)' }}>Basado en tu historial, necesidades y estacionalidad</div>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {FABRICANTES.map((f, i) => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0" style={{ background: '#1A2F4A' }}>
              {f.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-sm font-bold mb-1" style={{ color: '#1A2F4A' }}>{f.name}</div>
              <div className="text-xs mb-2" style={{ color: '#7A8899' }}>{f.cat} · {f.loc}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(26,47,74,.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: 'linear-gradient(90deg,#E87420,#F5A623)' }} />
                </div>
                <span className="text-xs font-black" style={{ color: '#E87420' }}>{f.score}%</span>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl text-xs font-bold text-white ml-2" style={{ background: '#E87420' }}>Ver →</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function PedidosView() {
  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-lg font-bold mb-5" style={{ color: '#1A2F4A' }}>Mis Pedidos</h2>
      <div className="space-y-3">
        {MIS_PEDIDOS.map((p, i) => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: '#1A2F4A' }}>{p.id}</span>
                <Badge text={p.estado} />
              </div>
              <div className="text-sm font-semibold" style={{ color: '#1A2F4A' }}>{p.fab}</div>
              <div className="text-xs" style={{ color: '#7A8899' }}>{p.producto}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-black" style={{ color: '#1A2F4A' }}>{p.total}</div>
              <div className="text-[10px]" style={{ color: '#7A8899' }}>{p.eta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FavoritosView() {
  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-lg font-bold mb-5" style={{ color: '#1A2F4A' }}>Mis Favoritos</h2>
      <div className="grid grid-cols-2 gap-4">
        {FABRICANTES.slice(0, 4).map((f, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black text-white" style={{ background: '#1A2F4A' }}>
                {f.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: '#1A2F4A' }}>{f.name}</div>
                <div className="text-[10px]" style={{ color: '#7A8899' }}>{f.loc}</div>
              </div>
            </div>
            <div className="text-xs mb-2" style={{ color: '#7A8899' }}>{f.cat}</div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: '#E87420' }}>⭐ {f.rating}</span>
              <span className="text-xs font-semibold" style={{ color: '#1A2F4A' }}>{f.entrega}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ClientePage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const SectionView = SECTIONS[activeSection] || DashboardView

  return (
    <AppShell activeSection={activeSection} setActiveSection={setActiveSection}>
      <div className="flex-1 scrollable" style={{ background: '#F5F6F8' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: '#fff', borderColor: 'rgba(26,47,74,.07)' }}>
          <h1 className="text-base font-bold capitalize" style={{ color: '#1A2F4A' }}>
            {activeSection === 'dashboard' ? 'Panel Cliente' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#7A8899' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-dotPulse" style={{ background: '#22A06B' }} />
            Sistema activo · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <SectionView setSection={setActiveSection} />
      </div>
    </AppShell>
  )
}
