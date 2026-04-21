import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { usePedidos, useCotizacionClientesMap, useCotizaciones, useProducts, useVisitas, useAlertasIa, usePushIa } from '../../hooks'
import IaBoxLive from '../../components/IaBoxLive'
import { pdfCotizacion, pdfFichaTecnica } from '../../utils/generatePDF'

const ACCENT = '#E87420'
const NAVY = '#1A2F4A'

/* ══ HOOKS ══ */
function useToast() {
  const [toast, setToast] = useState(null)
  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }, [])
  return { toast, showToast }
}

function useCountUp(target, duration=900) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    const num = parseFloat(String(target).replace(/[^0-9.]/g,''))
    if (!num) return
    const start = Date.now()
    const tick = () => {
      const p = Math.min((Date.now()-start)/duration, 1)
      setCount(Math.round(num * (1 - Math.pow(1-p, 3))))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [target, duration])
  return count
}

/* ══ BASE COMPONENTS ══ */
function Toast({ msg }) {
  if (!msg) return null
  return <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', background:NAVY, color:'#fff', padding:'10px 20px', borderRadius:10, fontSize:'.72rem', fontWeight:600, zIndex:9999, border:'1px solid rgba(232,116,32,.3)', boxShadow:'0 8px 24px rgba(26,47,74,.25)', whiteSpace:'nowrap' }}>{msg}</div>
}

