import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

const TW_TEXTS = [
  'FoodBridge IA extrae datos de 1.600+ fichas técnicas automáticamente.',
  'Cruza alérgenos, certificaciones y parámetros en segundos.',
  'Genera cotizaciones con márgenes optimizados por inteligencia artificial.',
  'Trazabilidad completa Reg. 178/2002 en cada operación.',
  'Equivalencias de producto calculadas con IA de 4ª generación.',
]

function Typewriter() {
  const [idx, setIdx] = useState(0)
  const [text, setText] = useState('')
  const [char, setChar] = useState(0)

  useEffect(() => {
    const full = TW_TEXTS[idx]
    if (char < full.length) {
      const t = setTimeout(() => { setText(full.slice(0, char + 1)); setChar(c => c + 1) }, 38)
      return () => clearTimeout(t)
    } else {
      const t = setTimeout(() => { setChar(0); setText(''); setIdx(i => (i + 1) % TW_TEXTS.length) }, 2200)
      return () => clearTimeout(t)
    }
  }, [char, idx])

  return (
    <span style={{ fontFamily: 'DM Sans', fontSize: '.8rem', fontWeight: 600, color: 'rgba(26,47,74,.45)', letterSpacing: '.03em' }}>
      {text}<span style={{ color: '#E87420', animation: 'blink .7s step-end infinite' }}>|</span>
    </span>
  )
}

function Counter() {
  const [n, setN] = useState(0)
  useEffect(() => {
    const target = 2847
    const step = Math.ceil(target / 60)
    const t = setInterval(() => setN(v => { if (v + step >= target) { clearInterval(t); return target } return v + step }), 20)
    return () => clearInterval(t)
  }, [])
  return <span style={{ color: '#E87420' }}>{n.toLocaleString('es-ES')}</span>
}

const BG_WORDS = ['LÁCTEOS','CONSERVAS','CEREALES','CÁRNICO','ACEITES','VINOS','FRUTAS','VERDURAS','PESCA','ECOLÓGICO','BIO','DOP','IGP']

