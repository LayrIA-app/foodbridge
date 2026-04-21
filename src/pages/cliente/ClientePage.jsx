import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { usePedidos, useCotizaciones, useAlertasIa, usePushIa } from '../../hooks'
import IaBoxLive from '../../components/IaBoxLive'

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

/* ══ UI ══ */
function Toast({ msg }) {
  if (!msg) return null
  return <div style={{ position:'fixed', bottom:80, left:'50%', transform:'translateX(-50%)', background:NAVY, color:'#fff', padding:'10px 20px', borderRadius:10, fontSize:'.72rem', fontWeight:600, zIndex:9999, border:'1px solid rgba(232,116,32,.3)', boxShadow:'0 8px 24px rgba(26,47,74,.25)', maxWidth:'calc(100vw - 32px)', textAlign:'center', lineHeight:1.4 }}>{msg}</div>
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
                  background: a.type==='primary'?`linear-gradient(135deg,${ACCENT},#D06A1C)`:a.type==='green'?'#E8F5E9':a.type==='blue'?'#E8F0FE':'#F0E6D9',
                  color: a.type==='primary'?'#fff':a.type==='green'?'#2D8A30':a.type==='blue'?'#1A78FF':NAVY }}>
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
  return <span style={{ display:'inline-block', padding:'2px 9px', borderRadius:20, fontSize:'.6rem', fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', verticalAlign:'middle' }}>{text}</span>
}

function KPI({ val, label, delta, up, color=ACCENT }) {
  const num = parseFloat(String(val).replace(/[^0-9.]/g,''))
  const animated = useCountUp(num)
  const suffix = String(val).replace(/^[0-9.,]+/,'')
  const prefix = String(val).match(/^[€+]*/)?.[0]||''
  const display = num ? `${prefix}${animated.toLocaleString('es-ES')}${suffix}` : val
  return (
    <div style={{ background:'linear-gradient(160deg,#fff,#FFFBF5)', border:'1px solid rgba(232,116,32,.15)', borderRadius:11, padding:'14px 16px', boxShadow:'0 2px 16px rgba(26,47,74,.07)', position:'relative', overflow:'hidden', minWidth:0, transition:'transform .28s,box-shadow .28s' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 36px rgba(26,47,74,.13)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 16px rgba(26,47,74,.07)'}}>

      <div style={{ fontSize:'.65rem', color:'#7a8899', marginBottom:4, wordBreak:'break-word' }}>{label}</div>
      <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.45rem', fontWeight:800, color, marginBottom:3, wordBreak:'break-word', overflowWrap:'anywhere', lineHeight:1.1 }}>{display}</div>
      {delta && <div style={{ fontSize:'.64rem', fontWeight:600, color:up?'#2D8A30':'#e03030' }}>{delta}</div>}
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

function LiveTicker({ msgs }) {
  const [i, setI] = useState(0)
  useEffect(() => { const t = setInterval(()=>setI(v=>(v+1)%msgs.length), 4500); return ()=>clearInterval(t) }, [msgs.length])
  return (
    <div style={{ background:'linear-gradient(135deg,#FFF3E8,#FFFBF5)', borderRadius:8, padding:'6px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:10, border:'1px solid rgba(232,116,32,.15)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
        <div className="animate-dotPulse" style={{ width:6, height:6, borderRadius:'50%', background:ACCENT }} />
        <span style={{ fontSize:'.52rem', fontWeight:800, color:ACCENT, letterSpacing:'.1em', textTransform:'uppercase' }}>IA LIVE</span>
      </div>
      <div style={{ fontSize:'.64rem', color:'#3a4a5a', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{msgs[i]}</div>
    </div>
  )
}

function Pbar({ pct, color=ACCENT }) {
  return (
    <div style={{ height:5, background:'#F0E4D6', borderRadius:3, overflow:'hidden', marginBottom:8 }}>
      <div style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg,${color},#F5A623)`, width:`${pct}%`, transition:'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
    </div>
  )
}

function BtnSm({ children, outline, onClick }) {
  return <button onClick={onClick} style={{ padding:'5px 12px', borderRadius:7, border:outline?`1.5px solid rgba(232,116,32,.4)`:'none', cursor:'pointer', fontSize:'.62rem', fontWeight:700, fontFamily:'DM Sans,sans-serif', background:outline?'transparent':`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:outline?ACCENT:'#fff', whiteSpace:'nowrap', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis' }}>{children}</button>
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

/* ══ GRUPO COLAPSABLE ══ */
function PedGroup({ dot, label, count, color, children, defaultOpen=true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <Card style={{ marginBottom:13 }}>
      <div onClick={()=>setOpen(v=>!v)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: open ? 10 : 0, cursor:'pointer' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:10, height:10, borderRadius:'50%', background:dot }} />
          <span style={{ fontSize:'.7rem', fontWeight:700, color:NAVY }}>{label}</span>
          <span style={{ fontSize:'.6rem', fontWeight:700, color, marginLeft:4 }}>{count}</span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7a8899" strokeWidth="2" style={{ transform: open?'rotate(0)':'rotate(-90deg)', transition:'transform .2s' }}><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      {open && <div style={{ display:'flex', flexDirection:'column', gap:8 }}>{children}</div>}
    </Card>
  )
}

/* ══ SCREENS ══ */
function CdashScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Mi Panel de Compras" subtitle="Gestión inteligente de aprovisionamiento — IA optimiza tus compras en tiempo real" badge="Abril 2026" />
      <SearchBar placeholder="Buscar pedido, proveedor o cotización..." />
      <LiveTicker msgs={['Monitorizando precios de 47 productos en tu catálogo habitual...','Verificando certificaciones de 12 proveedores activos...','Reg. 2025/847: analizando impacto en tus compras...','Ahorro Q1 2026: 14.880€ vs. gestión manual']} />

      <div className="grid-4 mb14">
        <KPI val="47" label="Productos activos" delta="▲ +8 este mes" up color={ACCENT}/>
        <KPI val="124k€" label="Compras Q1 2026" delta="▲ Ahorro 12% vs manual" up color="#2D8A30"/>
        <KPI val="12" label="Proveedores verificados" delta="▲ Todos certificados" up color="#1A78FF"/>
        <KPI val="100%" label="Trazabilidad" delta="▲ Reg. 178/2002" up color="#e8a010"/>
      </div>

      <Card style={{ marginBottom:13 }}>
        <CardTitle>Pedidos recientes <IaBadge /></CardTitle>
        {[{id:'PED-2026-412',prod:'Harina Ecológica T-110 × 2.000kg',prov:'Harinas Mediterráneo',st:'amber',sv:'En tránsito',bg:'#FFF8F0',border:'rgba(232,116,32,.15)'},{id:'PED-2026-408',prod:'Margarina Profesional PF42 × 500kg',prov:'Grasas Industriales S.A.',st:'ok',sv:'Entregado',bg:'#F0FFF4',border:'#C6F6D5'},{id:'PED-2026-401',prod:'Levadura fresca LV-Pure × 200kg',prov:'Lesaffre Ibérica',st:'ok',sv:'Entregado',bg:'#F0FFF4',border:'#C6F6D5'}].map((p,i)=>(
          <div key={i} onClick={()=>act('pedido',p.id)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, borderRadius:8, background:p.bg, border:`1px solid ${p.border}`, marginBottom:8, cursor:'pointer', transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <div><div style={{ fontSize:'.7rem', fontWeight:700, color:NAVY }}>{p.id}</div><div style={{ fontSize:'.6rem', color:'#7a8899' }}>{p.prod}</div></div>
            <div style={{ textAlign:'right' }}><Badge type={p.st} text={p.sv}/><div style={{ fontSize:'.55rem', color:'#7a8899', marginTop:3 }}>{p.prov}</div></div>
          </div>
        ))}
      </Card>

      <Card style={{ marginBottom:13 }}>
        <CardTitle>Cotizaciones pendientes <IaBadge /></CardTitle>
        <div style={{ padding:10, borderRadius:8, background:'#FFF8F0', border:'1px solid rgba(232,116,32,.15)', marginBottom:8 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:'.7rem', fontWeight:700, color:NAVY }}>COT-2026-098</span>
            <span style={{ fontSize:'.7rem', fontWeight:700, color:ACCENT }}>3 opciones</span>
          </div>
          <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:8 }}>Margarina Profesional -18°C — 800kg/mes</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <BtnSm onClick={()=>act('comparativa','Margarina -18°C')}>Comparativa IA</BtnSm>
            <BtnSm outline onClick={()=>act('negociar','COT-2026-098')}>Negociar</BtnSm>
          </div>
        </div>
        <div style={{ padding:10, borderRadius:8, background:'#EEF5FF', border:'1px solid #C4DEFF' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ fontSize:'.7rem', fontWeight:700, color:NAVY }}>COT-2026-095</span>
            <span style={{ fontSize:'.7rem', fontWeight:700, color:'#1A78FF' }}>IA analizando</span>
          </div>
          <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:6 }}>Azúcar glass ultrafino — 300kg/mes</div>
          <div style={{ height:5, background:'rgba(26,120,255,.15)', borderRadius:3, overflow:'hidden' }}>
            <div style={{ height:'100%', borderRadius:3, background:'linear-gradient(90deg,#1A78FF,#378ADD)', width:'65%' }} />
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Alertas de aprovisionamiento <IaBadge /></CardTitle>
        {[{type:'red',title:'Pedido PED-2026-412 retrasado 48h',sub:'Harinas Mediterráneo notificó incidencia logística. ETA actualizada: 21/04.'},{type:'amber',title:'Certificación BRC de Congelados Navarra caduca en 14 días',sub:'IA recomienda solicitar renovación o buscar proveedor alternativo.'},{type:'blue',title:'IA detectó nuevo proveedor de harina ecológica T-110',sub:'Harinas del Norte: IFS 7.0, sin alérgenos cruzados. 8% más barato.'},{type:'ok',title:'Pedido PED-2026-408 entregado — Trazabilidad verificada',sub:'Trazabilidad Reg. 178/2002 confirmada. Lote LOT-GI-0412 OK.'}].map((a,i)=>{
          const c={red:{bg:'#FDECEA',border:'#F1A9A0',t:'#e03030'},amber:{bg:'#FDF3E7',border:'#F0C06A',t:'#e8a010'},ok:{bg:'#EBF5EF',border:'#90D4A8',t:'#2D8A30'},blue:{bg:'#EEF5FF',border:'#B5D4F4',t:'#1A78FF'}}[a.type]
          return <div key={i} onClick={()=>act('alerta',a.title)} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:8, padding:'9px 12px', marginBottom:7, cursor:'pointer' }}><div style={{ fontSize:'.72rem', fontWeight:700, color:c.t, marginBottom:2 }}>{a.title}</div><div style={{ fontSize:'.65rem', color:'#3a4a5a' }}>{a.sub}</div></div>
        })}
      </Card>
    </div>
  )
}

function CbuscarScreen({ act }) {
  const [query, setQuery] = useState('')
  const [state, setState] = useState('idle') // idle | loading | results
  const doSearch = (q) => {
    if (!q.trim()) return
    setQuery(q)
    setState('loading')
    setTimeout(() => setState('results'), 1800)
  }
  const RESULTS = [
    {fab:'Grasas Industriales S.A.',prod:'Margarina PF42',cert:'IFS 7.0',match:94,color:'#E87420',bg:'#FFF8F0',border:'rgba(232,116,32,.15)',top:true},
    {fab:'MargaPro Europe',prod:'MargaPro Ultra',cert:'IFS 6.1',match:87,color:'#1A78FF',bg:'#EEF5FF',border:'#C4DEFF',top:false},
  ]
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Buscar Productos" subtitle="Describe lo que necesitas — la IA busca entre 1.647 fichas técnicas" />
      <Card>
        <CardTitle>Búsqueda Inteligente <IaBadge /></CardTitle>
        <div style={{ position:'relative', marginBottom:12 }}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSearch(query)}
            placeholder="Ej: Margarina profesional -18C sin palma..."
            style={{ width:'100%', padding:'11px 46px 11px 14px', border:'2px solid rgba(232,116,32,.2)', borderRadius:10, fontSize:'.72rem', fontFamily:'DM Sans,sans-serif', outline:'none', boxSizing:'border-box', color:NAVY }}
            onFocus={e=>{e.target.style.borderColor=ACCENT;e.target.style.boxShadow='0 0 0 3px rgba(232,116,32,.1)'}}
            onBlur={e=>{e.target.style.borderColor='rgba(232,116,32,.2)';e.target.style.boxShadow='none'}} />
          <button onClick={()=>doSearch(query)} style={{ position:'absolute', right:6, top:'50%', transform:'translateY(-50%)', width:34, height:34, borderRadius:8, border:'none', background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </button>
        </div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
          {['Margarina sin palma -18°C','Harina fuerza W300+ eco','Levadura fresca sin gluten','Cobertura chocolate 55%'].map(s=>(
            <span key={s} onClick={()=>doSearch(s)} style={{ padding:'3px 10px', borderRadius:20, background:'#FFF3E8', border:'1px solid rgba(232,116,32,.25)', fontSize:'.6rem', color:ACCENT, cursor:'pointer', fontWeight:600 }}>{s}</span>
          ))}
        </div>

        {state === 'loading' && (
          <div style={{ textAlign:'center', padding:20 }}>
            <div className="animate-dotPulse" style={{ width:8, height:8, borderRadius:'50%', background:ACCENT, margin:'0 auto 8px' }} />
            <div style={{ fontSize:'.65rem', color:'#7a8899' }}>IA buscando entre 1.647 fichas técnicas...</div>
          </div>
        )}

        {state === 'results' && (
          <div>
            <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:10 }}><strong>{RESULTS.length} resultados</strong> para "{query}"</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {RESULTS.map((r,i)=>(
                <div key={i} style={{ padding:12, borderRadius:8, border:`1px solid ${r.border}`, background:r.bg }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                    <span style={{ fontSize:'.7rem', fontWeight:700, color:NAVY }}>{r.prod} {r.top&&<span style={{ fontSize:'.48rem', background:ACCENT, color:'#fff', padding:'2px 5px', borderRadius:10 }}>TOP</span>}</span>
                    <span style={{ fontSize:'.6rem', fontWeight:700, color:r.color }}>{r.match}%</span>
                  </div>
                  <div style={{ fontSize:'.58rem', color:'#7a8899', marginBottom:8 }}>{r.fab} · {r.cert}</div>
                  <div style={{ display:'flex', gap:6 }}>
                    <BtnSm onClick={()=>act('cotizar',r.prod)}>Cotizar</BtnSm>
                    <BtnSm outline onClick={()=>act('ficha',r.prod)}>Ficha</BtnSm>
                  </div>
                </div>
              ))}
            </div>
            <IABox text="<strong>IA recomienda:</strong> Grasas Industriales PF42 es la mejor opción técnica y económica. Ahorro anual estimado vs. precio actual: <strong>14.880€</strong>." />
          </div>
        )}
      </Card>
    </div>
  )
}

function linesSummary(lines) {
  if (!lines?.length) return { main: 'Pedido sin líneas', qty: '' }
  const first = lines[0]
  const qty = `${Number(first.quantity).toLocaleString('es-ES')}${first.unit || 'kg'}`
  const main = first.product_name || 'Producto'
  const extra = lines.length > 1 ? ` + ${lines.length - 1} más` : ''
  return { main: main + extra, qty }
}

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}

function isDelayed(p) {
  if (!p.expected_date) return false
  if (p.status === 'delivered' || p.status === 'cancelled') return false
  return new Date(p.expected_date) < new Date()
}

const STATUS_PCT = { placed: 10, confirmed: 25, in_transit: 70, delivered: 100, cancelled: 0 }

function CpedidosScreen({ act }) {
  const { profile } = useApp()
  const { pedidos, loading } = usePedidos({ profile })

  const { kpis, grupos } = useMemo(() => {
    const delayed = pedidos.filter(isDelayed)
    const inTransit = pedidos.filter(p => p.status === 'in_transit' && !isDelayed(p))
    const confirmed = pedidos.filter(p => p.status === 'confirmed')
    const placed = pedidos.filter(p => p.status === 'placed')
    const delivered = pedidos.filter(p => p.status === 'delivered')
    const activos = pedidos.filter(p => ['placed', 'confirmed', 'in_transit'].includes(p.status)).length

    return {
      kpis: [
        { v: String(activos),         l: 'Activos',     c: '#E87420', bg: '#FFF8F0', border: 'rgba(232,116,32,.15)' },
        { v: String(delayed.length),  l: 'Retrasado',   c: '#e8a010', bg: '#FFF3CD', border: 'rgba(232,160,16,.2)' },
        { v: String(delivered.length),l: 'Entregados',  c: '#2D8A30', bg: '#F0FFF4', border: '#C6F6D5' },
        { v: String(confirmed.length + placed.length), l: 'Confirmados', c: '#1A78FF', bg: '#F0F7FF', border: '#C4DEFF' },
      ],
      grupos: { delayed, inTransit, confirmed, placed, delivered },
    }
  }, [pedidos])

  const empty = !loading && pedidos.length === 0

  return (
    <div className="animate-fadeIn">
      <PageHdr title="Mis Pedidos" subtitle="Seguimiento completo con trazabilidad Reg. 178/2002" />
      <SearchBar placeholder="Buscar pedido o producto..." />

      <div className="grid-4" style={{ marginBottom:13 }}>
        {kpis.map((k,i) => (
          <div key={i} style={{ padding:12, borderRadius:10, background:k.bg, border:`1px solid ${k.border}`, textAlign:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:k.c }}>{k.v}</div>
            <div style={{ fontSize:'.58rem', color:'#7a8899', marginTop:2 }}>{k.l}</div>
          </div>
        ))}
      </div>

      {!loading && pedidos.length > 0 && (
        <IaBoxLive
          context="cliente_pedidos"
          data={{
            total: pedidos.length,
            en_transito: grupos.inTransit.length,
            retrasados: grupos.delayed.length,
            confirmados: grupos.confirmed.length + grupos.placed.length,
            entregados: grupos.delivered.length,
            ultimos: pedidos.slice(0,5).map(p=>({ ref:p.ref, status:p.status, eta:p.expected_date })),
          }}
          style={{ marginBottom:14 }}
        />
      )}

      {loading && (
        <Card>
          <div style={{ padding:28, textAlign:'center', color:'#7a8899', fontSize:'.72rem' }}>Cargando pedidos…</div>
        </Card>
      )}

      {empty && (
        <Card>
          <div style={{ padding:'32px 20px', textAlign:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:800, color:NAVY, marginBottom:6, letterSpacing:'.04em', textTransform:'uppercase' }}>
              Aún no tienes pedidos
            </div>
            <div style={{ fontSize:'.72rem', color:'#7a8899', lineHeight:1.5 }}>
              Cuando aceptes una cotización o hagas un pedido, aparecerá aquí con trazabilidad completa.
            </div>
          </div>
        </Card>
      )}

      {!loading && grupos.delayed.length > 0 && (
        <PedGroup dot="#e03030" label="Retrasado" count={String(grupos.delayed.length)} color="#e03030" defaultOpen>
          {grupos.delayed.map(p => {
            const { main, qty } = linesSummary(p.lines)
            return (
              <div key={p.id} style={{ padding:12, borderRadius:8, border:'1px solid rgba(224,48,48,.2)', background:'#FFF5F5' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:'.72rem', fontWeight:700, color:NAVY }}>{p.ref}</span>
                  <Badge type="red" text="Retrasado"/>
                </div>
                <div style={{ fontSize:'.62rem', color:'#3a4a5a', marginBottom:4 }}><strong>{main}</strong>{qty && ` × ${qty}`}</div>
                <div style={{ fontSize:'.58rem', color:'#7a8899', marginBottom:6 }}>ETA {formatDate(p.expected_date)} vencida</div>
                <Pbar pct={85} color="#e03030"/>
                <div style={{ display:'flex', gap:6 }}>
                  <BtnSm onClick={()=>act('goto','cpedidos')}>Gestionar</BtnSm>
                  <BtnSm outline onClick={()=>act('trazabilidad',p.ref)}>Trazabilidad</BtnSm>
                </div>
              </div>
            )
          })}
        </PedGroup>
      )}

      {!loading && grupos.inTransit.length > 0 && (
        <PedGroup dot={ACCENT} label="En tránsito" count={String(grupos.inTransit.length)} color={ACCENT} defaultOpen>
          {grupos.inTransit.map(p => {
            const { main, qty } = linesSummary(p.lines)
            return (
              <div key={p.id} style={{ padding:12, borderRadius:8, border:'1px solid rgba(232,116,32,.15)', background:'#FFF8F0' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:'.72rem', fontWeight:700, color:NAVY }}>{p.ref}</span>
                  <Badge type="amber" text="En tránsito"/>
                </div>
                <div style={{ fontSize:'.62rem', color:'#3a4a5a', marginBottom:4 }}><strong>{main}</strong>{qty && ` × ${qty}`}</div>
                {p.expected_date && <div style={{ fontSize:'.58rem', color:'#7a8899', marginBottom:6 }}>ETA {formatDate(p.expected_date)}</div>}
                <Pbar pct={STATUS_PCT.in_transit} color={ACCENT}/>
                <div style={{ display:'flex', gap:6 }}>
                  <BtnSm onClick={()=>act('trazabilidad',p.ref)}>Trazabilidad</BtnSm>
                  <BtnSm outline onClick={()=>act('contactar','Proveedor')}>Contactar</BtnSm>
                </div>
              </div>
            )
          })}
        </PedGroup>
      )}

      {!loading && (grupos.confirmed.length > 0 || grupos.placed.length > 0) && (
        <PedGroup dot="#1A78FF" label="Confirmado" count={String(grupos.confirmed.length + grupos.placed.length)} color="#1A78FF" defaultOpen>
          {[...grupos.confirmed, ...grupos.placed].map(p => {
            const { main, qty } = linesSummary(p.lines)
            const pct = STATUS_PCT[p.status] ?? 20
            return (
              <div key={p.id} style={{ padding:12, borderRadius:8, border:'1px solid #C4DEFF', background:'#F0F7FF' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:'.72rem', fontWeight:700, color:NAVY }}>{p.ref}</span>
                  <Badge type="blue" text={p.status === 'placed' ? 'Pendiente' : 'Confirmado'}/>
                </div>
                <div style={{ fontSize:'.62rem', color:'#3a4a5a', marginBottom:8 }}><strong>{main}</strong>{qty && ` × ${qty}`}</div>
                <Pbar pct={pct} color="#1A78FF"/>
              </div>
            )
          })}
        </PedGroup>
      )}

      {!loading && grupos.delivered.length > 0 && (
        <PedGroup dot="#2D8A30" label="Entregado" count={String(grupos.delivered.length)} color="#2D8A30" defaultOpen={false}>
          {grupos.delivered.map(p => {
            const { main, qty } = linesSummary(p.lines)
            return (
              <div key={p.id} style={{ padding:12, borderRadius:8, border:'1px solid #C6F6D5', background:'#F0FFF4' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <span style={{ fontSize:'.72rem', fontWeight:700, color:NAVY }}>{p.ref}</span>
                  <Badge type="ok" text="Entregado"/>
                </div>
                <div style={{ fontSize:'.62rem', color:'#3a4a5a' }}><strong>{main}</strong>{qty && ` × ${qty}`}</div>
                <div style={{ fontSize:'.58rem', color:'#7a8899' }}>{formatDate(p.delivered_at)}</div>
              </div>
            )
          })}
        </PedGroup>
      )}
    </div>
  )
}

function CcotizaScreen({ act }) {
  const { profile } = useApp()
  const { cotizaciones, loading, acceptCotizacion, rejectCotizacion } = useCotizaciones({ profile })
  const [busyId, setBusyId] = useState(null)

  const kpis = useMemo(() => {
    const pendientes = cotizaciones.filter(c => c.status === 'sent').length
    const aceptadas = cotizaciones.filter(c => c.status === 'accepted').length
    const total = cotizaciones.filter(c => ['sent','accepted','rejected'].includes(c.status)).length
    const ratio = total > 0 ? Math.round((aceptadas / total) * 100) : null
    const borrador = cotizaciones.filter(c => c.status === 'draft').length
    return {
      pendientes: String(pendientes),
      aceptadas: String(aceptadas),
      ratio: ratio !== null ? `${ratio}%` : '—',
      borrador: String(borrador),
    }
  }, [cotizaciones])

  const onAccept = async (id) => {
    setBusyId(id)
    const { error, data } = await acceptCotizacion(id)
    setBusyId(null)
    if (error) { act('toast', `Error al aceptar: ${error.message || error}`); return }
    act('toast', `✓ Aceptada y pedido ${data?.pedidoRef || ''} creado`)
  }

  const onReject = async (id) => {
    setBusyId(id)
    const { error } = await rejectCotizacion(id)
    setBusyId(null)
    if (error) { act('toast', `Error: ${error.message || error}`); return }
    act('toast', 'Cotización rechazada')
  }

  const empty = !loading && cotizaciones.length === 0

  return (
    <div className="animate-fadeIn">
      <PageHdr title="Mis Cotizaciones" subtitle="Recibidas de tus comerciales — acepta para generar pedido" />
      <SearchBar placeholder="Buscar cotización o producto..." />

      <div className="grid-4 mb14">
        <div style={{ padding:12, borderRadius:10, background:'#FFF3CD', border:'1px solid rgba(232,160,16,.25)', textAlign:'center' }}>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:'#e8a010' }}>{kpis.pendientes}</div>
          <div style={{ fontSize:'.58rem', color:'#7a8899', marginTop:2 }}>Pendientes respuesta</div>
        </div>
        <div style={{ padding:12, borderRadius:10, background:'#F0FFF4', border:'1px solid #C6F6D5', textAlign:'center' }}>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:'#2D8A30' }}>{kpis.aceptadas}</div>
          <div style={{ fontSize:'.58rem', color:'#7a8899', marginTop:2 }}>Aceptadas</div>
        </div>
        <div style={{ padding:12, borderRadius:10, background:'#EEF5FF', border:'1px solid #C4DEFF', textAlign:'center' }}>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:'#1A78FF' }}>{kpis.ratio}</div>
          <div style={{ fontSize:'.58rem', color:'#7a8899', marginTop:2 }}>Aceptación</div>
        </div>
        <div style={{ padding:12, borderRadius:10, background:'#FFF8F0', border:'1px solid rgba(232,116,32,.15)', textAlign:'center' }}>
          <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:ACCENT }}>{kpis.borrador}</div>
          <div style={{ fontSize:'.58rem', color:'#7a8899', marginTop:2 }}>En borrador</div>
        </div>
      </div>

      {cotizaciones.length > 0 && (
        <IaBoxLive
          context="cliente_cotizaciones"
          data={{
            pendientes: kpis.pendientes,
            aceptadas: kpis.aceptadas,
            ratio_aceptacion: kpis.ratio,
            borradores: kpis.borrador,
            ultimas: cotizaciones.slice(0,8).map(c=>({ ref:c.ref, status:c.status, producto:c.product_name, total:Number(c.total_price), margen:c.margin_pct })),
          }}
          style={{ marginBottom:14 }}
        />
      )}
      <Card>
        <CardTitle>Cotizaciones recibidas <IaBadge /></CardTitle>

        {loading && (
          <div style={{ padding:28, textAlign:'center', color:'#7a8899', fontSize:'.72rem' }}>Cargando cotizaciones…</div>
        )}

        {empty && (
          <div style={{ padding:'32px 20px', textAlign:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:800, color:NAVY, marginBottom:6, letterSpacing:'.04em', textTransform:'uppercase' }}>
              Sin cotizaciones recibidas
            </div>
            <div style={{ fontSize:'.72rem', color:'#7a8899', lineHeight:1.5 }}>
              Cuando un comercial te envíe una cotización, aparecerá aquí con los detalles del producto y precio.
            </div>
          </div>
        )}

        {!loading && !empty && (
          <ScrollTable>
            <Thead cols={['Ref.','Producto','Cantidad','Precio','Margen','Estado','Acción']}/>
            <tbody>
              {cotizaciones.map(c => {
                const meta = {
                  draft:    { type:'amber', label:'Borrador' },
                  sent:     { type:'blue',  label:'Recibida' },
                  accepted: { type:'ok',    label:'Aceptada' },
                  rejected: { type:'red',   label:'Rechazada'},
                  expired:  { type:'red',   label:'Expirada' },
                }[c.status] || { type:'amber', label:c.status }
                const total = c.total_price != null ? `${Number(c.total_price).toLocaleString('es-ES', { minimumFractionDigits:2, maximumFractionDigits:2 })}€` : '—'
                const mrg = c.margin_pct != null ? `${Number(c.margin_pct).toFixed(1)}%` : '—'
                const canDecide = c.status === 'sent'
                const busy = busyId === c.id
                return (
                  <tr key={c.id} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                    <td style={{ padding:'8px 10px', fontWeight:700, color:ACCENT }}>{c.ref}</td>
                    <td style={{ padding:'8px 10px', color:NAVY, fontWeight:600 }}>{c.product_name || '—'}</td>
                    <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{Number(c.quantity).toLocaleString('es-ES')}{c.unit}</td>
                    <td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{total}</td>
                    <td style={{ padding:'8px 10px', color:'#2D8A30', fontWeight:700 }}>{mrg}</td>
                    <td style={{ padding:'8px 10px' }}><Badge type={meta.type} text={meta.label}/></td>
                    <td style={{ padding:'8px 10px' }}>
                      {canDecide ? (
                        <div style={{ display:'flex', gap:4 }}>
                          <button disabled={busy} onClick={()=>onAccept(c.id)} style={{ padding:'4px 10px', background:busy?'#aaa':'#2D8A30', color:'#fff', border:'none', borderRadius:6, fontSize:'.6rem', fontWeight:700, cursor:busy?'not-allowed':'pointer' }}>Aceptar</button>
                          <button disabled={busy} onClick={()=>onReject(c.id)} style={{ padding:'4px 10px', background:'transparent', color:'#e03030', border:'1px solid rgba(224,48,48,.4)', borderRadius:6, fontSize:'.6rem', fontWeight:700, cursor:busy?'not-allowed':'pointer' }}>Rechazar</button>
                        </div>
                      ) : (
                        <TblBtn type="orange" onClick={()=>act('ver', c.ref)}>Ver</TblBtn>
                      )}
                    </td>
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

function CproveeScreen({ act }) {
  const DOCS = [
    {ref:'RGSEAA 26.00086/A',tipo:'Registro Sanitario · 18/02/2010',st:'Vigente',stColor:'#2D8A30'},
    {ref:'RGSEAA 31.00015/A',tipo:'Registro Sanitario · 19/02/2010',st:'Vigente',stColor:'#2D8A30'},
    {ref:'RGSEAA 40.20102/A',tipo:'Adaptación Administrativa · 22/06/2015',st:'Vigente',stColor:'#2D8A30'},
    {ref:'RGSEAA 20.045203/A',tipo:'Notificación Inscripción · 08/09/2014',st:'Vigente',stColor:'#2D8A30'},
    {ref:'Acta Inspección APPCC',tipo:'Control Oficial AESAN · 25/02/2026',st:'Conforme',stColor:'#1A78FF'},
  ]
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Mis Proveedores" subtitle="Red de fabricantes verificados por FoodBridge IA" />
      <SearchBar placeholder="Buscar proveedor o certificación..." />
      <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:13 }}>
        {[{ini:'HM',color:`linear-gradient(135deg,${ACCENT},#D06A1C)`,nom:'Harinas Mediterráneo',loc:'Valencia · 234 productos',certs:['IFS 7.0','BRC A+'],st:'ok'},{ini:'GI',color:'linear-gradient(135deg,#1A78FF,#378ADD)',nom:'Grasas Industriales S.A.',loc:'Barcelona · 87 productos',certs:['IFS 7.0','RSPO'],st:'ok'},{ini:'LI',color:'linear-gradient(135deg,#2D8A30,#1B6B1E)',nom:'Lesaffre Ibérica',loc:'Madrid · 45 productos',certs:['ISO 22000','FSSC 22000'],st:'ok'}].map((p,i)=>(
          <Card key={i} style={{ marginBottom:0 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, flexWrap:'wrap', gap:6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:42, height:42, borderRadius:10, background:p.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'.7rem', fontWeight:700, flexShrink:0 }}>{p.ini}</div>
                <div><div style={{ fontSize:'.75rem', fontWeight:700, color:NAVY }}>{p.nom}</div><div style={{ fontSize:'.58rem', color:'#7a8899' }}>{p.loc}</div></div>
              </div>
              <Badge type={p.st} text="Verificado"/>
            </div>
            <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:10 }}>
              {p.certs.map(c=><span key={c} style={{ fontSize:'.5rem', padding:'3px 8px', borderRadius:10, background:'#EEF5FF', color:'#1A78FF', border:'1px solid #C4DEFF', fontWeight:600 }}>{c}</span>)}
            </div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <BtnSm onClick={()=>act('goto','cbuscar')}>Catálogo</BtnSm>
              <BtnSm outline onClick={()=>act('contactar',p.nom)}>Contactar</BtnSm>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardTitle>Documentos del proveedor <IaBadge /></CardTitle>
        <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:10 }}>Harinas Mediterráneo · RGSEAA, actas de inspección y certificaciones oficiales</div>
        {DOCS.map((d,i)=>(
          <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:10, borderRadius:8, background:'#FAFBFC', border:'1px solid #F1F5F9', marginBottom:6, cursor:'pointer', transition:'background .12s' }} onMouseEnter={e=>e.currentTarget.style.background='#F0F7FF'} onMouseLeave={e=>e.currentTarget.style.background='#FAFBFC'} onClick={()=>act('documento',d.ref)}>
            <div style={{ width:36, height:36, borderRadius:8, background:'linear-gradient(135deg,#1A2F4A,#2A4A6A)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'.7rem', fontWeight:700, color:NAVY, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.ref}</div>
              <div style={{ fontSize:'.55rem', color:'#7a8899' }}>{d.tipo}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
              <span style={{ fontSize:'.5rem', padding:'3px 7px', borderRadius:10, background:d.stColor==='#1A78FF'?'rgba(26,120,255,.13)':'rgba(45,138,48,.13)', color:d.stColor, fontWeight:700, border:`1px solid ${d.stColor}44` }}>{d.st}</span>
              <button onClick={e=>{e.stopPropagation();act('ver_pdf',d.ref)}} style={{ padding:'3px 8px', borderRadius:5, border:'1px solid rgba(232,116,32,.25)', cursor:'pointer', fontSize:'.58rem', fontWeight:700, background:'rgba(232,116,32,.1)', color:ACCENT, fontFamily:'DM Sans' }}>Ver</button>
              <button onClick={e=>{e.stopPropagation();act('exportar',d.ref)}} style={{ padding:'3px 8px', borderRadius:5, border:'1px solid rgba(45,138,48,.25)', cursor:'pointer', fontSize:'.58rem', fontWeight:700, background:'rgba(45,138,48,.08)', color:'#2D8A30', fontFamily:'DM Sans' }}>PDF</button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

function CtrazaScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Trazabilidad" subtitle="Cumplimiento Reg. 178/2002 — Cada lote rastreado por IA" />
      <SearchBar placeholder="Buscar lote o proveedor..." />
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Verificación de lote <IaBadge /></CardTitle>
        <div style={{ padding:14, borderRadius:8, background:'#F0FFF4', border:'1px solid #C6F6D5' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
            <div style={{ width:24, height:24, borderRadius:'50%', background:'#2D8A30', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <span style={{ fontSize:'.72rem', fontWeight:700, color:'#2D8A30' }}>Trazabilidad verificada</span>
          </div>
          <div style={{ fontSize:'.62rem', color:'#3a4a5a', lineHeight:1.8 }}>
            <strong>Lote:</strong> LOT-2026-HT110-0847<br/>
            <strong>Producto:</strong> Harina Ecológica T-110<br/>
            <strong>Fabricante:</strong> Harinas Mediterráneo S.L.<br/>
            <strong>Cert.:</strong> IFS 7.0, BRC A+, Ecológico UE<br/>
            <strong>Alérgenos:</strong> Gluten (sin trazas cruzadas)<br/>
            <strong>Cadena:</strong> Fabricación → Almacén → Transporte → Entrega
          </div>
        </div>
        <IABox text="<strong>Trazabilidad completa:</strong> Cadena verificada desde materia prima hasta entrega. Reg. 178/2002 cumplido. Sin alertas de seguridad alimentaria." />
      </Card>
      <Card>
        <CardTitle>Auditoría proveedores <IaBadge /></CardTitle>
        {[{nom:'Harinas Mediterráneo',cert:'IFS 7.0 · Hasta 12/2026',rating:'A+',color:'#2D8A30',bg:'#F0FFF4',border:'#C6F6D5'},{nom:'Grasas Industriales',cert:'IFS 7.0 · Hasta 09/2026',rating:'A',color:'#1A78FF',bg:'#F0FFF4',border:'#C6F6D5'},{nom:'Congelados Navarra',cert:'BRC · Caduca 14d',rating:'B+',color:'#e8a010',bg:'#FFFBE6',border:'#FDE68A'}].map((p,i)=>(
          <div key={i} onClick={()=>act('auditoria',p.nom)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:10, borderRadius:8, background:p.bg, border:`1px solid ${p.border}`, marginBottom:8, cursor:'pointer' }}>
            <div><div style={{ fontSize:'.7rem', fontWeight:700, color:NAVY }}>{p.nom}</div><div style={{ fontSize:'.58rem', color:'#7a8899' }}>{p.cert}</div></div>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.3rem', fontWeight:900, color:p.color }}>{p.rating}</div>
          </div>
        ))}
        <IABox text="<strong>IA alerta:</strong> Congelados Navarra BRC caduca en 14 días. Sin renovación, afectará a pedidos que requieran certificación BRC. FoodBridge IA puede buscar alternativas automáticamente." />
      </Card>
    </div>
  )
}

function CcomunicaScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Comunicaciones" subtitle="Canal directo con proveedores y agentes" />
      <SearchBar placeholder="Buscar mensaje o agente..." />
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Mensajes recientes</CardTitle>
        {[{ini:'JL',color:ACCENT,bg:'#FFF8F0',border:'rgba(232,116,32,.15)',nom:'José Luis Martínez (Agente)',msg:'3 opciones de margarina que cumplen vuestras especificaciones...',hora:'2h'},{ini:'HM',color:'#1A78FF',bg:'#EEF5FF',border:'#C4DEFF',nom:'Harinas Mediterráneo',msg:'Confirmamos envío lote LOT-2026-HT110-0847 mañana...',hora:'5h'}].map((m,i)=>(
          <div key={i} onClick={()=>act('comunicar',m.nom)} style={{ display:'flex', gap:10, padding:10, borderRadius:8, background:m.bg, border:`1px solid ${m.border}`, marginBottom:8, cursor:'pointer', transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'.65rem', color:'#fff', fontWeight:700 }}>{m.ini}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:'.7rem', fontWeight:700, color:NAVY }}>{m.nom}</div>
              <div style={{ fontSize:'.6rem', color:'#7a8899', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.msg}</div>
            </div>
            <div style={{ fontSize:'.52rem', color:'#7a8899', flexShrink:0 }}>{m.hora}</div>
          </div>
        ))}
      </Card>
      <Card>
        <CardTitle>Nuevo mensaje <IaBadge /></CardTitle>
        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:'.58rem', fontWeight:700, color:'#8A9BB0', letterSpacing:'.14em', textTransform:'uppercase', display:'block', marginBottom:5 }}>Destinatario</label>
          <select style={{ width:'100%', padding:'9px 12px', background:'#FFF8F0', border:'1.5px solid #E8D5C0', borderRadius:8, color:NAVY, fontSize:'.8rem', fontFamily:'DM Sans', outline:'none' }}>
            <option>José Luis Martínez (Agente)</option>
            <option>Harinas Mediterráneo</option>
            <option>Grasas Industriales</option>
          </select>
        </div>
        <div style={{ marginBottom:10 }}>
          <label style={{ fontSize:'.58rem', fontWeight:700, color:'#8A9BB0', letterSpacing:'.14em', textTransform:'uppercase', display:'block', marginBottom:5 }}>Mensaje</label>
          <textarea style={{ width:'100%', padding:'9px 12px', background:'#FFF8F0', border:'1.5px solid #E8D5C0', borderRadius:8, color:NAVY, fontSize:'.8rem', fontFamily:'DM Sans', outline:'none', minHeight:90, resize:'vertical', boxSizing:'border-box' }} placeholder="Escribe tu mensaje o describe lo que necesitas..." />
        </div>
        <button onClick={()=>act('enviar_mensaje','Mensaje')} style={{ width:'100%', padding:11, background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, border:'none', borderRadius:8, color:'#fff', fontFamily:'Barlow Condensed', fontWeight:900, fontSize:'.9rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer' }}>Enviar →</button>
      </Card>
    </div>
  )
}

/* ══ MODAL BUILDER ══ */
function buildModal(type, detail, showToast) {
  const m = {
    alerta:{title:`Alerta`,body:`<div style="padding:10px;border-radius:8px;background:#FFF5F5;border:1px solid rgba(224,48,48,.2);margin-bottom:12px;font-size:.75rem;font-weight:700;color:#e03030">${detail}</div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem">IA recomienda actuar en las próximas 24h.</div>`,actions:[{label:'Gestionar',type:'primary',fn:()=>showToast('✅ Alerta gestionada')},{label:'Cerrar',type:'gray'}]},
    pedido:{title:`Pedido: ${detail}`,body:`<div style="display:flex;flex-direction:column;gap:8px"><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:#F8FAFC"><span style="font-size:.68rem">Referencia</span><span style="font-size:.68rem;font-weight:700;color:#1A2F4A">${detail}</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:#F0FFF4"><span style="font-size:.68rem">Trazabilidad</span><span style="font-size:.68rem;font-weight:700;color:#2D8A30">✓ Reg. 178/2002</span></div></div>`,actions:[{label:'Ver trazabilidad',type:'primary',fn:()=>showToast('📋 Trazabilidad verificada')},{label:'Contactar',type:'blue',fn:()=>showToast('📞 Contactando...')},{label:'Cerrar',type:'gray'}]},
    incidencia:{title:`Gestionar incidencia: ${detail}`,body:`<div style="padding:10px;border-radius:8px;background:#FFF5F5;border:1px solid rgba(224,48,48,.2);margin-bottom:12px"><div style="font-size:.72rem;font-weight:700;color:#e03030;margin-bottom:4px">Retraso 48h detectado</div><div style="font-size:.65rem;color:#3a4a5a">Grasas Industriales notificó incidencia logística. ETA original no cumplida.</div></div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem">IA puede buscar alternativas de entrega urgente o negociar compensación.</div>`,actions:[{label:'Buscar alternativa',type:'primary',fn:()=>showToast('🧠 IA buscando alternativa...')},{label:'Reclamar',type:'blue',fn:()=>showToast('📩 Reclamación enviada')},{label:'Cerrar',type:'gray'}]},
    comparativa:{title:`Comparativa IA: ${detail}`,body:`<table style="width:100%;border-collapse:collapse;font-size:.68rem;margin-bottom:12px"><thead><tr style="background:#1A2F4A"><th style="padding:8px;text-align:left;color:rgba(255,255,255,.6)">Proveedor</th><th style="padding:8px;text-align:center;color:rgba(255,255,255,.6)">Precio</th><th style="padding:8px;text-align:center;color:rgba(255,255,255,.6)">Score</th></tr></thead><tbody><tr style="background:#FFF8F0"><td style="padding:8px;font-weight:700">Grasas Industriales ⭐</td><td style="padding:8px;text-align:center;color:#2D8A30;font-weight:700">2,48€</td><td style="padding:8px;text-align:center;color:#E87420;font-weight:700">94</td></tr><tr><td style="padding:8px">MargaPro Europe</td><td style="padding:8px;text-align:center">2,62€</td><td style="padding:8px;text-align:center;color:#1A78FF;font-weight:700">87</td></tr></tbody></table><div style="padding:10px;background:rgba(232,116,32,.06);border-radius:8px;font-size:.65rem">IA recomienda Grasas Industriales. Ahorro anual: <strong>14.880€</strong></div>`,actions:[{label:'Solicitar pedido',type:'primary',fn:()=>showToast('✅ Pedido solicitado')},{label:'Negociar',type:'blue',fn:()=>showToast('💬 Negociación iniciada')},{label:'Cerrar',type:'gray'}]},
    negociar:{title:`Negociar: ${detail}`,body:`<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:#F8FAFC"><span style="font-size:.68rem">Precio actual</span><span style="font-size:.68rem;font-weight:700">2,62€/kg</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(45,138,48,.06)"><span style="font-size:.68rem">Objetivo IA</span><span style="font-size:.68rem;font-weight:700;color:#2D8A30">2,48€/kg (-5,3%)</span></div></div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem">IA enviará propuesta al proveedor automáticamente.</div>`,actions:[{label:'Enviar propuesta',type:'primary',fn:()=>showToast('✅ Propuesta enviada')},{label:'Cancelar',type:'gray'}]},
    trazabilidad:{title:`Trazabilidad: ${detail}`,body:`<div style="padding:12px;background:#F0FFF4;border-radius:8px;margin-bottom:12px"><div style="font-size:.65rem;font-weight:700;color:#2D8A30;margin-bottom:6px">✓ Cadena verificada — Reg. 178/2002</div><div style="font-size:.62rem;color:#3a4a5a;line-height:1.7">Fabricación → Almacén → Transporte → Entrega<br/>Sin alertas de seguridad alimentaria</div></div>`,actions:[{label:'Exportar PDF',type:'primary',fn:()=>showToast('✅ PDF exportado')},{label:'Cerrar',type:'gray'}]},
    contactar:{title:`Contactar: ${detail}`,body:`<div style="font-size:.72rem;color:#3a4a5a;margin-bottom:12px">Contactar con: <strong>${detail}</strong></div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem">IA redacta el mensaje automáticamente según el contexto.</div>`,actions:[{label:'Llamar',type:'green',fn:()=>showToast('📞 Llamando...')},{label:'WhatsApp',type:'blue',fn:()=>showToast('💬 WhatsApp abierto')},{label:'Email IA',type:'primary',fn:()=>showToast('✉️ Email enviado')},{label:'Cerrar',type:'gray'}]},
    catalogo:{title:`Catálogo: ${detail}`,body:`<div style="font-size:.72rem;color:#3a4a5a;padding:10px;background:#F8FAFC;border-radius:8px">Catálogo completo de <strong>${detail}</strong> con fichas técnicas, alérgenos y precios actualizados en tiempo real.</div>`,actions:[{label:'Ver catálogo',type:'primary',fn:()=>showToast('📚 Catálogo abierto')},{label:'Cerrar',type:'gray'}]},
    documento:{title:`Documento: ${detail}`,body:`<div style="font-size:.72rem;color:#3a4a5a;margin-bottom:12px">Documento oficial: <strong>${detail}</strong></div><div style="padding:10px;background:#F0FFF4;border-radius:8px;font-size:.65rem;color:#2D8A30">✓ Vigente · Verificado por FoodBridge IA</div>`,actions:[{label:'Ver PDF',type:'primary',fn:()=>showToast('📄 PDF abierto')},{label:'Descargar',type:'blue',fn:()=>showToast('✅ PDF descargado')},{label:'Cerrar',type:'gray'}]},
    ver_pdf:{title:`Ver: ${detail}`,body:`<div style="text-align:center;padding:20px"><div style="font-size:.85rem;font-weight:700;color:#1A2F4A;margin-bottom:6px">${detail}</div><div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.65rem">Documento oficial verificado por FoodBridge IA</div></div>`,actions:[{label:'Descargar PDF',type:'primary',fn:()=>showToast('✅ PDF descargado')},{label:'Cerrar',type:'gray'}]},
    exportar:{title:`Exportar`,body:`<div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.68rem;color:#3a4a5a">Exportando: <strong>${detail}</strong></div>`,actions:[{label:'PDF',type:'primary',fn:()=>showToast('✅ PDF descargado')},{label:'Excel',type:'blue',fn:()=>showToast('✅ Excel descargado')},{label:'Cancelar',type:'gray'}]},
    auditoria:{title:`Auditoría: ${detail}`,body:`<div style="font-size:.72rem;color:#3a4a5a;padding:10px;background:#F8FAFC;border-radius:8px">Informe de auditoría de <strong>${detail}</strong> con certificaciones, inspecciones y alertas.</div>`,actions:[{label:'Ver informe',type:'primary',fn:()=>showToast('📋 Informe abierto')},{label:'Cerrar',type:'gray'}]},
    cotizar:{title:`Cotizar: ${detail}`,body:`<div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem">IA enviará solicitud de cotización a todos los proveedores verificados con <strong>${detail}</strong>.</div>`,actions:[{label:'Solicitar cotización',type:'primary',fn:()=>showToast('🧠 Cotización solicitada')},{label:'Cancelar',type:'gray'}]},
    ficha:{title:`Ficha técnica: ${detail}`,body:`<div style="display:flex;flex-direction:column;gap:8px"><div style="padding:8px;background:#F0FFF4;border-radius:8px;font-size:.65rem"><strong>Alérgenos:</strong> Gluten (sin trazas cruzadas)</div><div style="padding:8px;background:#F0FFF4;border-radius:8px;font-size:.65rem"><strong>Certificaciones:</strong> IFS 7.0, BRC A+</div><div style="padding:8px;background:#F0FFF4;border-radius:8px;font-size:.65rem"><strong>Trazabilidad:</strong> ✓ Reg. 178/2002</div></div>`,actions:[{label:'Descargar PDF',type:'primary',fn:()=>showToast('✅ Ficha descargada')},{label:'Cerrar',type:'gray'}]},
    pedido_directo:{title:`Confirmar pedido`,body:`<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(45,138,48,.06)"><span style="font-size:.68rem">Proveedor</span><span style="font-size:.68rem;font-weight:700;color:#2D8A30">Grasas Industriales S.A.</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:#F8FAFC"><span style="font-size:.68rem">Precio</span><span style="font-size:.68rem;font-weight:700;color:#E87420">2,48€/kg</span></div></div>`,actions:[{label:'Confirmar pedido',type:'primary',fn:()=>showToast('✅ Pedido confirmado')},{label:'Cancelar',type:'gray'}]},
    comunicar:{title:`Mensaje: ${detail}`,body:`<div style="font-size:.72rem;color:#3a4a5a;margin-bottom:12px">Comunicación con: <strong>${detail}</strong></div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem">IA redacta automáticamente según el contexto.</div>`,actions:[{label:'WhatsApp',type:'green',fn:()=>showToast('💬 WhatsApp abierto')},{label:'Email',type:'blue',fn:()=>showToast('✉️ Email enviado')},{label:'Cerrar',type:'gray'}]},
    enviar_mensaje:{title:'Mensaje enviado',body:`<div style="padding:12px;background:#F0FFF4;border-radius:8px;font-size:.72rem;color:#2D8A30;font-weight:700;text-align:center">✓ Mensaje enviado correctamente</div>`,actions:[{label:'Cerrar',type:'gray'}]},
  }
  return m[type]||{title:'FoodBridge IA',body:`<div style="font-size:.75rem;color:#3a4a5a;padding:10px">🧠 ${detail||type}</div>`,actions:[{label:'Cerrar',type:'gray'}]}
}

/* ══ DATA ══ */
const ALERTS = [
  {dot:'#e03030',text:'Pedido PED-2026-412 retrasado 48h — Harinas Mediterráneo notificó incidencia logística',time:'Hace 1h'},
  {dot:'#e8a010',text:'Certificación BRC de Congelados Navarra caduca en 14 días',time:'Hace 2h'},
  {dot:'#2D8A30',text:'Cotización COT-2026-098 recibida: Margarina Profesional -18°C (3 opciones)',time:'Hace 3h'},
  {dot:'#1A78FF',text:'IA detectó nuevo proveedor de harina ecológica T-110 con IFS 7.0',time:'Hace 4h'},
  {dot:'#2D8A30',text:'Pedido PED-2026-408 entregado — Trazabilidad completa verificada',time:'Hoy'},
  {dot:'#e8a010',text:'Nuevo Reg. 2025/847: 3 productos afectados en tu catálogo habitual',time:'Ayer'},
]

const PUSH_MSGS = [
  {bar:ACCENT,label:'COTIZACIÓN LISTA',text:'3 opciones de Margarina -18°C listas. IA recomienda opción B: Grasas Industriales.'},
  {bar:'#2D8A30',label:'PEDIDO ENTREGADO',text:'PED-2026-408 recibido. Trazabilidad Reg. 178/2002 verificada.'},
  {bar:'#1A78FF',label:'NUEVO PROVEEDOR',text:'Harinas del Norte cumple todos tus requisitos: IFS 7.0, sin alérgenos cruzados.'},
  {bar:'#e8a010',label:'ALERTA NORMATIVA',text:'Reg. 2025/847: límite acrilamida afecta Harina Repostera H-200. IA buscando alternativas...'},
]

const NAV = [
  {id:'cdash',section:'Compras',label:'Mi Panel',ia:true,icon:'<rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>'},
  {id:'cbuscar',label:'Buscar Productos',ia:true,icon:'<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'},
  {id:'cpedidos',label:'Mis Pedidos',icon:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'},
  {id:'ccotiza',section:'Gestión',label:'Cotizaciones',ia:true,icon:'<path d="M21 8a9 9 0 1 0 0 8"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="16" x2="13" y2="16"/>'},
  {id:'cprovee',label:'Mis Proveedores',icon:'<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>'},
  {id:'ctraza',label:'Trazabilidad',ia:true,icon:'<polyline points="20 6 9 17 4 12"/>'},
  {id:'ccomunica',label:'Comunicaciones',icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
]

const SCREENS = {cdash:CdashScreen,cbuscar:CbuscarScreen,cpedidos:CpedidosScreen,ccotiza:CcotizaScreen,cprovee:CproveeScreen,ctraza:CtrazaScreen,ccomunica:CcomunicaScreen}

/* ══ MAIN ══ */
export default function ClientePage() {
  const { signOut, profile } = useApp()
  const [active, setActive] = useState('cdash')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [push, setPush] = useState(null)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [readAlerts, setReadAlerts] = useState(new Set())
  const { toast, showToast } = useToast()
  const contentRef = useRef(null)

  const { pedidos: cliPedidos } = usePedidos({ profile })
  const { cotizaciones: cliCotiz } = useCotizaciones({ profile })
  const { alertas: aiAlerts } = useAlertasIa({
    role: 'cliente',
    data: {
      pedidos: cliPedidos.length,
      pedidos_en_transito: cliPedidos.filter(p=>p.status==='in_transit').length,
      pedidos_retrasados: cliPedidos.filter(p=>p.expected_date && new Date(p.expected_date) < new Date() && p.status!=='delivered' && p.status!=='cancelled').length,
      cotizaciones_pendientes: cliCotiz.filter(c=>c.status==='sent').length,
      cotizaciones_recientes: cliCotiz.slice(0,4).map(c=>({ ref:c.ref, status:c.status, producto:c.product_name })),
    },
  })
  // Normaliza alertas IA {sec, tipo, txt} al shape que espera AlertsModal {dot, text, time}
  const ALERT_DOT = { red:'#e03030', amber:'#e8a010', green:'#2D8A30', blue:'#1A78FF' }
  const mappedAi = aiAlerts.map(a => ({ dot: ALERT_DOT[a.tipo] || '#1A78FF', text: a.txt, time: a.sec }))
  const displayAlerts = mappedAi.length > 0 ? mappedAi : ALERTS
  const unreadCount = displayAlerts.filter((_,i)=>!readAlerts.has(i)).length

  const { mensajes: aiPushes } = usePushIa({
    role: 'cliente',
    data: {
      pedidos: cliPedidos.length,
      pedidos_en_transito: cliPedidos.filter(p=>p.status==='in_transit').length,
      cotizaciones_pendientes: cliCotiz.filter(c=>c.status==='sent').length,
    },
  })
  const pushPool = aiPushes.length > 0 ? aiPushes : PUSH_MSGS
  const pushPoolRef = useRef(pushPool)
  pushPoolRef.current = pushPool
  const closeModal = useCallback(()=>setModal(null),[])
  const changeSection = useCallback((id)=>{setActive(id);setSidebarOpen(false);setTimeout(()=>{if(contentRef.current)contentRef.current.scrollTop=0},0)},[])
  const act = useCallback((type,detail)=>{ if(type==='toast'){showToast(detail);return} if(type==='goto'){changeSection(detail);return} setModal(buildModal(type,detail,showToast)) },[showToast,changeSection])

  useEffect(()=>{
    let idx=0
    const show=()=>{const pool=pushPoolRef.current;if(!pool||pool.length===0)return;setPush(pool[idx%pool.length]);idx++;setTimeout(()=>setPush(null),5000)}
    const t1=setTimeout(show,20000); const t2=setInterval(show,15000)
    return()=>{clearTimeout(t1);clearInterval(t2)}
  },[])

  const Screen = SCREENS[active]||CdashScreen

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
            {item.label}
            {item.ia&&<span style={{ marginLeft:'auto', padding:'2px 5px', borderRadius:10, fontSize:'.52rem', fontWeight:700, background:'rgba(232,116,32,.1)', color:ACCENT, border:'1px solid rgba(232,116,32,.2)', whiteSpace:'nowrap' }}>IA</span>}
          </button>
        </div>
      ))}
      <div style={{ marginTop:'auto', borderTop:'1px solid #F0E4D6', paddingTop:10 }}>
        <button onClick={signOut} style={{ width:'100%', textAlign:'left', padding:'8px 10px', background:'transparent', border:'1px solid transparent', borderRadius:7, fontSize:'.7rem', color:'#7a8899', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontFamily:'DM Sans,sans-serif' }}
          onMouseEnter={e=>{e.currentTarget.style.background='#FEF0F0';e.currentTarget.style.color='#e03030'}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#7a8899'}}>
          ↩ Cerrar sesión
        </button>
      </div>
    </>
  )

  return (
    <div style={{ display:'flex', height:'100%', overflow:'hidden', background:'#FFF8F0' }}>
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
              <span className="fab-topbar-logo" style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:900, color:NAVY, whiteSpace:'nowrap' }}>Food<span style={{ color:ACCENT }}>Bridge IA</span></span>
            </div>
            <span className="fab-topbar-tagline" style={{ fontSize:'.68rem', color:'#7a8899', fontStyle:'italic', whiteSpace:'nowrap' }}>"Compras inteligentes con IA"</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <span className="fab-topbar-rolebadge" style={{ padding:'3px 10px', borderRadius:20, fontSize:'.62rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', background:'#EEF5FF', color:'#1A78FF', border:'1px solid rgba(26,120,255,.25)', whiteSpace:'nowrap' }}>Cliente</span>
            <div onClick={()=>setAlertsOpen(v=>!v)} style={{ position:'relative', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a8899" strokeWidth="2" strokeLinecap="round" style={{ transition:'transform .2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='rotate(20deg)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount>0&&<div style={{ position:'absolute', top:-6, right:-8, background:'#e03030', color:'#fff', fontSize:'.52rem', fontWeight:800, borderRadius:10, minWidth:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', border:'2px solid #fff' }}>{unreadCount}</div>}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.72rem', color:'#3a4a5a' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#1A78FF,#378ADD)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.6rem', fontWeight:700, color:'#fff', flexShrink:0 }}>PL</div>
              <span className="fab-topbar-user-name" style={{ whiteSpace:'nowrap' }}>Panaderías Leopold S.L.</span>
            </div>
            <button onClick={signOut} style={{ padding:'4px 10px', border:'1px solid #E8D5C0', borderRadius:20, background:'transparent', color:'#7a8899', fontSize:'.65rem', cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}
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
      <Toast msg={toast}/>
      {push&&<PushNotif msg={push} onClose={()=>setPush(null)}/>}
      {alertsOpen&&<AlertsModal alerts={displayAlerts} onClose={()=>setAlertsOpen(false)} readSet={readAlerts} onMarkRead={i=>setReadAlerts(s=>new Set([...s,i]))}/>}
    </div>
  )
}