function Modal({ modal, onClose }) {
  if (!modal) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,47,74,.55)', backdropFilter:'blur(3px)', zIndex:8999, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 16px' }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:16, padding:24, maxWidth:480, width:'100%', boxShadow:'0 8px 40px rgba(26,47,74,.2)', animation:'modalIn .25s ease both', maxHeight:'85vh', overflowY:'auto' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.1rem', fontWeight:900, color:NAVY }}>{modal.title}</div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(26,47,74,.06)', border:'none', cursor:'pointer', fontSize:'.9rem', color:'#7a8899' }}>✕</button>
        </div>
        <div style={{ fontSize:'.78rem', color:'#3a4a5a', lineHeight:1.65 }} dangerouslySetInnerHTML={{ __html: modal.body }} />
        {modal.actions && (
          <div style={{ display:'flex', gap:8, marginTop:16, justifyContent:'flex-end', flexWrap:'wrap' }}>
            {modal.actions.map((a,i) => (
              <button key={i} onClick={() => { a.fn?.(); onClose() }}
                style={{ padding:'10px 20px', borderRadius:8, fontSize:'.72rem', fontWeight:700, border:'none', cursor:'pointer',
                  background: a.type==='primary'?`linear-gradient(135deg,${ACCENT},#D06A1C)`:a.type==='green'?'#E8F5E9':a.type==='blue'?'#E8F0FE':a.type==='red'?'#FDECEA':'#F0E6D9',
                  color: a.type==='primary'?'#fff':a.type==='green'?'#2D8A30':a.type==='blue'?'#1A78FF':a.type==='red'?'#e03030':NAVY }}>
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PushNotif({ msg, onClose }) {
  if (!msg) return null
  return (
    <div onClick={onClose} style={{ position:'fixed', bottom:80, right:16, width:'min(320px,calc(100vw-32px))', background:NAVY, borderRadius:12, padding:'14px 16px', boxShadow:'0 8px 32px rgba(26,47,74,.4)', display:'flex', gap:10, zIndex:9999, cursor:'pointer', animation:'modalIn .3s ease both' }}>
      <div style={{ width:3, borderRadius:2, flexShrink:0, background:msg.bar }} />
      <div><div style={{ fontSize:'.48rem', fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:3 }}>{msg.label}</div><div style={{ fontSize:'.72rem', color:'rgba(255,255,255,.9)', lineHeight:1.5 }}>{msg.text}</div></div>
    </div>
  )
}

function AlertsModal({ alerts, onClose, readSet, onMarkRead }) {
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9990 }} />
      <div style={{ position:'fixed', top:62, right:16, width:'min(360px,calc(100vw-32px))', maxHeight:'80vh', background:'#fff', borderRadius:14, boxShadow:'0 8px 40px rgba(26,47,74,.2)', display:'flex', flexDirection:'column', overflow:'hidden', zIndex:9991, animation:'modalIn .2s ease both' }}>
        <div style={{ background:'linear-gradient(135deg,#1A2F4A,#E87420)', padding:'14px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <span style={{ fontFamily:'Barlow Condensed', fontSize:'.92rem', fontWeight:700, color:'#fff', letterSpacing:'.04em' }}>Alertas FoodBridge IA</span>
          <button onClick={onClose} style={{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,.15)', border:'none', color:'#fff', cursor:'pointer', fontSize:'.8rem' }}>✕</button>
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          <div style={{ fontSize:'.52rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#94A3B8', padding:'10px 16px 4px' }}>RECIENTES</div>
          {alerts.map((a,i) => (
            <div key={i} onClick={()=>onMarkRead(i)} style={{ display:'flex', gap:10, padding:'10px 16px', borderBottom:'1px solid #F8FAFC', cursor:'pointer', opacity:readSet.has(i)?.4:1 }}
              onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background=''}>
              <div style={{ width:8, height:8, borderRadius:'50%', background:a.dot, marginTop:4, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'.74rem', color:NAVY, lineHeight:1.5 }}>{a.text}</div>
                <div style={{ fontSize:'.58rem', color:'#94A3B8', marginTop:2 }}>{a.time}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding:'10px 16px', textAlign:'center', fontSize:'.6rem', color:'#94A3B8', borderTop:'1px solid #F1F5F9' }}>
          {alerts.filter((_,i)=>!readSet.has(i)).length} alertas sin leer
        </div>
      </div>
    </>
  )
}

function Badge({ type, text }) {
  const s = { ok:{bg:'#EBF5EF',color:'#2D8A30',border:'#C6F6D5'}, red:{bg:'#FDECEA',color:'#e03030',border:'#F1A9A0'}, amber:{bg:'#FDF3E7',color:'#e8a010',border:'#F0C06A'}, blue:{bg:'#EEF5FF',color:'#1A78FF',border:'#B5D4F4'}, orange:{bg:'#FFF3E8',color:'#E87420',border:'rgba(232,116,32,.3)'} }[type]||{bg:'#F0E6D9',color:NAVY,border:'#E8D5C0'}
  return <span style={{ display:'inline-block', padding:'2px 9px', borderRadius:20, fontSize:'.6rem', fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>{text}</span>
}

function KPI({ val, label, delta, up, color=ACCENT }) {
  const num = parseFloat(String(val).replace(/[^0-9.]/g,''))
  const animated = useCountUp(num)
  const suffix = String(val).replace(/^[0-9.,]+/,'')
  const prefix = String(val).match(/^[€+]*/)?.[0]||''
  const display = num ? `${prefix}${animated.toLocaleString('es-ES')}${suffix}` : val
  return (
    <div style={{ background:'linear-gradient(160deg,#fff,#FFFBF5)', border:'1px solid rgba(232,116,32,.15)', borderRadius:11, padding:'14px 16px', boxShadow:'0 2px 16px rgba(26,47,74,.07)', position:'relative', overflow:'hidden', transition:'transform .28s,box-shadow .28s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 36px rgba(26,47,74,.13)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 16px rgba(26,47,74,.07)'}}>

      <div style={{ fontSize:'.65rem', color:'#7a8899', marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.45rem', fontWeight:800, color, marginBottom:3 }}>{display}</div>
      {delta && <div style={{ fontSize:'.64rem', fontWeight:600, color:up?'#2D8A30':delta.includes('▼')?'#e03030':'#7a8899' }}>{delta}</div>}
    </div>
  )
}

function IABox({ text }) {
  return (
    <div style={{ background:'linear-gradient(135deg,rgba(232,116,32,.04),rgba(245,166,35,.06))', border:'1px solid rgba(232,116,32,.25)', borderRadius:9, padding:'10px 14px', marginTop:10, display:'flex', gap:8, alignItems:'flex-start' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" style={{ flexShrink:0, marginTop:2 }}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
      <div style={{ fontSize:'.72rem', color:'#3a4a5a', lineHeight:1.6 }} dangerouslySetInnerHTML={{ __html: text }} />
    </div>
  )
}

function Card({ children, style }) {
  return (
    <div style={{ background:'linear-gradient(160deg,#fff,#FFFBF5)', border:'1px solid #E8D5C0', borderRadius:11, padding:'14px 16px', boxShadow:'0 2px 16px rgba(26,47,74,.07)', transition:'all .28s', ...style }}>
      {children}
    </div>
  )
}

function CardTitle({ children }) {
  return <div style={{ fontSize:'.6rem', fontWeight:700, color:'#7a8899', textTransform:'uppercase', letterSpacing:'.1em', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:4 }}>{children}</div>
}

function IaBadge() {
  return <span style={{ fontSize:'.54rem', fontWeight:700, padding:'2px 7px', borderRadius:10, background:'rgba(232,116,32,.1)', color:ACCENT, border:'1px solid rgba(232,116,32,.2)', whiteSpace:'nowrap' }}>IA</span>
}

function SearchBar({ placeholder }) {
  return (
    <div style={{ position:'relative', marginBottom:12 }}>
      <input placeholder={placeholder} style={{ width:'100%', padding:'9px 38px 9px 12px', border:'2px solid rgba(232,116,32,.15)', borderRadius:9, fontSize:'.7rem', fontFamily:'DM Sans,sans-serif', outline:'none', boxSizing:'border-box', color:NAVY }}
        onFocus={e=>{e.target.style.borderColor=ACCENT;e.target.style.boxShadow='0 0 0 3px rgba(232,116,32,.1)'}}
        onBlur={e=>{e.target.style.borderColor='rgba(232,116,32,.15)';e.target.style.boxShadow='none'}} />
      <svg style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', opacity:.35, pointerEvents:'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    </div>
  )
}

function LiveTicker({ msgs, id }) {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(()=>setI(v=>(v+1)%msgs.length), 4500); return ()=>clearInterval(t) }, [msgs.length])
  return (
    <div style={{ background:'linear-gradient(135deg,#FFF3E8,#FFFBF5)', borderRadius:8, padding:'6px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(232,116,32,.15)', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
        <div className="animate-dotPulse" style={{ width:6, height:6, borderRadius:'50%', background:ACCENT }} />
        <span style={{ fontSize:'.52rem', fontWeight:800, color:ACCENT, letterSpacing:'.1em', textTransform:'uppercase' }}>IA LIVE</span>
      </div>
      <div style={{ fontSize:'.64rem', color:'#3a4a5a', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msgs[i]}</div>
    </div>
  )
}

function Pbar({ pct, color=ACCENT, height=10 }) {
  return (
    <div style={{ height, background:'#F0E4D6', borderRadius:6, overflow:'hidden', position:'relative' }}>
      <div style={{ height:'100%', borderRadius:6, background:`linear-gradient(90deg,${color},#F5A623)`, width:`${pct}%`, transition:'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  )
}

function BtnSm({ children, outline, color, onClick }) {
  return <button onClick={onClick} style={{ padding:'6px 12px', borderRadius:7, border:outline?`1.5px solid rgba(232,116,32,.4)`:'none', cursor:'pointer', fontSize:'.62rem', fontWeight:700, fontFamily:'DM Sans,sans-serif', background:outline?'transparent':color||`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:outline?ACCENT:'#fff', whiteSpace:'nowrap' }}>{children}</button>
}

function TblBtn({ type, children, onClick }) {
  const s = { orange:{bg:'rgba(232,116,32,.1)',color:ACCENT,border:'1px solid rgba(232,116,32,.25)'}, red:{bg:'rgba(224,48,48,.08)',color:'#e03030',border:'1px solid rgba(224,48,48,.2)'}, green:{bg:'rgba(45,138,48,.08)',color:'#2D8A30',border:'1px solid rgba(45,138,48,.2)'}, blue:{bg:'rgba(26,120,255,.08)',color:'#1A78FF',border:'1px solid rgba(26,120,255,.2)'} }[type]||{}
  return <button onClick={onClick} style={{ padding:'3px 8px', borderRadius:5, border:s.border, cursor:'pointer', fontSize:'.58rem', fontWeight:700, background:s.bg, color:s.color, fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}>{children}</button>
}

function PageHdr({ title, subtitle, badge }) {
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2, flexWrap:'wrap', gap:6 }}>
        <h2 style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:NAVY }}>{title}</h2>
        {badge && <Badge type="orange" text={badge} />}
      </div>
      {subtitle && <p style={{ fontSize:'.72rem', color:'#7a8899' }}>{subtitle}</p>}
    </div>
  )
}

function ScrollTable({ children }) {
  return <div style={{ width:'100%', overflowX:'hidden' }}><table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.6rem', tableLayout:'fixed' }}><colgroup><col style={{wordBreak:'break-word',whiteSpace:'normal'}}/></colgroup>{children}</table></div>
}

function Thead({ cols }) {
  return <thead><tr style={{ background:NAVY }}>{cols.map(c=><th key={c} style={{ fontSize:'.58rem', fontWeight:700, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.08em', padding:'8px 10px', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>)}</tr></thead>
}

/* ══ VISIT CARD ══ */
function VisitCard({ num, hour, color, border, bg, name, loc, badge, amount, urgent, iaNote, act }) {
  return (
    <div style={{ display:'flex', gap:14, marginBottom:6, position:'relative' }}>
      <div style={{ width:36, flexShrink:0, textAlign:'center', paddingTop:12 }}>
        <div style={{ fontFamily:'Barlow Condensed', fontSize:'.9rem', fontWeight:900, color, lineHeight:1 }}>{hour}</div>
      </div>
      <div style={{ position:'relative', width:18, flexShrink:0, display:'flex', alignItems:'flex-start', paddingTop:14 }}>
        <div style={{ width:18, height:18, borderRadius:'50%', background:color, border:`3px solid ${border}`, zIndex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:'#fff', fontSize:'.5rem', fontWeight:900 }}>{num}</span>
        </div>
      </div>
      <div style={{ flex:1, background:bg, border:`1.5px solid ${border}`, borderRadius:12, padding:14, marginBottom:4 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8, flexWrap:'wrap', gap:4 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
              <span style={{ fontSize:'.78rem', fontWeight:800, color:NAVY }}>{name}</span>
              {urgent && <span style={{ fontSize:'.45rem', fontWeight:800, padding:'2px 6px', borderRadius:4, background:'linear-gradient(135deg,#e03030,#ff4545)', color:'#fff', letterSpacing:'.05em', animation:'pulse 2s infinite' }}>URGENTE</span>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:'.58rem', color:'#7a8899' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7a8899" strokeWidth="2"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
              {loc}
            </div>
          </div>
          <Badge type="ok" text="Confirmada"/>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:10 }}>
          <Badge type="red" text={badge}/>
          <span style={{ fontSize:'.62rem', fontWeight:800, color }}>{amount}</span>
        </div>
        {iaNote && <div style={{ padding:'6px 10px', background:'rgba(232,116,32,.06)', borderRadius:6, marginBottom:10, display:'flex', alignItems:'center', gap:6 }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize:'.52rem', color:ACCENT, fontWeight:600 }}>{iaNote}</span>
        </div>}
        <div style={{ display:'flex', gap:6 }}>
          <button onClick={()=>act('checkin',name)} style={{ flex:1, padding:'8px', fontSize:'.62rem', borderRadius:8, background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:'#fff', border:'none', cursor:'pointer', fontFamily:'DM Sans', fontWeight:700 }}>✓ Check-in</button>
          <button disabled title="Disponible en Fase 3 · Voz IA" style={{ padding:'8px 12px', fontSize:'.62rem', borderRadius:8, background:'#f0f4f8', color:NAVY, border:'1px solid #dce3eb', cursor:'not-allowed', opacity:.5 }}>📞</button>
          <button onClick={()=>act('goto','fichas')} style={{ padding:'8px 12px', fontSize:'.62rem', borderRadius:8, background:'#f0f4f8', color:NAVY, border:'1px solid #dce3eb', cursor:'pointer' }}>📄</button>
        </div>
      </div>
    </div>
  )
}

function TravelIndicator({ time, km, via }) {
  return (
    <div style={{ display:'flex', gap:14, marginBottom:6 }}>
      <div style={{ width:36 }}/>
      <div style={{ width:18, display:'flex', justifyContent:'center' }}><div style={{ width:1 }}/></div>
      <div style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 10px', borderRadius:8, background:'rgba(26,47,74,.03)' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#7a8899" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        <span style={{ fontSize:'.52rem', fontWeight:600, color:'#7a8899' }}>{time} · {km} · {via}</span>
      </div>
    </div>
  )
}

/* ══ SCREEN 1: DASHBOARD ══ */
function DashScreen({ act }) {
  const now = new Date()
  const days = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  const dateStr = `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]} ${now.getFullYear()}`

  return (
    <div className="animate-fadeIn">
      {/* HERO */}
      <div style={{ background:'linear-gradient(135deg,#1A2F4A 0%,#2A4A6A 60%,#E87420 100%)', borderRadius:14, padding:'20px 24px', marginBottom:16, color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, width:'40%', height:'100%', background:'linear-gradient(135deg,transparent,rgba(232,116,32,.15))', pointerEvents:'none' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div style={{ flex:1, minWidth:200 }}>
            <div style={{ fontSize:'.54rem', fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(255,255,255,.5)', marginBottom:4 }}>FoodBridge IA — Agente Comercial</div>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.3rem', fontWeight:800, lineHeight:1.2, marginBottom:2 }}>Buenos días, José Luis</div>
            <div style={{ fontSize:'.7rem', color:'rgba(255,255,255,.6)', marginBottom:12 }}>{dateStr}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {[{label:'2 urgentes',color:'rgba(224,48,48,.2)',text:'#ff8a8a',border:'rgba(224,48,48,.3)'},{label:'5 visitas hoy',color:'rgba(232,160,16,.2)',text:'#ffd080',border:'rgba(232,160,16,.3)'},{label:'287 km ruta',color:'rgba(45,138,48,.2)',text:'#7ddf80',border:'rgba(45,138,48,.3)'},{label:'3 cotiz. pendientes',color:'rgba(26,120,255,.2)',text:'#80b8ff',border:'rgba(26,120,255,.3)'}].map((t,i)=>(
                <span key={i} style={{ padding:'4px 10px', borderRadius:20, fontSize:'.58rem', fontWeight:700, background:t.color, color:t.text, border:`1px solid ${t.border}` }}>{t.label}</span>
              ))}
            </div>
          </div>
          <div style={{ background:'rgba(255,255,255,.08)', borderRadius:10, padding:'12px 16px', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,.1)', minWidth:220, maxWidth:300, flex:'0 1 280px' }}>
            <div style={{ fontSize:'.5rem', fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,.4)', marginBottom:6 }}>BRIEFING IA DEL DÍA</div>
            <div style={{ fontSize:'.72rem', color:'rgba(255,255,255,.85)', lineHeight:1.55 }}>Prioridad 1: <strong style={{ color:'#ff8a8a' }}>Cerrar pedido Congelados Martz</strong> (visita 10:30h). Leopold necesita confirmación de stock W-280 antes de las 14h. Ruta optimizada: 287 km, ahorro de 52 km vs orden manual.</div>
          </div>
        </div>
      </div>

      <LiveTicker msgs={['Analizando 1.647 fichas técnicas de 23 fabricantes...','Match IA 96% — Harina W-280 para Panaderías Leopold encontrado','Cotización COT-2026-093 generada para Agrudispa — margen 19.2%','Ruta recalculada: Agrudispa antes que Martz ahorra 47 km']} />
      <SearchBar placeholder="Buscar alertas, clientes, KPIs..." />

      {/* OBJETIVO MENSUAL */}
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Objetivo mensual Abril 2026 <IaBadge /></CardTitle>
        <div className="grid-3" style={{ marginBottom:14 }}>
          {[{label:'FACTURACIÓN',val:'87.400 EUR',sub:'de 120.000 EUR',color:'#2D8A30'},{label:'OPERACIONES',val:'42',sub:'de 55 objetivo',color:'#2D8A30'},{label:'CLIENTES NUEVOS',val:'3',sub:'de 5 objetivo',color:'#e8a010'}].map((k,i)=>(
            <div key={i} style={{ textAlign:'center' }}>
              <div style={{ fontSize:'.5rem', fontWeight:700, color:'#7a8899', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>{k.label}</div>
              <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.1rem', fontWeight:800, color:NAVY }}>{k.val}</div>
              <div style={{ fontSize:'.58rem', color:k.color, fontWeight:600 }}>{k.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ marginBottom:6, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'.58rem', fontWeight:700, color:'#7a8899' }}>Facturación mensual</span>
          <span style={{ fontSize:'.58rem', fontWeight:800, color:ACCENT }}>72.8%</span>
        </div>
        <Pbar pct={72.8} color={ACCENT}/>
        <div style={{ marginTop:10, marginBottom:6, display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:'.58rem', fontWeight:700, color:'#7a8899' }}>Operaciones cerradas</span>
          <span style={{ fontSize:'.58rem', fontWeight:800, color:'#2D8A30' }}>76.4%</span>
        </div>
        <Pbar pct={76.4} color="#2D8A30"/>
        <IABox text="<strong>Proyección IA:</strong> Al ritmo actual cerrarás abril al <strong>94% del objetivo</strong>. Si cierras Congelados Martz hoy y Leopold confirma el pedido grande, llegas al <strong>108%</strong>." />
      </Card>

      {/* KPIs */}
      <div className="grid-4 mb14">
        <KPI val="1.647" label="Fichas técnicas activas" delta="▲ +84 este mes" up color={ACCENT}/>
        <KPI val="340" label="Operaciones Q1 2026" delta="▲ +47% vs Q1 2025" up color="#2D8A30"/>
        <KPI val="94%" label="Match IA exacto" delta="▲ Precisión creciente" up color="#1A78FF"/>
        <KPI val="12" label="Solicitudes pendientes" delta="→ 3 urgentes hoy" color="#e03030"/>
      </div>

      {/* PRÓXIMA VISITA */}
      <Card style={{ marginBottom:13,  }}>
        <CardTitle>Próxima visita <span style={{ fontSize:'.55rem', fontWeight:700, color:ACCENT, background:'rgba(232,116,32,.1)', padding:'2px 8px', borderRadius:12, marginLeft:6 }}>EN 47 MIN</span></CardTitle>
        <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:180 }}>
            <div style={{ fontSize:'.88rem', fontWeight:800, color:NAVY, marginBottom:2 }}>Congelados Martz S.L.</div>
            <div style={{ fontSize:'.68rem', color:'#7a8899', marginBottom:8 }}>Pol. Ind. Fuente del Jarro, Nave 14 — Paterna (Valencia)</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <Badge type="red" text="Pedido urgente"/>
              <Badge type="blue" text="Masa hojaldre -18°C"/>
              <Badge type="orange" text="31.200 EUR"/>
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <BtnSm onClick={()=>act('navegar','Congelados Martz')}>🧭 Navegar</BtnSm>
            <button disabled title="Disponible en Fase 3 · Voz IA" style={{ padding:'6px 12px', fontSize:'.62rem', fontWeight:700, borderRadius:6, background:'transparent', color:NAVY, border:'1.5px solid #dce3eb', cursor:'not-allowed', opacity:.5, fontFamily:'DM Sans' }}>📞 Llamar</button>
          </div>
        </div>
      </Card>

      {/* SOLICITUDES + ALERTAS */}
      <div className="grid-2 mb14">
        <Card>
          <CardTitle>Solicitudes activas por cliente <IaBadge /></CardTitle>
          <ScrollTable>
            <Thead cols={['Cliente','Producto','Urgencia','Match IA','Acción']}/>
            <tbody>
              {[['Panaderías Leopold','Harina fuerza W-280','red:Urgente','ok:3 matches','cotizar:Harina W-280'],['Dulces Iberia S.L.','Cobertura chocolate 55%','amber:Media','ok:5 matches','cotizar:Cobertura 55%'],['Agrudispa','Margarina hojaldre PF 42','amber:Media','blue:2 matches','buscar:Margarina PF 42'],['Pasteleros del Sur','Crema pastelera UHT','ok:Normal','ok:7 matches','cotizar:Crema UHT'],['Congelados Martz','Masa hojaldre -18°C','red:Urgente','amber:1 match','alerta:Solo 1 match Martz'],['Bollería Artesana Lux','Mantequilla laminar 82%','ok:Normal','ok:4 matches','cotizar:Mantequilla 82%']].map(([cli,prod,urg,match,ac],i)=>{
                const[ut,uv]=urg.split(':');const[mt,mv]=match.split(':');const[at,av]=ac.split(':')
                return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{ padding:'8px 10px', fontWeight:700, color:NAVY, whiteSpace:'nowrap' }}>{cli}</td>
                  <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{prod}</td>
                  <td style={{ padding:'8px 10px' }}><Badge type={ut} text={uv}/></td>
                  <td style={{ padding:'8px 10px' }}><Badge type={mt} text={mv}/></td>
                  <td style={{ padding:'8px 10px' }}><TblBtn type={ut==='red'?'red':'orange'} onClick={()=>act(at,av)}>{at==='cotizar'?'Cotizar IA':at==='buscar'?'Buscar más':'Ampliar IA'}</TblBtn></td>
                </tr>)
              })}
            </tbody>
          </ScrollTable>
          <IABox text="<strong>FoodBridge IA detecta:</strong> Congelados Martz necesita masa hojaldre con punto de fusión específico. Solo Harinas del Mediterráneo cumple. IA recomienda <strong>solicitar muestra urgente</strong>." />
        </Card>

        <Card>
          <CardTitle>Alertas prioritarias IA <IaBadge /></CardTitle>
          {[{type:'red',title:'3 certificaciones IFS caducan en 30 días',sub:'Harinas del Mediterráneo, Chocolates Gourmet BCN, Aceites Levante'},{type:'red',title:'Pedido PED-2026-387 retrasado 24h',sub:'Congelados Martz — Incidencia logística. Cliente ya ha llamado.'},{type:'amber',title:'Reg. 2025/847 — nuevos límites acrilamida',sub:'14 fichas técnicas afectadas. IA las ha marcado para revisión.'},{type:'blue',title:'Match IA 96% — Harina W-280 para Leopold',sub:'Harinas del Mediterráneo tiene stock. Propuesta lista en 2 min.'},{type:'ok',title:'Cotización COT-2026-093 aceptada',sub:'Agrudispa confirmó pedido. 8.900€ cerrados hoy.'}].map((a,i)=>{
            const c={red:{bg:'#FDECEA',border:'#F1A9A0',t:'#e03030'},amber:{bg:'#FDF3E7',border:'#F0C06A',t:'#e8a010'},ok:{bg:'#EBF5EF',border:'#90D4A8',t:'#2D8A30'},blue:{bg:'#EEF5FF',border:'#B5D4F4',t:'#1A78FF'}}[a.type]
            return <div key={i} onClick={()=>act('alerta',a.title)} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:8, padding:'9px 12px', marginBottom:7, cursor:'pointer' }}><div style={{ fontSize:'.72rem', fontWeight:700, color:c.t, marginBottom:2 }}>{a.title}</div><div style={{ fontSize:'.65rem', color:'#3a4a5a' }}>{a.sub}</div></div>
          })}
        </Card>
      </div>

      {/* TOP FABRICANTES */}
      <div className="grid-2 mb14">
        <Card>
          <CardTitle>Operaciones mensuales 2026 <IaBadge /></CardTitle>
          {[{m:'Enero',v:82,c:'#2D8A30'},{m:'Febrero',v:96,c:'#2D8A30'},{m:'Marzo',v:124,c:ACCENT},{m:'Abril',v:42,c:'#1A78FF',sub:'en curso'}].map((r,i)=>(
            <div key={i} style={{ marginBottom:8 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.68rem', marginBottom:3 }}>
                <span style={{ fontWeight:600, color:NAVY }}>{r.m}</span>
                <span style={{ color:r.c, fontWeight:700 }}>{r.v}{r.sub?` (${r.sub})`:''}</span>
              </div>
              <Pbar pct={Math.round(r.v/1.3)} color={r.c} height={6}/>
            </div>
          ))}
          <IABox text="<strong>Proyección IA:</strong> Al ritmo actual, cerrarás 2026 con <strong>~1.580 operaciones</strong> — un 52% más que 2025." />
        </Card>
        <Card>
          <CardTitle>Top fabricantes por volumen <IaBadge /></CardTitle>
          <ScrollTable>
            <Thead cols={['Fabricante','Prods','Ops Q1','Certif.','Acción']}/>
            <tbody>
              {[['Harinas del Mediterráneo','142','87','ok:IFS+BRC'],['Chocolates Gourmet BCN','98','64','ok:IFS'],['Aceites Levante S.A.','67','45','ok:ISO 22000'],['Lácteos Puerta de Hierro','54','38','blue:BRC'],['Congelados Navarra','87','12','amber:Pendiente']].map(([fab,prods,ops,cert],i)=>{const[ct,cv]=cert.split(':');return(
                <tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{ padding:'8px 10px', fontWeight:700, color:NAVY, whiteSpace:'nowrap' }}>{fab}</td>
                  <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{prods}</td>
                  <td style={{ padding:'8px 10px', fontWeight:700, color:'#2D8A30' }}>{ops}</td>
                  <td style={{ padding:'8px 10px' }}><Badge type={ct} text={cv}/></td>
                  <td style={{ padding:'8px 10px' }}><TblBtn type={ct==='amber'?'blue':'orange'} onClick={()=>act('goto','fichas')}>{ct==='amber'?'Validar IA':'Catálogo'}</TblBtn></td>
                </tr>
              )})}
            </tbody>
          </ScrollTable>
          <IABox text="<strong>Ranking IA:</strong> Harinas del Mediterráneo lidera por 3er trimestre consecutivo. Congelados Navarra <strong>pendiente de validación IFS</strong> antes de operar." />
        </Card>
      </div>
    </div>
  )
}

/* ══ SCREEN 2: MI RUTA HOY ══ */
const VISIT_COLORS = ['#2D8A30', ACCENT, '#1A78FF', '#e8a010', '#9B59B6']

function formatDateLong(d) {
  const days = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`
}

function formatHour(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function RutaScreen({ act }) {
  const { profile } = useApp()
  const today = new Date()
  const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()
  const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString()
  const { visitas, loading } = useVisitas({ profile, fromDate: dayStart, toDate: dayEnd })

  const empty = !loading && visitas.length === 0

  return (
    <div className="animate-fadeIn">
      <PageHdr title="Mi Ruta de Hoy" subtitle="Agenda del día — check-in con GPS al llegar" badge={`${visitas.length} visita${visitas.length===1?'':'s'}`} />
      <SearchBar placeholder="Buscar cliente, dirección, zona..." />

      <Card style={{ marginBottom:13 }}>
        <CardTitle>Resumen de ruta <IaBadge /></CardTitle>
        <div className="grid-4 mb14">
          <div style={{ textAlign:'center', padding:10, background:'#FFFBF5', borderRadius:8, border:'1px solid #E8D5C0' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:800, color:ACCENT }}>{visitas.length}</div>
            <div style={{ fontSize:'.55rem', color:'#7a8899', fontWeight:600, marginTop:2 }}>Visitas hoy</div>
          </div>
          <div style={{ textAlign:'center', padding:10, background:'#FFFBF5', borderRadius:8, border:'1px solid #E8D5C0' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:800, color:NAVY }}>{visitas.filter(v=>v.status==='scheduled').length}</div>
            <div style={{ fontSize:'.55rem', color:'#7a8899', fontWeight:600, marginTop:2 }}>Programadas</div>
          </div>
          <div style={{ textAlign:'center', padding:10, background:'#FFFBF5', borderRadius:8, border:'1px solid #E8D5C0' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:800, color:'#2D8A30' }}>{visitas.filter(v=>v.status==='checked_in').length}</div>
            <div style={{ fontSize:'.55rem', color:'#7a8899', fontWeight:600, marginTop:2 }}>Check-in hecho</div>
          </div>
          <div style={{ textAlign:'center', padding:10, background:'#FFFBF5', borderRadius:8, border:'1px solid #E8D5C0' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:800, color:'#1A78FF' }}>{visitas.filter(v=>v.status==='completed').length}</div>
            <div style={{ fontSize:'.55rem', color:'#7a8899', fontWeight:600, marginTop:2 }}>Completadas</div>
          </div>
        </div>
      </Card>

      <Card style={{ marginBottom:13, padding:0, overflow:'hidden' }}>
        <div style={{ padding:'16px 18px 10px', background:'linear-gradient(135deg,#1A2F4A,#2a4a6a)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:6 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F5A623" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontSize:'.82rem', fontWeight:800, color:'#fff' }}>Agenda del día</span>
              <span style={{ fontSize:'.55rem', fontWeight:700, padding:'3px 10px', borderRadius:12, background:'rgba(245,166,35,.15)', color:'#F5A623', border:'1px solid rgba(245,166,35,.3)' }}>{formatDateLong(today)}</span>
            </div>
          </div>
        </div>

        {loading && (
          <div style={{ padding:28, textAlign:'center', color:'#7a8899', fontSize:'.72rem' }}>Cargando agenda…</div>
        )}

        {empty && (
          <div style={{ padding:'32px 20px', textAlign:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'.95rem', fontWeight:800, color:NAVY, marginBottom:6, letterSpacing:'.04em', textTransform:'uppercase' }}>
              Hoy sin visitas programadas
            </div>
            <div style={{ fontSize:'.7rem', color:'#7a8899', lineHeight:1.5 }}>
              Añade visitas desde "Visitas y Check-in" o planifica la semana.
            </div>
          </div>
        )}

        {!loading && !empty && (
          <div style={{ padding:'16px 18px', position:'relative' }}>
            <div style={{ position:'absolute', left:54, top:16, bottom:16, width:3, background:'linear-gradient(to bottom,#2D8A30,#E87420,#1A78FF,#e8a010)', borderRadius:2, opacity:.3 }}/>
            {visitas.map((v, i) => {
              const color = VISIT_COLORS[i % VISIT_COLORS.length]
              const bg = `linear-gradient(135deg,${color}14,${color}06)`
              const border = `${color}40`
              return (
                <VisitCard
                  key={v.id}
                  num={i+1}
                  hour={formatHour(v.scheduled_at)}
                  color={color}
                  border={border}
                  bg={bg}
                  name={v.cliente_name || 'Cliente'}
                  loc={v.location || ''}
                  badge={v.status === 'checked_in' ? 'Check-in hecho' : v.status === 'completed' ? 'Completada' : 'Programada'}
                  amount=""
                  act={act}
                />
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

function VisitStatusBadge({ status }) {
  const meta = {
    scheduled: { type:'blue', label:'Programada' },
    checked_in: { type:'orange', label:'Check-in' },
    completed: { type:'ok', label:'Completada' },
    cancelled: { type:'red', label:'Cancelada' },
  }[status] || { type:'amber', label:status }
  return <Badge type={meta.type} text={meta.label}/>
}

function NuevaVisitaModal({ open, onClose, onCreate }) {
  const [clienteName, setClienteName] = useState('')
  const [location, setLocation] = useState('')
  const [when, setWhen] = useState(() => {
    const d = new Date(Date.now() + 24*3600e3)
    d.setMinutes(0); d.setSeconds(0); d.setMilliseconds(0)
    return d.toISOString().slice(0,16)
  })
  const [notes, setNotes] = useState('')
  const [err, setErr] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  if (!open) return null

  const submit = async () => {
    setErr(null)
    if (!clienteName.trim() || !when) { setErr('Rellena cliente y fecha/hora.'); return }
    setSubmitting(true)
    const { error } = await onCreate({
      cliente_name: clienteName.trim(),
      location: location.trim() || null,
      scheduled_at: new Date(when).toISOString(),
      notes: notes || null,
      status: 'scheduled',
    })
    setSubmitting(false)
    if (error) { setErr(error.message); return }
    onClose()
  }
  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,47,74,.6)', backdropFilter:'blur(4px)', zIndex:9000 }}/>
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9001, padding:'0 16px' }}>
        <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:480, boxShadow:'0 20px 60px rgba(26,47,74,.3)' }}>
          <div style={{ background:'linear-gradient(135deg,#1A2F4A,#2A4A6A)', borderRadius:'16px 16px 0 0', padding:'16px 22px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:900, color:'#fff', letterSpacing:'.04em', textTransform:'uppercase' }}>Nueva visita</div>
            <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,.12)', border:'none', color:'#fff', cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ padding:'18px 22px' }}>
            <Field label="Cliente"><input value={clienteName} onChange={e=>setClienteName(e.target.value)} placeholder="Panaderías Leopold" style={inputStyle()} /></Field>
            <Field label="Ubicación"><input value={location} onChange={e=>setLocation(e.target.value)} placeholder="Valencia centro" style={inputStyle()} /></Field>
            <Field label="Fecha y hora"><input type="datetime-local" value={when} onChange={e=>setWhen(e.target.value)} style={inputStyle()} /></Field>
            <Field label="Notas (opcional)"><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows="2" style={{...inputStyle(), resize:'vertical'}} /></Field>
            {err && <div style={{ color:'#c03030', fontSize:'.7rem', marginBottom:8, fontWeight:600 }}>{err}</div>}
            <div style={{ display:'flex', gap:8 }}>
              <button disabled={submitting} onClick={submit} style={{ flex:1, padding:'11px', background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, border:'none', borderRadius:8, color:'#fff', fontWeight:800, cursor:submitting?'not-allowed':'pointer', fontFamily:'Barlow Condensed', letterSpacing:'.1em', textTransform:'uppercase', fontSize:'.82rem' }}>{submitting?'Guardando…':'Agendar'}</button>
              <button disabled={submitting} onClick={onClose} style={{ padding:'11px 18px', background:'#F5F6F8', border:'1px solid #E8D5C0', borderRadius:8, color:NAVY, fontWeight:700, cursor:'pointer', fontSize:'.75rem' }}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function VisitasScreen({ act }) {
  const { profile } = useApp()
  const { visitas, loading, createVisita, checkIn, completeVisita } = useVisitas({ profile })
  const [open, setOpen] = useState(false)
  const [busyId, setBusyId] = useState(null)

  const proximaPendiente = useMemo(() => {
    const now = Date.now()
    return visitas
      .filter(v => v.status === 'scheduled')
      .map(v => ({ v, delta: new Date(v.scheduled_at).getTime() - now }))
      .sort((a,b) => Math.abs(a.delta) - Math.abs(b.delta))
      [0]?.v
  }, [visitas])

  const kpis = useMemo(() => {
    const mStart = new Date(); mStart.setDate(1); mStart.setHours(0,0,0,0)
    const mesISO = mStart.toISOString()
    const mes = visitas.filter(v => v.scheduled_at >= mesISO)
    const completadas = mes.filter(v => v.status === 'completed').length
    const ratio = mes.length > 0 ? Math.round((completadas / mes.length) * 100) : null
    return {
      mes: String(mes.length),
      ratio: ratio !== null ? `${ratio}%` : '—',
      clientes: new Set(mes.map(v => v.cliente_id || v.cliente_name)).size,
      pendientes: visitas.filter(v => v.status === 'scheduled' && new Date(v.scheduled_at) < new Date()).length,
    }
  }, [visitas])

  const doCheckIn = async (id) => {
    setBusyId(id)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        await checkIn(id, { lat: pos.coords.latitude, lng: pos.coords.longitude })
        setBusyId(null); act('toast', '✓ Check-in registrado con GPS')
      }, async () => {
        await checkIn(id)
        setBusyId(null); act('toast', '✓ Check-in registrado (sin GPS)')
      }, { timeout: 5000 })
    } else {
      await checkIn(id); setBusyId(null); act('toast', '✓ Check-in registrado')
    }
  }

  const doComplete = async (id) => {
    setBusyId(id)
    await completeVisita(id, { outcome: 'completada' })
    setBusyId(null); act('toast', '✓ Visita completada')
  }

  const historial = useMemo(() => visitas.slice().sort((a,b) => new Date(b.scheduled_at) - new Date(a.scheduled_at)), [visitas])

  return (
    <div className="animate-fadeIn">
      <PageHdr title="Visitas y Check-in" subtitle="Check-in con GPS y resultado en 1 toque" badge={`${kpis.mes} este mes`} />
      <SearchBar placeholder="Buscar cliente o visita..." />

      <div className="grid-4 mb14">
        <KPI val={kpis.mes} label="Visitas este mes" delta="→ programadas + hechas" up color={ACCENT}/>
        <KPI val={kpis.ratio} label="Ratio cierre" delta="completadas / totales" up color="#2D8A30"/>
        <KPI val={String(kpis.clientes)} label="Clientes visitados" delta="únicos en el mes" up color="#1A78FF"/>
        <KPI val={String(kpis.pendientes)} label="Atrasadas" delta={kpis.pendientes>0?'▼ Requieren atención':'todo al día'} color={kpis.pendientes>0?'#e8a010':'#2D8A30'}/>
      </div>

      {proximaPendiente ? (
        <Card style={{ marginBottom:13, border:'2px solid rgba(45,138,48,.3)', background:'linear-gradient(135deg,#f0faf0,#f8fff8)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12, flexWrap:'wrap', gap:6 }}>
            <div style={{ fontSize:'.6rem', fontWeight:700, color:'#7a8899', textTransform:'uppercase', letterSpacing:'.1em', display:'flex', alignItems:'center', gap:6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D8A30" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/></svg>
              Próxima visita · check-in con GPS
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4 }}>
              <div className="animate-dotPulse" style={{ width:6, height:6, borderRadius:'50%', background:'#2D8A30' }}/>
              <span style={{ fontSize:'.55rem', fontWeight:700, color:'#2D8A30' }}>GPS DISPONIBLE</span>
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:10, padding:14, border:'1px solid rgba(45,138,48,.2)' }}>
            <div style={{ fontSize:'.82rem', fontWeight:800, color:NAVY, marginBottom:4 }}>{proximaPendiente.cliente_name || 'Cliente'}</div>
            <div style={{ fontSize:'.62rem', color:'#7a8899', marginBottom:10 }}>{proximaPendiente.location || 'Sin ubicación'}</div>
            <div style={{ display:'flex', gap:6, marginBottom:10, flexWrap:'wrap' }}>
              <span style={{ fontSize:'.55rem', fontWeight:700, padding:'3px 8px', borderRadius:12, background:'rgba(232,116,32,.08)', color:ACCENT, border:'1px solid rgba(232,116,32,.15)' }}>Programada: {formatHour(proximaPendiente.scheduled_at)}</span>
            </div>
            <button disabled={busyId===proximaPendiente.id} onClick={()=>doCheckIn(proximaPendiente.id)} style={{ width:'100%', padding:12, fontSize:'.75rem', background:busyId===proximaPendiente.id?'#aaa':`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:'#fff', border:'none', borderRadius:8, cursor:busyId===proximaPendiente.id?'not-allowed':'pointer', fontFamily:'DM Sans', fontWeight:700 }}>
              {busyId===proximaPendiente.id ? 'Localizando GPS…' : '✓ Hacer check-in ahora'}
            </button>
          </div>
        </Card>
      ) : null}

      <Card style={{ marginBottom:13 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:10 }}>
          <CardTitle style={{ margin:0 }}>Todas las visitas</CardTitle>
          <button onClick={()=>setOpen(true)} style={{ padding:'8px 16px', background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:'.72rem', cursor:'pointer', fontFamily:'DM Sans' }}>+ Nueva visita</button>
        </div>

        {loading && <div style={{ padding:28, textAlign:'center', color:'#7a8899', fontSize:'.72rem' }}>Cargando visitas…</div>}

        {!loading && historial.length === 0 && (
          <div style={{ padding:'28px 20px', textAlign:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'.95rem', fontWeight:800, color:NAVY, marginBottom:6, letterSpacing:'.04em', textTransform:'uppercase' }}>Sin visitas registradas</div>
            <div style={{ fontSize:'.7rem', color:'#7a8899', lineHeight:1.5 }}>Agenda tu primera visita con el botón de arriba.</div>
          </div>
        )}

        {!loading && historial.length > 0 && (
          <ScrollTable>
            <Thead cols={['Fecha','Cliente','Ubicación','Estado','Acción']}/>
            <tbody>
              {historial.map(v => {
                const d = new Date(v.scheduled_at)
                const fecha = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')} ${formatHour(v.scheduled_at)}`
                const busy = busyId === v.id
                return (
                  <tr key={v.id} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{fecha}</td>
                    <td style={{ padding:'8px 10px', color:NAVY, fontWeight:600 }}>{v.cliente_name || '—'}</td>
                    <td style={{ padding:'8px 10px', color:'#7a8899', fontSize:'.6rem' }}>{v.location || '—'}</td>
                    <td style={{ padding:'8px 10px' }}><VisitStatusBadge status={v.status}/></td>
                    <td style={{ padding:'8px 10px' }}>
                      {v.status === 'scheduled' && <TblBtn type="orange" onClick={()=>doCheckIn(v.id)}>{busy?'…':'Check-in'}</TblBtn>}
                      {v.status === 'checked_in' && <TblBtn type="green" onClick={()=>doComplete(v.id)}>{busy?'…':'Completar'}</TblBtn>}
                      {(v.status === 'completed' || v.status === 'cancelled') && <TblBtn type="orange" onClick={()=>act('seguimiento', v.cliente_name)}>Ver</TblBtn>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </ScrollTable>
        )}
      </Card>

      <NuevaVisitaModal open={open} onClose={()=>setOpen(false)} onCreate={createVisita} />
    </div>
  )
}

/* ══ SCREEN 4: BÚSQUEDA IA ══ */
function BusquedaScreen({ act }) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState('idle')
  const RESULTS = [
    {fab:'Harinas Mediterráneo',prod:'Harina Panadera W-280',cert:'IFS 7.0 · BRC A+',match:96,precio:'0,89€/kg',color:ACCENT,bg:'#FFF8F0',border:'rgba(232,116,32,.2)',top:true},
    {fab:'Molinera Norte S.L.',prod:'Harina Fuerza Plus W-280',cert:'IFS 7.0',match:91,precio:'0,85€/kg',color:'#1A78FF',bg:'#EEF5FF',border:'#C4DEFF',top:false},
    {fab:'Cereales Alcarria',prod:'Harina Panificable W-260',cert:'BRC A',match:84,precio:'0,81€/kg',color:'#2D8A30',bg:'#F0FFF4',border:'#C6F6D5',top:false},
  ]
  const doSearch = (q) => { if (!q.trim()) return; setQuery(q); setState('loading'); setTimeout(()=>setState('results'), 1800) }

  const FAMILIAS = [
    {ico:'🌾',color:`linear-gradient(135deg,${ACCENT},#D06A1C)`,colorText:ACCENT,bg:'#FFF8F0',border:'rgba(232,116,32,.15)',nombre:'HARINAS Y SÉMOLAS',norma:'R.D. 677/2016 | Codex CXS 152-1985 | 8 tipologías',fichas:'487 fichas',tipos:[['Gran Fuerza','W > 300 | P > 12%'],['Fuerza','W 200-300 | P 10-12%'],['Media Fuerza','W 150-200'],['Floja','W < 100 | P 7-9%'],['Sémola Duro','Triticum durum'],['Integral','T > 130'],['Centeno','Secale cereale'],['Espelta','Triticum spelta']]},
    {ico:'🧈',color:'linear-gradient(135deg,#1A78FF,#378ADD)',colorText:'#1A78FF',bg:'#EEF5FF',border:'rgba(26,120,255,.15)',nombre:'GRASAS, ACEITES Y MARGARINAS',norma:'Codex CXS 32-1981 (Margarina) | 7 tipologías',fichas:'312 fichas',tipos:[['Mantequilla','≥ 82% MG | Laminar'],['Margarina Hojaldre','PF 40-44°C | ≥ 80% MG'],['Margarina Croissant','PF 36-40°C | Plástica'],['Manteca Vegetal','Palma/Coco | RSPO'],['Aceites','Girasol/Oliva/Colza'],['Grasa Fritura','Alto PF | Estabilidad'],['Desmoldeantes','Spray/Líquido']]},
    {ico:'🍫',color:'linear-gradient(135deg,#8B4513,#A0522D)',colorText:'#8B4513',bg:'#FBF5EF',border:'rgba(139,69,19,.15)',nombre:'CACAO, CHOCOLATE Y COBERTURAS',norma:'Codex CXS 87-1981 | R.D. 1055/2003 | 6 tipologías',fichas:'198 fichas',tipos:[['Cacao en Polvo','10-24% MG | pH 5-8'],['Cobertura Negra','≥ 45% cacao'],['Cobertura Leche','≥ 25% cacao'],['Cobertura Blanca','≥ 20% MC'],['Manteca Cacao','Deodorizada/Natural'],['Pasta/Licor Cacao','100% cacao']]},
    {ico:'🍬',color:'linear-gradient(135deg,#e8a010,#c98a00)',colorText:'#e8a010',bg:'#FFFDF5',border:'rgba(232,160,16,.15)',nombre:'AZÚCARES Y EDULCORANTES',norma:'Codex CXS 212-1999 | Reg. CE 1333/2008 | 8 tipologías',fichas:'156 fichas',tipos:[['Blanco Refinado','Sacarosa ≥ 99.7%'],['Glass / Lustre','Molido fino + almidón'],['Invertido','Glucosa+Fructosa'],['Glucosa','Líquida/Atomizada DE 38-42'],['Dextrosa','Monohidrato | Maíz'],['Isomalt','Azúcar artístico'],['Fructosa','Cristalina']]},
  ]

  const [openFam, setOpenFam] = useState(null)

  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:14 }}>
        <div>
          <h2 style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:NAVY }}>Búsqueda Inteligente IA</h2>
          <p style={{ fontSize:'.72rem', color:'#7a8899' }}>1.647 fichas · 23 fabricantes — taxonomía oficial Codex Alimentarius</p>
        </div>
        <span style={{ fontSize:'.5rem', fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase', padding:'4px 10px', borderRadius:12, background:`linear-gradient(135deg,${ACCENT},#F5A623)`, color:'#fff' }}>EXCLUSIVO COAXIONIA</span>
      </div>

      {/* Búsqueda */}
      <Card style={{ marginBottom:13, border:`2px solid rgba(232,116,32,.25)`, background:'linear-gradient(135deg,#FFFBF5,#FFF3E8)' }}>
        <CardTitle>Capa 1: Búsqueda natural IA <IaBadge /></CardTitle>
        <div style={{ fontSize:'.62rem', color:'#7a8899', marginBottom:10 }}>Habla o escribe lo que necesita tu cliente. La IA mapea automáticamente a familia, tipología y especificaciones técnicas.</div>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch(query)}
            placeholder="Ej: Mi cliente necesita una margarina para hojaldre que aguante -18°C sin palma..."
            style={{ flex:1, padding:'11px 16px', border:'1.5px solid #E8D5C0', borderRadius:10, fontSize:'.72rem', fontFamily:'DM Sans,sans-serif', background:'#fff', outline:'none' }}
            onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor='#E8D5C0'} />
          <div title="Disponible en Fase 3 · Voz IA" style={{ width:44, height:44, borderRadius:'50%', background:`linear-gradient(135deg,${ACCENT},#F5A623)`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'not-allowed', flexShrink:0, boxShadow:'0 2px 8px rgba(232,116,32,.3)', opacity:.5, pointerEvents:'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="#fff" strokeWidth="2"/></svg>
          </div>
          <button onClick={()=>doSearch(query)} style={{ padding:'11px 20px', borderRadius:10, border:'none', background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:'#fff', fontSize:'.72rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'DM Sans' }}>Buscar</button>
        </div>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <span style={{ fontSize:'.5rem', fontWeight:700, color:'#7a8899', paddingTop:4, marginRight:2 }}>EJEMPLOS:</span>
          {['Cacao alcalinizado 22% MG','Margarina hojaldre PF 42°C','Harina gran fuerza W-280','Mantequilla laminar 82%'].map(s=>(
            <span key={s} onClick={()=>doSearch(s)} style={{ padding:'4px 10px', borderRadius:20, fontSize:'.55rem', background:'rgba(232,116,32,.08)', color:ACCENT, border:'1px solid rgba(232,116,32,.2)', cursor:'pointer' }}>{s}</span>
          ))}
        </div>

        {state==='loading' && (
          <div style={{ textAlign:'center', padding:'20px 0' }}>
            <div className="animate-dotPulse" style={{ width:8, height:8, borderRadius:'50%', background:ACCENT, margin:'0 auto 8px' }}/>
            <div style={{ fontSize:'.65rem', color:'#7a8899' }}>IA buscando en 1.647 fichas técnicas...</div>
          </div>
        )}
        {state==='results' && (
          <div style={{ marginTop:14 }}>
            <div style={{ fontSize:'.62rem', color:'#7a8899', marginBottom:10 }}><strong style={{ color:NAVY }}>{RESULTS.length} resultados</strong> para "{query}"</div>
            {RESULTS.map((r,i)=>(
              <div key={i} onClick={()=>act('goto','fichas')} style={{ display:'flex', gap:12, padding:12, borderRadius:9, border:`1.5px solid ${r.border}`, background:r.bg, marginBottom:8, cursor:'pointer' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                    <span style={{ fontSize:'.75rem', fontWeight:800, color:NAVY }}>{r.prod}</span>
                    {r.top&&<span style={{ fontSize:'.45rem', fontWeight:800, padding:'2px 6px', borderRadius:10, background:ACCENT, color:'#fff' }}>TOP IA</span>}
                  </div>
                  <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:6 }}>{r.fab} · {r.cert}</div>
                  <div style={{ display:'flex', gap:6 }}>
                    <BtnSm onClick={e=>{e.stopPropagation();act('goto','cotizaciones')}}>Cotizar</BtnSm>
                    <BtnSm outline onClick={e=>{e.stopPropagation();act('goto','fichas')}}>Ficha</BtnSm>
                  </div>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.1rem', fontWeight:900, color:r.color }}>{r.precio}</div>
                  <div style={{ fontSize:'.55rem', color:'#7a8899', marginBottom:4 }}>Match {r.match}%</div>
                </div>
              </div>
            ))}
            <IABox text="<strong>Motor IA 3 capas:</strong> La IA entiende el lenguaje natural del sector y mapea a taxonomía oficial. Cruza catálogos de 23 fabricantes con nomenclaturas distintas." />
          </div>
        )}
      </Card>

      {/* Taxonomía */}
      <Card>
        <CardTitle><span style={{ display:'flex', alignItems:'center', gap:6 }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>Capa 2: Taxonomía por familias y tipologías</span></CardTitle>
        <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:12 }}>Clasificación basada en <strong>Codex Alimentarius FAO/OMS</strong>, R.D. 677/2016, CXS 87-1981 y normativa sectorial europea</div>
        {FAMILIAS.map((f,i)=>(
          <div key={i} style={{ marginBottom:8, border:`1.5px solid ${f.border}`, borderRadius:12, overflow:'hidden' }}>
            <div onClick={()=>setOpenFam(openFam===i?null:i)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 14px', background:f.bg, cursor:'pointer' }}>
              <div style={{ width:36, height:36, borderRadius:10, background:f.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><span style={{ fontSize:'.9rem' }}>{f.ico}</span></div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'.72rem', fontWeight:800, color:NAVY }}>{f.nombre}</div>
                <div style={{ fontSize:'.52rem', color:'#7a8899' }}>{f.norma}</div>
              </div>
              <span style={{ fontSize:'.55rem', fontWeight:700, padding:'3px 10px', borderRadius:12, background:`rgba(232,116,32,.1)`, color:ACCENT }}>{f.fichas}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#7a8899" strokeWidth="2" style={{ transform:openFam===i?'rotate(180deg)':'', transition:'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {openFam===i && (
              <div style={{ padding:'12px 14px', background:'#fff', borderTop:`1px solid ${f.border}` }}>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))', gap:6 }}>
                  {f.tipos.map(([nombre,spec])=>(
                    <div key={nombre} onClick={()=>doSearch(nombre)} style={{ padding:8, borderRadius:8, background:f.bg, border:`1px solid ${f.border}`, cursor:'pointer', textAlign:'center' }}>
                      <div style={{ fontSize:'.62rem', fontWeight:700, color:NAVY }}>{nombre}</div>
                      <div style={{ fontSize:'.48rem', color:'#7a8899' }}>{spec}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}

/* ══ SCREEN 5: FICHAS TÉCNICAS ══ */
function FichasScreen({ act }) {
  const [openFab, setOpenFab] = useState('harinasmed')
  const FABRICANTES = [
    { id:'harinasmed', ini:'HM', color:`linear-gradient(135deg,${ACCENT},#D06A1C)`, badgeType:'orange', nom:'Harinas Mediterráneo', loc:'Valencia · IFS 7.0 · BRC A+', total:'234 fichas',
      fichas:[['Harina Panadera W-280','REF-001','14/14 alérg.','IFS 7.0'],['Harina Ecológica T-110','REF-ECO-001','14/14 alérg.','Eco EU'],['Harina Gran Fuerza W-380','REF-002','14/14 alérg.','IFS 7.0'],['Sémola Trigo Duro','REF-SEM-001','14/14 alérg.','ISO 22000']] },
    { id:'grasasind', ini:'GI', color:'linear-gradient(135deg,#1A78FF,#378ADD)', badgeType:'blue', nom:'Grasas Industriales S.A.', loc:'Barcelona · IFS 7.0 · RSPO', total:'87 fichas',
      fichas:[['Margarina Profesional PF42','REF-GI-001','14/14 alérg.','RSPO'],['Margarina -18°C Sin Palma','REF-GI-002','14/14 alérg.','Sin palma']] },
    { id:'lesaffre', ini:'LI', color:'linear-gradient(135deg,#2D8A30,#1B6B1E)', badgeType:'ok', nom:'Lesaffre Ibérica', loc:'Madrid · ISO 22000 · FSSC 22000', total:'45 fichas',
      fichas:[['Levadura Fresca LV-Pure','REF-LV-001','14/14 alérg.','Sin gluten']] },
    { id:'otros23', ini:'+19', color:'linear-gradient(135deg,#9B59B6,#7D3C98)', badgeType:'', nom:'Otros 20 fabricantes', loc:'Molinera Norte, Congelados Navarra, MargaPro Europe y 17 más', total:'1.281 fichas', fichas:[] },
  ]
  const DOCS = [
    {ref:'RGSEAA 26.00086/A',tipo:'Registro Sanitario · 18/02/2010',st:'Vigente',stColor:'#2D8A30'},
    {ref:'RGSEAA 31.00015/A',tipo:'Registro Sanitario · 19/02/2010',st:'Vigente',stColor:'#2D8A30'},
    {ref:'RGSEAA 40.20102/A',tipo:'Adaptación Administrativa · 22/06/2015',st:'Vigente',stColor:'#2D8A30'},
    {ref:'RGSEAA 20.045203/A',tipo:'Notificación Inscripción · 08/09/2014',st:'Vigente',stColor:'#2D8A30'},
    {ref:'Acta Inspección APPCC',tipo:'Control Oficial AESAN · 25/02/2026',st:'Conforme',stColor:'#1A78FF'},
  ]
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Biblioteca de Fichas Técnicas" subtitle="1.647 fichas de 23 fabricantes — extracción, validación y traducción automática por IA" />
      <div className="grid-4 mb14">
        <KPI val="1.647" label="Fichas disponibles" delta="▲ +156 este trimestre" up color={ACCENT}/>
        <KPI val="23" label="Fabricantes" delta="▲ Todos certificados" up color="#2D8A30"/>
        <KPI val="5" label="Idiomas" delta="▲ ES CA PT EN FR" up color="#1A78FF"/>
        <KPI val="99.2%" label="Precisión IA" delta="▲ Máximo histórico" up color="#e8a010"/>
      </div>
      <Card style={{ marginBottom:13 }}>
        <SearchBar placeholder="Buscar por producto, fabricante, alérgeno, certificación..." />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {[['Todos los fabricantes','todas'],['Harinas Mediterráneo','harinasmed'],['Grasas Industriales','grasasind'],['Lesaffre Ibérica','lesaffre'],['+19 más','otros23']].map(([label,id])=>(
            <span key={id} onClick={()=>setOpenFab(id)} style={{ padding:'4px 12px', borderRadius:20, fontSize:'.6rem', fontWeight:600, cursor:'pointer', background:openFab===id?ACCENT:'rgba(232,116,32,.08)', color:openFab===id?'#fff':ACCENT, border:`1px solid ${openFab===id?ACCENT:'rgba(232,116,32,.2)'}`, transition:'all .15s' }}>{label}</span>
          ))}
        </div>
      </Card>
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Documentos Oficiales — Harinas Mediterráneo <IaBadge /></CardTitle>
        <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:10 }}>RGSEAA, actas de inspección y certificaciones verificadas por FoodBridge IA</div>
        {DOCS.map((d,i)=>(
          <div key={i} onClick={()=>act('documento',d.ref)} style={{ display:'flex', alignItems:'center', gap:10, padding:10, borderRadius:8, background:'#FAFBFC', border:'1px solid #F1F5F9', marginBottom:6, cursor:'pointer', transition:'background .12s' }} onMouseEnter={e=>e.currentTarget.style.background='#F0F7FF'} onMouseLeave={e=>e.currentTarget.style.background='#FAFBFC'}>
            <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,#1A2F4A,#2A4A6A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'.7rem', fontWeight:700, color:NAVY, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.ref}</div>
              <div style={{ fontSize:'.55rem', color:'#7a8899' }}>{d.tipo}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              <span style={{ fontSize:'.5rem', padding:'3px 7px', borderRadius:10, background:`${d.stColor}22`, color:d.stColor, fontWeight:700, border:`1px solid ${d.stColor}44` }}>{d.st}</span>
              <TblBtn type="orange" onClick={e=>{e.stopPropagation();act('ver_pdf',d.ref)}}>Ver</TblBtn>
              <TblBtn type="green" onClick={e=>{e.stopPropagation();act('exportar',d.ref)}}>PDF</TblBtn>
            </div>
          </div>
        ))}
      </Card>
      <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
        {FABRICANTES.map(f=>(
          <Card key={f.id} style={{ padding:0, overflow:'hidden' }}>
            <div onClick={()=>setOpenFab(openFab===f.id?null:f.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 16px', cursor:'pointer', background:openFab===f.id?'rgba(232,116,32,.04)':'transparent' }}>
              <div style={{ width:32, height:32, borderRadius:8, background:f.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.6rem', fontWeight:900, color:'#fff', flexShrink:0 }}>{f.ini}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'.72rem', fontWeight:700, color:NAVY }}>{f.nom}</div>
                <div style={{ fontSize:'.55rem', color:'#7a8899' }}>{f.loc}</div>
              </div>
              <span style={{ fontSize:'.55rem', fontWeight:700, padding:'2px 8px', borderRadius:12, background:'rgba(232,116,32,.1)', color:ACCENT }}>{f.total}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7a8899" strokeWidth="2" style={{ transform:openFab===f.id?'rotate(180deg)':'', transition:'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {openFab===f.id && (
              <div style={{ borderTop:'1px solid #F0E4D6' }}>
                {f.fichas.length>0 ? f.fichas.map(([prod,ref,alerg,cert])=>(
                  <div key={ref} onClick={()=>act('goto','fichas')} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 16px', borderBottom:'1px solid #F8FAFC', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'.72rem', fontWeight:700, color:NAVY }}>{prod}</div>
                      <div style={{ fontSize:'.55rem', color:'#7a8899' }}>{ref}</div>
                    </div>
                    <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                      {[alerg,cert].map(b=><span key={b} style={{ fontSize:'.48rem', padding:'2px 6px', borderRadius:10, background:'#EBF5EF', color:'#2D8A30', border:'1px solid #C6F6D5', fontWeight:700 }}>{b}</span>)}
                    </div>
                    <div style={{ display:'flex', gap:4 }}>
                      <TblBtn type="orange" onClick={e=>{e.stopPropagation();act('goto','fichas')}}>Ver</TblBtn>
                      <TblBtn type="green" onClick={e=>{e.stopPropagation();act('exportar',prod)}}>PDF</TblBtn>
                    </div>
                  </div>
                )) : (
                  <div style={{ padding:'12px 16px', fontSize:'.65rem', color:'#7a8899', textAlign:'center' }}>Usa el buscador para encontrar fichas de cualquiera de los 23 fabricantes</div>
                )}
                {f.fichas.length>0 && <div onClick={()=>act('ver_todas',f.nom)} style={{ padding:'8px 16px', fontSize:'.6rem', color:'#7a8899', textAlign:'center', cursor:'pointer' }}>+ {parseInt(f.total)-f.fichas.length} fichas más — Ver todas →</div>}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

/* ══ SCREEN 6: EQUIVALENCIAS ══ */
function EquivalenciasScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:14 }}>
        <div>
          <h2 style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:NAVY }}>Equivalencias y Comparador</h2>
          <p style={{ fontSize:'.72rem', color:'#7a8899' }}>Compara precios y equivalencias entre proveedores — la IA encuentra el mejor match</p>
        </div>
        <span style={{ fontSize:'.5rem', fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase', padding:'4px 10px', borderRadius:12, background:`linear-gradient(135deg,${ACCENT},#F5A623)`, color:'#fff' }}>EXCLUSIVO COAXIONIA</span>
      </div>
      <SearchBar placeholder="Buscar producto o equivalencia..." />
      <div className="grid-4 mb14">
        <KPI val="4" label="Proveedores activos" delta="→ PT + ES" color={ACCENT}/>
        <KPI val="23%" label="Ahorro medio" delta="▲ vs proveedor único" up color="#2D8A30"/>
        <KPI val="142" label="Productos cruzados" delta="▲ +38 este mes" up color="#1A78FF"/>
        <KPI val="89%" label="Match IA precisión" delta="▲ Auto-equivalencias" up color="#e8a010"/>
      </div>
      <Card style={{ marginBottom:13, border:`2px solid rgba(232,116,32,.3)`, background:'linear-gradient(135deg,#FFFBF5,#FFF3E8)' }}>
        <CardTitle>Comparador de precios multi-proveedor <IaBadge /></CardTitle>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.6rem', minWidth:560 }}>
            <thead><tr style={{ background:'#F8FAFC' }}>
              {['Producto','Leopoldo Romes','Wifredo','Mundo Pastel','Ovomafre','Ahorro'].map(h=><th key={h} style={{ padding:8, textAlign:h==='Producto'?'left':'center', borderBottom:'2px solid #E2E8F0', color:'#64748B', fontSize:'.58rem' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {[['Azúcar blanco 25kg','0,82€/kg ★','0,89€/kg','0,94€/kg','—','-12,8%'],['Harina T-45 repostera','0,68€/kg ★','0,75€/kg','—','—','-9,3%'],['Tartaletas mini x200','—','0,045€/ud ★','0,052€/ud','—','-13,5%'],['Yema pastelera UHT','3,20€/kg','2,85€/kg ★','—','3,10€/kg','-10,9%'],['Fios D\'ovos 12kg','—','—','—','4,20€/kg ★','Único'],['Vol au Vent grande','—','0,18€/ud','0,15€/ud ★','—','-16,7%']].map(([prod,...cols],i)=>(
                <tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                  <td style={{ padding:8, fontWeight:600, color:NAVY }}>{prod}</td>
                  {cols.slice(0,4).map((v,j)=><td key={j} style={{ padding:8, textAlign:'center', fontWeight:v.includes('★')?700:400, color:v.includes('★')?'#2D8A30':v==='—'?'#ccc':NAVY }}>{v.replace(' ★','')}{v.includes('★')&&' ⭐'}</td>)}
                  <td style={{ padding:8, textAlign:'center', fontWeight:700, color:cols[4]==='Único'?'#1A78FF':'#2D8A30' }}>{cols[4]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <IABox text="<strong>IA Equivalencias:</strong> Cruzados 142 productos de 4 proveedores automáticamente. El ahorro medio al elegir mejor proveedor por producto es del <strong>23%</strong>." />
      </Card>
      <div className="grid-2 mb14">
        <div style={{ background:'linear-gradient(135deg,#f0f9f0,#fff)', borderRadius:11, padding:14, border:'1.5px solid rgba(45,138,48,.2)' }}>
          <div style={{ fontSize:'.6rem', fontWeight:800, color:'#2D8A30', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>EQUIVALENCIA ENCONTRADA</div>
          <div style={{ fontSize:'.72rem', fontWeight:700, color:NAVY, marginBottom:4 }}>Doce de Chila (Ovomafre) = Dulce de Cidra (ES)</div>
          <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:10 }}>Producto portugués con equivalente español — ideal para clientes que no conocen la versión PT</div>
          <BtnSm onClick={()=>act('equiv','Doce de Chila')}>Ver comparativa completa</BtnSm>
        </div>
        <div style={{ background:'linear-gradient(135deg,#f0f4ff,#fff)', borderRadius:11, padding:14, border:'1.5px solid rgba(26,120,255,.2)' }}>
          <div style={{ fontSize:'.6rem', fontWeight:800, color:'#1A78FF', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>SUGERENCIA IA</div>
          <div style={{ fontSize:'.72rem', fontWeight:700, color:NAVY, marginBottom:4 }}>Massa D'ovo (Ovomafre) sin equivalente ES</div>
          <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:10 }}>Producto exclusivo portugués — oportunidad de nicho para pastelerías gourmet</div>
          <button onClick={()=>act('sugerir','Massa D\'ovo')} style={{ padding:'6px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:'.62rem', fontWeight:700, background:'#E8F0FE', color:'#1A78FF', fontFamily:'DM Sans' }}>Sugerir a clientes</button>
        </div>
      </div>
    </div>
  )
}

/* ══ SCREEN 7: TARIFAS IA ══ */
function TarifasScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Tarifas IA" subtitle="Precios actualizados automáticamente según mercado de materias primas — IA detecta cuándo actualizar" />
      <SearchBar placeholder="Buscar producto o tarifa..." />
      <div className="grid-4 mb14">
        <KPI val="6" label="Tarifas activas" delta="→ Actualizadas Q1" color={ACCENT}/>
        <KPI val="18%" label="Margen medio" delta="▲ Objetivo: 15-22%" up color="#2D8A30"/>
        <KPI val="2" label="Por actualizar" delta="▼ IA detectó variación" color="#e03030"/>
        <KPI val="12 min" label="vs 3 días manual" delta="▲ con IA" up color="#1A78FF"/>
      </div>
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Tabla de tarifas vigentes <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Producto','Ref.','Precio base','Margen IA','Precio venta','Var. mercado','Estado']}/>
          <tbody>
            {[['Harina Panadera W-280','REF-HM-001','0,72€/kg','+24%','0,89€/kg','▲ +1,2%','ok:Vigente'],['Harina Gran Fuerza W-380','REF-HM-002','0,81€/kg','+22%','0,99€/kg','→ 0%','ok:Vigente'],['Harina Ecológica T-110','REF-ECO-001','1,04€/kg','+28%','1,33€/kg','▲ +3,8%','orange:Revisar'],['Sémola Trigo Duro','REF-SEM-001','0,68€/kg','+19%','0,81€/kg','▼ -0,8%','blue:Propuesta'],['Levadura LV-Pure','REF-LV-001','2,10€/kg','+21%','2,54€/kg','→ +0,3%','ok:Vigente'],['Margarina PF42','REF-GI-001','2,48€/kg','+18%','2,93€/kg','▼ -2,1%','orange:Revisar']].map(([prod,ref,base,mrg,pvp,var_,st],i)=>{const[tt,tv]=st.split(':');const varColor=var_.includes('▲')?'#2D8A30':var_.includes('▼')?'#e03030':'#e8a010';return(
              <tr key={i} style={{ borderBottom:'1px solid #F0E4D6', background:tt==='orange'?'#FFF8F0':'' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=tt==='orange'?'#FFF8F0':''}>
                <td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{prod}</td>
                <td style={{ padding:'8px 10px', color:'#7a8899', fontSize:'.62rem' }}>{ref}</td>
                <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{base}</td>
                <td style={{ padding:'8px 10px', fontWeight:700, color:'#2D8A30' }}>{mrg}</td>
                <td style={{ padding:'8px 10px', fontWeight:700, color:ACCENT }}>{pvp}</td>
                <td style={{ padding:'8px 10px', fontWeight:700, color:varColor }}>{var_}</td>
                <td style={{ padding:'8px 10px' }}><Badge type={tt} text={tv}/></td>
              </tr>
            )})}
          </tbody>
        </ScrollTable>
        <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
          <BtnSm onClick={()=>act('aplicar','Propuestas IA aprobadas')}>Aplicar propuestas IA</BtnSm>
          <BtnSm outline onClick={()=>act('exportar','Tarifa PDF')}>Exportar tarifa PDF</BtnSm>
          <BtnSm outline onClick={()=>act('enviar','Tarifa a clientes')}>Enviar a clientes</BtnSm>
        </div>
      </Card>
      <div className="grid-2 mb14">
        <div style={{ padding:14, borderRadius:11, background:'linear-gradient(135deg,rgba(232,116,32,.08),rgba(232,116,32,.03))', border:'1px solid rgba(232,116,32,.2)' }}>
          <div style={{ fontSize:'.6rem', fontWeight:800, color:ACCENT, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8 }}>Harina Ecológica T-110 — Actualización sugerida</div>
          <div style={{ display:'flex', gap:10, marginBottom:10 }}>
            <div style={{ flex:1, textAlign:'center', padding:10, borderRadius:8, background:'#fff', border:'1px solid rgba(232,116,32,.15)' }}>
              <div style={{ fontSize:'.5rem', color:'#7a8899', marginBottom:2 }}>PRECIO ACTUAL</div>
              <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:900, color:NAVY }}>1,33€/kg</div>
            </div>
            <div style={{ display:'flex', alignItems:'center' }}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
            <div style={{ flex:1, textAlign:'center', padding:10, borderRadius:8, background:'rgba(45,138,48,.1)', border:'1px solid rgba(45,138,48,.2)' }}>
              <div style={{ fontSize:'.5rem', color:'#2D8A30', marginBottom:2 }}>PRECIO PROPUESTO</div>
              <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:900, color:'#2D8A30' }}>1,38€/kg</div>
            </div>
          </div>
          <div style={{ fontSize:'.62rem', color:'#3a4a5a', lineHeight:1.7, marginBottom:8 }}><strong>Razón:</strong> Cotización trigo BIO en MATIF +3,8% desde tarifa anterior. Margen actual comprimido al 24,8% vs objetivo 28%.</div>
          <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:8 }}>Impacto en clientes: Leopold (+8€/pedido). Probabilidad aceptación IA: <strong style={{ color:'#2D8A30' }}>94%</strong></div>
          <div style={{ display:'flex', gap:6 }}>
            <BtnSm onClick={()=>act('aprobar','Tarifa T-110')}>Aprobar y notificar</BtnSm>
            <BtnSm outline onClick={()=>act('revisar','Tarifa T-110')}>Revisar</BtnSm>
          </div>
        </div>
        <div style={{ padding:14, borderRadius:11, background:'linear-gradient(135deg,rgba(224,48,48,.06),rgba(224,48,48,.02))', border:'1px solid rgba(224,48,48,.15)' }}>
          <div style={{ fontSize:'.6rem', fontWeight:800, color:'#e03030', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:8 }}>Margarina PF42 — Precio de mercado bajó</div>
          <div style={{ display:'flex', gap:10, marginBottom:8 }}>
            <div style={{ flex:1, textAlign:'center', padding:8, borderRadius:8, background:'#fff', border:'1px solid #FEE2E2' }}>
              <div style={{ fontSize:'.5rem', color:'#7a8899', marginBottom:2 }}>PRECIO ACTUAL</div>
              <div style={{ fontFamily:'Barlow Condensed', fontSize:'.95rem', fontWeight:900, color:'#e03030' }}>2,93€/kg</div>
            </div>
            <div style={{ display:'flex', alignItems:'center' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#e03030" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div>
            <div style={{ flex:1, textAlign:'center', padding:8, borderRadius:8, background:'#fff', border:'1px solid rgba(232,116,32,.15)' }}>
              <div style={{ fontSize:'.5rem', color:'#7a8899', marginBottom:2 }}>PROPUESTO</div>
              <div style={{ fontFamily:'Barlow Condensed', fontSize:'.95rem', fontWeight:900, color:ACCENT }}>2,87€/kg</div>
            </div>
          </div>
          <div style={{ fontSize:'.62rem', color:'#3a4a5a' }}><strong>Razón:</strong> Precio aceite de colza -2,1%. IA sugiere trasladar reducción para ganar competitividad. Margen se mantiene en 18%.</div>
        </div>
      </div>
      <Card>
        <CardTitle>Histórico de actualizaciones <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Fecha','Productos','Variación','Motivo IA','Aplicado por','Estado']}/>
          <tbody>
            {[['15/01/2026','4 productos','+2,8%','Trigo MATIF +4,1% · Energía +1,8%','José Luis M.','ok:Aplicado'],['03/10/2025','6 productos','+3,2%','IPC alimentario Q3 +2,9%','José Luis M.','ok:Aplicado'],['17/06/2025','2 productos','-1,4%','Baja precio aceite palma RSPO','Ana García','ok:Aplicado'],['28/01/2025','5 productos','+4,1%','Crisis gas · Energía industrial +8%','José Luis M.','ok:Aplicado']].map(([f,p,v,m,a,st],i)=>{const[tt,tv]=st.split(':');return(
              <tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }}><td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{f}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{p}</td><td style={{ padding:'8px 10px', fontWeight:700, color:parseFloat(v)>0?'#2D8A30':'#e03030' }}>{v}</td><td style={{ padding:'8px 10px', fontSize:'.62rem', color:'#3a4a5a' }}>{m}</td><td style={{ padding:'8px 10px', color:'#7a8899' }}>{a}</td><td style={{ padding:'8px 10px' }}><Badge type={tt} text={tv}/></td></tr>
            )})}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>Diferencial FoodBridge IA:</strong> Antes, actualizar una tarifa requería 3 días. Ahora la IA lo hace en <strong>12 minutos</strong>, con notificación automática personalizada a cada cliente." />
      </Card>
    </div>
  )
}

/* ══ SCREEN 8: COTIZACIONES IA ══ */
const COT_STATUS_META = {
  draft:    { type:'amber', label:'Borrador' },
  sent:     { type:'blue',  label:'Enviada'  },
  accepted: { type:'ok',    label:'Aceptada' },
  rejected: { type:'red',   label:'Rechazada'},
  expired:  { type:'red',   label:'Expirada' },
}

function NuevaCotModal({ open, onClose, profile, products, onCreate }) {
  const [clienteName, setClienteName] = useState('')
  const [productId, setProductId] = useState('')
  const [productName, setProductName] = useState('')
  const [quantity, setQuantity] = useState(1000)
  const [unitPrice, setUnitPrice] = useState(1.00)
  const [marginPct, setMarginPct] = useState(18)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [err, setErr] = useState(null)
  if (!open) return null

  const pickProduct = (id) => {
    setProductId(id)
    const p = products.find(x => x.id === id)
    if (p) { setProductName(p.name); setUnitPrice(Number(p.price_current)) }
  }

  const submit = async () => {
    setErr(null)
    if (!clienteName.trim() || !productName.trim() || !quantity || !unitPrice) {
      setErr('Rellena cliente, producto, cantidad y precio.')
      return
    }
    setSubmitting(true)
    const year = new Date().getFullYear()
    const suffix = Math.floor(Math.random() * 90000 + 10000)
    const ref = `COT-${year}-${suffix}`
    const p = products.find(x => x.id === productId)
    const { error } = await onCreate({
      ref,
      cliente_name: clienteName.trim(),
      product_id: productId || null,
      product_name: productName.trim(),
      fabricante_id: p?.fabricante_id || null,
      quantity: Number(quantity),
      unit: p?.unit || 'kg',
      unit_price: Number(unitPrice),
      margin_pct: Number(marginPct),
      notes: notes || null,
      status: 'draft',
    })
    setSubmitting(false)
    if (error) { setErr(error.message); return }
    onClose()
  }

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,47,74,.6)', backdropFilter:'blur(4px)', zIndex:9000 }}/>
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9001, padding:'0 16px' }}>
        <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(26,47,74,.3)', animation:'modalIn .25s ease both' }}>
          <div style={{ background:'linear-gradient(135deg,#1A2F4A,#2A4A6A)', borderRadius:'16px 16px 0 0', padding:'16px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:900, color:'#fff', letterSpacing:'.04em', textTransform:'uppercase' }}>Nueva cotización</div>
            <button onClick={onClose} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(255,255,255,.12)', border:'none', color:'#fff', cursor:'pointer' }}>✕</button>
          </div>
          <div style={{ padding:'18px 22px' }}>
            <Field label="Cliente (nombre comercial)"><input value={clienteName} onChange={e=>setClienteName(e.target.value)} placeholder="Panaderías Leopold" style={inputStyle()} /></Field>
            {products.length > 0 ? (
              <Field label="Producto del catálogo">
                <select value={productId} onChange={e=>pickProduct(e.target.value)} style={inputStyle()}>
                  <option value="">— Selecciona —</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} · {p.price_current}€/{p.unit}</option>)}
                </select>
              </Field>
            ) : null}
            <Field label="Nombre del producto"><input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="Harina W-280" style={inputStyle()} /></Field>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8 }}>
              <Field label="Cantidad"><input type="number" min="1" value={quantity} onChange={e=>setQuantity(e.target.value)} style={inputStyle()} /></Field>
              <Field label="Precio unit. (€)"><input type="number" step="0.01" value={unitPrice} onChange={e=>setUnitPrice(e.target.value)} style={inputStyle()} /></Field>
              <Field label="Margen %"><input type="number" step="0.1" value={marginPct} onChange={e=>setMarginPct(e.target.value)} style={inputStyle()} /></Field>
            </div>
            <Field label="Notas (opcional)"><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows="2" style={{...inputStyle(), resize:'vertical'}} /></Field>
            {err && <div style={{ color:'#c03030', fontSize:'.7rem', marginBottom:8, fontWeight:600 }}>{err}</div>}
            <div style={{ display:'flex', gap:8, marginTop:6 }}>
              <button disabled={submitting} onClick={submit} style={{ flex:1, padding:'11px', background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, border:'none', borderRadius:8, color:'#fff', fontWeight:800, cursor:submitting?'not-allowed':'pointer', fontFamily:'Barlow Condensed', letterSpacing:'.1em', textTransform:'uppercase', fontSize:'.82rem' }}>{submitting?'Creando…':'Crear borrador'}</button>
              <button disabled={submitting} onClick={onClose} style={{ padding:'11px 18px', background:'#F5F6F8', border:'1px solid #E8D5C0', borderRadius:8, color:NAVY, fontWeight:700, cursor:'pointer', fontSize:'.75rem' }}>Cancelar</button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ fontSize:'.58rem', fontWeight:700, color:'#8A9BB0', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:4 }}>{label}</div>
      {children}
    </div>
  )
}
function inputStyle() {
  return { width:'100%', padding:'9px 11px', background:'#FFF8F0', border:'1.5px solid #E8D5C0', borderRadius:6, fontSize:'.78rem', color:NAVY, fontFamily:'DM Sans', outline:'none', boxSizing:'border-box' }
}

function CotizacionesScreen({ act }) {
  const { profile } = useApp()
  const { cotizaciones, loading, createCotizacion, sendCotizacion } = useCotizaciones({ profile })
  const { products } = useProducts({ profile, onlyActive: true })
  const [open, setOpen] = useState(false)

  const kpis = useMemo(() => {
    const q1Start = new Date(new Date().getFullYear(), 0, 1).toISOString()
    const q1 = cotizaciones.filter(c => c.created_at >= q1Start)
    const aceptadas = q1.filter(c => c.status === 'accepted').length
    const enviadas = q1.filter(c => ['sent','accepted','rejected'].includes(c.status)).length
    const conv = enviadas > 0 ? Math.round((aceptadas / enviadas) * 100) : null
    const volumen = q1.reduce((s,c) => s + (Number(c.total_price) || 0), 0)
    const margenes = q1.filter(c => c.margin_pct != null).map(c => Number(c.margin_pct))
    const margenMedio = margenes.length ? (margenes.reduce((a,b)=>a+b,0)/margenes.length).toFixed(1) : '—'
    return {
      total: String(q1.length),
      conv: conv !== null ? `${conv}%` : '—',
      volumen: volumen > 0 ? `${Math.round(volumen/1000)}k€` : '0€',
      margen: margenMedio !== '—' ? `${margenMedio}%` : '—',
    }
  }, [cotizaciones])

  const empty = !loading && cotizaciones.length === 0

  return (
    <div className="animate-fadeIn">
      <PageHdr title="Cotizaciones" subtitle="Crea, envía y sigue cotizaciones con cálculo de margen automático" />
      <SearchBar placeholder="Buscar cotización o cliente..." />
      <div className="grid-4 mb14">
        <KPI val={kpis.total} label="Cotizaciones este año" delta="→ Q1 + Q2" color={ACCENT}/>
        <KPI val={kpis.conv} label="Tasa conversión" delta="aceptadas / enviadas" up color="#2D8A30"/>
        <KPI val={kpis.volumen} label="Volumen cotizado" delta={`Margen medio ${kpis.margen}`} up color="#1A78FF"/>
        <KPI val={String(cotizaciones.filter(c=>c.status==='sent').length)} label="Pendientes respuesta" delta="estado 'enviada'" color="#e8a010"/>
      </div>

      <IaBoxLive
        context="comercial_cotizaciones"
        data={{
          total: cotizaciones.length,
          conversion: kpis.conv,
          volumen: kpis.volumen,
          margen_medio: kpis.margen,
          status_counts: cotizaciones.reduce((a,c)=>{ a[c.status]=(a[c.status]||0)+1; return a }, {}),
        }}
        style={{ marginBottom:14 }}
      />
      <Card>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8, marginBottom:10 }}>
          <CardTitle style={{ margin:0 }}>Cotizaciones recientes <IaBadge /></CardTitle>
          <button onClick={()=>setOpen(true)} style={{ padding:'8px 16px', background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:'.72rem', cursor:'pointer', fontFamily:'DM Sans' }}>
            + Nueva cotización
          </button>
        </div>

        {loading && (
          <div style={{ padding:28, textAlign:'center', color:'#7a8899', fontSize:'.72rem' }}>Cargando cotizaciones…</div>
        )}

        {empty && (
          <div style={{ padding:'32px 20px', textAlign:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:800, color:NAVY, marginBottom:6, letterSpacing:'.04em', textTransform:'uppercase' }}>
              Aún no has creado cotizaciones
            </div>
            <div style={{ fontSize:'.72rem', color:'#7a8899', lineHeight:1.5, marginBottom:12 }}>
              Crea tu primera cotización desde el botón arriba. Calcula margen y precio total automáticamente.
            </div>
          </div>
        )}

        {!loading && !empty && (
          <ScrollTable>
            <Thead cols={['Ref.','Cliente','Producto','Importe','Margen','Estado','Acción']}/>
            <tbody>
              {cotizaciones.map(c => {
                const meta = COT_STATUS_META[c.status] || { type:'amber', label:c.status }
                const imp = c.total_price != null ? `${Number(c.total_price).toLocaleString('es-ES', { minimumFractionDigits:2, maximumFractionDigits:2 })}€` : '—'
                const mrg = c.margin_pct != null ? `${Number(c.margin_pct).toFixed(1)}%` : '—'
                const canSend = c.status === 'draft'
                return (
                  <tr key={c.id} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:'8px 10px', fontWeight:700, color:ACCENT }}>{c.ref}</td>
                    <td style={{ padding:'8px 10px', color:NAVY }}>{c.cliente_name || '—'}</td>
                    <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{c.product_name || '—'} ({Number(c.quantity).toLocaleString('es-ES')}{c.unit})</td>
                    <td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{imp}</td>
                    <td style={{ padding:'8px 10px', fontWeight:700, color:'#2D8A30' }}>{mrg}</td>
                    <td style={{ padding:'8px 10px' }}><Badge type={meta.type} text={meta.label}/></td>
                    <td style={{ padding:'8px 10px' }}>
                      {canSend ? (
                        <TblBtn type="orange" onClick={async ()=>{ await sendCotizacion(c.id); act('toast','Cotización marcada como enviada') }}>Enviar</TblBtn>
                      ) : (
                        <TblBtn type="orange" onClick={()=>act('ver',c.ref)}>Ver</TblBtn>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </ScrollTable>
        )}
      </Card>

      <NuevaCotModal
        open={open}
        onClose={()=>setOpen(false)}
        profile={profile}
        products={products}
        onCreate={createCotizacion}
      />
    </div>
  )
}

/* ══ SCREEN 9: PEDIDOS EN CURSO ══ */
function pedidoStatusMeta(status, delayed) {
  if (delayed) return { type:'red', label:'Incidencia', btnType:'red', btnLabel:'Gestionar', color:'#e03030' }
  if (status === 'in_transit') return { type:'amber', label:'En tránsito', btnType:'orange', btnLabel:'Tracking', color:'#e8a010' }
  if (status === 'confirmed') return { type:'ok', label:'Confirmado', btnType:'orange', btnLabel:'Tracking', color:'#2D8A30' }
  if (status === 'placed') return { type:'blue', label:'Pendiente', btnType:'orange', btnLabel:'Seguir', color:'#1A78FF' }
  if (status === 'delivered') return { type:'ok', label:'Entregado', btnType:'green', btnLabel:'Ver', color:'#2D8A30' }
  if (status === 'cancelled') return { type:'red', label:'Cancelado', btnType:'red', btnLabel:'Ver', color:'#e03030' }
  return { type:'amber', label:status, btnType:'orange', btnLabel:'Ver', color:'#e8a010' }
}

function isPedidoDelayed(p) {
  if (!p.expected_date) return false
  if (p.status === 'delivered' || p.status === 'cancelled') return false
  return new Date(p.expected_date) < new Date()
}

function formatEta(p) {
  if (isPedidoDelayed(p)) {
    const h = Math.round((Date.now() - new Date(p.expected_date).getTime()) / 3600000)
    return `RETRASADO ${h}h`
  }
  if (!p.expected_date) return '—'
  const d = new Date(p.expected_date)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`
}

function productsSummary(lines) {
  if (!lines?.length) return '—'
  const first = lines[0]
  const extra = lines.length > 1 ? ` + ${lines.length - 1}` : ''
  const qty = Number(first.quantity).toLocaleString('es-ES')
  return `${first.product_name} (${qty} ${first.unit || 'kg'})${extra}`
}

function PedidosScreen({ act }) {
  const { profile } = useApp()
  const { pedidos, loading } = usePedidos({ profile })
  const cotMap = useCotizacionClientesMap(pedidos)

  const kpis = useMemo(() => {
    const activos = pedidos.filter(p => ['placed','confirmed','in_transit'].includes(p.status)).length
    const retrasados = pedidos.filter(isPedidoDelayed).length
    const entregados = pedidos.filter(p => p.status === 'delivered')
    const total = entregados.length + retrasados
    const pctAtTime = total > 0 ? Math.round((entregados.length / total) * 100) : null
    return {
      activos, retrasados,
      pctAtTime: pctAtTime !== null ? `${pctAtTime}%` : '—',
      enTransito: pedidos.filter(p => p.status === 'in_transit').length,
    }
  }, [pedidos])

  const empty = !loading && pedidos.length === 0

  return (
    <div className="animate-fadeIn">
      <PageHdr title="Pedidos en Curso" subtitle="Tracking en tiempo real con trazabilidad completa Reg. 178/2002" badge={`${kpis.activos} activos`} />
      <SearchBar placeholder="Buscar pedido, producto o cliente..." />
      <div className="grid-4 mb14">
        <KPI val={String(kpis.activos)} label="Pedidos activos" delta={`→ ${kpis.enTransito} en tránsito`} color={ACCENT}/>
        <KPI val={kpis.pctAtTime} label="Entrega a tiempo" delta="calculado IA" up color="#2D8A30"/>
        <KPI val={String(kpis.retrasados)} label="Retrasado" delta={kpis.retrasados > 0 ? '▼ Atención' : 'todo OK'} color={kpis.retrasados > 0 ? '#e03030' : '#2D8A30'}/>
        <KPI val="48h" label="Tiempo medio entrega" delta="estimado" up color="#1A78FF"/>
      </div>
      <IaBoxLive
        context="comercial_pedidos"
        data={{
          activos: kpis.activos,
          en_transito: kpis.enTransito,
          retrasados: kpis.retrasados,
          ultimos: pedidos.slice(0,8).map(p => ({ ref:p.ref, status:p.status, total:Number(p.total_amount), eta:p.expected_date })),
        }}
        style={{ marginBottom:14 }}
      />
      <Card>
        <CardTitle>Pedidos activos <IaBadge /></CardTitle>

        {loading && (
          <div style={{ padding:28, textAlign:'center', color:'#7a8899', fontSize:'.72rem' }}>Cargando pedidos…</div>
        )}

        {empty && (
          <div style={{ padding:'28px 20px', textAlign:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'.95rem', fontWeight:800, color:NAVY, marginBottom:6, letterSpacing:'.04em', textTransform:'uppercase' }}>
              Sin pedidos de tus cotizaciones
            </div>
            <div style={{ fontSize:'.7rem', color:'#7a8899', lineHeight:1.5 }}>
              Cuando un cliente acepte una de tus cotizaciones y genere pedido, aparecerá aquí con seguimiento en tiempo real.
            </div>
          </div>
        )}

        {!loading && !empty && (
          <ScrollTable>
            <Thead cols={['Ref.','Cliente','Productos','Importe','Entrega est.','Estado','Acción']}/>
            <tbody>
              {pedidos.map(p => {
                const delayed = isPedidoDelayed(p)
                const meta = pedidoStatusMeta(p.status, delayed)
                const cli = cotMap[p.cotizacion_id]?.cliente_name || '—'
                return (
                  <tr key={p.id} style={{ borderBottom:'1px solid #F0E4D6', background:meta.type==='red'?'rgba(224,48,48,.04)':'' }} onMouseEnter={e=>e.currentTarget.style.background=meta.type==='red'?'rgba(224,48,48,.06)':'#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=meta.type==='red'?'rgba(224,48,48,.04)':''}>
                    <td style={{ padding:'8px 10px', fontWeight:700, color:meta.type==='red'?'#e03030':ACCENT }}>{p.ref}</td>
                    <td style={{ padding:'8px 10px', fontWeight:600, color:NAVY }}>{cli}</td>
                    <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{productsSummary(p.lines)}</td>
                    <td style={{ padding:'8px 10px', fontWeight:700 }}>{p.total_amount ? `${Number(p.total_amount).toLocaleString('es-ES')}€` : '—'}</td>
                    <td style={{ padding:'8px 10px', fontWeight:meta.type==='red'?700:400, color:meta.type==='red'?'#e03030':'#3a4a5a' }}>{formatEta(p)}</td>
                    <td style={{ padding:'8px 10px' }}><Badge type={meta.type} text={meta.label}/></td>
                    <td style={{ padding:'8px 10px' }}><TblBtn type={meta.btnType} onClick={()=>act(delayed?'incidencia':'tracking', p.ref)}>{meta.btnLabel}</TblBtn></td>
                  </tr>
                )
              })}
            </tbody>
          </ScrollTable>
        )}
      </Card>
    </div>
  )
}

/* ══ SCREEN 10: SIMULADOR COSTES ══ */
function SimuladorScreen({ act }) {
  const [margen, setMargen] = useState(18)
  const coste = 2550
  const transporte = 120
  const total = coste + transporte
  const margenEur = Math.round(total * margen / 100)
  const pvp = total + margenEur
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Simulador de Costes IA" subtitle="Calcula márgenes, transporte y precio final en tiempo real" />
      <SearchBar placeholder="Buscar escenario o producto..." />
      <div className="grid-4 mb14">
        <KPI val="18%" label="Margen medio" delta="→ Objetivo: 15-22%" color={ACCENT}/>
        <KPI val="94%" label="Precisión IA" delta="▲ vs coste real" up color="#2D8A30"/>
        <KPI val="47" label="Simulaciones Q1" delta="▲ +180% vs manual" up color="#1A78FF"/>
        <KPI val="3.2s" label="Tiempo cálculo" delta="▲ Antes: 2-3 horas" up color="#e8a010"/>
      </div>
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Simulación activa <IaBadge /></CardTitle>
        <div className="grid-2">
          <div style={{ background:'linear-gradient(135deg,#FFFBF5,#FFF3E8)', borderRadius:10, padding:16, border:`1.5px solid rgba(232,116,32,.2)` }}>
            <div style={{ fontSize:'.6rem', fontWeight:800, color:ACCENT, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>PARÁMETROS</div>
            {[['Producto','Harina Panadera W-280'],['Fabricante','Harinas del Mediterráneo'],['Cantidad','5.000 kg (palet completo)'],['Destino','Valencia centro (12 km)']].map(([k,v])=>(
              <div key={k} style={{ marginBottom:8 }}>
                <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:2 }}>{k}</div>
                <div style={{ fontSize:'.72rem', fontWeight:700, color:NAVY }}>{v}</div>
              </div>
            ))}
            <div style={{ marginBottom:8 }}>
              <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:4 }}>Margen objetivo: <strong style={{ color:ACCENT }}>{margen}%</strong></div>
              <input type="range" min="10" max="35" value={margen} onChange={e=>setMargen(Number(e.target.value))} style={{ width:'100%', accentColor:ACCENT }} />
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:10, padding:16, border:'1.5px solid rgba(45,138,48,.3)' }}>
            <div style={{ fontSize:'.6rem', fontWeight:800, color:'#2D8A30', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>RESULTADO IA</div>
            <table style={{ width:'100%', fontSize:'.62rem', borderCollapse:'collapse' }}>
              {[['Coste fábrica','0,85€/kg','2.550€'],['Transporte (12km)','','120€'],['Coste total','','2.670€'],['Margen '+margen+'%','',margenEur+'€']].map(([k,u,v])=>(
                <tr key={k} style={{ borderBottom:'1px solid #f0e6d9' }}>
                  <td style={{ padding:'5px 0', color:'#7a8899' }}>{k}</td>
                  <td style={{ padding:'5px 0', color:'#7a8899' }}>{u}</td>
                  <td style={{ padding:'5px 0', textAlign:'right', fontWeight:700, color:NAVY }}>{v}</td>
                </tr>
              ))}
              <tr style={{ background:'rgba(232,116,32,.05)' }}>
                <td style={{ padding:'8px 0', fontWeight:700, color:NAVY, fontSize:'.68rem' }} colSpan={2}>PVP FINAL</td>
                <td style={{ padding:'8px 0', textAlign:'right', fontFamily:'Barlow Condensed', fontSize:'.9rem', fontWeight:800, color:ACCENT }}>{pvp.toLocaleString('es-ES')}€</td>
              </tr>
            </table>
            <div style={{ display:'flex', gap:6, marginTop:10 }}>
              <BtnSm onClick={()=>act('goto','cotizaciones')}>Generar cotización</BtnSm>
              <BtnSm outline onClick={()=>act('ajustar','simulación')}>Ajustar</BtnSm>
            </div>
          </div>
        </div>
        <IABox text="<strong>IA Simulador:</strong> Con palet completo (5.000kg) el transporte baja a 0,024€/kg vs 0,063€/kg en envío parcial. <strong>Recomendación: agrupar pedidos Leopold + Agrudispa</strong> para optimizar transporte a Valencia zona sur." />
      </Card>
    </div>
  )
}

/* ══ SCREEN 11: CRM CLIENTES ══ */
function CrmScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:8, marginBottom:14 }}>
        <div>
          <h2 style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:NAVY }}>CRM Clientes</h2>
          <p style={{ fontSize:'.72rem', color:'#7a8899' }}>Registra notas de cliente hablando — la IA estructura y organiza todo</p>
        </div>
        <span style={{ fontSize:'.5rem', fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase', padding:'4px 10px', borderRadius:12, background:`linear-gradient(135deg,${ACCENT},#F5A623)`, color:'#fff' }}>EXCLUSIVO COAXIONIA</span>
      </div>
      <SearchBar placeholder="Buscar cliente..." />
      <div className="grid-4 mb14">
        <KPI val="34" label="Clientes activos" delta="▲ +8 nuevos Q1" up color={ACCENT}/>
        <KPI val="92%" label="Tasa retención" delta="▲ +5pp vs 2025" up color="#2D8A30"/>
        <KPI val="2.4M€" label="Facturación anual" delta="▲ +28% crecimiento" up color="#1A78FF"/>
        <KPI val="156" label="Notas de voz IA" delta="→ 0 tecleadas" color="#e8a010"/>
      </div>

      <Card style={{ marginBottom:13, border:`2px solid rgba(232,116,32,.3)`, background:'linear-gradient(135deg,#FFFBF5,#FFF3E8)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <CardTitle style={{ margin:0 }}>CRM por voz <IaBadge /></CardTitle>
          <span style={{ fontSize:'.5rem', fontWeight:800, letterSpacing:'.12em', textTransform:'uppercase', padding:'4px 10px', borderRadius:12, background:`linear-gradient(135deg,${ACCENT},#F5A623)`, color:'#fff' }}>0 FORMULARIOS</span>
        </div>
        <div className="grid-2">
          <div style={{ background:'#fff', borderRadius:10, padding:16, border:'1px solid #E8D5C0', textAlign:'center' }}>
            <div title="Disponible en Fase 3 · Voz IA" style={{ width:56, height:56, borderRadius:'50%', background:`linear-gradient(135deg,${ACCENT},#F5A623)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px', cursor:'not-allowed', boxShadow:'0 4px 15px rgba(232,116,32,.3)', opacity:.5, pointerEvents:'none' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="#fff" strokeWidth="2"/><line x1="12" y1="19" x2="12" y2="23" stroke="#fff" strokeWidth="2"/></svg>
            </div>
            <div style={{ fontSize:'.72rem', fontWeight:700, color:NAVY, marginBottom:4 }}>Dicta nota de cliente</div>
            <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:10 }}>La IA estructura, clasifica y asocia al cliente</div>
            <div style={{ padding:10, background:'rgba(232,116,32,.04)', borderRadius:8, border:'1px dashed rgba(232,116,32,.2)' }}>
              <div style={{ fontSize:'.58rem', fontStyle:'italic', color:'#3a4a5a', lineHeight:1.5 }}>"Acabo de salir de Leopold, el jefe de compras dice que la harina W-280 le va perfecta pero necesita que le bajemos el plazo de entrega a 48 horas."</div>
            </div>
          </div>
          <div style={{ background:'#fff', borderRadius:10, padding:16, border:'1.5px solid rgba(45,138,48,.3)' }}>
            <div style={{ fontSize:'.6rem', fontWeight:800, color:'#2D8A30', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:10 }}>IA HA ESTRUCTURADO</div>
            {[{color:'#2D8A30',label:'CLIENTE',val:'Panaderías Leopold S.L.'},{color:'#1A78FF',label:'CONTACTO',val:'Jefe de compras'},{color:ACCENT,label:'FEEDBACK',val:'Harina W-280 OK. Pide plazo 48h.'},{color:'#e8a010',label:'OPORTUNIDAD',val:'Interés en harinas ecológicas (nueva línea)'}].map((f,i)=>(
              <div key={i} style={{ marginBottom:8, padding:8, background:`rgba(${f.color==='#2D8A30'?'45,138,48':f.color==='#1A78FF'?'26,120,255':f.color===ACCENT?'232,116,32':'232,160,16'},.04)`, borderRadius:6, borderLeft:`3px solid ${f.color}` }}>
                <div style={{ fontSize:'.55rem', fontWeight:700, color:f.color, marginBottom:3 }}>{f.label}</div>
                <div style={{ fontSize:'.66rem', color:NAVY }}>{f.val}</div>
              </div>
            ))}
            <div style={{ display:'flex', gap:6, marginTop:10 }}>
              <BtnSm onClick={()=>act('guardar','nota CRM Leopold')}>Guardar en CRM</BtnSm>
              <button onClick={()=>act('tarea','seguimiento eco')} style={{ padding:'6px 12px', borderRadius:7, border:'none', cursor:'pointer', fontSize:'.62rem', fontWeight:700, background:'#E8F0FE', color:'#1A78FF', fontFamily:'DM Sans' }}>+ Tarea</button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Top clientes por facturación <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Cliente','Fact. 2026','Pedidos','Última visita','Sat.','Acción']}/>
          <tbody>
            {[['Panaderías Leopold','480k€','34','Hoy','ok:Alto'],['Dulces Iberia','320k€','28','14/04','ok:Alto'],['Congelados Martz','285k€','12','12/04','amber:Medio'],['Bollería Lux','198k€','22','10/04','ok:Alto'],['Agrudispa','156k€','18','09/04','amber:Medio'],['Pasteleros del Sur','134k€','15','08/04','ok:Alto']].map(([cli,fact,ped,ult,sat],i)=>{const[tt,tv]=sat.split(':');return(
              <tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{cli}</td>
                <td style={{ padding:'8px 10px', fontWeight:700 }}>{fact}</td>
                <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{ped}</td>
                <td style={{ padding:'8px 10px', fontSize:'.65rem', color:'#7a8899' }}>{ult}</td>
                <td style={{ padding:'8px 10px' }}><Badge type={tt} text={tv}/></td>
                <td style={{ padding:'8px 10px' }}><TblBtn type="orange" onClick={()=>act('crm',cli)}>Ver</TblBtn></td>
              </tr>
            )})}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>IA CRM:</strong> 156 notas registradas por voz este trimestre. <strong>0 tecleadas manualmente.</strong> Agrudispa lleva 7 días sin visita y su satisfacción baja → programar visita esta semana." />
      </Card>
    </div>
  )
}

/* ══ SCREEN 12: MUESTRAS ══ */
function MuestrasScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Muestras" subtitle="La IA sugiere qué muestras enviar a cada cliente según su historial" />
      <SearchBar placeholder="Buscar muestra o cliente..." />
      <div className="grid-4 mb14">
        <KPI val="18" label="Muestras Q1" delta="▲ +45% vs Q1 2025" up color={ACCENT}/>
        <KPI val="67%" label="Conversión" delta="▲ Muestra a pedido" up color="#2D8A30"/>
        <KPI val="4" label="En tránsito" delta="→ MST-041 hoy" color="#1A78FF"/>
        <KPI val="3" label="Pend. valoración" delta="→ Recordatorio enviado" color="#e8a010"/>
      </div>

      <Card style={{ marginBottom:13, border:`2px solid rgba(232,116,32,.3)`, background:'linear-gradient(135deg,#FFFBF5,#FFF3E8)' }}>
        <CardTitle>IA sugiere muestras para tu próxima visita <IaBadge /></CardTitle>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))', gap:10 }}>
          {[{tipo:'ALTA PROBABILIDAD',color:'#2D8A30',bg:'rgba(45,138,48,.06)',border:'rgba(45,138,48,.2)',prod:'Harina ecológica T-110',desc:'Para Leopold — preguntó en última visita por línea eco',btn:'primary'},{tipo:'CROSS-SELL',color:ACCENT,bg:'rgba(232,116,32,.06)',border:'rgba(232,116,32,.2)',prod:'Cobertura chocolate 55%',desc:'Para Bollería Lux — compran cacao pero no cobertura',btn:'primary'},{tipo:'NUEVO PRODUCTO',color:'#1A78FF',bg:'rgba(26,120,255,.06)',border:'rgba(26,120,255,.2)',prod:'Fios D\'ovos (Ovomafre)',desc:'Especialidad PT sin competencia en ES — alto margen',btn:'blue'}].map((s,i)=>(
            <div key={i} style={{ background:'#fff', borderRadius:10, padding:14, border:`1.5px solid ${s.border}` }}>
              <div style={{ fontSize:'.55rem', fontWeight:800, color:s.color, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:6 }}>{s.tipo}</div>
              <div style={{ fontSize:'.72rem', fontWeight:700, color:NAVY, marginBottom:4 }}>{s.prod}</div>
              <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:10 }}>{s.desc}</div>
              <button onClick={()=>act('muestra',s.prod)} style={{ width:'100%', padding:'8px 0', borderRadius:7, border:'none', cursor:'pointer', fontSize:'.62rem', fontWeight:700, background:s.btn==='blue'?'#E8F0FE':s.btn==='primary'?`linear-gradient(135deg,${ACCENT},#D06A1C)`:'#F0E6D9', color:s.btn==='blue'?'#1A78FF':'#fff', fontFamily:'DM Sans' }}>Solicitar muestra</button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardTitle>Muestras en curso</CardTitle>
        <ScrollTable>
          <Thead cols={['Ref.','Producto','Fabricante','Cliente','Estado','Acción']}/>
          <tbody>
            {[['MST-041','Masa hojaldre -18°C','Cong. Navarra','Congelados Martz','amber:En tránsito','orange:Tracking'],['MST-040','Harina ecológica T-110','Harinas Med.','Leopold','ok:Entregada','green:Valorar'],['MST-039','Cacao alcalizado 10-12%','Cacao Import','Dulces Iberia','ok:Aprobada','orange:Cotizar IA'],['MST-038','Mantequilla 82%','Lácteos PH','Bollería Lux','amber:Pend. valoración','blue:Recordar']].map(([ref,prod,fab,cli,st,ac],i)=>{const[tt,tv]=st.split(':');const[at,av]=ac.split(':');return(
              <tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{ padding:'8px 10px', fontWeight:700, color:ACCENT }}>{ref}</td>
                <td style={{ padding:'8px 10px', color:NAVY }}>{prod}</td>
                <td style={{ padding:'8px 10px', color:'#7a8899' }}>{fab}</td>
                <td style={{ padding:'8px 10px', color:NAVY }}>{cli}</td>
                <td style={{ padding:'8px 10px' }}><Badge type={tt} text={tv}/></td>
                <td style={{ padding:'8px 10px' }}><TblBtn type={at} onClick={()=>act(at==='orange'?'tracking':'valorar',ref)}>{av}</TblBtn></td>
              </tr>
            )})}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>IA Muestras:</strong> Cuando una muestra se aprueba, IA genera la cotización automáticamente. MST-039 aprobada por Dulces Iberia → <strong>cotización COT-2026-090 ya generada</strong>, pendiente de envío." />
      </Card>
    </div>
  )
}

/* ══ SCREEN 13: GASTOS Y DIETAS ══ */
function GastosScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Gastos y Dietas" subtitle="Escanea el ticket o QR y la IA registra todo automáticamente" badge="Abril 2026" />
      <SearchBar placeholder="Buscar gasto o concepto..." />
      <div className="grid-4 mb14">
        <KPI val="1.280 km" label="Km abril" delta="→ 0,19€/km" color={ACCENT}/>
        <KPI val="243€" label="Kilometraje" delta="→ Automático GPS" color="#2D8A30"/>
        <KPI val="156€" label="Dietas + peajes" delta="→ 12 comidas" color="#1A78FF"/>
        <KPI val="342€" label="Total liquidación" delta="→ Pendiente aprobación" color="#e8a010"/>
      </div>

      <Card style={{ marginBottom:13, border:`2px solid rgba(232,116,32,.3)`, background:'linear-gradient(135deg,#FFFBF5,#FFF3E8)' }}>
        <CardTitle>Registrar gasto <IaBadge /></CardTitle>
        <div className="grid-3" style={{ marginBottom:14 }}>
          {[{icon:'📷',label:'Foto del ticket',desc:'OCR lee importe y concepto',bg:`linear-gradient(135deg,${ACCENT},#F5A623)`},{icon:'📱',label:'Escanear QR',desc:'Lee todos los datos del QR',bg:'linear-gradient(135deg,#1A2F4A,#2A4A6A)'},{icon:'📍',label:'Km automático',desc:'GPS registra cada ruta',bg:'linear-gradient(135deg,#2D8A30,#4CAF50)'}].map((t,i)=>(
            <div key={i} onClick={()=>act('escanear',t.label)} style={{ background:'#fff', borderRadius:10, padding:16, border:`1.5px solid rgba(232,116,32,.2)`, textAlign:'center', cursor:'pointer', transition:'transform .2s' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 8px', fontSize:'1.2rem' }}>{t.icon}</div>
              <div style={{ fontSize:'.7rem', fontWeight:700, color:NAVY, marginBottom:2 }}>{t.label}</div>
              <div style={{ fontSize:'.55rem', color:'#7a8899' }}>{t.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ background:'#fff', borderRadius:10, padding:12, border:'1.5px solid rgba(45,138,48,.3)' }}>
          <div style={{ fontSize:'.55rem', fontWeight:800, color:'#2D8A30', letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>ÚLTIMO TICKET ESCANEADO</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:'.72rem', fontWeight:700, color:NAVY }}>Restaurante La Barraca — Almuerzo</div>
              <div style={{ fontSize:'.6rem', color:'#7a8899' }}>Hoy 13:45h | Comida con cliente Dulces Iberia | CIF: B96XXXX</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'Barlow Condensed', fontSize:'.88rem', fontWeight:800, color:ACCENT }}>24,80€</div>
              <Badge type="ok" text="Registrado"/>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Detalle de gastos abril <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Fecha','Concepto','Detalle','Km','Importe','Estado']}/>
          <tbody>
            {[['16/04','Ruta comercial','Valencia — Paterna — Manises — Torrent — Alzira','287','54,53€','amber:Hoy'],['15/04','Ruta comercial','Valencia — Sagunto — Castellón','198','37,62€','ok:GPS'],['15/04','Comida cliente','Almuerzo con Pasteleros del Sur','—','18,50€','ok:QR'],['14/04','Ruta comercial','Valencia — Alicante','356','67,64€','ok:GPS'],['14/04','Peaje AP-7','Valencia — Alicante ida y vuelta','—','12,40€','ok:QR'],['14/04','Comida cliente','Almuerzo con Leopold + Dulces Iberia','—','24,80€','ok:Foto']].map(([f,c,d,km,imp,st],i)=>{const[tt,tv]=st.split(':');return(
              <tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }}>
                <td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{f}</td>
                <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{c}</td>
                <td style={{ padding:'8px 10px', fontSize:'.62rem', color:'#7a8899' }}>{d}</td>
                <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{km}</td>
                <td style={{ padding:'8px 10px', fontWeight:700 }}>{imp}</td>
                <td style={{ padding:'8px 10px' }}><Badge type={tt} text={tv}/></td>
              </tr>
            )})}
          </tbody>
        </ScrollTable>
        <div style={{ display:'flex', justifyContent:'flex-end', marginTop:12 }}>
          <BtnSm onClick={()=>act('liquidar','liquidación abril')}>Generar liquidación PDF</BtnSm>
        </div>
        <IABox text="<strong>IA Gastos:</strong> Km por GPS, peajes por QR, comidas por foto del ticket. <strong>0 datos tecleados manualmente.</strong> Este mes llevas un 12% menos de km gracias a la optimización de rutas IA." />
      </Card>
    </div>
  )
}

/* ══ SCREEN 14: COMUNICACIONES ══ */
function ComunicaScreen({ act }) {
  const [activeChat, setActiveChat] = useState(0)
  const CHATS = [
    {ini:'PL',color:'#25D366',nom:'Panaderías Leopold',preview:'Necesitamos 3.000 kg de W-280...',hora:'2h',active:true},
    {ini:'HM',color:'#378ADD',nom:'Harinas Mediterráneo',preview:'Adjunto ficha técnica Harina T-110...',hora:'4h',active:false},
    {ini:'CM',color:'#FF6B2B',nom:'Congelados Martz',preview:'Llamada: consulta certificación IFS...',hora:'Ayer',active:false},
    {ini:'IA',color:ACCENT,nom:'FoodBridge IA',preview:'Ruta recalculada para mañana...',hora:'Ayer',active:false},
    {ini:'DI',color:'#25D366',nom:'Dulces Iberia',preview:'Recibida la muestra de cacao...',hora:'2d',active:false},
  ]
  const MSGS = [
    {side:'left',ini:'PL',color:'#25D366',nom:'Panaderías Leopold',msg:'Buenos días José Luis. Necesitamos 3.000 kg de harina W-280 para la próxima semana. Mismo proveedor que la última vez si es posible.',hora:'10:24'},
    {side:'right',msg:'Buenos días. Confirmo disponibilidad con Harinas del Mediterráneo. Os preparo cotización esta mañana.',hora:'10:31'},
    {side:'ia',msg:'Cotización COT-2026-094 generada automáticamente: 3.000 kg Harina W-280 a 2,95€/kg. Enviada a Leopold para revisión.',hora:'10:33'},
    {side:'left',ini:'PL',color:'#25D366',nom:'Panaderías Leopold',msg:'Perfecto, aceptamos. Necesitamos entrega antes del viernes.',hora:'10:48'},
  ]
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Centro de Comunicaciones" subtitle="Todos los canales unificados — VOZ IA, WhatsApp, Email" />
      <div style={{ background:'linear-gradient(135deg,#FFF3E8,#FFFBF5)', borderRadius:8, padding:'6px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(232,116,32,.15)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
          <div className="animate-dotPulse" style={{ width:6, height:6, borderRadius:'50%', background:'#25D366' }}/>
          <span style={{ fontSize:'.54rem', fontWeight:800, color:'#25D366', letterSpacing:'.1em', textTransform:'uppercase' }}>IA LIVE</span>
        </div>
        <div style={{ fontSize:'.66rem', color:'#3a4a5a' }}>3 conversaciones activas ahora mismo — FoodBridge IA monitorizando</div>
      </div>
      <Card>
        <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
          {[{label:'Todo',color:ACCENT,bg:'rgba(232,116,32,.1)'},{label:'VOZ IA',color:'#FF6B2B',bg:'rgba(255,107,43,.08)'},{label:'Chat',color:'#25D366',bg:'rgba(37,211,102,.08)'},{label:'Email',color:'#378ADD',bg:'rgba(55,138,221,.08)'}].map((f,i)=>(
            <button key={i} onClick={()=>act('filtro',f.label)} style={{ padding:'8px 14px', fontSize:'.65rem', fontWeight:700, background:f.bg, color:f.color, border:`1px solid ${f.bg}`, borderRadius:8, cursor:'pointer', fontFamily:'DM Sans' }}>{f.label}</button>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:14, minHeight:340 }}>
          {/* Lista chats */}
          <div style={{ borderRight:'1px solid #E8D5C0', paddingRight:14, display:'flex', flexDirection:'column', gap:6, overflowY:'auto', maxHeight:380 }}>
            {CHATS.map((c,i)=>(
              <div key={i} onClick={()=>setActiveChat(i)} style={{ display:'flex', gap:8, padding:10, borderRadius:8, background:activeChat===i?'rgba(232,116,32,.06)':'#FFFBF5', border:`1px solid ${activeChat===i?'rgba(232,116,32,.15)':'#E8D5C0'}`, cursor:'pointer', transition:'all .15s' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'.65rem', color:'#fff', fontWeight:700 }}>{c.ini}</div>
                <div style={{ flex:1, overflow:'hidden' }}>
                  <div style={{ fontSize:'.7rem', fontWeight:700, color:NAVY }}>{c.nom}</div>
                  <div style={{ fontSize:'.6rem', color:'#7a8899', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.preview}</div>
                </div>
                <div style={{ fontSize:'.5rem', color:'#7a8899', flexShrink:0 }}>{c.hora}</div>
              </div>
            ))}
          </div>
          {/* Chat activo */}
          <div style={{ display:'flex', flexDirection:'column' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, paddingBottom:10, borderBottom:'1px solid #E8D5C0', marginBottom:10 }}>
              <div style={{ width:32, height:32, borderRadius:'50%', background:CHATS[activeChat].color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.65rem', color:'#fff', fontWeight:700 }}>{CHATS[activeChat].ini}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'.78rem', fontWeight:700, color:NAVY }}>{CHATS[activeChat].nom}</div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <div className="animate-dotPulse" style={{ width:6, height:6, borderRadius:'50%', background:'#2D8A30' }}/>
                  <span style={{ fontSize:'.55rem', color:'#2D8A30', fontWeight:600 }}>En línea</span>
                </div>
              </div>
            </div>
            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:8, maxHeight:240 }}>
              {MSGS.map((m,i)=>(
                <div key={i} style={{ alignSelf:m.side==='right'?'flex-end':m.side==='ia'?'stretch':'flex-start', maxWidth:m.side==='ia'?'100%':'75%' }}>
                  {m.side==='ia' ? (
                    <div style={{ background:'rgba(232,116,32,.06)', border:'1px solid rgba(232,116,32,.15)', borderRadius:12, padding:'10px 14px' }}>
                      <div style={{ fontSize:'.5rem', fontWeight:800, color:ACCENT, letterSpacing:'.08em', textTransform:'uppercase', marginBottom:3 }}>FOODBRIDGE AUTOMÁTICO</div>
                      <div style={{ fontSize:'.72rem', color:'#3a4a5a', lineHeight:1.5 }}>{m.msg}</div>
                      <div style={{ fontSize:'.5rem', color:'#94A3B8', marginTop:4, textAlign:'right' }}>{m.hora}</div>
                    </div>
                  ) : m.side==='left' ? (
                    <div style={{ background:'#fff', border:'1px solid #E8D5C0', borderRadius:'12px 12px 12px 2px', padding:'10px 14px' }}>
                      <div style={{ fontSize:'.55rem', fontWeight:700, color:m.color, marginBottom:3 }}>{m.nom}</div>
                      <div style={{ fontSize:'.72rem', color:'#3a4a5a', lineHeight:1.5 }}>{m.msg}</div>
                      <div style={{ fontSize:'.5rem', color:'#94A3B8', marginTop:4, textAlign:'right' }}>{m.hora}</div>
                    </div>
                  ) : (
                    <div style={{ background:ACCENT, borderRadius:'12px 12px 2px 12px', padding:'10px 14px' }}>
                      <div style={{ fontSize:'.72rem', color:'#fff', lineHeight:1.5 }}>{m.msg}</div>
                      <div style={{ fontSize:'.5rem', color:'rgba(255,255,255,.6)', marginTop:4, textAlign:'right' }}>{m.hora}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:10, paddingTop:10, borderTop:'1px solid #E8D5C0' }}>
              <input placeholder="Escribe un mensaje..." style={{ flex:1, padding:'10px 14px', border:'1.5px solid #E8D5C0', borderRadius:8, fontSize:'.75rem', fontFamily:'DM Sans', background:'#FFF8F0', outline:'none' }} onFocus={e=>e.target.style.borderColor=ACCENT} onBlur={e=>e.target.style.borderColor='#E8D5C0'}/>
              <BtnSm onClick={()=>act('enviar','mensaje')}>Enviar</BtnSm>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/* ══ PLACEHOLDER SCREENS ══ */
function ProximamentePlaceholder({ title, icon }) {
  return (
    <div className="animate-fadeIn" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300, textAlign:'center' }}>
      <div style={{ fontSize:'3rem', marginBottom:16 }}>{icon}</div>
      <h2 style={{ fontFamily:'Barlow Condensed', fontSize:'1.6rem', fontWeight:900, color:NAVY, marginBottom:8 }}>{title}</h2>
      <div style={{ fontSize:'.78rem', color:'#7a8899', maxWidth:320, lineHeight:1.6 }}>Esta pantalla se está desarrollando. Estará disponible en la próxima actualización de FoodBridge IA.</div>
      <div style={{ marginTop:16, padding:'8px 20px', borderRadius:20, background:'rgba(232,116,32,.1)', color:ACCENT, fontSize:'.68rem', fontWeight:700, border:'1px solid rgba(232,116,32,.2)' }}>Próximamente</div>
    </div>
  )
}


/* ══ MODAL ENVIAR COTIZACIÓN ══ */
function EnviarCotizModal({ cot, onClose }) {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(null)

  if (!cot) return null

  const msg = encodeURIComponent(
    `Hola, te hago llegar la cotización solicitada *${cot.ref}*:\n\n` +
    `Producto: ${cot.prod}\n` +
    `Fabricante: ${cot.fab}\n` +
    `Cantidad: ${cot.qty}\n` +
    `Precio total: ${cot.pvp} (IVA no incluido)\n\n` +
    `---\n` +
    `_From FoodBridge IA · Soluciones inteligentes by COAXIONIA_\n` +
    `_www.coaxionia.com · © Todos los derechos reservados_`
  )

  const emailBody = encodeURIComponent(
    `Estimado cliente,\n\nAdjunto encontrará la cotización ${cot.ref}:\n\n` +
    `Producto: ${cot.prod}\n` +
    `Fabricante: ${cot.fab}\n` +
    `Cantidad: ${cot.qty}\n` +
    `Precio total: ${cot.pvp} (IVA no incluido)\n` +
    `Margen: ${cot.margen}\n\n` +
    `Generada por FoodBridge IA\n\nQuedamos a su disposición.`
  )

  const sendWhatsApp = () => {
    const num = phone.replace(/[\s\-+()]/g,'')
    if (!num) return
    setSent('whatsapp')
    setTimeout(() => {
      window.open(`https://wa.me/${num}?text=${msg}`, '_blank')
    }, 100)
  }

  const sendEmail = async () => {
    if (!email) return
    setSent('sending_email')
    try {
      // Intentar redaccion IA (Sonnet 4) antes del envio
      let subject = null, html = null
      try {
        const borradorRes = await fetch('/api/email-borrador', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tipo: 'cotizacion',
            datos: {
              ref: cot.ref,
              producto: cot.prod,
              fabricante: cot.fab,
              cantidad: cot.qty,
              precio_total: cot.pvp,
              margen: cot.margen,
            },
          }),
        })
        if (borradorRes.ok) {
          const b = await borradorRes.json()
          subject = b.subject; html = b.html
        }
      } catch { /* noop */ }

      const payload = subject && html
        ? { to: email, subject, html }
        : { to: email, ref: cot.ref, prod: cot.prod, fab: cot.fab, qty: cot.qty, pvp: cot.pvp, margen: cot.margen }
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.success) setSent('email')
      else setSent('email_error')
    } catch {
      setSent('email_error')
    }
  }

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,47,74,.6)', backdropFilter:'blur(4px)', zIndex:9000 }}/>
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9001, padding:'0 16px' }}>
        <div style={{ background:'#fff', borderRadius:18, width:'100%', maxWidth:520, maxHeight:'90vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(26,47,74,.3)', animation:'modalIn .25s ease both' }}>

          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#1A2F4A,#2A4A6A)', borderRadius:'18px 18px 0 0', padding:'18px 22px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.1rem', fontWeight:900, color:'#fff', marginBottom:2 }}>Enviar cotización</div>
              <div style={{ fontSize:'.62rem', color:'rgba(255,255,255,.5)' }}>Generada por FoodBridge IA · {cot.ref}</div>
            </div>
            <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', background:'rgba(255,255,255,.12)', border:'none', color:'#fff', cursor:'pointer', fontSize:'1rem' }}>✕</button>
          </div>

          <div style={{ padding:'20px 22px' }}>

            {/* Cotización preview */}
            <div style={{ background:'linear-gradient(135deg,#FFFBF5,#FFF8F0)', border:'1.5px solid rgba(232,116,32,.25)', borderRadius:12, padding:16, marginBottom:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:800, color:ACCENT }}>{cot.ref}</div>
                <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.3rem', fontWeight:900, color:NAVY }}>{cot.pvp}</div>
              </div>
              {[['📦 Producto',cot.prod],['🏭 Fabricante',cot.fab],['⚖️ Cantidad',cot.qty],['📊 Margen',cot.margen]].map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(232,116,32,.1)', fontSize:'.72rem' }}>
                  <span style={{ color:'#7a8899' }}>{k}</span>
                  <span style={{ fontWeight:600, color:NAVY }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop:10, padding:'8px 10px', background:'rgba(45,138,48,.06)', borderRadius:8, fontSize:'.62rem', color:'#2D8A30', borderLeft:'3px solid #2D8A30' }}>
                ✓ Generada automáticamente por FoodBridge IA en 47 segundos
              </div>
            </div>

            {/* WhatsApp */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:'.68rem', fontWeight:700, color:NAVY, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:'1rem' }}>💬</span> Enviar por WhatsApp
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <div style={{ position:'relative', flex:1 }}>
                  <span style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', fontSize:'.72rem', color:'#7a8899', pointerEvents:'none' }}>+</span>
                  <input
                    type="tel"
                    placeholder="34 612 345 678"
                    value={phone}
                    onChange={e=>setPhone(e.target.value)}
                    style={{ width:'100%', padding:'10px 12px 10px 22px', border:'2px solid rgba(37,211,102,.3)', borderRadius:9, fontSize:'.72rem', fontFamily:'DM Sans', outline:'none', boxSizing:'border-box', color:NAVY }}
                    onFocus={e=>e.target.style.borderColor='#25D366'}
                    onBlur={e=>e.target.style.borderColor='rgba(37,211,102,.3)'}
                  />
                </div>
                <button onClick={sendWhatsApp} style={{ padding:'10px 16px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'Barlow Condensed', fontWeight:700, fontSize:'.82rem', letterSpacing:'.04em', background:'#25D366', color:'#fff', whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(37,211,102,.3)', transition:'all .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#1DA855'}
                  onMouseLeave={e=>e.currentTarget.style.background='#25D366'}>
                  Enviar →
                </button>
              </div>
              {sent==='whatsapp' && <div style={{ marginTop:6, fontSize:'.62rem', color:'#25D366', fontWeight:600 }}>✓ WhatsApp abierto — pulsa Enviar en la app</div>}
            </div>

            {/* Email */}
            <div style={{ marginBottom:18 }}>
              <div style={{ fontSize:'.68rem', fontWeight:700, color:NAVY, marginBottom:8, display:'flex', alignItems:'center', gap:6 }}>
                <span style={{ fontSize:'1rem' }}>✉️</span> Enviar por Email
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <input
                  type="email"
                  placeholder="cliente@empresa.com"
                  value={email}
                  onChange={e=>setEmail(e.target.value)}
                  style={{ flex:1, padding:'10px 12px', border:'2px solid rgba(26,120,255,.25)', borderRadius:9, fontSize:'.72rem', fontFamily:'DM Sans', outline:'none', color:NAVY }}
                  onFocus={e=>e.target.style.borderColor='#1A78FF'}
                  onBlur={e=>e.target.style.borderColor='rgba(26,120,255,.25)'}
                />
                <button onClick={sendEmail} style={{ padding:'10px 16px', borderRadius:9, border:'none', cursor:'pointer', fontFamily:'Barlow Condensed', fontWeight:700, fontSize:'.82rem', letterSpacing:'.04em', background:'#1A78FF', color:'#fff', whiteSpace:'nowrap', boxShadow:'0 4px 12px rgba(26,120,255,.3)', transition:'all .2s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='#1565D8'}
                  onMouseLeave={e=>e.currentTarget.style.background='#1A78FF'}>
                  Enviar →
                </button>
              </div>
              {sent==='sending_email' && <div style={{ marginTop:6, fontSize:'.62rem', color:'#7a8899', fontWeight:600 }}>⏳ Enviando email...</div>}
      {sent==='email' && <div style={{ marginTop:6, fontSize:'.62rem', color:'#2D8A30', fontWeight:600 }}>✓ Email enviado directamente al cliente</div>}
      {sent==='email_error' && <div style={{ marginTop:6, fontSize:'.62rem', color:'#e03030', fontWeight:600 }}>✗ Error al enviar. Comprueba el email.</div>}
            </div>

            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <button onClick={()=>pdfCotizacion(cot)} style={{ flex:1, padding:10, borderRadius:9, border:'none', cursor:'pointer', fontFamily:'Barlow Condensed', fontWeight:700, fontSize:'.82rem', letterSpacing:'.04em', background:'linear-gradient(135deg,#1A2F4A,#2A4A6A)', color:'#fff' }}>
                📄 Descargar PDF
              </button>
            </div>
            <button onClick={onClose} style={{ width:'100%', padding:10, borderRadius:9, border:'1px solid #E8D5C0', background:'transparent', color:'#7a8899', fontSize:'.7rem', cursor:'pointer', fontFamily:'DM Sans' }}>Cerrar</button>
          </div>
        </div>
      </div>
    </>
  )
}

/* ══ MODAL BUILDER ══ */
function buildModal(type, detail, showToast) {
  const m = {
    alerta:{title:'Alerta',body:`<div style="padding:10px;border-radius:8px;background:#FFF5F5;border:1px solid rgba(224,48,48,.2);margin-bottom:12px;font-size:.75rem;color:#e03030;font-weight:700">${detail}</div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA recomienda actuar en las próximas 24h.</div>`,actions:[{label:'Gestionar',type:'primary',fn:()=>showToast('✅ Alerta gestionada')},{label:'Cerrar',type:'gray'}]},
    checkin:{title:`Check-in: ${detail}`,body:`<div style="padding:12px;background:#F0FFF4;border-radius:8px;margin-bottom:12px"><div style="font-size:.72rem;font-weight:700;color:#2D8A30;margin-bottom:4px">✓ Check-in registrado automáticamente</div><div style="font-size:.62rem;color:#3a4a5a">Cliente: <strong>${detail}</strong><br/>Hora de llegada: ${new Date().toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}<br/>GPS verificado · FoodBridge IA</div></div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA ha registrado la visita y actualizado el CRM automáticamente.</div>`,actions:[{label:'Registrar resultado',type:'primary',fn:()=>showToast('✅ Visita registrada')},{label:'Cerrar',type:'gray'}]},
    llamar:{title:`Llamar: ${detail}`,body:`<div style="font-size:.72rem;color:#3a4a5a;margin-bottom:12px">Contactar con: <strong>${detail}</strong></div><div style="padding:10px;background:rgba(45,138,48,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #2D8A30">IA tiene el historial de este cliente listo para la llamada.</div>`,actions:[{label:'Llamar ahora',type:'green',fn:()=>showToast('📞 Llamando...')},{label:'WhatsApp',type:'blue',fn:()=>showToast('💬 WhatsApp abierto')},{label:'Cerrar',type:'gray'}]},
    ficha:{title:`Ficha técnica: ${detail}`,body:`<div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.72rem;color:#3a4a5a">Ficha técnica de <strong>${detail}</strong>.<br/><br/>Alérgenos verificados · Certificaciones IFS/BRC · Trazabilidad Reg. 178/2002</div>`,actions:[{label:'Ver ficha',type:'primary',fn:()=>showToast('📄 Ficha abierta')},{label:'Enviar al cliente',type:'blue',fn:()=>showToast('✉️ Ficha enviada')},{label:'Cerrar',type:'gray'}]},
    navegar:{title:`Navegar a: ${detail}`,body:`<div style="padding:12px;background:#F0FFF4;border-radius:8px;font-size:.72rem;color:#2D8A30;font-weight:700;margin-bottom:12px">📍 Ruta calculada por FoodBridge IA</div><div style="font-size:.65rem;color:#3a4a5a">Distancia estimada: 28 km · Tiempo: 35 min · Via AP-7</div>`,actions:[{label:'Abrir en Maps',type:'primary',fn:()=>showToast('🗺️ Abriendo Maps...')},{label:'Cerrar',type:'gray'}]},
    cotizar:{title:`Cotizar IA: ${detail}`,body:`<div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420;margin-bottom:12px">IA generará cotización automática comparando todos los fabricantes disponibles para <strong>${detail}</strong>.</div>`,actions:[{label:'Generar cotización IA',type:'primary',fn:()=>showToast('🧠 Cotización generada')},{label:'Cancelar',type:'gray'}]},
    buscar:{title:`Búsqueda IA: ${detail}`,body:`<div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA buscará en las 1.647 fichas técnicas para encontrar más matches de <strong>${detail}</strong>.</div>`,actions:[{label:'Buscar ahora',type:'primary',fn:()=>showToast('🧠 IA buscando...')},{label:'Cancelar',type:'gray'}]},
    catalogo:{title:`Catálogo: ${detail}`,body:`<div style="font-size:.72rem;color:#3a4a5a;padding:10px;background:#F8FAFC;border-radius:8px">Catálogo completo de <strong>${detail}</strong> con fichas técnicas, certificaciones y precios actualizados.</div>`,actions:[{label:'Ver catálogo',type:'primary',fn:()=>showToast('📚 Catálogo abierto')},{label:'Cerrar',type:'gray'}]},
    seguimiento:{title:`Seguimiento: ${detail}`,body:`<div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.72rem;color:#3a4a5a">Historial completo de <strong>${detail}</strong> con notas de visitas anteriores, cotizaciones y pedidos.</div>`,actions:[{label:'Ver historial',type:'primary',fn:()=>showToast('📋 Historial abierto')},{label:'Agendar visita',type:'blue',fn:()=>showToast('📅 Visita agendada')},{label:'Cerrar',type:'gray'}]},
    agendar:{title:`Agendar visita: ${detail}`,body:`<div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA añadirá la visita a tu ruta optimizada para la próxima semana disponible.</div>`,actions:[{label:'Añadir a ruta',type:'primary',fn:()=>showToast('📅 Visita añadida a la ruta')},{label:'Cancelar',type:'gray'}]},
    resultado:{title:`Resultado visita`,body:`<div style="font-size:.72rem;color:#3a4a5a;margin-bottom:12px">Registrar resultado: <strong>${detail}</strong></div><div style="padding:10px;background:rgba(45,138,48,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #2D8A30">IA actualizará el CRM y generará el seguimiento automáticamente.</div>`,actions:[{label:'Confirmar',type:'primary',fn:()=>showToast('✅ Resultado registrado')},{label:'Cerrar',type:'gray'}]},
    notavoz:{title:`Nota de voz`,body:`<div style="text-align:center;padding:20px"><div style="width:60px;height:60px;borderRadius:'50%',background:'linear-gradient(135deg,#E87420,#F5A623)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'">🎤</div><div style="font-size:.78rem;fontWeight:700;color:#1A2F4A;marginBottom:6px">Dictando nota de voz...</div><div style="font-size:.65rem;color:#7a8899">IA transcribirá automáticamente y la añadirá al CRM.</div></div>`,actions:[{label:'Detener y guardar',type:'primary',fn:()=>showToast('✅ Nota guardada en CRM')},{label:'Cancelar',type:'gray'}]},
    equiv:{title:`Equivalencia: ${detail}`,body:`<div style="padding:10px;background:#F0FFF4;border-radius:8px;font-size:.72rem;color:#2D8A30;margin-bottom:12px;font-weight:700">✓ Equivalencia verificada por IA</div><div style="font-size:.65rem;color:#3a4a5a">Comparativa completa de precios, alérgenos y certificaciones entre proveedores.</div>`,actions:[{label:'Ver comparativa',type:'primary',fn:()=>showToast('📊 Comparativa abierta')},{label:'Cerrar',type:'gray'}]},
    sugerir:{title:`Sugerir a clientes: ${detail}`,body:`<div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA enviará sugerencia personalizada a los clientes más adecuados para <strong>${detail}</strong>.</div>`,actions:[{label:'Enviar sugerencia',type:'primary',fn:()=>showToast('✅ Sugerencia enviada')},{label:'Cancelar',type:'gray'}]},
    aplicar:{title:`Aplicar: ${detail}`,body:`<div style="padding:10px;background:rgba(45,138,48,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #2D8A30">IA aplicará los cambios de tarifa y notificará automáticamente a todos los clientes afectados.</div>`,actions:[{label:'Confirmar y aplicar',type:'primary',fn:()=>showToast('✅ Tarifas actualizadas')},{label:'Cancelar',type:'gray'}]},
    enviar:{title:`Enviar: ${detail}`,body:`<div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA personalizará el mensaje para cada cliente según su historial de pedidos.</div>`,actions:[{label:'Enviar ahora',type:'primary',fn:()=>showToast('✅ Tarifa enviada a todos los clientes')},{label:'Cancelar',type:'gray'}]},
    aprobar:{title:`Aprobar tarifa: ${detail}`,body:`<div style="padding:10px;background:#F0FFF4;border-radius:8px;font-size:.65rem;color:#2D8A30;margin-bottom:10px">✓ Cambio de precio aprobado. IA notificará a los clientes con 15 días de antelación.</div>`,actions:[{label:'Aprobar y notificar',type:'primary',fn:()=>showToast('✅ Tarifa aprobada y comunicada')},{label:'Cancelar',type:'gray'}]},
    ver_todas:{title:`Ver todas: ${detail}`,body:`<div style="font-size:.72rem;color:#3a4a5a;padding:10px;background:#F8FAFC;border-radius:8px">Catálogo completo de <strong>${detail}</strong> con todas las fichas técnicas disponibles.</div>`,actions:[{label:'Ver catálogo',type:'primary',fn:()=>showToast('📚 Catálogo abierto')},{label:'Cerrar',type:'gray'}]},
    vozsearch:{title:'Búsqueda por voz',body:`<div style="text-align:center;padding:20px"><div style="width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#E87420,#F5A623);display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="#fff" stroke-width="2"/></svg></div><div style="font-size:.78rem;font-weight:700;color:#1A2F4A;margin-bottom:6px">Grabando búsqueda por voz...</div><div style="font-size:.65rem;color:#7a8899">IA transcribirá y buscará automáticamente</div></div>`,actions:[{label:'Detener y buscar',type:'primary',fn:()=>showToast('🧠 IA buscando...')},{label:'Cancelar',type:'gray'}]},
    incidencia:{title:`Gestionar incidencia: ${detail}`,body:`<div style="padding:10px;border-radius:8px;background:#FFF5F5;border:1px solid rgba(224,48,48,.2);margin-bottom:12px"><div style="font-size:.72rem;font-weight:700;color:#e03030;margin-bottom:4px">Retraso detectado</div><div style="font-size:.65rem;color:#3a4a5a">IA ha contactado automáticamente al transportista. Entrega estimada: mañana 10:00h.</div></div>`,actions:[{label:'Notificar al cliente',type:'primary',fn:()=>showToast('✅ Cliente notificado')},{label:'Buscar alternativa',type:'blue',fn:()=>showToast('🧠 IA buscando alternativa...')},{label:'Cerrar',type:'gray'}]},
    tracking:{title:`Tracking: ${detail}`,body:`<div style="padding:10px;background:#F0FFF4;border-radius:8px;font-size:.72rem;color:#2D8A30;font-weight:700;margin-bottom:10px">✓ Trazabilidad Reg. 178/2002 verificada</div><div style="font-size:.65rem;color:#3a4a5a">Cadena completa desde fabricante hasta destino final. Sin alertas de seguridad.</div>`,actions:[{label:'Ver trazabilidad',type:'primary',fn:()=>showToast('📋 Trazabilidad abierta')},{label:'Cerrar',type:'gray'}]},
    guardar:{title:`Guardar en CRM: ${detail}`,body:`<div style="padding:10px;background:#F0FFF4;border-radius:8px;font-size:.65rem;color:#2D8A30">✓ Nota guardada automáticamente en el CRM del cliente.</div>`,actions:[{label:'Ver CRM',type:'primary',fn:()=>showToast('✅ Nota guardada en CRM')},{label:'Cerrar',type:'gray'}]},
    tarea:{title:`Nueva tarea: ${detail}`,body:`<div style="padding:10px;background:rgba(26,120,255,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #1A78FF">Tarea creada: <strong>${detail}</strong>. IA la añadirá a tu agenda.</div>`,actions:[{label:'Añadir a agenda',type:'primary',fn:()=>showToast('📅 Tarea añadida')},{label:'Cerrar',type:'gray'}]},
    ajustar:{title:`Ajustar cotización: ${detail}`,body:`
      <div style="margin-bottom:12px">
        <div style="font-size:.6rem;font-weight:700;color:#8A9BB0;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px">Producto</div>
        <input style="width:100%;padding:9px 12px;border:1.5px solid #E8D5C0;border-radius:8px;font-size:.75rem;font-family:DM Sans,sans-serif;color:#1A2F4A;outline:none;box-sizing:border-box" value="Harina Panadera W-280" />
      </div>
      <div style="margin-bottom:12px">
        <div style="font-size:.6rem;font-weight:700;color:#8A9BB0;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px">Cantidad (kg)</div>
        <input style="width:100%;padding:9px 12px;border:1.5px solid #E8D5C0;border-radius:8px;font-size:.75rem;font-family:DM Sans,sans-serif;color:#1A2F4A;outline:none;box-sizing:border-box" value="3.000" />
      </div>
      <div style="display:flex;gap:10px;margin-bottom:12px">
        <div style="flex:1">
          <div style="font-size:.6rem;font-weight:700;color:#8A9BB0;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px">Margen (%)</div>
          <input style="width:100%;padding:9px 12px;border:1.5px solid #E8D5C0;border-radius:8px;font-size:.75rem;font-family:DM Sans,sans-serif;color:#1A2F4A;outline:none;box-sizing:border-box" value="18" />
        </div>
        <div style="flex:1">
          <div style="font-size:.6rem;font-weight:700;color:#8A9BB0;letter-spacing:.1em;text-transform:uppercase;margin-bottom:5px">PVP Total (€)</div>
          <input style="width:100%;padding:9px 12px;border:1.5px solid #E8D5C0;border-radius:8px;font-size:.75rem;font-family:DM Sans,sans-serif;color:#1A2F4A;outline:none;box-sizing:border-box" value="3.233" />
        </div>
      </div>
      <div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.62rem;color:#E87420">IA recalculará automáticamente el precio al cambiar margen o cantidad.</div>
    `,actions:[{label:'Guardar cambios',type:'primary',fn:()=>showToast('✅ Cotización actualizada')},{label:'Cancelar',type:'gray'}]},
    crm:{title:`CRM: ${detail}`,body:`<div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.72rem;color:#3a4a5a">Ficha completa de <strong>${detail}</strong> con historial de visitas, notas de voz, cotizaciones y pedidos.</div>`,actions:[{label:'Ver ficha',type:'primary',fn:()=>showToast('📋 Ficha abierta')},{label:'Cerrar',type:'gray'}]},
    muestra:{title:`Solicitar muestra: ${detail}`,body:`<div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA solicitará la muestra al fabricante y coordinará la entrega al cliente.</div>`,actions:[{label:'Solicitar',type:'primary',fn:()=>showToast('✅ Muestra solicitada')},{label:'Cancelar',type:'gray'}]},
    valorar:{title:`Valorar muestra: ${detail}`,body:`<div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.72rem;margin-bottom:10px">¿Cuál fue la valoración del cliente sobre <strong>${detail}</strong>?</div>`,actions:[{label:'Aprobada → Cotizar',type:'primary',fn:()=>showToast('✅ Cotización generada automáticamente')},{label:'Rechazada',type:'red',fn:()=>showToast('❌ Muestra rechazada registrada')},{label:'Pendiente',type:'gray'}]},
    recordar:{title:`Recordatorio: ${detail}`,body:`<div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA enviará un recordatorio al cliente para que valore la muestra.</div>`,actions:[{label:'Enviar recordatorio',type:'primary',fn:()=>showToast('✅ Recordatorio enviado')},{label:'Cancelar',type:'gray'}]},
    escanear:{title:`Escanear: ${detail}`,body:`<div style="text-align:center;padding:20px"><div style="font-size:2rem;margin-bottom:12px">📷</div><div style="font-size:.78rem;font-weight:700;color:#1A2F4A;margin-bottom:6px">IA procesando ${detail}...</div><div style="font-size:.65rem;color:#7a8899">OCR extrae importe, concepto y datos fiscales automáticamente.</div></div>`,actions:[{label:'Confirmar registro',type:'primary',fn:()=>showToast('✅ Gasto registrado automáticamente')},{label:'Cancelar',type:'gray'}]},
    liquidar:{title:'Generar liquidación',body:`<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:#F8FAFC"><span style="font-size:.68rem">Kilometraje (1.280 km)</span><span style="font-size:.68rem;font-weight:700">243€</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:#F8FAFC"><span style="font-size:.68rem">Dietas y peajes</span><span style="font-size:.68rem;font-weight:700">156€</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(232,116,32,.06)"><span style="font-size:.68rem;font-weight:700">TOTAL</span><span style="font-size:.68rem;font-weight:800;color:#E87420">342€</span></div></div>`,actions:[{label:'Descargar PDF',type:'primary',fn:()=>showToast('✅ Liquidación PDF descargada')},{label:'Enviar a dirección',type:'blue',fn:()=>showToast('✉️ Enviada a dirección')},{label:'Cerrar',type:'gray'}]},
    filtro:{title:`Filtro: ${detail}`,body:`<div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.72rem;color:#3a4a5a">Filtrando mensajes por: <strong>${detail}</strong></div>`,actions:[{label:'Aplicar',type:'primary',fn:()=>showToast(`✅ Filtro ${detail} aplicado`)},{label:'Cerrar',type:'gray'}]},
    exportar:{title:`Exportar: ${detail}`,body:`<div style="text-align:center;padding:20px"><div style="font-size:.85rem;font-weight:700;color:#1A2F4A;margin-bottom:8px">${detail}</div><div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.62rem;color:#3a4a5a">PDF profesional generado por FoodBridge IA con todos los datos.</div></div>`,actions:[{label:'Descargar PDF',type:'primary',fn:()=>{pdfFichaTecnica({nombre:detail,ref:detail});showToast('✅ PDF descargado')}},{label:'Cerrar',type:'gray'}]},
  }
  return m[type]||{title:'FoodBridge IA',body:`<div style="font-size:.75rem;color:#3a4a5a;padding:10px">🧠 ${detail||type}</div>`,actions:[{label:'Cerrar',type:'gray'}]}
}

/* ══ DATA ══ */
const ALERTS = [
  {dot:'#e03030',text:'Certificación IFS de Harinas Mediterráneo caduca en 18 días — Solicitar renovación urgente',time:'Hace 30min'},
  {dot:'#e03030',text:'Pedido PED-2026-387 de Congelados Martz retrasado 24h — Incidencia logística',time:'Hace 1h'},
  {dot:'#e8a010',text:'Panaderías Leopold solicita 3.000 kg harina W-280 para próxima semana',time:'Hace 2h'},
  {dot:'#e8a010',text:'Reg. 2025/847 nuevos límites acrilamida afecta 14 fichas técnicas',time:'Hace 3h'},
  {dot:'#2D8A30',text:'Cotización COT-2026-089 aceptada por Leopold — 14.800€ confirmados',time:'Hace 4h'},
  {dot:'#2D8A30',text:'Muestra MST-040 aprobada por Leopold — Harina ecológica lista para cotizar',time:'Hoy'},
  {dot:'#1A78FF',text:'IA detecta nuevo fabricante Congelados Navarra con 87 productos — Validar certificaciones',time:'Hoy'},
  {dot:'#1A78FF',text:'Match IA 96% entre Harina W-280 Mediterráneo y Fuerza Plus Molinera Norte',time:'Ayer'},
]

const PUSH_MSGS = [
  {bar:ACCENT,label:'COTIZACIÓN GENERADA',text:'COT-2026-093 lista para Agrudispa. Margen optimizado al 19.2%.'},
  {bar:'#2D8A30',label:'PEDIDO CONFIRMADO',text:'PED-2026-412 entregado a Leopold. Trazabilidad Reg. 178/2002 OK.'},
  {bar:'#1A78FF',label:'EQUIVALENCIA IA',text:'Alternativa encontrada: Harina T-65 de Molinera Norte sustituye W-280.'},
  {bar:'#e03030',label:'ALERTA CRÍTICA',text:'Stock Margarina PF42 bajo mínimo en Aceites Levante. IA buscando alternativa.'},
  {bar:'#e8a010',label:'VISITA OPTIMIZADA',text:'Ruta recalculada: Agrudispa antes que Martz ahorra 47 km y 38 min.'},
]

const NAV = [
  {id:'dash',section:'Comercial',label:'Dashboard',ia:true,icon:'<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>'},
  {id:'ruta',label:'Mi Ruta Hoy',ia:true,icon:'<circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"/>'},
  {id:'visitas',label:'Visitas y Check-in',icon:'<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/>'},
  {id:'busqueda',section:'Catálogo',label:'Búsqueda IA',ia:true,icon:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'},
  {id:'fichas',label:'Fichas Técnicas',ia:true,icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'},
  {id:'equivalencias',label:'Equivalencias',ia:true,icon:'<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/>'},
  {id:'tarifas',section:'Ventas',label:'Tarifas IA',ia:true,icon:'<path d="M21 8a9 9 0 1 0 0 8"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="16" x2="13" y2="16"/>'},
  {id:'cotizaciones',label:'Cotizaciones',ia:true,icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
  {id:'pedidos',label:'Pedidos en curso',icon:'<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>'},
  {id:'simulador',label:'Simulador costes',ia:true,icon:'<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>'},
  {id:'crm',section:'Gestión',label:'CRM Clientes',icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>'},
  {id:'muestras',label:'Muestras',icon:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'},
  {id:'gastos',label:'Gastos y Dietas',icon:'<rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/>'},
  {id:'comunica',label:'Comunicaciones',icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
]

const SCREENS = {
  dash:DashScreen, ruta:RutaScreen, visitas:VisitasScreen,
  busqueda:BusquedaScreen,
  fichas:FichasScreen,
  equivalencias:EquivalenciasScreen,
  tarifas:TarifasScreen,
  cotizaciones:CotizacionesScreen,
  pedidos:PedidosScreen,
  simulador:SimuladorScreen,
  crm:CrmScreen,
  muestras:MuestrasScreen,
  gastos:GastosScreen,
  comunica:ComunicaScreen,
}

/* ══ MAIN ══ */
export default function ComercialPage() {
  const { goHome, profile } = useApp()
  const [active, setActive] = useState('dash')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [sendCot, setSendCot] = useState(null)
  const [push, setPush] = useState(null)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [readAlerts, setReadAlerts] = useState(new Set())
  const { toast, showToast } = useToast()
  const contentRef = useRef(null)

  const { pedidos: comPedidos } = usePedidos({ profile })
  const { cotizaciones: comCotiz } = useCotizaciones({ profile })
  const { visitas: comVisitas } = useVisitas({ profile })
  const { alertas: aiAlerts } = useAlertasIa({
    role: 'comercial',
    data: {
      pedidos_activos: comPedidos.filter(p => ['placed','confirmed','in_transit'].includes(p.status)).length,
      pedidos_retrasados: comPedidos.filter(p => p.expected_date && new Date(p.expected_date) < new Date() && p.status!=='delivered' && p.status!=='cancelled').length,
      cotizaciones_sent: comCotiz.filter(c => c.status === 'sent').length,
      cotizaciones_draft: comCotiz.filter(c => c.status === 'draft').length,
      cotizaciones_accepted_q1: comCotiz.filter(c => c.status === 'accepted').length,
      visitas_hoy: comVisitas.filter(v => {
        const d = new Date(v.scheduled_at); const t = new Date()
        return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate()
      }).length,
      visitas_atrasadas: comVisitas.filter(v => v.status === 'scheduled' && new Date(v.scheduled_at) < new Date()).length,
    },
  })
  const displayAlerts = aiAlerts.length > 0 ? aiAlerts : ALERTS
  const unreadCount = displayAlerts.filter((_,i)=>!readAlerts.has(i)).length

  const { mensajes: aiPushes } = usePushIa({
    role: 'comercial',
    data: {
      pedidos_activos: comPedidos.filter(p => ['placed','confirmed','in_transit'].includes(p.status)).length,
      cotizaciones_sent: comCotiz.filter(c => c.status === 'sent').length,
      visitas_hoy: comVisitas.filter(v => {
        const d = new Date(v.scheduled_at); const t = new Date()
        return d.getFullYear()===t.getFullYear() && d.getMonth()===t.getMonth() && d.getDate()===t.getDate()
      }).length,
    },
  })
  const pushPool = aiPushes.length > 0 ? aiPushes : PUSH_MSGS
  const pushPoolRef = useRef(pushPool)
  pushPoolRef.current = pushPool
  const closeModal = useCallback(()=>setModal(null),[])
  const changeSection = useCallback((id)=>{setActive(id);setSidebarOpen(false);setTimeout(()=>{if(contentRef.current)contentRef.current.scrollTop=0},0)},[])
  const act = useCallback((type,detail)=>{
    if(type==='goto'){changeSection(detail);return}
    if(type==='enviar_cot'){setSendCot(detail);return}
    setModal(buildModal(type,detail,showToast))
  },[showToast,changeSection])

  useEffect(()=>{
    let idx=0
    const show=()=>{const pool=pushPoolRef.current;if(!pool||pool.length===0)return;setPush(pool[idx%pool.length]);idx++;setTimeout(()=>setPush(null),5000)}
    const t1=setTimeout(show,15000); const t2=setInterval(show,12000)
    return()=>{clearTimeout(t1);clearInterval(t2)}
  },[])

  const Screen = SCREENS[active]||DashScreen

  const SidebarContent = () => (
    <>
      {NAV.map((item,i)=>(
        <div key={item.id}>
          {item.section&&<div style={{ fontSize:'.54rem', fontWeight:700, color:'#7a8899', letterSpacing:'.14em', textTransform:'uppercase', padding:'10px 8px 4px', marginTop:i>0?4:0 }}>{item.section}</div>}
          <button onClick={()=>changeSection(item.id)}
            style={{ width:'100%', textAlign:'left', padding:'8px 10px', marginBottom:2, background:active===item.id?'linear-gradient(135deg,rgba(232,116,32,.08),rgba(232,116,32,.04))':'transparent', border:active===item.id?'1px solid rgba(232,116,32,.2)':'1px solid transparent', borderRadius:7, fontSize:'.72rem', fontWeight:active===item.id?600:500, color:active===item.id?ACCENT:'#3a4a5a', cursor:'pointer', display:'flex', alignItems:'center', gap:8, position:'relative', fontFamily:'DM Sans,sans-serif' }}
            onMouseEnter={e=>{if(active!==item.id){e.currentTarget.style.background='rgba(232,116,32,.04)';e.currentTarget.style.color=ACCENT}}}
            onMouseLeave={e=>{if(active!==item.id){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#3a4a5a'}}}>
            {active===item.id&&<div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:3, height:'55%', background:ACCENT, borderRadius:'0 2px 2px 0' }}/>}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{ __html:item.icon }}/>
            <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.label}</span>
            {item.ia&&<span style={{ padding:'2px 5px', borderRadius:10, fontSize:'.52rem', fontWeight:700, background:'rgba(232,116,32,.1)', color:ACCENT, border:'1px solid rgba(232,116,32,.2)', flexShrink:0 }}>IA</span>}
          </button>
        </div>
      ))}
      <div style={{ marginTop:'auto', borderTop:'1px solid #F0E4D6', paddingTop:10 }}>
        <button onClick={goHome} style={{ width:'100%', textAlign:'left', padding:'8px 10px', background:'transparent', border:'1px solid transparent', borderRadius:7, fontSize:'.7rem', color:'#7a8899', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontFamily:'DM Sans,sans-serif' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#FEF0F0';e.currentTarget.style.color='#e03030'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#7a8899'}}>
          ↩ Cambiar perfil
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#FFF8F0' }}>
      {sidebarOpen&&<div onClick={()=>setSidebarOpen(false)} className="fab-sidebar-overlay" style={{ position:'fixed', inset:0, background:'rgba(26,47,74,.55)', zIndex:999 }}/>}

      <div className="fab-sidebar" style={{ width:210, flexShrink:0, display:'flex', flexDirection:'column', background:'#fff', borderRight:'1px solid #E8D5C0', overflowY:'auto', padding:'12px 8px' }}>
        <SidebarContent />
      </div>

      {sidebarOpen&&(
        <div style={{ position:'fixed', top:0, left:0, bottom:0, width:260, background:'#fff', zIndex:1000, display:'flex', flexDirection:'column', padding:'12px 8px', boxShadow:'4px 0 32px rgba(26,47,74,.25)', overflowY:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 2px 12px', marginBottom:6, borderBottom:'1px solid #F0E4D6' }}>
            <span style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:900, color:NAVY }}>Menú</span>
            <button onClick={()=>setSidebarOpen(false)} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(26,47,74,.06)', border:'none', cursor:'pointer', fontSize:'.9rem', color:'#7a8899' }}>✕</button>
          </div>
          <SidebarContent />
        </div>
      )}

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <div className="fab-topbar" style={{ height:56, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', background:'#fff', borderBottom:'1px solid #E8D5C0', boxShadow:'0 1px 12px rgba(26,47,74,.06)', position:'relative', gap:8 }}>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#1A2F4A,#E87420,#F5A623,#E87420,#1A2F4A)', opacity:.6 }}/>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button className="fab-hamburger" onClick={()=>setSidebarOpen(true)} style={{ width:36, height:36, borderRadius:8, background:'rgba(26,47,74,.05)', border:'1px solid #E8D5C0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${ACCENT},#F5A623)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="14" height="14" viewBox="0 0 48 48" fill="none"><path d="M14 36V22a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><path d="M10 36h28" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:900, color:NAVY, whiteSpace:'nowrap' }}>Food<span style={{ color:ACCENT }}>Bridge IA</span></span>
            </div>
            <span className="fab-topbar-tagline" style={{ fontSize:'.68rem', color:'#7a8899', fontStyle:'italic', whiteSpace:'nowrap' }}>"Tu catálogo, en el bolsillo"</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'.62rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', background:'#F0FFF4', color:'#2D8A30', border:'1px solid rgba(45,138,48,.25)', whiteSpace:'nowrap' }}>Comercial</span>
            <div onClick={()=>setAlertsOpen(v=>!v)} style={{ position:'relative', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a8899" strokeWidth="2" strokeLinecap="round" style={{ transition:'transform .2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='rotate(20deg)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount>0&&<div style={{ position:'absolute', top:-6, right:-8, background:'#e03030', color:'#fff', fontSize:'.52rem', fontWeight:800, borderRadius:10, minWidth:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', border:'2px solid #fff' }}>{unreadCount}</div>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.72rem', color:'#3a4a5a' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#2D8A30,#4CAF50)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.6rem', fontWeight:700, color:'#fff', flexShrink:0 }}>JL</div>
              <span className="fab-topbar-user-name" style={{ whiteSpace:'nowrap' }}>José Luis Martínez</span>
            </div>
            <button onClick={goHome} style={{ padding:'4px 10px', border:'1px solid #E8D5C0', borderRadius:20, background:'transparent', color:'#7a8899', fontSize:'.65rem', cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=ACCENT;e.currentTarget.style.color=ACCENT}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8D5C0';e.currentTarget.style.color='#7a8899'}}>
              ↩ Salir
            </button>
          </div>
        </div>

        <div ref={contentRef} className="fab-content-pad scrollable" style={{ flex:1, overflowY:'auto', padding:'20px 22px', background:'#FFF8F0' }}>
          <Screen act={act} />
        </div>
      </div>

      <Modal modal={modal} onClose={closeModal}/>
      <EnviarCotizModal cot={sendCot} onClose={()=>setSendCot(null)}/>
      <Toast msg={toast}/>
      {push&&<PushNotif msg={push} onClose={()=>setPush(null)}/>}
      {alertsOpen&&<AlertsModal alerts={displayAlerts} onClose={()=>setAlertsOpen(false)} readSet={readAlerts} onMarkRead={i=>setReadAlerts(s=>new Set([...s,i]))}/>}
    </div>
  )
}
