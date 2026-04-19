import { useState } from 'react'
import AppShell from '../../components/AppShell'

const METRICS = [
  { label: 'Fabricantes activos', value: '1.247', delta: '+34', up: true },
  { label: 'Clientes registrados', value: '4.832', delta: '+128', up: true },
  { label: 'Matches generados', value: '8.941', delta: '+12%', up: true },
  { label: 'GMV mensual', value: '€ 2.4M', delta: '+18%', up: true },
]

const RECENT_USERS = [
  { name: 'Lácteos Larrea S.L.', type: 'Fabricante', region: 'País Vasco', status: 'Activo', joined: 'Hoy' },
  { name: 'Distribuciones SG', type: 'Cliente', region: 'Madrid', status: 'Activo', joined: 'Hoy' },
  { name: 'Conservas Bermeo', type: 'Fabricante', region: 'Vizcaya', status: 'Pendiente', joined: 'Ayer' },
  { name: 'Carrefour España', type: 'Cliente', region: 'Nacional', status: 'Activo', joined: '17 abr' },
  { name: 'Verduras Ecológicas BIO', type: 'Fabricante', region: 'Navarra', status: 'Revisión', joined: '16 abr' },
]

const MATCHING_LOG = [
  { fab: 'Lácteos Larrea', cli: 'Distribuciones SG', score: 96, cat: 'Quesos', resultado: 'Pedido' },
  { fab: 'Conservas Ortiz', cli: 'Carrefour España', score: 91, cat: 'Conservas', resultado: 'Negociando' },
  { fab: 'Aceites Núñez', cli: 'El Corte Inglés', score: 88, cat: 'Aceites', resultado: 'Contactado' },
  { fab: 'Embutidos Revilla', cli: 'Mercadona', score: 84, cat: 'Embutidos', resultado: 'Pendiente' },
]

function Badge({ text }) {
  const colors = {
    Activo: { bg: 'rgba(34,160,107,.1)', color: '#22A06B' },
    Pendiente: { bg: 'rgba(232,116,32,.1)', color: '#E87420' },
    Revisión: { bg: 'rgba(198,93,74,.1)', color: '#C65D4A' },
    Pedido: { bg: 'rgba(34,160,107,.1)', color: '#22A06B' },
    Negociando: { bg: 'rgba(46,90,140,.1)', color: '#2E5A8C' },
    Contactado: { bg: 'rgba(232,116,32,.1)', color: '#E87420' },
  }
  const c = colors[text] || { bg: 'rgba(26,47,74,.07)', color: '#7A8899' }
  return <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.color }}>{text}</span>
}

const SECTIONS = {
  dashboard: AdminDashView,
  usuarios: UsuariosView,
  matching: MatchingView,
  metricas: MetricasView,
  config: ConfigView,
}

