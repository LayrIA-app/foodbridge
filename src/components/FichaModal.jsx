import { pdfFichaTecnica } from '../utils/generatePDF'

const ACCENT = '#E87420'
const NAVY = '#1A2F4A'

/*
 * FichaModal — Modal de ficha técnica completa (Reg. 1169/2011).
 * Fidelidad HTML v5 FoodBridge_IA_v5_restaurado.html líneas 3413-3434
 * (ficha-modal + #fm-ident, #fm-alerg, #fm-nutri, #fm-micro).
 *
 * Props:
 *   - ficha: { nombre, ref, fabricante, categoria, estado, certs[] } · null para cerrar
 *   - onClose: () => void
 *
 * Botón "Descargar PDF" invoca `pdfFichaTecnica` de src/utils/generatePDF.js.
 */
export default function FichaModal({ ficha, onClose }) {
  if (!ficha) return null

  const ident = [
    ['Producto', ficha.nombre],
    ['Referencia', ficha.ref || '—'],
    ['Fabricante', ficha.fabricante || 'Harinas del Mediterráneo S.L.'],
    ['Categoría', ficha.categoria || '—'],
    ['Estado', ficha.estado === 'parcial' ? 'Parcialmente validada' : 'Completa y validada'],
    ['Vida útil', ficha.vidaUtil || '18 meses'],
  ]

  // Reg. UE 1169/2011 · 14 alérgenos obligatorios
  const ALERGENOS = ficha.alergenos || [
    { nom:'Gluten',        estado:'presente',  det:'Trigo · sin trazas cruzadas' },
    { nom:'Lácteos',       estado:'ausente',   det:'No presente' },
    { nom:'Huevos',        estado:'ausente',   det:'No presente' },
    { nom:'Pescado',       estado:'ausente',   det:'No presente' },
    { nom:'Crustáceos',    estado:'ausente',   det:'No presente' },
    { nom:'Cacahuetes',    estado:'ausente',   det:'No presente' },
    { nom:'Soja',          estado:'trazas',    det:'Posibles trazas (mismo obrador)' },
    { nom:'Frutos cáscara',estado:'ausente',   det:'No presente' },
    { nom:'Apio',          estado:'ausente',   det:'No presente' },
    { nom:'Mostaza',       estado:'ausente',   det:'No presente' },
    { nom:'Sésamo',        estado:'ausente',   det:'No presente' },
    { nom:'Sulfitos',      estado:'ausente',   det:'< 10 mg/kg' },
    { nom:'Altramuces',    estado:'ausente',   det:'No presente' },
    { nom:'Moluscos',      estado:'ausente',   det:'No presente' },
  ]

  const NUTRI = ficha.nutri || [
    ['Valor energético',  '341 kcal / 1447 kJ'],
    ['Grasas',            '1,3 g'],
    ['  de las cuales saturadas', '0,3 g'],
    ['Hidratos de carbono','72,3 g'],
    ['  de los cuales azúcares', '0,4 g'],
    ['Fibra alimentaria',  '2,8 g'],
    ['Proteínas',          '11,4 g'],
    ['Sal',                '< 0,01 g'],
  ]

  const MICRO = ficha.micro || [
    ['Aerobios mesófilos',     '< 10⁵ UFC/g'],
    ['Enterobacterias',        '< 10² UFC/g'],
    ['E. coli',                '< 10 UFC/g'],
    ['Salmonella',             'Ausencia / 25 g'],
    ['Mohos y levaduras',      '< 10³ UFC/g'],
    ['Bacillus cereus',        '< 10² UFC/g'],
  ]

  const alergColors = {
    presente: { bg:'#FDECEA', border:'rgba(224,48,48,.25)', text:'#e03030', dot:'#e03030', label:'PRESENTE' },
    trazas:   { bg:'#FDF3E7', border:'rgba(232,160,16,.3)', text:'#e8a010', dot:'#e8a010', label:'TRAZAS' },
    ausente:  { bg:'#EBF5EF', border:'rgba(45,138,48,.2)',  text:'#2D8A30', dot:'#2D8A30', label:'AUSENTE' },
  }

  return (
    <>
      <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(26,47,74,.6)', backdropFilter:'blur(4px)', zIndex:9500 }}/>
      <div style={{ position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:9501, padding:'0 16px', pointerEvents:'none' }}>
        <div onClick={e=>e.stopPropagation()} style={{ background:'#fff', borderRadius:14, width:'100%', maxWidth:520, maxHeight:'88vh', overflow:'hidden', display:'flex', flexDirection:'column', boxShadow:'0 24px 80px rgba(0,0,0,.3)', pointerEvents:'auto', animation:'modalIn .25s ease both' }}>

          {/* Header */}
          <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(232,116,32,.12)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexShrink:0 }}>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontFamily:'Barlow Condensed, sans-serif', fontSize:'1rem', fontWeight:900, color:NAVY, overflow:'hidden', textOverflow:'ellipsis' }}>Ficha Técnica</div>
              <div style={{ fontSize:'.55rem', color:'#7a8899', marginTop:2 }}>{ficha.ref || 'REF-001'}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
              <button onClick={()=>pdfFichaTecnica({ nombre: ficha.nombre, ref: ficha.ref })} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 12px', borderRadius:7, border:'none', background:`linear-gradient(135deg,${ACCENT},#D06A1C)`, color:'#fff', fontSize:'.62rem', fontWeight:700, cursor:'pointer', fontFamily:'DM Sans,sans-serif' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Descargar PDF
              </button>
              <button onClick={onClose} aria-label="Cerrar" style={{ width:28, height:28, borderRadius:'50%', border:'none', background:'rgba(26,47,74,.06)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ overflowY:'auto', padding:'16px 18px', flex:1 }}>

            {/* Badges */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
              {(ficha.certs || ['IFS Food v8','BRC Grade A','Reg. 1169/2011','Reg. 178/2002']).map(b => (
                <span key={b} style={{ fontSize:'.52rem', fontWeight:700, padding:'3px 8px', borderRadius:10, background:'#EBF5EF', color:'#2D8A30', border:'1px solid rgba(45,138,48,.2)' }}>{b}</span>
              ))}
            </div>

            {/* 1. IDENTIFICACIÓN */}
            <div style={{ fontSize:'.58rem', fontWeight:800, color:ACCENT, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>IDENTIFICACIÓN</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:6, marginBottom:14 }}>
              {ident.map(([k,v]) => (
                <div key={k} style={{ padding:'8px 10px', borderRadius:6, background:'#FAFBFC', border:'1px solid #F1F5F9' }}>
                  <div style={{ fontSize:'.5rem', color:'#7a8899', letterSpacing:'.08em', textTransform:'uppercase', marginBottom:2 }}>{k}</div>
                  <div style={{ fontSize:'.65rem', fontWeight:700, color:NAVY }}>{v}</div>
                </div>
              ))}
            </div>

            {/* 2. ALÉRGENOS (Reg. 1169/2011) */}
            <div style={{ fontSize:'.58rem', fontWeight:800, color:ACCENT, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>ALÉRGENOS (Reg. 1169/2011)</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:6, marginBottom:14 }}>
              {ALERGENOS.map(a => {
                const c = alergColors[a.estado] || alergColors.ausente
                return (
                  <div key={a.nom} style={{ padding:'6px 9px', borderRadius:6, background:c.bg, border:`1px solid ${c.border}` }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                      <div style={{ width:6, height:6, borderRadius:'50%', background:c.dot, flexShrink:0 }}/>
                      <span style={{ fontSize:'.62rem', fontWeight:700, color:NAVY }}>{a.nom}</span>
                      <span style={{ marginLeft:'auto', fontSize:'.46rem', fontWeight:800, color:c.text, letterSpacing:'.06em' }}>{c.label}</span>
                    </div>
                    <div style={{ fontSize:'.5rem', color:'#7a8899' }}>{a.det}</div>
                  </div>
                )
              })}
            </div>

            {/* 3. VALORES NUTRICIONALES / 100g */}
            <div style={{ fontSize:'.58rem', fontWeight:800, color:ACCENT, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>VALORES NUTRICIONALES / 100g</div>
            <div style={{ marginBottom:14, border:'1px solid #F1F5F9', borderRadius:6, overflow:'hidden' }}>
              {NUTRI.map(([k,v],i) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 10px', borderBottom: i<NUTRI.length-1?'1px solid #F1F5F9':'none', background: i%2 ? '#FAFBFC':'#fff' }}>
                  <span style={{ fontSize:'.62rem', color:k.startsWith('  ')?'#7a8899':NAVY, fontWeight:k.startsWith('  ')?500:600 }}>{k}</span>
                  <span style={{ fontSize:'.62rem', color:NAVY, fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>

            {/* 4. PARÁMETROS MICROBIOLÓGICOS */}
            <div style={{ fontSize:'.58rem', fontWeight:800, color:ACCENT, letterSpacing:'.1em', textTransform:'uppercase', marginBottom:8 }}>PARÁMETROS MICROBIOLÓGICOS</div>
            <div style={{ border:'1px solid #F1F5F9', borderRadius:6, overflow:'hidden' }}>
              {MICRO.map(([k,v],i) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 10px', borderBottom: i<MICRO.length-1?'1px solid #F1F5F9':'none', background: i%2 ? '#FAFBFC':'#fff' }}>
                  <span style={{ fontSize:'.62rem', color:NAVY, fontWeight:600 }}>{k}</span>
                  <span style={{ fontSize:'.62rem', color:'#2D8A30', fontWeight:700 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
