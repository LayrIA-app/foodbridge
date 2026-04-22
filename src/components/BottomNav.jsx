/*
 * BottomNav — Barra inferior de navegación móvil (≤768px).
 * Fidelidad HTML v5 `buildBottomNav([...])` (5 items por perfil).
 *
 * Se oculta automáticamente en desktop mediante la clase `.fb-bottomnav`
 * (regla CSS en index.css: display:none por defecto, display:flex en
 * @media (max-width: 768px)).
 *
 * Props:
 *   - items: [{ id, label, icon }]  ·  5 accesos rápidos
 *   - active: id de la sección activa
 *   - onChange: (id) => void
 */
const ACCENT = '#E87420'
const NAVY = '#1A2F4A'

export default function BottomNav({ items, active, onChange }) {
  if (!items || items.length === 0) return null
  return (
    <div className="fb-bottomnav" style={{
      position:'fixed',
      left:0, right:0, bottom:0,
      height:58,
      background:'#fff',
      borderTop:'1px solid #E8D5C0',
      boxShadow:'0 -4px 24px rgba(26,47,74,.08)',
      display:'none',       /* .fb-bottomnav { display:flex } en @media (max-width:768px) */
      alignItems:'center',
      justifyContent:'space-around',
      zIndex:900,
      paddingBottom:'env(safe-area-inset-bottom, 0)',
    }}>
      {items.map(item => {
        const isActive = active === item.id
        return (
          <button
            key={item.id}
            onClick={()=>onChange(item.id)}
            aria-label={item.label}
            style={{
              flex:1,
              height:'100%',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              gap:3,
              padding:'6px 4px',
              border:'none',
              background:'transparent',
              cursor:'pointer',
              color: isActive ? ACCENT : '#7a8899',
              fontFamily:'DM Sans, sans-serif',
              transition:'color .15s',
              position:'relative',
            }}
          >
            {isActive && (
              <div style={{ position:'absolute', top:0, left:'25%', right:'25%', height:2, background:ACCENT, borderRadius:'0 0 2px 2px' }}/>
            )}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: item.icon }}/>
            <span style={{ fontSize:'.5rem', fontWeight:isActive ? 700 : 600, letterSpacing:'.04em', whiteSpace:'nowrap' }}>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────────
 * Presets de items por perfil — HTML v5:
 *   Comercial      (l.2742-2747)
 *   Fabricante Dir (l.3228-3232)
 *   Fabricante Ops (l.3649-3653)
 *   Cliente        (l.3949-3953)
 * ─────────────────────────────────────────────────────────────────── */

export const BOTTOM_NAV_COMERCIAL = [
  { id:'dash',         label:'Inicio',   icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  { id:'ruta',         label:'Ruta',     icon:'<circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>' },
  { id:'pedidos',      label:'Pedidos',  icon:'<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>' },
  { id:'cotizaciones', label:'Cotizar',  icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
  { id:'comunica',     label:'Chat',     icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
]

export const BOTTOM_NAV_FAB_DIR = [
  { id:'fdash',         label:'Inicio',   icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  { id:'fventas',       label:'Ventas',   icon:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>' },
  { id:'frentabilidad', label:'Rentab.',  icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
  { id:'fsimulador',    label:'Simular',  icon:'<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>' },
  { id:'fcomunica',     label:'Chat',     icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>' },
]

export const BOTTOM_NAV_FAB_OPS = [
  { id:'odash',        label:'Inicio',    icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  { id:'osubir',       label:'Subir',     icon:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>' },
  { id:'ofichas',      label:'Fichas',    icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
  { id:'oappcc',       label:'APPCC',     icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { id:'oproduccion',  label:'Producc.',  icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>' },
]

export const BOTTOM_NAV_CLIENTE = [
  { id:'cdash',    label:'Inicio',   icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>' },
  { id:'cbuscar',  label:'Buscar',   icon:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>' },
  { id:'cpedidos', label:'Pedidos',  icon:'<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/>' },
  { id:'ccotiza',  label:'Cotizar',  icon:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>' },
  { id:'ctraza',   label:'Trazab.',  icon:'<polyline points="20 6 9 17 4 12"/>' },
]