function AdminDashView() {
  const bars = [55, 70, 48, 85, 72, 90, 65]
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  return (
    <div className="p-6 space-y-5 animate-fadeIn">
      <div className="grid grid-cols-4 gap-4">
        {METRICS.map((m, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: '#7A8899' }}>{m.label}</div>
            <div className="font-display text-2xl font-black mb-1" style={{ color: '#1A2F4A' }}>{m.value}</div>
            <span className="text-xs font-bold" style={{ color: m.up ? '#22A06B' : '#C65D4A' }}>{m.delta} esta semana</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Chart */}
        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: '#1A2F4A' }}>Matches generados · semana</h3>
          <div className="flex items-end gap-3 h-28">
            {bars.map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg" style={{ height: `${h}%`, background: i === 5 ? '#22A06B' : 'rgba(34,160,107,.2)' }} />
                <span className="text-[10px] font-semibold" style={{ color: '#7A8899' }}>{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Last matches */}
        <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-md ia-gradient flex items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3 className="text-sm font-bold" style={{ color: '#1A2F4A' }}>Últimos matches IA</h3>
          </div>
          <div className="space-y-2.5">
            {MATCHING_LOG.map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b last:border-0" style={{ borderColor: 'rgba(26,47,74,.05)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: m.score > 90 ? '#22A06B' : m.score > 85 ? '#E87420' : '#7A8899' }}>
                  {m.score}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-semibold truncate" style={{ color: '#1A2F4A' }}>{m.fab} → {m.cli}</div>
                  <div className="text-[10px]" style={{ color: '#7A8899' }}>{m.cat}</div>
                </div>
                <Badge text={m.resultado} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: 'rgba(26,47,74,.06)' }}>
          <h3 className="text-sm font-bold" style={{ color: '#1A2F4A' }}>Usuarios recientes</h3>
          <span className="text-xs font-semibold" style={{ color: '#22A06B' }}>Ver todos →</span>
        </div>
        <table className="w-full">
          <tbody>
            {RECENT_USERS.map((u, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-[rgba(26,47,74,.01)]" style={{ borderColor: 'rgba(26,47,74,.04)' }}>
                <td className="px-5 py-3">
                  <div className="text-xs font-semibold" style={{ color: '#1A2F4A' }}>{u.name}</div>
                  <div className="text-[10px]" style={{ color: '#7A8899' }}>{u.region}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: u.type === 'Fabricante' ? 'rgba(232,116,32,.1)' : 'rgba(26,47,74,.08)', color: u.type === 'Fabricante' ? '#E87420' : '#7A8899' }}>
                    {u.type}
                  </span>
                </td>
                <td className="px-4 py-3"><Badge text={u.status} /></td>
                <td className="px-4 py-3 text-[10px] text-right" style={{ color: '#7A8899' }}>{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function UsuariosView() {
  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold" style={{ color: '#1A2F4A' }}>Gestión de Usuarios</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.12)', color: '#1A2F4A' }}>Filtrar</button>
          <button className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: '#22A06B' }}>+ Invitar usuario</button>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(26,47,74,.06)', background: 'rgba(26,47,74,.02)' }}>
              {['Usuario', 'Tipo', 'Región', 'Estado', 'Alta'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#7A8899' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECENT_USERS.map((u, i) => (
              <tr key={i} className="border-b last:border-0 hover:bg-[rgba(26,47,74,.01)]" style={{ borderColor: 'rgba(26,47,74,.04)' }}>
                <td className="px-5 py-3 text-xs font-semibold" style={{ color: '#1A2F4A' }}>{u.name}</td>
                <td className="px-5 py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: u.type === 'Fabricante' ? 'rgba(232,116,32,.1)' : 'rgba(26,47,74,.08)', color: u.type === 'Fabricante' ? '#E87420' : '#7A8899' }}>
                    {u.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs" style={{ color: '#7A8899' }}>{u.region}</td>
                <td className="px-5 py-3"><Badge text={u.status} /></td>
                <td className="px-5 py-3 text-xs" style={{ color: '#7A8899' }}>{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function MatchingView() {
  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-lg font-bold mb-5" style={{ color: '#1A2F4A' }}>Motor de Matching IA</h2>
      <div className="space-y-3">
        {MATCHING_LOG.map((m, i) => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white flex-shrink-0"
              style={{ background: m.score > 90 ? '#22A06B' : m.score > 85 ? '#E87420' : '#7A8899' }}>
              {m.score}%
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold" style={{ color: '#1A2F4A' }}>{m.fab}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E87420" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
                <span className="text-sm font-bold" style={{ color: '#1A2F4A' }}>{m.cli}</span>
              </div>
              <div className="text-xs" style={{ color: '#7A8899' }}>Categoría: {m.cat}</div>
            </div>
            <Badge text={m.resultado} />
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricasView() {
  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-lg font-bold mb-5" style={{ color: '#1A2F4A' }}>Métricas Globales</h2>
      <div className="grid grid-cols-2 gap-4">
        {METRICS.map((m, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="text-xs font-semibold mb-3" style={{ color: '#7A8899' }}>{m.label}</div>
            <div className="font-display text-3xl font-black mb-2" style={{ color: '#1A2F4A' }}>{m.value}</div>
            <span className="text-sm font-bold" style={{ color: '#22A06B' }}>{m.delta}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConfigView() {
  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-lg font-bold mb-5" style={{ color: '#1A2F4A' }}>Configuración</h2>
      <div className="rounded-2xl p-5 space-y-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
        {[
          { label: 'Umbral mínimo de matching', val: '70%' },
          { label: 'Notificaciones automáticas', val: 'Activadas' },
          { label: 'Modelo IA activo', val: 'Claude Sonnet 4' },
          { label: 'Región de datos', val: 'Europa (GDPR)' },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: 'rgba(26,47,74,.06)' }}>
            <span className="text-sm" style={{ color: '#1A2F4A' }}>{s.label}</span>
            <span className="text-sm font-bold" style={{ color: '#22A06B' }}>{s.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const SectionView = SECTIONS[activeSection] || AdminDashView

  return (
    <AppShell activeSection={activeSection} setActiveSection={setActiveSection}>
      <div className="flex-1 scrollable" style={{ background: '#F5F6F8' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: '#fff', borderColor: 'rgba(26,47,74,.07)' }}>
          <h1 className="text-base font-bold capitalize" style={{ color: '#1A2F4A' }}>
            {activeSection === 'dashboard' ? 'Panel Admin' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
          </h1>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#7A8899' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-dotPulse" style={{ background: '#22A06B' }} />
            Sistema activo · {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
        <SectionView />
      </div>
    </AppShell>
  )
}
