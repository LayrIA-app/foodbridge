import { useState, useEffect, useCallback, useRef } from 'react'
import { useApp } from '../../context/AppContext'

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
      const e = 1 - Math.pow(1-p, 3)
      setCount(Math.round(num * e))
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
    <div onClick={onClose} style={{ position:'fixed', bottom:80, right:16, width:'min(320px, calc(100vw - 32px))', background:NAVY, borderRadius:12, padding:'14px 16px', boxShadow:'0 8px 32px rgba(26,47,74,.4)', display:'flex', gap:10, alignItems:'flex-start', zIndex:9999, cursor:'pointer', animation:'modalIn .3s ease both' }}>
      <div style={{ width:3, borderRadius:2, flexShrink:0, alignSelf:'stretch', background:msg.bar }} />
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'.48rem', fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:'rgba(255,255,255,.35)', marginBottom:3 }}>{msg.label}</div>
        <div style={{ fontSize:'.72rem', color:'rgba(255,255,255,.9)', lineHeight:1.5 }}>{msg.text}</div>
      </div>
    </div>
  )
}

function Badge({ type, text }) {
  const s = { ok:{bg:'#EBF5EF',color:'#2D8A30',border:'#C6F6D5'}, red:{bg:'#FDECEA',color:'#e03030',border:'#F1A9A0'}, amber:{bg:'#FDF3E7',color:'#e8a010',border:'#F0C06A'}, blue:{bg:'#EEF5FF',color:'#1A78FF',border:'#B5D4F4'}, orange:{bg:'#FFF3E8',color:'#E87420',border:'rgba(232,116,32,.3)'} }[type] || {bg:'#F0E6D9',color:NAVY,border:'#E8D5C0'}
  return <span style={{ display:'inline-block', padding:'2px 9px', borderRadius:20, fontSize:'.6rem', fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:'nowrap' }}>{text}</span>
}

function KPI({ val, label, delta, up, color=ACCENT }) {
  const num = parseFloat(String(val).replace(/[^0-9.]/g,''))
  const animated = useCountUp(num)
  const suffix = String(val).replace(/^[^a-zA-Z€%+]*/, '').replace(/^[0-9.,]+/,'')
  const prefix = String(val).match(/^[€+]*/)?.[0] || ''
  const display = num ? `${prefix}${animated.toLocaleString('es-ES')}${suffix}` : val
  return (
    <div style={{ background:'linear-gradient(160deg,#fff,#FFFBF5)', border:'1px solid rgba(232,116,32,.15)', borderRadius:11, padding:'14px 16px', boxShadow:'0 2px 16px rgba(26,47,74,.07)', position:'relative', overflow:'hidden', transition:'transform .28s,box-shadow .28s', cursor:'default' }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 36px rgba(26,47,74,.13)'}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 2px 16px rgba(26,47,74,.07)'}}>

      <div style={{ fontSize:'.65rem', color:'#7a8899', marginBottom:4 }}>{label}</div>
      <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.45rem', fontWeight:800, color, marginBottom:3 }}>{display}</div>
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
    <div style={{ background:'linear-gradient(160deg,#fff,#FFFBF5)', border:'1px solid #E8D5C0', borderRadius:11, padding:'14px 16px', boxShadow:'0 2px 16px rgba(26,47,74,.07)', transition:'all .28s', ...style }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow='0 12px 36px rgba(26,47,74,.1)';e.currentTarget.style.transform='translateY(-2px)'}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow='0 2px 16px rgba(26,47,74,.07)';e.currentTarget.style.transform=''}}>
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
  useEffect(() => { const t = setInterval(()=>setI(v=>(v+1)%msgs.length), 4000); return ()=>clearInterval(t) }, [msgs.length])
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

function Pbar({ label, val, pct, color=ACCENT }) {
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontSize:'.68rem', marginBottom:3, flexWrap:'wrap', gap:2 }}>
        <span style={{ fontWeight:600, color:NAVY }}>{label}</span>
        <span style={{ color, fontWeight:700 }}>{val}</span>
      </div>
      <div style={{ height:5, background:'#F0E4D6', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg,${color},#F5A623)`, width:`${pct}%`, transition:'width 1.2s cubic-bezier(.4,0,.2,1)' }} />
      </div>
    </div>
  )
}