export default function HomeScreen() {
  const { enterAs } = useApp()
  const [hovered, setHovered] = useState(null)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'linear-gradient(160deg,#FFF8F0 55%,#1A2F4A 55%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden'
    }} className="home-wrap">
      {/* Diagonal line */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: '55%', width: 1, background: 'linear-gradient(180deg,transparent,rgba(232,120,18,.4),transparent)' }} />

      {/* Floating background words */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {BG_WORDS.map((w, i) => (
          <span key={i} style={{
            position: 'absolute',
            fontFamily: 'DM Sans', fontWeight: 700,
            color: 'rgba(26,47,74,.04)',
            fontSize: `${0.7 + (i % 3) * 0.4}rem`,
            whiteSpace: 'nowrap',
            left: `${(i * 7 + 3) % 90}%`,
            top: `${(i * 11 + 5) % 85}%`,
            animation: `drift ${14 + i * 2}s linear infinite`,
          }}>{w}</span>
        ))}
      </div>

      {/* Content */}
      <div className="home-content" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '100%', padding: '0 12px', boxSizing: 'border-box' }}>

        {/* Logo */}
        <div className="animate-fadeUp" style={{
          display: 'flex', alignItems: 'center', gap: 'clamp(6px,2vw,10px)', marginBottom: 10,
          background: '#1A2F4A', padding: 'clamp(6px,1.5vw,10px) clamp(12px,3vw,20px)', borderRadius: 40,
          boxShadow: '0 6px 22px rgba(26,47,74,.28)'
        }}>
          <div style={{
            width: 'clamp(28px,5vw,38px)', height: 'clamp(28px,5vw,38px)', borderRadius: '50%',
            background: 'linear-gradient(135deg,#E87420,#F5A623)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(232,116,32,.35)'
          }}>
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M14 36V22a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M10 36h28" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M24 12v8M20 14l4-4 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="19" y="26" width="4" height="6" rx="1" fill="#fff" opacity=".8"/>
              <rect x="25" y="28" width="4" height="4" rx="1" fill="#fff" opacity=".6"/>
              <circle cx="38" cy="10" r="5" fill="#F5A623" opacity=".9"/>
              <path d="M36 10h4M38 8v4" stroke="#1A2F4A" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'Barlow Condensed', fontSize: 'clamp(22px,4vw,32px)', fontWeight: 900, letterSpacing: '.04em', lineHeight: 1 }}>
            <span style={{ color: '#fff' }}>Food</span><span style={{ color: '#fff' }}>Bridge</span><span style={{ color: '#F5A623' }}> IA</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="animate-fadeUp home-tagline" style={{ animationDelay: '.1s', fontSize: '.72rem', color: 'rgba(26,47,74,.4)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 10, textAlign: 'center', maxWidth: '100%', padding: '0 4px' }}>
          — Puente Inteligente · Sector Alimentario · IA 4ª Generación —
        </div>

        {/* Subtitle */}
        <div className="animate-fadeUp" style={{ animationDelay: '.15s', fontFamily: 'Barlow Condensed', fontSize: '1.1rem', fontWeight: 700, color: 'rgba(26,47,74,.45)', letterSpacing: '.1em', marginBottom: 20 }}>
          Selecciona el perfil que deseas ver
        </div>

        {/* Typewriter */}
        <div style={{ minHeight: '1.4em', marginBottom: 10, textAlign: 'center' }}>
          <Typewriter />
        </div>

        {/* Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
          <div className="animate-dotPulse" style={{ width: 7, height: 7, borderRadius: '50%', background: '#E87420', flexShrink: 0 }} />
          <span style={{ fontFamily: 'DM Sans', fontSize: '.75rem', fontWeight: 700, color: 'rgba(26,47,74,.55)' }}>
            <Counter /> fichas técnicas procesadas hoy
          </span>
        </div>

        {/* Canales */}
        <div className="home-canales" style={{ display: 'flex', alignItems: 'center', background: 'rgba(26,47,74,.15)', borderRadius: 30, padding: '7px 14px', marginBottom: 8, maxWidth: '100%' }}>
          {[
            { bg: '#FF6B2B', label: 'VOZ IA', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.11 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 8a16 16 0 0 0 5.91 5.91l.27-.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg> },
            { bg: '#25D366', label: 'WHATSAPP', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
            { bg: '#378ADD', label: 'EMAIL', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
          ].map((c, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 12px', borderLeft: i > 0 ? '1px solid rgba(255,255,255,.15)' : 'none' }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{c.icon}</div>
              <span style={{ fontSize: '.58rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: c.bg }}>{c.label}</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '.52rem', color: 'rgba(26,47,74,.3)', textAlign: 'center', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 26 }}>
          FoodBridge IA gestiona todos tus canales
        </div>

        {/* Cards */}
        <div
          style={{ display: 'flex', gap: 20, justifyContent: 'center' }} className="home-cards"
          onMouseLeave={() => setHovered(null)}
        >
          {[
            {
              id: 'fabricante',
              bg: '#fff', border: '1.5px solid #E8D5C0',
              float: 'animate-float1',
              iconBg: '#FFF3E8',
              icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M3 21V7l9-4 9 4v14" stroke="#E87420" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 21h18" stroke="#E87420" strokeWidth="1.8" strokeLinecap="round"/><rect x="7" y="11" width="3" height="4" rx=".5" fill="#E87420" opacity=".7"/><rect x="14" y="11" width="3" height="4" rx=".5" fill="#E87420" opacity=".5"/><path d="M12 3v4" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round"/></svg>,
              titleColor: '#1A2F4A', descColor: '#7A8899',
              title: 'Fabricante',
              desc: 'Sube tu catálogo y la IA genera fichas técnicas automáticamente',
              ctaBg: '#1A2F4A', ctaColor: '#fff',
              hoverIconBg: '#E87420',
              hoverCta: '#E87420',
            },
            {
              id: 'comercial',
              bg: '#E87420', border: '1.5px solid transparent',
              float: 'animate-float2',
              iconBg: 'rgba(255,255,255,.2)',
              icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#fff" strokeWidth="1.8"/><path d="M21 21l-4.35-4.35" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><path d="M8 11h6M11 8v6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/></svg>,
              titleColor: '#fff', descColor: 'rgba(255,255,255,.7)',
              title: 'Comercial',
              desc: 'IA cruza 1.600+ fichas con peticiones de clientes en segundos',
              ctaBg: 'rgba(255,255,255,.15)', ctaColor: '#fff',
              hoverIconBg: 'rgba(255,255,255,.3)',
              hoverCta: 'rgba(255,255,255,.25)',
            },
            {
              id: 'cliente',
              bg: '#1A2F4A', border: '1px solid rgba(255,255,255,.08)',
              float: 'animate-float3',
              iconBg: 'rgba(232,116,32,.15)',
              icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" stroke="#E87420" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 6h18" stroke="#E87420" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 10a4 4 0 0 1-8 0" stroke="#F5A623" strokeWidth="1.8" strokeLinecap="round"/></svg>,
              titleColor: '#fff', descColor: 'rgba(255,255,255,.6)',
              title: 'Cliente',
              desc: 'Solicita productos, recibe cotizaciones y trazabilidad completa',
              ctaBg: '#E87420', ctaColor: '#fff',
              hoverIconBg: 'linear-gradient(135deg,#E87420,#D06A1C)',
              hoverCta: '#F5A623',
            },
          ].map((card) => {
            const isHov = hovered === card.id
            const isBlur = hovered && hovered !== card.id
            return (
              <div
                key={card.id}
                className={card.float}
                onClick={() => enterAs(card.id)}
                onMouseEnter={() => setHovered(card.id)}
                style={{
                  width: 200, borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
                  background: card.bg, border: card.border,
                  boxShadow: isHov ? '0 28px 60px rgba(0,0,0,.3)' : '0 8px 32px rgba(0,0,0,.15)',
                  opacity: isBlur ? 0.4 : 1,
                  filter: isBlur ? 'blur(1px)' : 'none',
                  transform: isHov ? 'translateY(-12px) scale(1.02)' : isBlur ? 'scale(.97)' : '',
                  transition: 'all .28s cubic-bezier(.4,0,.2,1)',
                }}
              >
                <div style={{ padding: '28px 18px 18px', textAlign: 'center' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: isHov && card.id !== 'comercial' ? card.hoverIconBg : card.iconBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px', transition: 'all .25s',
                    border: card.id === 'cliente' ? '1px solid rgba(232,116,32,.3)' : 'none'
                  }}>
                    {card.icon}
                  </div>
                  <div style={{ fontFamily: 'Barlow Condensed', fontSize: 20, fontWeight: 900, color: card.titleColor, textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 8 }}>
                    {card.title}
                  </div>
                  <div style={{ fontSize: '.68rem', color: card.descColor, lineHeight: 1.6 }}>
                    {card.desc}
                  </div>
                </div>
                <div style={{
                  padding: 14,
                  background: isHov ? card.hoverCta : card.ctaBg,
                  textAlign: 'center', transition: 'background .2s'
                }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontSize: 12, fontWeight: 700, color: card.ctaColor, letterSpacing: '.2em', textTransform: 'uppercase' }}>
                    Entrar →
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="home-footer" style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 8,
        background: 'rgba(232,116,32,.03)', borderTop: '1px solid rgba(232,116,32,.08)'
      }}>
        <span style={{ fontSize: '.44rem', letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(26,47,74,.25)' }}>COAXIONIA · FoodBridge IA</span>
        <div className="animate-pulse-icon" style={{ width: 5, height: 5, borderRadius: '50%', background: '#E87420' }} />
        <span style={{ fontSize: '.44rem', letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 600, color: 'rgba(26,47,74,.25)' }}>Selecciona tu perfil</span>
      </div>
    </div>
  )
}
