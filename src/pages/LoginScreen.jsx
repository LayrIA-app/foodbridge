import { useState } from 'react'
import { useApp } from '../context/AppContext'

const ROLE_DATA = {
  fabricante: {
    pill: 'Fabricante',
    h1: ['Panel', 'Fabricante'],
    sub: 'Sube tu catálogo y la IA genera fichas técnicas automáticamente para conectar con miles de clientes.',
    feats: [
      'Fichas técnicas generadas por IA en segundos',
      'Matching automático con clientes potenciales',
      'Gestión de certificaciones y trazabilidad',
      'Panel de ventas y análisis de mercado',
    ],
    kpis: [
      { val: '1.600+', lbl: 'Fichas activas' },
      { val: '340', lbl: 'Clientes conectados' },
      { val: '98%', lbl: 'Satisfacción' },
    ],
    showToggle: true,
  },
  comercial: {
    pill: 'Comercial',
    h1: ['Panel', 'Comercial'],
    sub: 'IA que cruza 1.600+ fichas técnicas con las necesidades de tus clientes en segundos.',
    feats: [
      'Búsqueda semántica en todo el catálogo',
      'Propuestas y cotizaciones automáticas',
      'CRM integrado con historial completo',
      'Rutas y visitas optimizadas por IA',
    ],
    kpis: [
      { val: '1.600+', lbl: 'Fichas indexadas' },
      { val: '2.3x', lbl: 'Más conversiones' },
      { val: '4 min', lbl: 'Propuesta lista' },
    ],
    showToggle: false,
  },
  cliente: {
    pill: 'Cliente',
    h1: ['Panel', 'Cliente'],
    sub: 'Solicita productos, recibe cotizaciones y trazabilidad completa de principio a fin.',
    feats: [
      'Búsqueda por necesidad, no por referencia',
      'Cotizaciones comparadas en tiempo real',
      'Trazabilidad completa del producto',
      'Historial de pedidos y favoritos',
    ],
    kpis: [
      { val: '340+', lbl: 'Fabricantes' },
      { val: '48h', lbl: 'Entrega media' },
      { val: '100%', lbl: 'Trazabilidad' },
    ],
    showToggle: false,
  },
}

