import { useState } from 'react'
import AppShell from '../../components/AppShell'

const KPI = [
  { label: 'Facturación mensual', value: '€ 48.320', delta: '+12%', up: true, sub: 'vs mes anterior' },
  { label: 'Clientes activos', value: '23', delta: '+3', up: true, sub: 'nuevos este mes' },
  { label: 'Pedidos pendientes', value: '8', delta: '-2', up: false, sub: 'vs semana pasada' },
  { label: 'Ratio conversión', value: '34%', delta: '+5pp', up: true, sub: 'de leads a pedido' },
]

const PRODUCTS = [
  { name: 'Queso Idiazabal DOP', cat: 'Quesos', stock: 240, price: '€18.50/kg', status: 'activo', matches: 12 },
  { name: 'Yogur Natural Ecológico', cat: 'Yogures', stock: 580, price: '€2.30/ud', status: 'activo', matches: 8 },
  { name: 'Mantequilla Artesana', cat: 'Mantequillas', stock: 120, price: '€4.80/250g', status: 'activo', matches: 5 },
  { name: 'Leche Fresca Entera', cat: 'Leche', stock: 1200, price: '€0.95/L', status: 'activo', matches: 19 },
  { name: 'Cuajada Tradicional', cat: 'Postres', stock: 80, price: '€1.60/ud', status: 'revisión', matches: 3 },
]

const PEDIDOS = [
  { id: 'PED-2847', cliente: 'Distribuciones SG', producto: 'Queso Idiazabal DOP', cantidad: '40 kg', total: '€ 740', estado: 'Confirmado', fecha: 'Hoy' },
  { id: 'PED-2846', cliente: 'Supermercados Eroski', producto: 'Yogur Natural Eco', cantidad: '200 ud', total: '€ 460', estado: 'En preparación', fecha: 'Ayer' },
  { id: 'PED-2845', cliente: 'Gastronomía Aizkorri', producto: 'Mantequilla Artesana', cantidad: '24 ud', total: '€ 115', estado: 'Entregado', fecha: '17 abr' },
]

const LEADS = [
  { empresa: 'Carrefour España', tipo: 'Gran superficie', interes: 'Queso Idiazabal', score: 92, estado: 'Caliente' },
  { empresa: 'El Corte Inglés', tipo: 'Gran almacén', interes: 'Gama ecológica', score: 78, estado: 'Templado' },
  { empresa: 'Makro Bilbao', tipo: 'Cash&Carry', interes: 'Leche fresca', score: 65, estado: 'Frío' },
]

function Badge({ text, color }) {
  const colors = {
    activo: { bg: 'rgba(34,160,107,.1)', text: '#22A06B' },
    revisión: { bg: 'rgba(232,116,32,.1)', text: '#E87420' },
    Confirmado: { bg: 'rgba(34,160,107,.1)', text: '#22A06B' },
    'En preparación': { bg: 'rgba(46,90,140,.1)', text: '#2E5A8C' },
    Entregado: { bg: 'rgba(26,47,74,.08)', text: '#7A8899' },
    Caliente: { bg: 'rgba(198,93,74,.1)', text: '#C65D4A' },
    Templado: { bg: 'rgba(232,116,32,.1)', text: '#E87420' },
    Frío: { bg: 'rgba(26,47,74,.08)', text: '#7A8899' },
  }
  const c = colors[text] || { bg: 'rgba(26,47,74,.08)', text: '#7A8899' }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.text }}>
      {text}
    </span>
  )
}

const SECTIONS = {
  dashboard: DashboardView,
  catalogo: CatalogoView,
  clientes: ClientesView,
  pedidos: PedidosView,
  analisis: AnalisisView,
}

function DashboardView() {
  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {KPI.map((k, i) => (
          <div key={i} className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: '#7A8899' }}>{k.label}</div>
            <div className="font-display text-2xl font-black mb-1" style={{ color: '#1A2F4A' }}>{k.value}</div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: k.up ? '#22A06B' : '#C65D4A' }}>{k.delta}</span>
              <span className="text-[10px]" style={{ color: '#7A8899' }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Últimos pedidos + Leads */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pedidos recientes */}
        <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold" style={{ color: '#1A2F4A' }}>Pedidos recientes</h3>
            <span className="text-xs font-semibold" style={{ color: '#E87420' }}>Ver todos →</span>
          </div>
          <div className="space-y-3">
            {PEDIDOS.map((p, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(26,47,74,.05)' }}>
                <div>
                  <div className="text-xs font-semibold" style={{ color: '#1A2F4A' }}>{p.id} · {p.cliente}</div>
                  <div className="text-[10px]" style={{ color: '#7A8899' }}>{p.producto} · {p.cantidad}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold" style={{ color: '#1A2F4A' }}>{p.total}</div>
                  <Badge text={p.estado} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* IA Leads */}
        <div className="rounded-2xl p-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-md ia-gradient flex items-center justify-center">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <h3 className="text-sm font-bold" style={{ color: '#1A2F4A' }}>Leads · Matching IA</h3>
          </div>
          <div className="space-y-3">
            {LEADS.map((l, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: 'rgba(26,47,74,.05)' }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: l.score > 85 ? '#C65D4A' : l.score > 70 ? '#E87420' : '#7A8899' }}>
                  {l.score}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold" style={{ color: '#1A2F4A' }}>{l.empresa}</div>
                  <div className="text-[10px]" style={{ color: '#7A8899' }}>{l.tipo} · {l.interes}</div>
                </div>
                <Badge text={l.estado} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* IA Insight banner */}
      <div className="rounded-2xl p-4 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #1A2F4A, #2E5A8C)', border: '1px solid rgba(255,255,255,.05)' }}>
        <div className="w-10 h-10 rounded-xl ia-gradient flex items-center justify-center flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-xs font-bold text-white mb-0.5">💡 Insight IA · Esta semana</div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,.6)' }}>
            El Queso Idiazabal tiene 12 clientes potenciales activos sin contactar. Subirlo al carrusel premium podría aumentar las conversiones un 34%.
          </div>
        </div>
        <button className="px-4 py-2 rounded-xl text-xs font-bold text-white flex-shrink-0 transition-all hover:opacity-80" style={{ background: '#E87420' }}>
          Activar →
        </button>
      </div>
    </div>
  )
}