function TblBtn({ type, children, onClick }) {
  const s = { orange:{bg:'rgba(232,116,32,.1)',color:ACCENT,border:'1px solid rgba(232,116,32,.25)'}, red:{bg:'rgba(224,48,48,.08)',color:'#e03030',border:'1px solid rgba(224,48,48,.2)'}, green:{bg:'rgba(45,138,48,.08)',color:'#2D8A30',border:'1px solid rgba(45,138,48,.2)'}, blue:{bg:'rgba(26,120,255,.08)',color:'#1A78FF',border:'1px solid rgba(26,120,255,.2)'} }[type]||{}
  return <button onClick={onClick} style={{ padding:'3px 8px', borderRadius:5, border:s.border, cursor:'pointer', fontSize:'.58rem', fontWeight:700, background:s.bg, color:s.color, fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}>{children}</button>
}

function BtnSm({ children, outline, onClick }) {
  return <button onClick={onClick} style={{ padding:'6px 12px', borderRadius:7, border:outline?`1.5px solid rgba(232,116,32,.4)`:'none', cursor:'pointer', fontSize:'.64rem', fontWeight:700, fontFamily:'DM Sans,sans-serif', background:outline?'transparent':`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:outline?ACCENT:'#fff', whiteSpace:'nowrap' }}>{children}</button>
}

function PageHdr({ title, subtitle, badge }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2, flexWrap:'wrap', gap:6 }}>
        <h2 style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:NAVY }}>{title}</h2>
        {badge && <Badge type="orange" text={badge} />}
      </div>
      {subtitle && <p style={{ fontSize:'.72rem', color:'#7a8899' }}>{subtitle}</p>}
    </div>
  )
}

function ScrollTable({ children }) {
  return <div style={{ overflowX:'auto', WebkitOverflowScrolling:'touch', borderRadius:8, width:'100%', display:'block' }}><table style={{ width:'100%', borderCollapse:'collapse', fontSize:'.65rem', tableLayout:'auto' }}>{children}</table></div>
}

function Thead({ cols }) {
  return <thead><tr style={{ background:NAVY }}>{cols.map(c=><th key={c} style={{ fontSize:'.58rem', fontWeight:700, color:'rgba(255,255,255,.55)', textTransform:'uppercase', letterSpacing:'.08em', padding:'8px 10px', textAlign:'left', whiteSpace:'nowrap' }}>{c}</th>)}</tr></thead>
}

/* ══ SCREENS ══ */
function DashboardCEO({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Dashboard CEO" subtitle="Visión estratégica de negocio — datos actualizados por IA en tiempo real" badge="Abril 2026" />
      <SearchBar placeholder="Buscar producto, alerta o canal..." />
      <LiveTicker msgs={['Analizando rendimiento de 1.247 fichas técnicas...','99.2% precisión IA — máximo histórico','3 agentes cerraron operaciones hoy','Alerta: IFS Food v8 caduca en 30 días']} />

      <div className="grid-4 mb14">
        <KPI val="1.247" label="Fichas publicadas" delta="▲ +156 este trimestre" up color={ACCENT}/>
        <KPI val="847k€" label="Ventas Q1 2026" delta="▲ +38% vs Q1 2025" up color="#2D8A30"/>
        <KPI val="23" label="Agentes conectados" delta="▲ +5 nuevos" up color="#1A78FF"/>
        <KPI val="99.2%" label="Precisión IA" delta="▲ Máximo histórico" up color="#e8a010"/>
      </div>

      <div className="grid-2 mb14">
        <Card>
          <CardTitle>Ventas por canal <IaBadge /></CardTitle>
          <Pbar label="Agentes B2B" val="487.000€" pct={68} color="#2D8A30"/>
          <Pbar label="Venta directa" val="234.000€" pct={42} color="#1A78FF"/>
          <Pbar label="Marketplace" val="126.000€" pct={24} color={ACCENT}/>
          <IABox text="<strong>IA predice:</strong> Canal B2B crecerá un 45% en Q2. <strong>Proyección anual: 3.4M€</strong>." />
        </Card>
        <Card>
          <CardTitle>Resumen financiero Q1</CardTitle>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {[{val:'847k€',label:'Ingresos',color:'#2D8A30',bg:'rgba(45,138,48,.06)'},{val:'22%',label:'Margen bruto',color:ACCENT,bg:'rgba(232,116,32,.06)'},{val:'186k€',label:'Beneficio neto',color:'#1A78FF',bg:'rgba(26,120,255,.06)'}].map((f,i)=>(
              <div key={i} style={{ flex:'1 1 80px', textAlign:'center', padding:12, borderRadius:8, background:f.bg }}>
                <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.3rem', fontWeight:900, color:f.color }}>{f.val}</div>
                <div style={{ fontSize:'.56rem', color:'#7a8899', textTransform:'uppercase', letterSpacing:'.06em', marginTop:3 }}>{f.label}</div>
              </div>
            ))}
          </div>
          <IABox text="<strong>Proyección IA:</strong> Cerrarás 2026 con <strong>3.4M€ de ingresos</strong> y <strong>748k€ de beneficio neto</strong>." />
          <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
            <BtnSm onClick={()=>act('exportar','Informe CEO Q1 2026')}>Exportar PDF</BtnSm>
            <BtnSm outline onClick={()=>act('simular','Proyección anual')}>Simular anual</BtnSm>
          </div>
        </Card>
      </div>

      <div className="grid-2 mb14">
        <Card>
          <CardTitle>Alertas CEO <IaBadge /></CardTitle>
          {[{type:'red',title:'3 certificaciones IFS caducan en 30 días',sub:'Acción requerida antes del 19 de mayo',a:'goto',d:'fcerts'},{type:'amber',title:'Reg. 2025/847 — nuevos límites acrilamida',sub:'14 fichas afectadas. IA las ha marcado.',a:'alerta',d:'Revisar fichas Reg. 2025/847'},{type:'ok',title:'99.2% precisión IA — máximo histórico',sub:'Algoritmo de extracción mejorado este mes'},{type:'blue',title:'2 nuevos agentes incorporados',sub:'Zona Norte y Portugal operativos'}].map((al,i)=>{
            const c={red:{bg:'#FDECEA',border:'#F1A9A0',t:'#e03030'},amber:{bg:'#FDF3E7',border:'#F0C06A',t:'#e8a010'},ok:{bg:'#EBF5EF',border:'#90D4A8',t:'#2D8A30'},blue:{bg:'#EEF5FF',border:'#B5D4F4',t:'#1A78FF'}}[al.type]
            return <div key={i} onClick={()=>al.a&&(al.a==='goto'?act('goto',al.d):act(al.a,al.d))} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:8, padding:'9px 12px', marginBottom:7, cursor:al.a?'pointer':'default' }}><div style={{ fontSize:'.72rem', fontWeight:700, color:c.t, marginBottom:2 }}>{al.title}</div><div style={{ fontSize:'.65rem', color:'#3a4a5a' }}>{al.sub}</div></div>
          })}
        </Card>
        <Card>
          <CardTitle>Productos más solicitados <IaBadge /></CardTitle>
          <ScrollTable>
            <Thead cols={['Producto','Sol.','Conv.','Tend.']}/>
            <tbody>
              {[['Harina W-280','342','ok:87%','▲ +22%'],['Harina W-380','198','ok:82%','▲ +15%'],['Sémola','156','amber:74%','▼ -0.8%'],['H. Integral','134','ok:91%','▲ +31%']].map(([p,s,c,t],i)=>{const[ct,cv]=c.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}><td style={{ padding:'8px 10px', fontWeight:600, color:NAVY }}>{p}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{s}</td><td style={{ padding:'8px 10px' }}><Badge type={ct} text={cv}/></td><td style={{ padding:'8px 10px', color:t.includes('▲')?'#2D8A30':'#e03030', fontWeight:700 }}>{t}</td></tr>)})}
            </tbody>
          </ScrollTable>
        </Card>
      </div>
    </div>
  )
}

function VentasCanal({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Ventas por Canal" subtitle="Análisis detallado de rendimiento por canal de distribución" />
      <SearchBar placeholder="Buscar canal, zona o mes..." />
      <div className="grid-3 mb14">
        <KPI val="487k€" label="Canal B2B (Agentes)" delta="▲ 57% del total" up color="#2D8A30"/>
        <KPI val="234k€" label="Venta directa" delta="▲ 28% del total" up color="#1A78FF"/>
        <KPI val="126k€" label="Marketplace" delta="▲ 15% del total" up color={ACCENT}/>
      </div>
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Evolución mensual por canal</CardTitle>
        <ScrollTable>
          <Thead cols={['Mes','B2B Agentes','Venta directa','Marketplace','Total']}/>
          <tbody>
            {[['Enero','148.000€','72.000€','38.000€','258.000€'],['Febrero','162.000€','78.000€','42.000€','282.000€'],['Marzo','177.000€','84.000€','46.000€','307.000€']].map(([mes,...c],i)=>(
              <tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{mes}</td>
                {c.slice(0,3).map((v,j)=><td key={j} style={{ padding:'8px 10px', color:'#3a4a5a' }}>{v}</td>)}
                <td style={{ padding:'8px 10px', fontWeight:700, color:ACCENT }}>{c[3]}</td>
              </tr>
            ))}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>Tendencia IA:</strong> Canal B2B crece un 9.8% mensual. <strong>Marketplace es el canal con mayor crecimiento relativo (+10.5%/mes).</strong>" />
      </Card>
      <Card>
        <CardTitle>Rendimiento por zona geográfica <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Zona','Agente','Q1 Real','Objetivo','Cumplim.','Estado','Acción']}/>
          <tbody>
            {[['Levante','J.L. Martínez','124.8k€','118k€','ok:105.8%','ok:Top'],['Cataluña','A. García','98.4k€','95k€','ok:103.6%','ok:Top'],['Andalucía','C. Ruiz','72.3k€','78k€','amber:92.7%','amber:OK'],['Portugal','M. Santos','56.2k€','48k€','ok:117.1%','ok:★ Nuevo'],['Baleares','P. Almeida','34.1k€','52k€','red:65.6%','red:Apoyo']].map(([z,ag,r,o,cum,est],i)=>{const[ct,cv]=cum.split(':');const[et,ev]=est.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}><td style={{ padding:'8px 10px', fontWeight:700, color:NAVY, whiteSpace:'nowrap' }}>{z}</td><td style={{ padding:'8px 10px', color:'#3a4a5a', whiteSpace:'nowrap' }}>{ag}</td><td style={{ padding:'8px 10px', fontWeight:700, color:'#2D8A30' }}>{r}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{o}</td><td style={{ padding:'8px 10px' }}><Badge type={ct} text={cv}/></td><td style={{ padding:'8px 10px' }}><Badge type={et} text={ev}/></td><td style={{ padding:'8px 10px' }}><TblBtn type={et==='red'?'red':'orange'} onClick={()=>act('ver',`Zona ${z}`)}>Ver</TblBtn></td></tr>)})}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>IA detecta:</strong> La zona Centro (Madrid) no tiene cobertura. <strong>Potencial no capturado: 214k€ anuales.</strong>" />
        <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
          <BtnSm onClick={()=>act('simular','Expansión zona Centro Madrid')}>Simular expansión</BtnSm>
          <BtnSm outline onClick={()=>act('exportar','Informe zonas geográficas')}>Exportar</BtnSm>
        </div>
      </Card>
    </div>
  )
}

function Rentabilidad({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Rentabilidad" subtitle="Análisis de márgenes y rentabilidad por producto — calculado por IA" />
      <div className="grid-4 mb14">
        <KPI val="22%" label="Margen bruto medio" delta="▲ +2pp vs Q1 2025" up color={ACCENT}/>
        <KPI val="186k€" label="Beneficio neto Q1" delta="▲ +41% vs Q1 2025" up color="#2D8A30"/>
        <KPI val="18%" label="Prod. más rentable" delta="Harina W-380" color="#1A78FF"/>
        <KPI val="3" label="Productos a revisar" delta="Margen < 10%" color="#e03030"/>
      </div>
      <Card>
        <CardTitle>Margen por producto <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Producto','Precio venta','Coste','Margen €','Margen %','Estado','Acción']}/>
          <tbody>
            {[['Harina W-380','1,15€/kg','0,94€/kg','0,21€','18,3%','ok'],['H. Integral T-150','1,28€/kg','1,05€/kg','0,23€','18,0%','ok'],['Harina W-280','0,85€/kg','0,70€/kg','0,15€','17,6%','ok'],['H. Ecológica','1,33€/kg','1,15€/kg','0,18€','13,5%','amber'],['Sémola Duro','0,81€/kg','0,74€/kg','0,07€','8,6%','red']].map(([p,pv,co,me,mp,st],i)=>(
              <tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                <td style={{ padding:'8px 10px', fontWeight:600, color:NAVY, whiteSpace:'nowrap' }}>{p}</td>
                <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{pv}</td>
                <td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{co}</td>
                <td style={{ padding:'8px 10px', fontWeight:700, color:'#2D8A30' }}>{me}</td>
                <td style={{ padding:'8px 10px' }}><Badge type={st} text={mp}/></td>
                <td style={{ padding:'8px 10px' }}><Badge type={st} text={st==='ok'?'OK':st==='amber'?'Revisar':'Urgente'}/></td>
                <td style={{ padding:'8px 10px' }}><TblBtn type={st==='red'?'red':st==='amber'?'orange':'green'} onClick={()=>act(st==='red'?'revisar':'aprobar',p)}>{st==='red'?'Revisar':'Optimizar'}</TblBtn></td>
              </tr>
            ))}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>IA recomienda:</strong> Sémola Trigo Duro tiene un margen del 8.6%. Subir precio a 0,87€/kg (+7%) mejoraría el margen al 14.9%." />
        <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
          <BtnSm onClick={()=>act('aplicar','Optimización de precios IA')}>Aplicar optimización IA</BtnSm>
          <BtnSm outline onClick={()=>act('exportar','Informe rentabilidad')}>Exportar PDF</BtnSm>
        </div>
      </Card>
    </div>
  )
}

function SimuladorIA({ act }) {
  const [pct, setPct] = useState(5)
  const ingreso = Math.round(847 * pct / 100)
  const churn = (pct * 0.64).toFixed(1)
  const margen = Math.round(22 + pct)
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Simulador IA" subtitle="Simula escenarios de negocio y obtén proyecciones en segundos" />
      <div className="grid-2 mb14">
        <Card>
          <CardTitle>¿Qué pasa si añado 3 agentes nuevos? <IaBadge /></CardTitle>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:6 }}>Zonas sin cobertura:</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {['Madrid Centro','País Vasco','Galicia','Canarias'].map(z=>(
                <span key={z} onClick={()=>act('simular',`Agente en ${z}`)} style={{ padding:'4px 10px', borderRadius:20, background:'#E8F0FE', border:'1px solid #C4DEFF', fontSize:'.6rem', color:'#1A78FF', cursor:'pointer' }}>{z}</span>
              ))}
            </div>
          </div>
          <div style={{ padding:12, borderRadius:8, background:'rgba(45,138,48,.06)', border:'1px solid rgba(45,138,48,.15)', marginBottom:10 }}>
            <div style={{ fontSize:'.6rem', fontWeight:700, color:'#2D8A30', marginBottom:8 }}>📈 Proyección con 3 agentes nuevos:</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[{val:'+642k€',label:'Ingresos add.',color:'#2D8A30'},{val:'+141k€',label:'Contrib. neta',color:ACCENT},{val:'5.1x',label:'ROI',color:'#1A78FF'}].map((r,i)=>(
                <div key={i} style={{ flex:'1 1 70px', textAlign:'center', padding:8, borderRadius:8, background:'#fff' }}>
                  <div style={{ fontFamily:'Barlow Condensed', fontSize:'.95rem', fontWeight:900, color:r.color }}>{r.val}</div>
                  <div style={{ fontSize:'.5rem', color:'#7a8899' }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <BtnSm onClick={()=>act('simular','Contratar 3 agentes nuevos')}>Simular contratación</BtnSm>
            <BtnSm outline onClick={()=>act('exportar','Informe simulador')}>Exportar</BtnSm>
          </div>
        </Card>
        <Card>
          <CardTitle>¿Qué pasa si subo precios un {pct}%? <IaBadge /></CardTitle>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontSize:'.6rem', color:'#7a8899', marginBottom:4 }}>Ajuste simulado: <strong>+{pct}%</strong></div>
            <input type="range" min="1" max="15" value={pct} onChange={e=>setPct(Number(e.target.value))} style={{ width:'100%', accentColor:ACCENT }} />
          </div>
          <div style={{ padding:12, borderRadius:8, background:'rgba(232,116,32,.06)', border:'1px solid rgba(232,116,32,.15)', marginBottom:10 }}>
            <div style={{ fontSize:'.6rem', fontWeight:700, color:ACCENT, marginBottom:8 }}>📊 Impacto estimado con +{pct}%:</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {[{val:`+${ingreso}k€`,label:'Ingresos add.',color:'#2D8A30'},{val:`-${churn}%`,label:'Riesgo churn',color:'#9B59B6'},{val:`+${margen}%`,label:'Nuevo margen',color:ACCENT}].map((r,i)=>(
                <div key={i} style={{ flex:'1 1 70px', textAlign:'center', padding:8, borderRadius:8, background:'#fff' }}>
                  <div style={{ fontFamily:'Barlow Condensed', fontSize:'.95rem', fontWeight:900, color:r.color }}>{r.val}</div>
                  <div style={{ fontSize:'.5rem', color:'#7a8899' }}>{r.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <BtnSm onClick={()=>act('aplicar',`Subida de precio +${pct}%`)}>Aplicar al catálogo</BtnSm>
            <BtnSm outline onClick={()=>act('notificar','Agentes subida precio')}>Notificar agentes</BtnSm>
          </div>
        </Card>
      </div>
      <Card>
        <CardTitle>Escenarios estratégicos comparados <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Escenario','Inversión','Ingresos +12m','ROI','Riesgo','Recomendación IA']}/>
          <tbody>
            {[['+ 3 agentes nuevos','54k€','+642k€','5.1x','ok:Bajo','★ Top recomendado','#2D8A30'],['Subir precio +5%','0€','+42k€','∞','blue:Medio','Ejecutar si churn <5%','#1A78FF'],['Certificación ecológica EU','28k€','+180k€','6.4x','blue:Medio','Priorizar Q2','#9B59B6'],['Ampliar catálogo 200 SKUs','35k€','+124k€','3.5x','amber:Medio-alto','Evaluar Q3','#e8a010'],['Marketplace propio','120k€','+380k€','3.2x','red:Alto','Solo si Q2 cumple','#e03030']].map(([esc,inv,ing,roi,ris,rec,rc],i)=>{const[rt,rv]=ris.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''} onClick={()=>act('simular',esc)}><td style={{ padding:'8px 10px', fontWeight:700, color:NAVY, whiteSpace:'nowrap' }}>{esc}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{inv}</td><td style={{ padding:'8px 10px', fontWeight:700, color:'#2D8A30' }}>{ing}</td><td style={{ padding:'8px 10px', fontWeight:700, color:'#1A78FF' }}>{roi}</td><td style={{ padding:'8px 10px' }}><Badge type={rt} text={rv}/></td><td style={{ padding:'8px 10px', fontWeight:700, color:rc }}>{rec}</td></tr>)})}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>IA recomienda ejecutar ahora:</strong> 1) Agente Madrid Centro (+214k€), 2) Certificación ecológica EU (6.4x ROI), 3) Precio +5% en Q3. Proyectan <strong>+836k€ en 12 meses</strong>." />
      </Card>
    </div>
  )
}

function Catalogo({ act }) {
  return (
    <div className="animate-fadeIn">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12, flexWrap:'wrap', gap:8 }}>
        <div>
          <h2 style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:NAVY }}>Catálogo de Productos</h2>
          <p style={{ fontSize:'.72rem', color:'#7a8899' }}>1.247 productos publicados en FoodBridge IA</p>
        </div>
        <button onClick={()=>act('goto','osubir')} style={{ padding:'8px 14px', background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, border:'none', borderRadius:8, color:'#fff', fontSize:'.7rem', fontWeight:700, cursor:'pointer', whiteSpace:'nowrap' }}>+ Subir documento</button>
      </div>
      <SearchBar placeholder="Buscar categoría o producto..." />
      <div className="grid-4 mb14">
        <KPI val="1.247" label="Productos activos" delta="▲ Todos con ficha IA" up color={ACCENT}/>
        <KPI val="8" label="Categorías" delta="→ Harinas, sémolas..." color="#2D8A30"/>
        <KPI val="47" label="Por actualizar" delta="▼ Revisión pendiente" color="#1A78FF"/>
        <KPI val="12" label="Nuevos este mes" delta="▲ Indexados por IA" up color="#e8a010"/>
      </div>
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Productos por categoría</CardTitle>
        <ScrollTable>
          <Thead cols={['Categoría','Productos','Con ficha IA','Solicitudes Q1','Acción']}/>
          <tbody>
            {[['Harinas panificación','342','ok:342','1.240'],['Harinas repostería','198','ok:198','670'],['Harinas ecológicas','87','ok:87','480'],['Sémolas','156','ok:156','320'],['Mezclas y mejorantes','234','blue:228','510'],['Otros','230','blue:224','180']].map(([cat,prod,ficha,sol],i)=>{const[ft,fv]=ficha.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}><td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{cat}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{prod}</td><td style={{ padding:'8px 10px' }}><Badge type={ft} text={fv}/></td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{sol}</td><td style={{ padding:'8px 10px' }}><TblBtn type="orange" onClick={()=>act('goto','ofichas')}>Ver fichas</TblBtn></td></tr>)})}
          </tbody>
        </ScrollTable>
      </Card>
      <Card>
        <CardTitle>Fichas técnicas recientes <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Producto','Ref.','Alérgenos','Certificaciones','Estado','Acción']}/>
          <tbody>
            {[['Harina W-280','HM-W280-25','Gluten','IFS Food v8, BRC','ok:Publicada'],['Harina W-380','HM-W380-25','Gluten','IFS Food v8','ok:Publicada'],['Sémola Duro','HM-STD-25','Gluten','IFS Food v8','amber:Revisión'],['H. Integral T-150','HM-INT-25','Gluten','BRC Grade A','ok:Publicada']].map(([p,ref,al,cert,st],i)=>{const[ct,cv]=st.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''} onClick={()=>act('PDF',p)}><td style={{ padding:'8px 10px', fontWeight:600, color:NAVY, whiteSpace:'nowrap' }}>{p}</td><td style={{ padding:'8px 10px', color:'#7a8899', fontSize:'.62rem' }}>{ref}</td><td style={{ padding:'8px 10px', color:'#e03030', fontSize:'.62rem', fontWeight:600 }}>{al}</td><td style={{ padding:'8px 10px', fontSize:'.62rem', color:'#2D8A30' }}>{cert}</td><td style={{ padding:'8px 10px' }}><Badge type={ct} text={cv}/></td><td style={{ padding:'8px 10px' }}><TblBtn type={ct==='amber'?'orange':'green'} onClick={e=>{e.stopPropagation();act(ct==='amber'?'revisar':'PDF',p)}}>{ct==='amber'?'Revisar':'Ver PDF'}</TblBtn></td></tr>)})}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>FoodBridge IA:</strong> Todas las fichas cumplen con el Reglamento 1169/2011. 14 alérgenos declarados, valores nutricionales y microbiológicos verificados." />
      </Card>
    </div>
  )
}

function Certificaciones({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Certificaciones" subtitle="Gestión y seguimiento de certificaciones GFSI — automatizado por IA" />
      <SearchBar placeholder="Buscar certificación o entidad..." />
      <div className="grid-4 mb14">
        <KPI val="8" label="Certificaciones activas" delta="Todas vigentes" up color="#2D8A30"/>
        <KPI val="3" label="Por renovar (30 días)" delta="Acción requerida" color="#e03030"/>
        <KPI val="2" label="En tramitación" delta="IA gestionando" color={ACCENT}/>
        <KPI val="100%" label="Cumplimiento normativo" delta="Reg. 1169/2011" up color="#1A78FF"/>
      </div>
      <Card>
        <CardTitle>Certificaciones activas <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Certificación','Entidad','Vigencia','Estado','Acción']}/>
          <tbody>
            {[['IFS Food v8','TÜV SÜD','15/06/2026','amber:Caduca pronto','red:Renovar'],['BRC Global Standard','SGS','22/11/2026','ok:Vigente','green:Ver'],['ISO 22000:2018','Bureau Veritas','03/09/2027','ok:Vigente','green:Ver'],['RGSEAA','AESAN','Permanente','ok:Activo','green:Ver'],['Ecológico EU','CAECV','En trámite','blue:Pendiente','blue:Estado']].map(([cert,ent,vig,est,acc],i)=>{const[et,ev]=est.split(':');const[at,av]=acc.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}><td style={{ padding:'8px 10px', fontWeight:700, color:NAVY, whiteSpace:'nowrap' }}>{cert}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{ent}</td><td style={{ padding:'8px 10px', color:'#3a4a5a', whiteSpace:'nowrap' }}>{vig}</td><td style={{ padding:'8px 10px' }}><Badge type={et} text={ev}/></td><td style={{ padding:'8px 10px' }}><TblBtn type={at} onClick={()=>at==='red'?act('goto','ocerts'):act('validar',cert)}>{av}</TblBtn></td></tr>)})}
          </tbody>
        </ScrollTable>
        <div style={{ background:'#FDF3E7', border:'1px solid #F0C06A', borderRadius:8, padding:'9px 12px', marginTop:10 }}>
          <div style={{ fontSize:'.72rem', fontWeight:700, color:'#e8a010', marginBottom:2 }}>⚠️ IFS Food v8 caduca el 15/06/2026</div>
          <div style={{ fontSize:'.65rem', color:'#3a4a5a' }}>IA recomienda iniciar auditoría de renovación antes del 15/05. Impacta 142 fichas técnicas.</div>
        </div>
        <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
          <BtnSm onClick={()=>act('validar','IFS Food v8')}>Iniciar renovación IA</BtnSm>
          <BtnSm outline onClick={()=>act('exportar','Informe certificaciones')}>Exportar</BtnSm>
        </div>
      </Card>
    </div>
  )
}

function Comunicaciones({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Centro de Comunicaciones" subtitle="Canales unificados con agentes y clientes — IA redacta y envía" />
      <SearchBar placeholder="Buscar mensaje o agente..." />
      <div className="grid-2 mb14">
        <Card>
          <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
            {[{bg:'rgba(255,107,43,.08)',icon:'📞',label:'VOZ IA',sub:'4 llamadas hoy',color:'#FF6B2B'},{bg:'rgba(37,211,102,.08)',icon:'💬',label:'WHATSAPP',sub:'15 mensajes',color:'#25D366'},{bg:'rgba(55,138,221,.08)',icon:'✉️',label:'EMAIL',sub:'8 enviados',color:'#378ADD'}].map((c,i)=>(
              <div key={i} onClick={()=>act('comunicar',c.label)} style={{ flex:'1 1 80px', padding:10, borderRadius:8, background:c.bg, textAlign:'center', cursor:'pointer' }}>
                <div style={{ fontSize:'1.1rem', marginBottom:3 }}>{c.icon}</div>
                <div style={{ fontSize:'.62rem', fontWeight:700, color:c.color }}>{c.label}</div>
                <div style={{ fontSize:'.54rem', color:'#7a8899' }}>{c.sub}</div>
              </div>
            ))}
          </div>
          <CardTitle>Mensajes recientes</CardTitle>
          {[{de:'J.L. Martínez (Levante)',msg:'Panaderías Leopold confirma pedido W-280 — 500kg',hora:'Hace 12 min',tipo:'ok'},{de:'A. García (Cataluña)',msg:'Dulces Iberia solicita muestra cobertura 55%',hora:'Hace 1h',tipo:'blue'},{de:'Sistema IA',msg:'3 cotizaciones automáticas generadas',hora:'Hace 2h',tipo:'orange'},{de:'C. Ruiz (Andalucía)',msg:'Agrudispa pide ampliación de plazo',hora:'Ayer',tipo:'amber'}].map((m,i)=>(
            <div key={i} onClick={()=>act('comunicar',m.de)} style={{ padding:'8px 0', borderBottom:'1px solid #F0E4D6', display:'flex', gap:8, cursor:'pointer' }}>
              <div style={{ width:7, height:7, borderRadius:'50%', marginTop:5, flexShrink:0, background:{ok:'#2D8A30',blue:'#1A78FF',orange:ACCENT,amber:'#e8a010'}[m.tipo] }} />
              <div>
                <div style={{ fontSize:'.68rem', fontWeight:700, color:NAVY }}>{m.de}</div>
                <div style={{ fontSize:'.62rem', color:'#3a4a5a', margin:'1px 0' }}>{m.msg}</div>
                <div style={{ fontSize:'.56rem', color:'#7a8899' }}>{m.hora}</div>
              </div>
            </div>
          ))}
        </Card>
        <Card>
          <CardTitle>Redactar con IA <IaBadge /></CardTitle>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:'.58rem', fontWeight:700, color:'#8A9BB0', letterSpacing:'.14em', textTransform:'uppercase', display:'block', marginBottom:5 }}>Destinatario</label>
            <select style={{ width:'100%', padding:'9px 12px', background:'#FFF8F0', border:'1.5px solid #E8D5C0', borderRadius:8, color:NAVY, fontSize:'.8rem', fontFamily:'DM Sans,sans-serif', outline:'none' }}>
              <option>Todos los agentes</option><option>J.L. Martínez (Levante)</option><option>A. García (Cataluña)</option>
            </select>
          </div>
          <div style={{ marginBottom:10 }}>
            <label style={{ fontSize:'.58rem', fontWeight:700, color:'#8A9BB0', letterSpacing:'.14em', textTransform:'uppercase', display:'block', marginBottom:5 }}>Mensaje</label>
            <textarea style={{ width:'100%', padding:'9px 12px', background:'#FFF8F0', border:'1.5px solid #E8D5C0', borderRadius:8, color:NAVY, fontSize:'.8rem', fontFamily:'DM Sans,sans-serif', outline:'none', minHeight:100, resize:'vertical', boxSizing:'border-box' }} placeholder="Describe qué quieres comunicar y la IA lo redacta..." />
          </div>
          <button onClick={()=>act('notificar','Todos los agentes')} style={{ width:'100%', padding:11, background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, border:'none', borderRadius:8, color:'#fff', fontFamily:'Barlow Condensed', fontWeight:900, fontSize:'.9rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer' }}>
            Redactar y enviar con IA →
          </button>
        </Card>
      </div>
    </div>
  )
}

/* ══ MODAL BUILDER ══ */
function buildModal(type, detail, showToast) {
  const modals = {
    alerta:{title:`Alerta: ${detail}`,body:`<div style="padding:10px;border-radius:8px;background:#FFF5F5;border:1px solid rgba(224,48,48,.2);margin-bottom:12px;font-size:.75rem;font-weight:700;color:#e03030">${detail}</div><div style="font-size:.72rem;color:#3a4a5a;line-height:1.7;margin-bottom:12px">FoodBridge IA ha detectado esta alerta. Revisa y toma acción antes de que impacte en operaciones.</div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA recomienda actuar en las próximas 24h.</div>`,actions:[{label:'Gestionar ahora',type:'primary',fn:()=>showToast('✅ Alerta gestionada')},{label:'Posponer',type:'gray',fn:()=>showToast('⏰ Pospuesta 24h')}]},
    simular:{title:`Simulación: ${detail}`,body:`<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(45,138,48,.06)"><span style="font-size:.68rem">Facturación proyectada</span><span style="font-size:.68rem;font-weight:700;color:#2D8A30">+340.000€/año</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(232,116,32,.06)"><span style="font-size:.68rem">Coste adicional</span><span style="font-size:.68rem;font-weight:700;color:#E87420">+180.000€/año</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(26,120,255,.06)"><span style="font-size:.68rem">ROI estimado</span><span style="font-size:.68rem;font-weight:700;color:#1A78FF">89% en 18 meses</span></div></div><div style="padding:10px;background:rgba(45,138,48,.06);border-radius:8px;font-size:.65rem;border-left:3px solid #2D8A30">IA recomienda este escenario. Probabilidad de éxito: 78%.</div>`,actions:[{label:'Generar plan',type:'primary',fn:()=>showToast('📋 Plan generado')},{label:'Cerrar',type:'gray'}]},
    exportar:{title:`Exportar: ${detail}`,body:`<div style="text-align:center;padding:20px"><div style="font-size:.85rem;font-weight:700;color:#1A2F4A;margin-bottom:6px">${detail}</div><div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.65rem;color:#3a4a5a">Datos actualizados en tiempo real. Firma digital. Compatible Excel y PDF.</div></div>`,actions:[{label:'PDF',type:'primary',fn:()=>showToast('✅ PDF descargado')},{label:'Excel',type:'blue',fn:()=>showToast('✅ Excel descargado')},{label:'Cancelar',type:'gray'}]},
    aplicar:{title:`Aplicar: ${detail}`,body:`<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(45,138,48,.06)"><span style="font-size:.68rem">Productos afectados</span><span style="font-size:.68rem;font-weight:700;color:#2D8A30">4 productos</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(232,116,32,.06)"><span style="font-size:.68rem">Variación media</span><span style="font-size:.68rem;font-weight:700;color:#E87420">+2,8%</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(26,120,255,.06)"><span style="font-size:.68rem">Clientes notificados</span><span style="font-size:.68rem;font-weight:700;color:#1A78FF">23 automáticamente</span></div></div><div style="padding:10px;background:rgba(45,138,48,.06);border-radius:8px;font-size:.65rem;border-left:3px solid #2D8A30">IA: probabilidad aceptación 94%.</div>`,actions:[{label:'Confirmar y notificar',type:'green',fn:()=>showToast('✅ Cambios aplicados')},{label:'Cancelar',type:'gray'}]},
    notificar:{title:`Notificar: ${detail}`,body:`<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px"><div style="padding:10px;border-radius:8px;background:rgba(45,138,48,.06)"><div style="font-size:.68rem;color:#3a4a5a">Destinatarios: <strong>23 agentes comerciales activos</strong></div></div></div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA personaliza el mensaje para cada destinatario.</div>`,actions:[{label:'Enviar ahora',type:'primary',fn:()=>showToast('✅ Notificación enviada a 23 agentes')},{label:'Cancelar',type:'gray'}]},
    validar:{title:`Certificación: ${detail}`,body:`<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;padding:10px;border-radius:8px;background:#FFFBE6;border:1px solid #FDE68A"><div><div style="font-size:.7rem;font-weight:700">IFS Food v8</div><div style="font-size:.58rem;color:#7a8899">Pendiente renovación</div></div><span style="color:#e8a010;font-size:.6rem;font-weight:700">Pendiente</span></div><div style="display:flex;justify-content:space-between;padding:10px;border-radius:8px;background:#F0FFF4;border:1px solid #C6F6D5"><div><div style="font-size:.7rem;font-weight:700">ISO 22000</div><div style="font-size:.58rem;color:#7a8899">Vigente hasta 12/2026</div></div><span style="color:#2D8A30;font-size:.6rem;font-weight:700">Vigente</span></div></div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA puede iniciar la renovación IFS automáticamente.</div>`,actions:[{label:'Iniciar renovación IA',type:'primary',fn:()=>showToast('✅ Renovación IFS iniciada')},{label:'Cerrar',type:'gray'}]},
    revisar:{title:`Revisar: ${detail}`,body:`<div style="display:flex;flex-direction:column;gap:8px"><div style="padding:10px;border-radius:8px;background:#FFFBE6;border:1px solid #FDE68A"><div style="font-size:.65rem;font-weight:700;color:#92400E;margin-bottom:4px">Motivo</div><div style="font-size:.68rem;color:#3a4a5a">${detail}: variación negativa. IA recomienda ajustar precio.</div></div><div style="padding:10px;border-radius:8px;background:#EEF5FF;border:1px solid #B5D4F4"><div style="font-size:.65rem;font-weight:700;color:#1A78FF;margin-bottom:4px">Recomendación IA</div><div style="font-size:.68rem;color:#3a4a5a">Ajustar precio -7% para mantener cuota de mercado.</div></div></div>`,actions:[{label:'Guardar cambios',type:'primary',fn:()=>showToast('✅ Revisión guardada')},{label:'Cerrar',type:'gray'}]},
    aprobar:{title:`Optimizar: ${detail}`,body:`<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px"><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(26,47,74,.04)"><span style="font-size:.68rem">Precio actual</span><span style="font-size:.68rem;font-weight:700">1,28€/kg</span></div><div style="display:flex;justify-content:space-between;padding:8px;border-radius:8px;background:rgba(45,138,48,.06)"><span style="font-size:.68rem">Precio propuesto IA</span><span style="font-size:.68rem;font-weight:700;color:#2D8A30">1,38€/kg (+7.8%)</span></div></div><div style="padding:10px;background:rgba(45,138,48,.06);border-radius:8px;font-size:.65rem;border-left:3px solid #2D8A30">IA: aceptación estimada 94%.</div>`,actions:[{label:'Aprobar y notificar',type:'green',fn:()=>showToast('✅ Tarifa aprobada')},{label:'Cancelar',type:'gray'}]},
    subir:{title:'Subir documento',body:`<div style="text-align:center;padding:24px"><div style="width:72px;height:72px;border:2px dashed rgba(232,116,32,.3);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;background:#FFFBF5"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E87420" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg></div><div style="font-size:.82rem;font-weight:700;color:#1A2F4A;margin-bottom:5px">Arrastra un documento aquí</div><div style="font-size:.7rem;color:#7a8899">PDF, Excel, imagen · La IA extraerá todos los datos automáticamente</div></div>`,actions:[{label:'Seleccionar archivo',type:'primary',fn:()=>showToast('✅ IA extrayendo datos...')},{label:'Cancelar',type:'gray'}]},
    ver:{title:`Ver: ${detail}`,body:`<div style="padding:12px;background:#F8FAFC;border-radius:8px;font-size:.72rem;color:#3a4a5a;line-height:1.7">Detalles de: <strong>${detail}</strong><br/><br/>Datos actualizados por IA en tiempo real.</div>`,actions:[{label:'Exportar PDF',type:'primary',fn:()=>showToast('✅ PDF exportado')},{label:'Cerrar',type:'gray'}]},
    PDF:{title:`Ficha técnica: ${detail}`,body:`<div style="text-align:center;padding:20px"><div style="width:56px;height:56px;border-radius:12px;background:linear-gradient(135deg,#1A2F4A,#2A4A6A);display:flex;align-items:center;justify-content:center;margin:0 auto 12px"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E87420" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div style="font-size:.82rem;font-weight:700;color:#1A2F4A;margin-bottom:5px">${detail}</div><div style="padding:10px;background:#F8FAFC;border-radius:8px;font-size:.62rem;color:#3a4a5a;text-align:left">✓ Reg. 1169/2011 · ✓ 14 alérgenos · ✓ Datos nutricionales · ✓ Microbiología</div></div>`,actions:[{label:'Descargar PDF',type:'primary',fn:()=>showToast('✅ PDF descargado')},{label:'Cerrar',type:'gray'}]},
    comunicar:{title:`Contactar: ${detail}`,body:`<div style="font-size:.72rem;color:#3a4a5a;margin-bottom:12px">Contacto: <strong>${detail}</strong></div><div style="padding:10px;background:rgba(232,116,32,.05);border-radius:8px;font-size:.65rem;border-left:3px solid #E87420">IA redacta el mensaje automáticamente según el historial.</div>`,actions:[{label:'Llamar',type:'green',fn:()=>showToast('📞 Llamando...')},{label:'WhatsApp',type:'blue',fn:()=>showToast('💬 WhatsApp abierto')},{label:'Email IA',type:'primary',fn:()=>showToast('✉️ Email redactado por IA')},{label:'Cerrar',type:'gray'}]},
  }
  return modals[type] || {title:'FoodBridge IA',body:`<div style="font-size:.75rem;color:#3a4a5a;padding:10px">🧠 Procesando: <strong>${detail||type}</strong>...</div>`,actions:[{label:'Cerrar',type:'gray'}]}
}

/* ══ NAV DIRECTIVO ══ */
const NAV = [
  {id:'fdash',section:'Directivo',label:'Dashboard CEO',ia:true,icon:'<rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>'},
  {id:'fventas',label:'Ventas por canal',icon:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'},
  {id:'frentabilidad',section:'Estratégica',label:'Rentabilidad',ia:true,icon:'<path d="M21 8a9 9 0 1 0 0 8"/><line x1="3" y1="12" x2="15" y2="12"/><line x1="3" y1="16" x2="13" y2="16"/>'},
  {id:'fsimulador',label:'Simulador IA',ia:true,icon:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'},
  {id:'fcatalogo',section:'Control',label:'Catálogo productos',icon:'<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'},
  {id:'fcerts',label:'Certificaciones',ia:true,icon:'<polyline points="20 6 9 17 4 12"/>'},
  {id:'fcomunica',label:'Comunicaciones',icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
]

const SCREENS = {fdash:DashboardCEO,fventas:VentasCanal,frentabilidad:Rentabilidad,fsimulador:SimuladorIA,fcatalogo:Catalogo,fcerts:Certificaciones,fcomunica:Comunicaciones}

/* ══ NAV OPERACIONES ══ */
const NAV_OPS = [
  {id:'odash',section:'Operaciones',label:'Dashboard Ops',ia:true,icon:'<rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>'},
  {id:'osubir',label:'Subir documentos',ia:true,icon:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'},
  {id:'ofichas',label:'Fichas técnicas',ia:true,icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>'},
  {id:'ocerts',label:'Certificaciones',icon:'<polyline points="20 6 9 17 4 12"/>'},
  {id:'olotes',section:'Calidad',label:'Control de lotes',icon:'<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>'},
  {id:'oalergenos',label:'Alérgenos 14 EU',ia:true,icon:'<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'},
  {id:'oappcc',label:'APPCC',ia:true,icon:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'},
  {id:'oproduccion',section:'Producción',label:'Producción',ia:true,icon:'<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'},
  {id:'otrazabilidad',label:'Trazabilidad',ia:true,icon:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'},
  {id:'ocomunica',label:'Comunicaciones',icon:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'},
]

/* ══ OPERACIONES SCREENS ══ */
function OdashScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Dashboard Operaciones" subtitle="Estado de fichas técnicas, documentos y calidad — gestión IA" badge="Abril 2026" />
      <SearchBar placeholder="Buscar documento o alerta..." />
      <LiveTicker msgs={['3 documentos en cola de extracción automática...','Ficha Harina Eco T-110 completada — 14 alérgenos verificados','Lote L-2026-0412 retenido pendiente análisis micro','APPCC: 7 PCC activos sin desviaciones hoy']} />
      <div className="grid-4 mb14">
        <KPI val="1.247" label="Fichas generadas IA" delta="▲ 99.2% precisión" up color={ACCENT}/>
        <KPI val="0" label="Errores normativos" delta="▲ Sin incidencias" up color="#2D8A30"/>
        <KPI val="47" label="Fichas por revisar" delta="→ IA las marcó" color="#1A78FF"/>
        <KPI val="3" label="Docs en cola IA" delta="→ Procesando..." color="#e8a010"/>
      </div>
      <div className="grid-2 mb14">
        <Card>
          <CardTitle>Documentos procesados hoy <IaBadge /></CardTitle>
          {[{ico:'📝',name:'Ficha_Harina_Ecologica_T110.pdf',desc:'IA extrajo: 14 alérgenos, nutricionales, microbiológicos',st:'ok:Completado'},{ico:'📷',name:'Etiqueta_Semola_Duro_foto.jpg',desc:'IA extrajo ingredientes y alérgenos de foto de etiqueta',st:'ok:Completado'},{ico:'📄',name:'Catalogo_Mejorantes_2026.xlsx',desc:'IA procesando 34 productos del Excel...',st:'amber:En proceso'}].map((d,i)=>{const[t,v]=d.st.split(':');return(<div key={i} style={{ display:'flex', gap:10, padding:10, borderRadius:8, background:t==='ok'?'rgba(45,138,48,.04)':'rgba(232,116,32,.04)', border:`1px solid ${t==='ok'?'rgba(45,138,48,.15)':'rgba(232,116,32,.15)'}`, marginBottom:8 }}><div style={{ fontSize:'1.1rem' }}>{d.ico}</div><div style={{ flex:1 }}><div style={{ fontSize:'.75rem', fontWeight:700, color:NAVY }}>{d.name}</div><div style={{ fontSize:'.62rem', color:'#7a8899' }}>{d.desc}</div></div><Badge type={t} text={v}/></div>)})}
        </Card>
        <Card>
          <CardTitle>Alertas Operaciones <IaBadge /></CardTitle>
          {[{type:'red',title:'Lote L-2026-0412 retenido',sub:'Análisis Salmonella pendiente. No liberar hasta confirmación laboratorio.'},{type:'amber',title:'47 fichas marcadas para revisión',sub:'Cambio normativo Reg. 2025/847 — límites acrilamida actualizados.'},{type:'ok',title:'APPCC validado sin incidencias',sub:'7 PCC activos. Cumplimiento 98.4% este mes.'},{type:'blue',title:'IFS Food v8 caduca en 60 días',sub:'Programar auditoría antes del 15/05/2026.'}].map((a,i)=>{const c={red:{bg:'#FDECEA',border:'#F1A9A0',t:'#e03030'},amber:{bg:'#FDF3E7',border:'#F0C06A',t:'#e8a010'},ok:{bg:'#EBF5EF',border:'#90D4A8',t:'#2D8A30'},blue:{bg:'#EEF5FF',border:'#B5D4F4',t:'#1A78FF'}}[a.type];return(<div key={i} onClick={()=>act('alerta',a.title)} style={{ background:c.bg, border:`1px solid ${c.border}`, borderRadius:8, padding:'9px 12px', marginBottom:7, cursor:'pointer' }}><div style={{ fontSize:'.72rem', fontWeight:700, color:c.t, marginBottom:2 }}>{a.title}</div><div style={{ fontSize:'.65rem', color:'#3a4a5a' }}>{a.sub}</div></div>)})}
        </Card>
      </div>
    </div>
  )
}

function OsubirScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Subir Documentos" subtitle="IA extrae automáticamente todos los datos del documento" />
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:13, marginBottom:13 }}>
        {[{ico:'📄',label:'PDF / Word',desc:'Ficha técnica, especificación, certificado'},{ico:'📊',label:'Excel / CSV',desc:'Catálogo de productos, lista de ingredientes'},{ico:'📷',label:'Foto / JPG',desc:'Etiqueta, documento físico fotografiado'},{ico:'📦',label:'Múltiple',desc:'Subida masiva de varios documentos a la vez'}].map((t,i)=>(
          <Card key={i} style={{ cursor:'pointer', textAlign:'center' }} onClick={()=>act('subir',t.label)}>
            <div style={{ fontSize:'2rem', marginBottom:8 }}>{t.ico}</div>
            <div style={{ fontSize:'.82rem', fontWeight:700, color:NAVY, marginBottom:4 }}>{t.label}</div>
            <div style={{ fontSize:'.68rem', color:'#7a8899' }}>{t.desc}</div>
          </Card>
        ))}
      </div>
      <Card>
        <div style={{ border:'2px dashed rgba(232,116,32,.3)', borderRadius:12, padding:36, textAlign:'center', cursor:'pointer', background:'rgba(232,116,32,.02)' }} onClick={()=>act('goto','osubir')}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" style={{ margin:'0 auto 12px', display:'block' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <div style={{ fontSize:'.88rem', fontWeight:700, color:NAVY, marginBottom:4 }}>Arrastra tu documento aquí o haz clic</div>
          <div style={{ fontSize:'.72rem', color:'#7a8899' }}>PDF, Excel, imagen o foto del documento · La IA extraerá todos los datos automáticamente</div>
        </div>
        <IABox text="<strong>Motor IA de extracción:</strong> Identifica automáticamente 14 alérgenos (Reg. 1169/2011), valores nutricionales, parámetros microbiológicos, certificaciones y datos de trazabilidad. Precisión: <strong>99.2%</strong>." />
      </Card>
    </div>
  )
}

function OfichasScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Fichas Técnicas" subtitle="1.247 fichas generadas por IA — Reg. 1169/2011" />
      <SearchBar placeholder="Buscar ficha técnica..." />
      <div className="grid-4 mb14">
        <KPI val="1.247" label="Fichas publicadas" delta="▲ 99.2% precisión" up color={ACCENT}/>
        <KPI val="47" label="Por revisar" delta="→ IA las marcó" color="#e8a010"/>
        <KPI val="12" label="Nuevas este mes" delta="▲ Indexadas por IA" up color="#2D8A30"/>
        <KPI val="0" label="Errores normativos" delta="▲ Cumplimiento total" up color="#1A78FF"/>
      </div>
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Fichas por categoría</CardTitle>
        <ScrollTable>
          <Thead cols={['Categoría','Total','Publicadas','Por revisar','Acción']}/>
          <tbody>
            {[['Harinas panificación','342','ok:342','0'],['Harinas repostería','198','ok:198','0'],['Harinas ecológicas','87','ok:87','0'],['Sémolas','156','amber:151','5'],['Mezclas y mejorantes','234','amber:228','6'],['Otros','230','amber:224','6']].map(([cat,tot,pub,rev],i)=>{const[pt,pv]=pub.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}><td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{cat}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{tot}</td><td style={{ padding:'8px 10px' }}><Badge type={pt} text={pv}/></td><td style={{ padding:'8px 10px', color:rev==='0'?'#2D8A30':'#e8a010', fontWeight:700 }}>{rev}</td><td style={{ padding:'8px 10px' }}><TblBtn type="orange" onClick={()=>act('goto','ofichas')}>Ver fichas</TblBtn></td></tr>)})}
          </tbody>
        </ScrollTable>
      </Card>
      <Card>
        <CardTitle>Últimas fichas generadas <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Producto','Ref.','Fecha','Alérgenos','Estado','Acción']}/>
          <tbody>
            {[['Harina Eco T-110','HM-ECO-110','16/04','Gluten','ok:Publicada'],['Sémola Trigo Duro','HM-STD-25','15/04','Gluten','amber:Revisión'],['Harina W-280','HM-W280-25','14/04','Gluten','ok:Publicada'],['Harina W-380','HM-W380-25','12/04','Gluten','ok:Publicada']].map(([p,ref,f,al,st],i)=>{const[ct,cv]=st.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''} onClick={()=>act('PDF',p)}><td style={{ padding:'8px 10px', fontWeight:600, color:NAVY }}>{p}</td><td style={{ padding:'8px 10px', color:'#7a8899', fontSize:'.62rem' }}>{ref}</td><td style={{ padding:'8px 10px', color:'#7a8899' }}>{f}</td><td style={{ padding:'8px 10px', color:'#e03030', fontSize:'.62rem', fontWeight:600 }}>{al}</td><td style={{ padding:'8px 10px' }}><Badge type={ct} text={cv}/></td><td style={{ padding:'8px 10px' }}><TblBtn type={ct==='amber'?'orange':'green'} onClick={e=>{e.stopPropagation();act(ct==='amber'?'revisar':'PDF',p)}}>{ct==='amber'?'Revisar':'PDF'}</TblBtn></td></tr>)})}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>FoodBridge IA:</strong> Todas las fichas incluyen 14 alérgenos (Reg. 1169/2011), valores nutricionales, parámetros microbiológicos y trazabilidad de lote." />
      </Card>
    </div>
  )
}

function OcertsScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Certificaciones y Registros" subtitle="Control de certificaciones de calidad y registros sanitarios" />
      <SearchBar placeholder="Buscar certificación o entidad..." />
      <div className="grid-4 mb14">
        {[{val:'3',label:'Vigentes',color:'#2D8A30',bg:'#F0FFF4',border:'#C6F6D5'},{val:'1',label:'Urgente',color:'#e03030',bg:'#FFF5F5',border:'rgba(224,48,48,.2)'},{val:'1',label:'Próxima',color:'#e8a010',bg:'#FFF3CD',border:'rgba(232,160,16,.2)'},{val:'4',label:'Total',color:'#1A78FF',bg:'#F0F7FF',border:'#C4DEFF'}].map((k,i)=>(
          <div key={i} style={{ padding:12, borderRadius:10, background:k.bg, border:`1px solid ${k.border}`, textAlign:'center' }}>
            <div style={{ fontFamily:'Barlow Condensed', fontSize:'1.4rem', fontWeight:900, color:k.color }}>{k.val}</div>
            <div style={{ fontSize:'.6rem', color:'#7a8899', marginTop:3 }}>{k.label}</div>
          </div>
        ))}
      </div>
      <Card>
        <CardTitle>Estado de certificaciones</CardTitle>
        <ScrollTable>
          <Thead cols={['Certificación','Entidad','Vigencia','Días','Estado','Acción']}/>
          <tbody>
            {[['IFS Food v8','TÜV SÜD','15/06/2026','60','red:Urgente','red:Renovar'],['BRC Global','SGS','22/11/2026','220','ok:OK','green:Ver'],['ISO 22000','Bureau Veritas','03/09/2027','506','ok:OK','green:Ver'],['RGSEAA','AESAN','Permanente','—','ok:Activo','green:Ver']].map(([cert,ent,vig,dias,est,acc],i)=>{const[et,ev]=est.split(':');const[at,av]=acc.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}><td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{cert}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{ent}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{vig}</td><td style={{ padding:'8px 10px', fontWeight:700, color:et==='red'?'#e03030':'#2D8A30' }}>{dias}</td><td style={{ padding:'8px 10px' }}><Badge type={et} text={ev}/></td><td style={{ padding:'8px 10px' }}><TblBtn type={at} onClick={()=>at==='red'?act('goto','ocerts'):act('validar',cert)}>{av}</TblBtn></td></tr>)})}
          </tbody>
        </ScrollTable>
      </Card>
    </div>
  )
}

function OlotesScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Control de Lotes" subtitle="Trazabilidad completa Reg. 178/2002 de cada lote producido" />
      <SearchBar placeholder="Buscar lote o producto..." />
      <Card>
        <CardTitle>Últimos lotes registrados</CardTitle>
        <ScrollTable>
          <Thead cols={['Lote','Producto','Fecha','Cantidad','Análisis','Estado']}/>
          <tbody>
            {[['L-2026-0416','Harina W-280','16/04/2026','25.000 kg','ok:Aprobado','ok:Liberado'],['L-2026-0415','Harina Eco T-110','15/04/2026','8.000 kg','ok:Aprobado','ok:Liberado'],['L-2026-0414','Sémola Duro','14/04/2026','15.000 kg','ok:Aprobado','ok:Liberado'],['L-2026-0412','Harina W-280','12/04/2026','20.000 kg','red:Pendiente micro','red:Retenido']].map(([lote,prod,fecha,cant,an,st],i)=>{const[at,av]=an.split(':');const[st2,sv]=st.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6', cursor:'pointer' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''} onClick={()=>act('ver',`Lote ${lote}`)}><td style={{ padding:'8px 10px', fontWeight:700, color:ACCENT }}>{lote}</td><td style={{ padding:'8px 10px', color:NAVY }}>{prod}</td><td style={{ padding:'8px 10px', color:'#7a8899' }}>{fecha}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{cant}</td><td style={{ padding:'8px 10px' }}><Badge type={at} text={av}/></td><td style={{ padding:'8px 10px' }}><Badge type={st2} text={sv}/></td></tr>)})}
          </tbody>
        </ScrollTable>
        <div style={{ background:'#FDECEA', border:'1px solid #F1A9A0', borderRadius:8, padding:'9px 12px', marginTop:10 }}>
          <div style={{ fontSize:'.72rem', fontWeight:700, color:'#e03030', marginBottom:2 }}>🚨 Lote L-2026-0412 retenido</div>
          <div style={{ fontSize:'.65rem', color:'#3a4a5a' }}>Análisis Salmonella ausencia/25g pendiente. Resultado esperado: 17/04. No liberar hasta confirmación laboratorio.</div>
        </div>
      </Card>
    </div>
  )
}

function OalergenosScreen({ act }) {
  const ALERG = [
    {n:'1. Gluten',e:'🌾',tipo:'red',desc:'Presente en 98%'},
    {n:'2. Leche',e:'🥛',tipo:'amber',desc:'Trazas en 12%'},
    {n:'3. Huevos',e:'🥚',tipo:'ok',desc:'No presente'},
    {n:'4. Pescado',e:'🐟',tipo:'ok',desc:'No presente'},
    {n:'5. Crustáceos',e:'🦐',tipo:'ok',desc:'No presente'},
    {n:'6. Cacahuetes',e:'🥜',tipo:'amber',desc:'Trazas posibles'},
    {n:'7. Soja',e:'🌱',tipo:'amber',desc:'Trazas en 8%'},
    {n:'8. Frutos secos',e:'🌰',tipo:'ok',desc:'No presente'},
    {n:'9. Apio',e:'🥬',tipo:'ok',desc:'No presente'},
    {n:'10. Mostaza',e:'🌶️',tipo:'ok',desc:'No presente'},
    {n:'11. Sésamo',e:'🌻',tipo:'ok',desc:'No presente'},
    {n:'12. Sulfitos',e:'🧪',tipo:'amber',desc:'Trazas en 3%'},
    {n:'13. Altramuces',e:'🫘',tipo:'ok',desc:'No presente'},
    {n:'14. Moluscos',e:'🐚',tipo:'ok',desc:'No presente'},
  ]
  const colors = {red:{bg:'rgba(224,48,48,.06)',border:'rgba(224,48,48,.15)',c:'#e03030'},amber:{bg:'rgba(232,160,16,.06)',border:'rgba(232,160,16,.15)',c:'#e8a010'},ok:{bg:'rgba(45,138,48,.06)',border:'rgba(45,138,48,.15)',c:'#2D8A30'}}
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Control de Alérgenos — 14 EU" subtitle="Declaración obligatoria según Reglamento 1169/2011" />
      <SearchBar placeholder="Buscar alérgeno..." />
      <Card>
        <CardTitle>14 alérgenos de declaración obligatoria <IaBadge /></CardTitle>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:8, marginTop:8 }}>
          {ALERG.map((a,i)=>{const c=colors[a.tipo];return(<div key={i} style={{ padding:10, borderRadius:8, background:c.bg, border:`1px solid ${c.border}`, textAlign:'center' }}><div style={{ fontSize:'1.1rem', marginBottom:4 }}>{a.e}</div><div style={{ fontSize:'.68rem', fontWeight:700, color:NAVY }}>{a.n}</div><div style={{ fontSize:'.55rem', color:c.c, fontWeight:600, marginTop:2 }}>{a.desc}</div></div>)})}
        </div>
        <IABox text="<strong>FoodBridge IA verifica automáticamente</strong> los 14 alérgenos de declaración obligatoria (Reg. 1169/2011) en cada ficha técnica. Precisión de detección: <strong>99.2%</strong>. Incluye trazas y contaminación cruzada." />
      </Card>
    </div>
  )
}

function OappccScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Control APPCC" subtitle="Análisis de Peligros y Puntos de Control Crítico — monitorización IA en tiempo real" badge="Activo" />
      <SearchBar placeholder="Buscar PCC, peligro o resultado..." />
      <div className="grid-4 mb14">
        <KPI val="7" label="PCC activos" delta="▲ Todos monitorizados" up color="#2D8A30"/>
        <KPI val="0" label="Desviaciones hoy" delta="▲ Control total" up color={ACCENT}/>
        <KPI val="98.4%" label="Cumplimiento APPCC" delta="▲ +1.2pp mes anterior" up color="#1A78FF"/>
        <KPI val="15/07" label="Próxima auditoría" delta="→ 90 días" color="#9B59B6"/>
      </div>
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Puntos de Control Crítico — Estado en tiempo real <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['PCC','Peligro','Límite crítico','Valor actual','Estado','Acción']}/>
          <tbody>
            {[['PCC-1 · Recepción MP','Humedad excesiva','< 14%','12.8%','ok:OK','green:Registro'],['PCC-2 · Molienda','Temperatura','< 45°C','38°C','ok:OK','green:Registro'],['PCC-3 · Tamizado','Cuerpos extraños','Malla 0.6mm','OK','ok:OK','green:Registro'],['PCC-4 · Detector metales','Metal Fe/nFe','Fe<1.5mm','0 alertas','ok:OK','green:Registro'],['PCC-5 · Almacén','Humedad relativa','< 65%','62%','amber:Vigilar','orange:Vigilar'],['PCC-6 · Envasado','Cierre hermético','Test OK','100%','ok:OK','green:Registro'],['PCC-7 · Expedición','Temp. transporte','< 20°C','16°C','ok:OK','green:Registro']].map(([pcc,pel,lim,val,est,acc],i)=>{const[et,ev]=est.split(':');const[at,av]=acc.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}><td style={{ padding:'8px 10px', fontWeight:700, color:NAVY, whiteSpace:'nowrap' }}>{pcc}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{pel}</td><td style={{ padding:'8px 10px', color:'#3a4a5a', whiteSpace:'nowrap' }}>{lim}</td><td style={{ padding:'8px 10px', fontWeight:700, color:et==='ok'?'#2D8A30':et==='amber'?'#e8a010':'#e03030' }}>{val}</td><td style={{ padding:'8px 10px' }}><Badge type={et} text={ev}/></td><td style={{ padding:'8px 10px' }}><TblBtn type={at} onClick={()=>act('ver',`Registro ${pcc}`)}>{av}</TblBtn></td></tr>)})}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>IA monitoriza PCC-5 (Almacén):</strong> Humedad en 62% — cerca del límite crítico (65%). <strong>Recomendación: activar deshumidificador zona B antes de las 14h.</strong>" />
      </Card>
      <Card>
        <CardTitle>Historial de registros APPCC <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Fecha','PCC','Responsable','Resultado','Verificación IA']}/>
          <tbody>
            {[['16/04/2026','PCC 1-7','Luis M.','ok:Sin desviaciones','ok:Validado IA'],['15/04/2026','PCC 1-7','Carmen V.','ok:Sin desviaciones','ok:Validado IA'],['14/04/2026','PCC-5','Luis M.','amber:Desviación leve','amber:Acción correctora OK'],['11/04/2026','PCC 1-7','Carmen V.','ok:Sin desviaciones','ok:Validado IA']].map(([fecha,pcc,resp,res,ver],i)=>{const[rt,rv]=res.split(':');const[vt,vv]=ver.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }}><td style={{ padding:'8px 10px', color:'#7a8899' }}>{fecha}</td><td style={{ padding:'8px 10px', color:NAVY }}>{pcc}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{resp}</td><td style={{ padding:'8px 10px' }}><Badge type={rt} text={rv}/></td><td style={{ padding:'8px 10px' }}><Badge type={vt} text={vv}/></td></tr>)})}
          </tbody>
        </ScrollTable>
      </Card>
    </div>
  )
}

function OproduccionScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Producción & Capacidad" subtitle="Planificación de producción y rendimiento de líneas — optimización IA" badge="Abril 2026" />
      <SearchBar placeholder="Buscar línea de producción o producto..." />
      <div className="grid-4 mb14">
        <KPI val="87%" label="Ocupación hoy" delta="▲ Rendimiento óptimo" up color={ACCENT}/>
        <KPI val="68.000" label="Kg producidos hoy" delta="▲ +12% sobre objetivo" up color="#2D8A30"/>
        <KPI val="3" label="Líneas activas" delta="→ 1 en mantenimiento" color="#1A78FF"/>
        <KPI val="1" label="Lote retenido" delta="▼ Micro pendiente" color="#e03030"/>
      </div>
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Estado de líneas de producción <IaBadge /></CardTitle>
        <ScrollTable>
          <Thead cols={['Línea','Producto actual','Velocidad','Ocupación','Estado','Acción']}/>
          <tbody>
            {[['Línea 1','Harina W-280','2.800 kg/h','92%','ok:Activa'],['Línea 2','Harina Eco T-110','1.200 kg/h','78%','ok:Activa'],['Línea 3','Sémola Trigo Duro','2.100 kg/h','85%','ok:Activa'],['Línea 4','—','—','0%','red:Mantenimiento']].map(([lin,prod,vel,ocu,st],i)=>{const[et,ev]=st.split(':');return(<tr key={i} style={{ borderBottom:'1px solid #F0E4D6' }} onMouseEnter={e=>e.currentTarget.style.background='#FFF8F0'} onMouseLeave={e=>e.currentTarget.style.background=''}><td style={{ padding:'8px 10px', fontWeight:700, color:NAVY }}>{lin}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{prod}</td><td style={{ padding:'8px 10px', color:'#3a4a5a' }}>{vel}</td><td style={{ padding:'8px 10px', fontWeight:700, color:et==='ok'?'#2D8A30':'#e03030' }}>{ocu}</td><td style={{ padding:'8px 10px' }}><Badge type={et} text={ev}/></td><td style={{ padding:'8px 10px' }}><TblBtn type={et==='red'?'blue':'green'} onClick={()=>act('ver',lin)}>{et==='red'?'Estado':'Registro'}</TblBtn></td></tr>)})}
          </tbody>
        </ScrollTable>
        <IABox text="<strong>IA optimiza producción:</strong> La demanda de Harina Ecológica T-110 ha subido +48%. Recomendación: reasignar Línea 4 (cuando termine mantenimiento) a producción ecológica para cubrir pedidos Q2." />
      </Card>
    </div>
  )
}

function OtrazabilidadScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Trazabilidad" subtitle="Trazabilidad completa hacia atrás y hacia adelante — Reg. 178/2002" />
      <SearchBar placeholder="Buscar lote, producto o cliente..." />
      <div className="grid-4 mb14">
        <KPI val="100%" label="Trazabilidad completa" delta="▲ Reg. 178/2002" up color="#2D8A30"/>
        <KPI val="1.247" label="Lotes rastreables" delta="▲ Todos con ficha" up color={ACCENT}/>
        <KPI val="0" label="Alertas trazabilidad" delta="▲ Sin incidencias" up color="#1A78FF"/>
        <KPI val="48h" label="Tiempo max. rastreo" delta="→ IA en minutos" color="#9B59B6"/>
      </div>
      <Card style={{ marginBottom:13 }}>
        <CardTitle>Cadena de trazabilidad — L-2026-0416 <IaBadge /></CardTitle>
        {[{color:'#2D8A30',bg:'#F0FFF4',border:'#C6F6D5',step:'1. Recepción MP',det:'Trigo duro — Origen: Castilla-La Mancha · Proveedor: Cereales Alcarria · Lote MP: CA-2026-112',fecha:'10/04/2026',ok:true},{color:'#1A78FF',bg:'#EEF5FF',border:'#B5D4F4',step:'2. Producción',det:'Molienda Línea 1 · Velocidad: 2.800 kg/h · Temperatura: 38°C · PCC validados: 7/7',fecha:'16/04/2026',ok:true},{color:ACCENT,bg:'#FFF8F0',border:'rgba(232,116,32,.15)',step:'3. Control calidad',det:'Análisis laboratorio: Humedad 13.8% · Proteína 11.4% · Cenizas 0.54% · Salmonella: ausencia',fecha:'16/04/2026',ok:true},{color:'#9B59B6',bg:'#F8F0FF',border:'rgba(155,89,182,.15)',step:'4. Expedición',det:'Destino: Panaderías Leopold (Valencia) · Transportista: Trans Iberia · Temperatura: 16°C',fecha:'17/04/2026',ok:true}].map((s,i)=>(
          <div key={i} style={{ display:'flex', gap:12, marginBottom:8 }}>
            <div style={{ width:28, height:28, borderRadius:'50%', background:s.color, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
              <span style={{ color:'#fff', fontSize:'.6rem', fontWeight:900 }}>{i+1}</span>
            </div>
            <div style={{ flex:1, padding:12, borderRadius:8, background:s.bg, border:`1px solid ${s.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                <div style={{ fontSize:'.72rem', fontWeight:700, color:NAVY }}>{s.step}</div>
                <div style={{ fontSize:'.6rem', color:'#7a8899' }}>{s.fecha}</div>
              </div>
              <div style={{ fontSize:'.65rem', color:'#3a4a5a' }}>{s.det}</div>
            </div>
          </div>
        ))}
        <IABox text="<strong>Trazabilidad verificada:</strong> Cadena completa desde materia prima hasta cliente final. Cumple Reg. 178/2002. Sin alertas de seguridad alimentaria." />
        <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap' }}>
          <BtnSm onClick={()=>act('exportar','Informe trazabilidad L-2026-0416')}>Exportar PDF</BtnSm>
          <BtnSm outline onClick={()=>act('goto','otrazabilidad')}>Ver trazabilidad completa</BtnSm>
        </div>
      </Card>
    </div>
  )
}

function OcomunicaScreen({ act }) {
  return (
    <div className="animate-fadeIn">
      <PageHdr title="Comunicaciones" subtitle="Mensajes de agentes y solicitudes de fichas técnicas" />
      <SearchBar placeholder="Buscar mensaje o solicitud..." />
      <Card style={{ marginBottom:13 }}>
        <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
          {[{bg:'rgba(232,116,32,.06)',icon:'📩',label:'SOLICITUDES FICHAS',sub:'7 nuevas',color:ACCENT},{bg:'rgba(37,211,102,.08)',icon:'💬',label:'WHATSAPP',sub:'12 mensajes',color:'#25D366'},{bg:'rgba(55,138,221,.08)',icon:'✉️',label:'EMAIL',sub:'3 pendientes',color:'#378ADD'}].map((c,i)=>(
            <div key={i} onClick={()=>act('comunicar',c.label)} style={{ flex:'1 1 80px', padding:10, borderRadius:8, background:c.bg, textAlign:'center', cursor:'pointer' }}>
              <div style={{ fontSize:'1.1rem', marginBottom:3 }}>{c.icon}</div>
              <div style={{ fontSize:'.62rem', fontWeight:700, color:c.color }}>{c.label}</div>
              <div style={{ fontSize:'.54rem', color:'#7a8899' }}>{c.sub}</div>
            </div>
          ))}
        </div>
        <CardTitle>Solicitudes de fichas técnicas</CardTitle>
        {[{de:'J.L. Martínez (Comercial)',msg:'Necesito ficha técnica Harina W-380 con alérgenos en inglés para cliente UK',hora:'Hace 20 min',tipo:'orange'},{de:'A. García (Comercial)',msg:'Cliente solicita certificado IFS Food v8 actualizado para Dulces Iberia',hora:'Hace 1h',tipo:'blue'},{de:'Sistema IA',msg:'Ficha Harina Eco T-110 lista — alérgenos, nutricionales y micro incluidos',hora:'Hace 2h',tipo:'ok'}].map((m,i)=>(
          <div key={i} onClick={()=>act('comunicar',m.de)} style={{ padding:'8px 0', borderBottom:'1px solid #F0E4D6', display:'flex', gap:8, cursor:'pointer' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', marginTop:5, flexShrink:0, background:{ok:'#2D8A30',blue:'#1A78FF',orange:ACCENT,amber:'#e8a010'}[m.tipo] }} />
            <div>
              <div style={{ fontSize:'.68rem', fontWeight:700, color:NAVY }}>{m.de}</div>
              <div style={{ fontSize:'.62rem', color:'#3a4a5a', margin:'1px 0' }}>{m.msg}</div>
              <div style={{ fontSize:'.56rem', color:'#7a8899' }}>{m.hora}</div>
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

const SCREENS_OPS = {odash:OdashScreen,osubir:OsubirScreen,ofichas:OfichasScreen,ocerts:OcertsScreen,olotes:OlotesScreen,oalergenos:OalergenosScreen,oappcc:OappccScreen,oproduccion:OproduccionScreen,otrazabilidad:OtrazabilidadScreen,ocomunica:OcomunicaScreen}

const PUSH_MSGS_DIR = [
  {bar:'#e03030',label:'ALERTA CERTIFICACIÓN',text:'IFS Food v8 caduca en 30 días — Acción requerida'},
  {bar:'#2D8A30',label:'PEDIDO CONFIRMADO',text:'Panaderías Leopold confirma pedido W-280 — 500kg · 4.250€'},
  {bar:ACCENT,label:'IA DETECTA OPORTUNIDAD',text:'Zona Madrid Centro sin cobertura. Potencial: 214k€/año'},
]

const PUSH_MSGS_OPS = [
  {bar:'#e03030',label:'CALIDAD',text:'Lote L-2026-0412: resultado Salmonella esperado mañana. No liberar hasta confirmación.'},
  {bar:ACCENT,label:'IA PROCESANDO',text:'Catálogo Mejorantes 2026.xlsx: extracción de 34 productos en curso...'},
  {bar:'#2D8A30',label:'FICHA GENERADA',text:'Harina Ecológica T-110: ficha completa con 14 alérgenos. Lista para publicar.'},
]

/* ══ ALERTS DATA ══ */
const ALERTS_DIR = [
  {type:'amber',dot:'#e8a010',text:'Certificación IFS Food v8 caduca el 15/06/2026 — 60 días',time:'Hoy'},
  {type:'green',dot:'#2D8A30',text:'Harina Ecológica T-110: demanda +48% en Q1',time:'Hoy'},
  {type:'blue',dot:'#1A78FF',text:'5 nuevos agentes conectados en Q1 2026',time:'Esta semana'},
  {type:'red',dot:'#e03030',text:'Reg. 2025/847: actualizar 14 fichas antes del 1 julio',time:'Esta semana'},
  {type:'green',dot:'#2D8A30',text:'Ventas Q1: 847.000€ (+38% vs Q1 2025)',time:'Ayer'},
  {type:'blue',dot:'#1A78FF',text:'Proyección IA anual: 3.4M€ ingresos',time:'Ayer'},
]
const ALERTS_OPS = [
  {type:'red',dot:'#e03030',text:'Lote L-2026-0412 retenido: análisis micro pendiente',time:'Hace 2h'},
  {type:'amber',dot:'#e8a010',text:'47 fichas marcadas para revisión por cambio normativo',time:'Hoy'},
  {type:'green',dot:'#2D8A30',text:'Ficha Harina Eco T-110 generada correctamente por IA',time:'Hoy'},
  {type:'amber',dot:'#e8a010',text:'3 documentos en cola de procesamiento IA',time:'Hace 1h'},
  {type:'green',dot:'#2D8A30',text:'APPCC validado sin incidencias esta semana',time:'Esta semana'},
  {type:'blue',dot:'#1A78FF',text:'IFS Food v8 caduca en 60 días — programar auditoría',time:'Esta semana'},
]

function AlertsModal({ alerts, onClose, onMarkRead, readSet }) {
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
          {alerts.map((a,i) => {
            const isRead = readSet.has(i)
            return (
              <div key={i} onClick={() => onMarkRead(i)} style={{ display:'flex', gap:10, padding:'10px 16px', borderBottom:'1px solid #F8FAFC', cursor:'pointer', opacity: isRead ? .4 : 1, transition:'background .15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#F8FAFC'} onMouseLeave={e=>e.currentTarget.style.background=''}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:a.dot, marginTop:4, flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:'.74rem', color:NAVY, lineHeight:1.5 }}>{a.text}</div>
                  <div style={{ fontSize:'.58rem', color:'#94A3B8', marginTop:2 }}>{a.time}</div>
                </div>
              </div>
            )
          })}
        </div>
        <div style={{ padding:'10px 16px', textAlign:'center', fontSize:'.6rem', color:'#94A3B8', borderTop:'1px solid #F1F5F9' }}>
          {alerts.filter((_,i)=>!readSet.has(i)).length} alertas sin leer
        </div>
      </div>
    </>
  )
}

export default function FabricantePage() {
  const { goHome, fabProfile } = useApp()
  const isOps = fabProfile === 'operaciones'
  const currentNav = isOps ? NAV_OPS : NAV
  const currentScreens = isOps ? SCREENS_OPS : SCREENS
  const defaultScreen = isOps ? 'odash' : 'fdash'
  const PUSH_MSGS = isOps ? PUSH_MSGS_OPS : PUSH_MSGS_DIR
  const [active, setActive] = useState(defaultScreen)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modal, setModal] = useState(null)
  const [push, setPush] = useState(null)
  const [alertsOpen, setAlertsOpen] = useState(false)
  const [readAlerts, setReadAlerts] = useState(new Set())
  const currentAlerts = isOps ? ALERTS_OPS : ALERTS_DIR
  const unreadCount = currentAlerts.filter((_,i) => !readAlerts.has(i)).length
  const { toast, showToast } = useToast()
  const contentRef = useRef(null)

  const closeModal = useCallback(() => setModal(null), [])

  const changeSection = useCallback((id) => {
    setActive(id)
    setSidebarOpen(false)
    setTimeout(() => { if (contentRef.current) contentRef.current.scrollTop = 0 }, 0)
  }, [])

  const act = useCallback((type, detail) => {
    if (type === 'goto') { changeSection(detail); return }
    setModal(buildModal(type, detail, showToast))
  }, [showToast, changeSection])

  useEffect(() => {
    let idx = 0
    const show = () => { setPush(PUSH_MSGS[idx%PUSH_MSGS.length]); idx++; setTimeout(()=>setPush(null),5000) }
    const t1 = setTimeout(show, 20000)
    const t2 = setInterval(show, 15000)
    return () => { clearTimeout(t1); clearInterval(t2) }
  }, [])

  const Screen = currentScreens[active] || currentScreens[defaultScreen]

  const SidebarContent = () => (
    <>
      {currentNav.map((item,i) => (
        <div key={item.id}>
          {item.section && <div style={{ fontSize:'.54rem', fontWeight:700, color:'#7a8899', letterSpacing:'.14em', textTransform:'uppercase', padding:'10px 8px 4px', marginTop:i>0?4:0 }}>{item.section}</div>}
          <button onClick={() => changeSection(item.id)}
            style={{ width:'100%', textAlign:'left', padding:'8px 10px', marginBottom:2, background:active===item.id?'linear-gradient(135deg,rgba(232,116,32,.08),rgba(232,116,32,.04))':'transparent', border:active===item.id?'1px solid rgba(232,116,32,.2)':'1px solid transparent', borderRadius:7, fontSize:'.72rem', fontWeight:active===item.id?600:500, color:active===item.id?ACCENT:'#3a4a5a', cursor:'pointer', display:'flex', alignItems:'center', gap:8, position:'relative', fontFamily:'DM Sans,sans-serif' }}
            onMouseEnter={e=>{ if(active!==item.id){e.currentTarget.style.background='rgba(232,116,32,.04)';e.currentTarget.style.color=ACCENT}}}
            onMouseLeave={e=>{ if(active!==item.id){e.currentTarget.style.background='transparent';e.currentTarget.style.color='#3a4a5a'}}}>
            {active===item.id && <div style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:3, height:'55%', background:ACCENT, borderRadius:'0 2px 2px 0' }} />}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" dangerouslySetInnerHTML={{ __html:item.icon }} />
            {item.label}
            {item.ia && <span style={{ marginLeft:'auto', padding:'2px 5px', borderRadius:10, fontSize:'.52rem', fontWeight:700, background:'rgba(232,116,32,.1)', color:ACCENT, border:'1px solid rgba(232,116,32,.2)', whiteSpace:'nowrap' }}>IA</span>}
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

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)} className="fab-sidebar-overlay" style={{ position:'fixed', inset:0, background:'rgba(26,47,74,.55)', zIndex:999 }} />
      )}

      {/* Sidebar desktop */}
      <div className="fab-sidebar" style={{ width:210, flexShrink:0, display:'flex', flexDirection:'column', background:'#fff', borderRight:'1px solid #E8D5C0', overflowY:'auto', padding:'12px 8px' }}>
        <SidebarContent />
      </div>

      {/* Sidebar mobile drawer */}
      {sidebarOpen && (
        <div style={{ position:'fixed', top:0, left:0, bottom:0, width:260, background:'#fff', zIndex:1000, display:'flex', flexDirection:'column', padding:'12px 8px', boxShadow:'4px 0 32px rgba(26,47,74,.25)', overflowY:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 2px 12px', marginBottom:6, borderBottom:'1px solid #F0E4D6' }}>
            <span style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:900, color:NAVY }}>Menú</span>
            <button onClick={()=>setSidebarOpen(false)} style={{ width:28, height:28, borderRadius:'50%', background:'rgba(26,47,74,.06)', border:'none', cursor:'pointer', fontSize:'.9rem', color:'#7a8899' }}>✕</button>
          </div>
          <SidebarContent />
        </div>
      )}

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        {/* Topbar */}
        <div className="fab-topbar" style={{ height:56, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 16px', background:'#fff', borderBottom:'1px solid #E8D5C0', boxShadow:'0 1px 12px rgba(26,47,74,.06)', position:'relative', gap:8 }}>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2, background:'linear-gradient(90deg,#1A2F4A,#E87420,#F5A623,#E87420,#1A2F4A)', opacity:.6 }} />
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Hamburger */}
            <button className="fab-hamburger" onClick={()=>setSidebarOpen(true)} style={{ width:36, height:36, borderRadius:8, background:'rgba(26,47,74,.05)', border:'1px solid #E8D5C0', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={NAVY} strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:`linear-gradient(135deg,${ACCENT},#F5A623)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="14" height="14" viewBox="0 0 48 48" fill="none"><path d="M14 36V22a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v14" stroke="#fff" strokeWidth="3" strokeLinecap="round"/><path d="M10 36h28" stroke="#fff" strokeWidth="3" strokeLinecap="round"/></svg>
              </div>
              <span style={{ fontFamily:'Barlow Condensed', fontSize:'1rem', fontWeight:900, color:NAVY, whiteSpace:'nowrap' }}>Food<span style={{ color:ACCENT }}>Bridge IA</span></span>
            </div>
            <span className="fab-topbar-tagline" style={{ fontSize:'.68rem', color:'#7a8899', fontStyle:'italic', whiteSpace:'nowrap' }}>{isOps ? '"Tu calidad, verificada por IA"' : '"Tu catálogo, automatizado por IA"'}</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
            <span style={{ padding:'3px 10px', borderRadius:20, fontSize:'.62rem', fontWeight:700, letterSpacing:'.06em', textTransform:'uppercase', background:'#FFF3E8', color:ACCENT, border:'1px solid rgba(232,116,32,.25)', whiteSpace:'nowrap' }}>{isOps ? 'Operaciones' : 'Fabricante CEO'}</span>
            {/* Bell */}
            <div onClick={()=>setAlertsOpen(v=>!v)} style={{ position:'relative', cursor:'pointer', display:'flex', alignItems:'center' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7a8899" strokeWidth="2" strokeLinecap="round" style={{ transition:'transform .2s' }}
                onMouseEnter={e=>e.currentTarget.style.transform='rotate(20deg)'} onMouseLeave={e=>e.currentTarget.style.transform=''}>
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <div style={{ position:'absolute', top:-6, right:-8, background:'#e03030', color:'#fff', fontSize:'.52rem', fontWeight:800, borderRadius:10, minWidth:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', border:'2px solid #fff' }}>
                  {unreadCount}
                </div>
              )}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'.72rem', color:'#3a4a5a' }}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:`linear-gradient(135deg,${NAVY},${ACCENT})`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.6rem', fontWeight:700, color:'#fff', flexShrink:0 }}>IL</div>
              <span className="fab-topbar-user-name" style={{ whiteSpace:'nowrap' }}>Industrias Alimentarias Levante</span>
            </div>
            <button onClick={goHome} style={{ padding:'4px 10px', border:'1px solid #E8D5C0', borderRadius:20, background:'transparent', color:'#7a8899', fontSize:'.65rem', cursor:'pointer', fontFamily:'DM Sans,sans-serif', whiteSpace:'nowrap' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=ACCENT;e.currentTarget.style.color=ACCENT}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='#E8D5C0';e.currentTarget.style.color='#7a8899'}}>
              ↩ Salir
            </button>
          </div>
        </div>

        {/* Content */}
        <div ref={contentRef} className="fab-content-pad scrollable" style={{ flex:1, overflowY:'auto', padding:'20px 22px', background:'#FFF8F0' }}>
          <Screen act={act} />
        </div>
      </div>

      <Modal modal={modal} onClose={closeModal} />
      <Toast msg={toast} />
      {push && <PushNotif msg={push} onClose={()=>setPush(null)} />}
      {alertsOpen && <AlertsModal alerts={currentAlerts} onClose={()=>setAlertsOpen(false)} readSet={readAlerts} onMarkRead={i=>setReadAlerts(s=>new Set([...s,i]))} />}
    </div>
  )
}