export default function LoginScreen() {
  const { currentRole, enterPanel, goHome } = useApp()
  const [fabProfile, setFabProfile] = useState('directivo')
  const data = ROLE_DATA[currentRole] || ROLE_DATA.comercial

  const handleAcceder = () => enterPanel(fabProfile)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, display: 'flex' }} className="login-wrap">

      {/* LEFT — navy panel */}
      <div style={{
        flex: 1, background: '#1A2F4A',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '64px 72px', position: 'relative', overflow: 'hidden'
      }} className="login-left">
        {/* Subtle bg glow */}
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,116,32,.08), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: -80, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,116,32,.05), transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'linear-gradient(135deg,#E87420,#F5A623)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 16px rgba(232,116,32,.35)'
            }}>
              <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
                <path d="M14 36V22a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M10 36h28" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="38" cy="10" r="4" fill="#F5A623"/>
              </svg>
            </div>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: 32, fontWeight: 900, letterSpacing: '.04em' }}>
              <span style={{ color: '#fff' }}>Food</span>
              <span style={{ color: '#fff' }}>Bridge</span>
              <span style={{ color: '#F5A623' }}> IA</span>
            </div>
          </div>

          {/* Role pill */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(232,116,32,.15)', border: '1px solid rgba(232,116,32,.35)',
            borderRadius: 20, padding: '5px 16px', margin: '20px 0 16px',
            fontSize: '.72rem', fontWeight: 600, color: '#F5A623',
            letterSpacing: '.08em', textTransform: 'uppercase'
          }}>
            {data.pill}
          </div>

          {/* H1 */}
          <h1 style={{
            fontFamily: 'Barlow Condensed', fontSize: '2rem', fontWeight: 900,
            lineHeight: 1.05, color: '#fff', marginBottom: 14,
            letterSpacing: '.02em', textTransform: 'uppercase'
          }}>
            {data.h1[0]}<br />
            <span style={{ color: '#F5A623' }}>{data.h1[1]}</span>
          </h1>

          {/* Description */}
          <p style={{ color: 'rgba(255,255,255,.55)', fontSize: '.9rem', lineHeight: 1.75, maxWidth: 400 }}>
            {data.sub}
          </p>

          {/* Features */}
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.feats.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.78rem', color: 'rgba(255,255,255,.65)' }}>
                <div style={{ width: 3, height: 14, background: '#E87420', borderRadius: 2, flexShrink: 0 }} />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Brand footer */}
        <div style={{
          position: 'absolute', bottom: 28, left: 72,
          fontSize: '.55rem', color: 'rgba(255,255,255,.2)',
          letterSpacing: '.16em', textTransform: 'uppercase'
        }}>
          COAXIONIA · FoodBridge IA · IA Adaptativa 4ª Generación
        </div>
      </div>

      {/* RIGHT — form panel */}
      <div style={{
        width: 'min(460px, 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 'clamp(28px, 6vw, 64px) clamp(20px, 8vw, 56px)', background: '#fff',
        borderLeft: '1px solid #E8D5C0', boxShadow: '-20px 0 60px rgba(26,47,74,.08)', flex: '1 0 auto'
      }}>
        <div style={{ fontSize: '.62rem', color: '#8A9BB0', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 8 }}>
          Acceso seguro
        </div>
        <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.5rem', fontWeight: 900, color: '#1A2F4A', marginBottom: 32, textTransform: 'uppercase', letterSpacing: '.04em' }}>
          Acceder · <span style={{ color: '#E87420' }}>{data.pill}</span>
        </div>

        {/* Fabricante toggle */}
        {data.showToggle && (
          <div style={{ marginBottom: 20, textAlign: 'center' }}>
            <div style={{
              display: 'inline-flex', background: 'rgba(26,47,74,.06)',
              borderRadius: 30, padding: 3, border: '1px solid rgba(232,116,32,.15)'
            }}>
              {[
                { id: 'directivo', label: 'Directivo / CEO' },
                { id: 'operaciones', label: 'Operaciones / Calidad' },
              ].map(opt => (
                <button key={opt.id} onClick={() => setFabProfile(opt.id)}
                  style={{
                    padding: '8px 20px', borderRadius: 28, border: 'none',
                    fontFamily: 'DM Sans', fontSize: '.7rem', fontWeight: 700,
                    letterSpacing: '.06em', textTransform: 'uppercase', cursor: 'pointer',
                    transition: 'all .25s',
                    background: fabProfile === opt.id ? 'linear-gradient(135deg,#E87420,#D06A1C)' : 'transparent',
                    color: fabProfile === opt.id ? '#fff' : '#7A8899',
                    boxShadow: fabProfile === opt.id ? '0 4px 16px rgba(232,116,32,.3)' : 'none',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '.62rem', color: '#8A9BB0', marginTop: 6 }}>
              {fabProfile === 'directivo' ? 'Vista estratégica de negocio' : 'Vista operativa y de calidad'}
            </div>
          </div>
        )}

        {/* Email */}
        <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: '#8A9BB0', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 6 }}>
          Correo electrónico
        </label>
        <input type="email" placeholder="nombre@empresa.es"
          style={{
            width: '100%', padding: '13px 16px',
            background: '#FFF8F0', border: '1.5px solid #E8D5C0',
            borderRadius: 8, color: '#1A2F4A', fontSize: '.88rem',
            fontFamily: 'DM Sans', outline: 'none', marginBottom: 18,
            boxSizing: 'border-box'
          }}
          onFocus={e => { e.target.style.borderColor = '#E87420'; e.target.style.boxShadow = '0 0 0 3px rgba(232,116,32,.08)' }}
          onBlur={e => { e.target.style.borderColor = '#E8D5C0'; e.target.style.boxShadow = 'none' }}
        />

        {/* Password */}
        <label style={{ display: 'block', fontSize: '.6rem', fontWeight: 700, color: '#8A9BB0', letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 6 }}>
          Contraseña
        </label>
        <input type="password" placeholder="••••••••"
          style={{
            width: '100%', padding: '13px 16px',
            background: '#FFF8F0', border: '1.5px solid #E8D5C0',
            borderRadius: 8, color: '#1A2F4A', fontSize: '.88rem',
            fontFamily: 'DM Sans', outline: 'none', marginBottom: 20,
            boxSizing: 'border-box'
          }}
          onFocus={e => { e.target.style.borderColor = '#E87420'; e.target.style.boxShadow = '0 0 0 3px rgba(232,116,32,.08)' }}
          onBlur={e => { e.target.style.borderColor = '#E8D5C0'; e.target.style.boxShadow = 'none' }}
        />

        {/* Acceder button */}
        <button onClick={handleAcceder}
          style={{
            width: '100%', padding: 14,
            background: 'linear-gradient(135deg,#E87420,#D06A1C)',
            border: 'none', borderRadius: 8, color: '#fff',
            fontFamily: 'Barlow Condensed', fontWeight: 900, fontSize: '1rem',
            letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(232,116,32,.3)',
            transition: 'all .2s'
          }}
          onMouseEnter={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 28px rgba(232,116,32,.4)' }}
          onMouseLeave={e => { e.target.style.transform = ''; e.target.style.boxShadow = '0 4px 20px rgba(232,116,32,.3)' }}
        >
          Acceder
        </button>

        {/* Back link */}
        <span onClick={goHome}
          style={{ display: 'block', textAlign: 'center', marginTop: 16, fontSize: '.75rem', color: '#8A9BB0', cursor: 'pointer', transition: 'color .2s' }}
          onMouseEnter={e => e.target.style.color = '#E87420'}
          onMouseLeave={e => e.target.style.color = '#8A9BB0'}
        >
          ← Cambiar perfil
        </span>

        {/* KPIs */}
        <div style={{ display: 'flex', marginTop: 24, borderTop: '1px solid #E8D5C0', paddingTop: 18 }}>
          {data.kpis.map((k, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '0 8px', borderLeft: i > 0 ? '1px solid #E8D5C0' : 'none' }}>
              <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.4rem', fontWeight: 900, color: '#E87420', lineHeight: 1, marginBottom: 4 }}>{k.val}</div>
              <div style={{ fontSize: '.5rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#7A8899' }}>{k.lbl}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