function CatalogoView() {
  return (
    <div className="p-6 animate-fadeIn">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold" style={{ color: '#1A2F4A' }}>Mi Catálogo</h2>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white" style={{ background: '#E87420' }}>
          + Añadir producto
        </button>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(26,47,74,.07)', background: '#fff' }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(26,47,74,.06)', background: 'rgba(26,47,74,.02)' }}>
              {['Producto', 'Categoría', 'Stock', 'Precio', 'Matches IA', 'Estado'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-wider" style={{ color: '#7A8899' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map((p, i) => (
              <tr key={i} className="border-b hover:bg-[rgba(26,47,74,.02)] transition-colors" style={{ borderColor: 'rgba(26,47,74,.04)' }}>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#1A2F4A' }}>{p.name}</td>
                <td className="px-4 py-3 text-xs" style={{ color: '#7A8899' }}>{p.cat}</td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#1A2F4A' }}>{p.stock} ud</td>
                <td className="px-4 py-3 text-xs font-semibold" style={{ color: '#1A2F4A' }}>{p.price}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-bold" style={{ color: '#E87420' }}>⚡ {p.matches} clientes</span>
                </td>
                <td className="px-4 py-3"><Badge text={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ClientesView() {
  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-lg font-bold mb-5" style={{ color: '#1A2F4A' }}>Mis Clientes</h2>
      <div className="grid grid-cols-3 gap-4">
        {LEADS.map((l, i) => (
          <div key={i} className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black text-white mb-3"
              style={{ background: l.score > 85 ? '#C65D4A' : l.score > 70 ? '#E87420' : '#7A8899' }}>
              {l.empresa.slice(0, 2).toUpperCase()}
            </div>
            <h3 className="text-sm font-bold mb-1" style={{ color: '#1A2F4A' }}>{l.empresa}</h3>
            <p className="text-xs mb-3" style={{ color: '#7A8899' }}>{l.tipo}</p>
            <div className="flex items-center justify-between">
              <Badge text={l.estado} />
              <span className="text-xs font-bold" style={{ color: '#E87420' }}>Score {l.score}</span>
            </div>
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
        {PEDIDOS.map((p, i) => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold" style={{ color: '#E87420' }}>{p.id}</span>
                <Badge text={p.estado} />
              </div>
              <div className="text-sm font-semibold" style={{ color: '#1A2F4A' }}>{p.cliente}</div>
              <div className="text-xs" style={{ color: '#7A8899' }}>{p.producto} · {p.cantidad}</div>
            </div>
            <div className="text-right">
              <div className="font-display text-xl font-black" style={{ color: '#1A2F4A' }}>{p.total}</div>
              <div className="text-[10px]" style={{ color: '#7A8899' }}>{p.fecha}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalisisView() {
  const bars = [65, 80, 55, 90, 70, 85, 48]
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-lg font-bold mb-5" style={{ color: '#1A2F4A' }}>Análisis</h2>
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: '#1A2F4A' }}>Ventas esta semana</h3>
        <div className="flex items-end gap-3 h-32">
          {bars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full rounded-t-lg transition-all" style={{ height: `${h}%`, background: i === 3 ? '#E87420' : 'rgba(232,116,32,.2)' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#7A8899' }}>{days[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function FabricantePage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const SectionView = SECTIONS[activeSection] || DashboardView

  return (
    <AppShell activeSection={activeSection} setActiveSection={setActiveSection}>
      <div className="flex-1 scrollable" style={{ background: '#F5F6F8' }}>
        <div className="px-6 py-4 border-b flex items-center justify-between" style={{ background: '#fff', borderColor: 'rgba(26,47,74,.07)' }}>
          <h1 className="text-base font-bold capitalize" style={{ color: '#1A2F4A' }}>
            {activeSection === 'dashboard' ? 'Panel Fabricante' : activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
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
