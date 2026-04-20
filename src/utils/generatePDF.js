import { jsPDF } from 'jspdf'

const NAVY = '#1A2F4A'
const ORANGE = '#E87420'
const GRAY = '#7a8899'

function rgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)]
}

function header(doc, title, subtitle) {
  doc.setFillColor(...rgb(NAVY))
  doc.rect(0, 0, 210, 32, 'F')
  doc.setFont('helvetica','bold')
  doc.setFontSize(20)
  doc.setTextColor(255,255,255)
  doc.text('Food', 14, 20)
  doc.setTextColor(...rgb(ORANGE))
  doc.text('Bridge IA', 33, 20)
  doc.setFontSize(7)
  doc.setFont('helvetica','normal')
  doc.setTextColor(190,190,190)
  doc.text('Soluciones inteligentes by COAXIONIA', 14, 27)
  doc.setFillColor(...rgb(ORANGE))
  doc.rect(0, 32, 210, 1.5, 'F')
  doc.setFont('helvetica','bold')
  doc.setFontSize(14)
  doc.setTextColor(...rgb(NAVY))
  doc.text(title, 14, 46)
  if (subtitle) {
    doc.setFont('helvetica','normal')
    doc.setFontSize(8)
    doc.setTextColor(...rgb(GRAY))
    doc.text(subtitle, 14, 54)
    return 62
  }
  return 54
}

function footer(doc) {
  const h = doc.internal.pageSize.height
  doc.setFillColor(245,245,245)
  doc.rect(0, h-14, 210, 14, 'F')
  doc.setFontSize(6.5)
  doc.setFont('helvetica','normal')
  doc.setTextColor(...rgb(GRAY))
  doc.text('From FoodBridge IA · Soluciones inteligentes by COAXIONIA · www.coaxionia.com · © Todos los derechos reservados', 14, h-5)
  doc.text(new Date().toLocaleDateString('es-ES'), 185, h-5)
}

function kpi(doc, x, y, val, label, color) {
  doc.setFillColor(248,248,248)
  doc.roundedRect(x, y, 42, 22, 2, 2, 'F')
  doc.setFont('helvetica','bold')
  doc.setFontSize(13)
  doc.setTextColor(...rgb(color || ORANGE))
  doc.text(String(val), x+3, y+13)
  doc.setFont('helvetica','normal')
  doc.setFontSize(6.5)
  doc.setTextColor(...rgb(GRAY))
  doc.text(label, x+3, y+19)
}

function tableRow(doc, y, cols, widths, isHeader) {
  if (isHeader) {
    doc.setFillColor(...rgb(NAVY))
    doc.rect(14, y-5.5, 182, 8, 'F')
    doc.setTextColor(255,255,255)
    doc.setFont('helvetica','bold')
    doc.setFontSize(7.5)
  } else {
    doc.setTextColor(...rgb(NAVY))
    doc.setFont('helvetica','normal')
    doc.setFontSize(7.5)
    doc.setDrawColor(230,230,230)
    doc.line(14, y+3, 196, y+3)
  }
  let x = 14
  cols.forEach((text, i) => {
    doc.text(String(text||''), x+1, y)
    x += widths[i]
  })
  return y + 9
}

// ══ EXPORTS ══

export function pdfCotizacion(cot) {
  const doc = new jsPDF()
  let y = header(doc, `Cotización ${cot.ref}`, `Cliente: ${cot.cliente||'Panaderías Leopold S.L.'} · ${new Date().toLocaleDateString('es-ES')}`)
  y += 6
  kpi(doc, 14, y, cot.pvp||'3.233€', 'PVP Total', ORANGE)
  kpi(doc, 58, y, cot.qty||'3.000 kg', 'Cantidad', NAVY)
  kpi(doc, 102, y, cot.fab||'Harinas Med.', 'Fabricante', '#2D8A30')
  y += 30

  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...rgb(NAVY))
  doc.text('Detalle de la cotización', 14, y); y += 8

  const cols = ['Concepto','Detalle']
  const ws = [80, 102]
  y = tableRow(doc, y, cols, ws, true)
  ;[
    ['Producto', cot.prod||'Harina Panadera W-280'],
    ['Fabricante', cot.fab||'Harinas del Mediterráneo'],
    ['Cantidad', cot.qty||'3.000 kg'],
    ['Coste fábrica', '2.550€ (0,85€/kg)'],
    ['Transporte', '190€ (Valencia centro)'],
    [`Margen ${cot.margen||'18%'}`, '493€'],
    ['PVP TOTAL (IVA no incluido)', cot.pvp||'3.233€'],
  ].forEach(r => { y = tableRow(doc, y, r, ws, false) })

  y += 10
  doc.setFillColor(255,243,232)
  doc.roundedRect(14, y, 182, 16, 2, 2, 'F')
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...rgb(ORANGE))
  doc.text('FoodBridge IA:', 18, y+7)
  doc.setFont('helvetica','normal'); doc.setTextColor(...rgb(NAVY))
  doc.text('Cotización generada automáticamente. Validez: 30 días · Entrega: 48-72h · Pago a 30 días.', 52, y+7)
  doc.setFontSize(7); doc.setTextColor(...rgb(GRAY))
  doc.text('Precio competitivo vs. mercado según análisis IA de 1.247 fichas técnicas activas.', 18, y+13)

  footer(doc)
  doc.save(`cotizacion-${cot.ref||'COT'}.pdf`)
}

export function pdfFichaTecnica(prod) {
  const doc = new jsPDF()
  let y = header(doc, `Ficha Técnica: ${prod.nombre||'Harina W-280'}`, `Ref: ${prod.ref||'HM-W280-25'} · Fabricante: Harinas del Mediterráneo`)
  y += 6
  kpi(doc, 14, y, 'IFS v8', 'Certificación', '#2D8A30')
  kpi(doc, 58, y, 'Gluten', 'Alérgeno principal', '#e03030')
  kpi(doc, 102, y, 'W-280', 'Fuerza harinera', ORANGE)
  kpi(doc, 146, y, '14%', 'Humedad máx.', '#1A78FF')
  y += 30

  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...rgb(NAVY))
  doc.text('Información técnica', 14, y); y += 8
  const ws = [80,102]
  y = tableRow(doc, y, ['Parámetro','Valor'], ws, true)
  ;[
    ['Producto', prod.nombre||'Harina Panadera W-280'],
    ['Referencia', prod.ref||'HM-W280-25'],
    ['Fabricante', 'Harinas del Mediterráneo S.L.'],
    ['Fuerza (W)', '280'],
    ['Proteína', '11.5%'],
    ['Humedad', '< 14%'],
    ['Cenizas', '0.55%'],
    ['Alérgenos', 'Gluten (trigo). Sin trazas cruzadas.'],
    ['Certificaciones', 'IFS Food v8 · BRC Grade A · ISO 22000'],
    ['Trazabilidad', 'Reg. 178/2002 completa'],
    ['Reg. etiquetado', 'Reg. 1169/2011 · 14 alérgenos declarados'],
    ['Microbiología', 'Ausencia Salmonella · <100 UFC/g enterobacterias'],
  ].forEach(r => { y = tableRow(doc, y, r, ws, false) })

  footer(doc)
  doc.save(`ficha-tecnica-${(prod.nombre||'producto').replace(/\s+/g,'-').toLowerCase()}.pdf`)
}

export function pdfInformeCEO() {
  const doc = new jsPDF()
  let y = header(doc, 'Informe CEO — Q1 2026', 'Industrias Alimentarias Levante S.L. · Abril 2026')
  y += 6
  kpi(doc, 14, y, '847k€', 'Ventas Q1 2026', '#2D8A30')
  kpi(doc, 58, y, '22%', 'Margen bruto', ORANGE)
  kpi(doc, 102, y, '186k€', 'Beneficio neto', '#1A78FF')
  kpi(doc, 146, y, '23', 'Agentes activos', '#e8a010')
  y += 30

  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...rgb(NAVY))
  doc.text('Ventas por canal de distribución', 14, y); y += 8
  const ws = [50,40,30,62]
  y = tableRow(doc, y, ['Canal','Q1 2026','% Total','Tendencia'], ws, true)
  ;[
    ['Agentes B2B','487.000€','57%','▲ +9.8%/mes'],
    ['Venta directa','234.000€','28%','▲ +5.2%/mes'],
    ['Marketplace','126.000€','15%','▲ +10.5%/mes'],
    ['TOTAL','847.000€','100%','▲ +38% vs Q1 2025'],
  ].forEach(r => { y = tableRow(doc, y, r, ws, false) })

  y += 8
  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...rgb(NAVY))
  doc.text('Productos más solicitados', 14, y); y += 8
  const ws2 = [60,35,30,57]
  y = tableRow(doc, y, ['Producto','Solicitudes','Conversión','Tendencia'], ws2, true)
  ;[
    ['Harina W-280','342','87%','▲ +22%'],
    ['Harina W-380','198','82%','▲ +15%'],
    ['Harina Eco T-110','156','74%','▲ +48%'],
    ['Harina Repostería W-180','134','79%','▲ +2%'],
    ['Sémola Trigo Duro','89','62%','▼ -8%'],
  ].forEach(r => { y = tableRow(doc, y, r, ws2, false) })

  y += 10
  doc.setFillColor(255,243,232)
  doc.roundedRect(14, y, 182, 14, 2, 2, 'F')
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...rgb(ORANGE))
  doc.text('Proyección IA anual:', 18, y+6)
  doc.setFont('helvetica','normal'); doc.setTextColor(...rgb(NAVY))
  doc.text('Cerrarás 2026 con 3.4M€ de ingresos y 748k€ de beneficio neto si se mantiene tendencia Q1.', 18, y+12)

  footer(doc)
  doc.save('informe-CEO-Q1-2026.pdf')
}

export function pdfRentabilidad() {
  const doc = new jsPDF()
  let y = header(doc, 'Informe de Rentabilidad', 'Q1 2026 · Industrias Alimentarias Levante S.L.')
  y += 6
  kpi(doc, 14, y, '22%', 'Margen bruto medio', ORANGE)
  kpi(doc, 58, y, '186k€', 'Beneficio neto Q1', '#2D8A30')
  kpi(doc, 102, y, '18%', 'Prod. más rentable', '#1A78FF')
  kpi(doc, 146, y, '3', 'A revisar', '#e03030')
  y += 30

  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...rgb(NAVY))
  doc.text('Margen por producto', 14, y); y += 8
  const ws = [45,28,28,25,22,34]
  y = tableRow(doc, y, ['Producto','P.Venta','Coste','Margen €','Margen %','Estado'], ws, true)
  ;[
    ['Harina W-380','1,15€/kg','0,94€/kg','0,21€','18.3%','✓ OK'],
    ['H. Integral T-150','1,28€/kg','1,05€/kg','0,23€','18.0%','✓ OK'],
    ['Harina W-280','0,85€/kg','0,70€/kg','0,15€','17.6%','✓ OK'],
    ['H. Ecológica','1,33€/kg','1,15€/kg','0,18€','13.5%','Revisar'],
    ['Sémola Duro','0,81€/kg','0,74€/kg','0,07€','8.6%','⚠ Urgente'],
  ].forEach(r => { y = tableRow(doc, y, r, ws, false) })

  footer(doc)
  doc.save('informe-rentabilidad-Q1-2026.pdf')
}

export function pdfCertificaciones() {
  const doc = new jsPDF()
  let y = header(doc, 'Informe de Certificaciones', 'Industrias Alimentarias Levante S.L. · Abril 2026')
  y += 12

  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...rgb(NAVY))
  doc.text('Estado de certificaciones activas', 14, y); y += 8
  const ws = [50,35,35,30,32]
  y = tableRow(doc, y, ['Certificación','Entidad','Vencimiento','Días rest.','Estado'], ws, true)
  ;[
    ['IFS Food v8','TÜV SÜD','15/06/2026','56','⚠ Caduca pronto'],
    ['BRC Global Standard','SGS','22/11/2026','216','✓ Vigente'],
    ['ISO 22000:2018','Bureau Veritas','03/09/2027','501','✓ Vigente'],
    ['RGSEAA','AESAN','Permanente','—','✓ Activo'],
    ['Ecológico EU','CAECV','En trámite','—','En proceso'],
  ].forEach(r => { y = tableRow(doc, y, r, ws, false) })

  y += 10
  doc.setFillColor(255,243,232)
  doc.roundedRect(14, y, 182, 14, 2, 2, 'F')
  doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(...rgb(ORANGE))
  doc.text('Alerta IA:', 18, y+6)
  doc.setFont('helvetica','normal'); doc.setTextColor(...rgb(NAVY))
  doc.text('IFS Food v8 caduca en 56 días. Iniciar renovación antes del 15/05/2026 para evitar impacto en 142 fichas.', 18, y+12)

  footer(doc)
  doc.save('informe-certificaciones.pdf')
}

export function pdfTrazabilidad(lote) {
  const doc = new jsPDF()
  let y = header(doc, `Trazabilidad: ${lote||'L-2026-0416'}`, `Reg. 178/2002 · Verificado por FoodBridge IA · ${new Date().toLocaleDateString('es-ES')}`)
  y += 12

  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...rgb(NAVY))
  doc.text('Información del lote', 14, y); y += 8
  const ws = [60,122]
  y = tableRow(doc, y, ['Campo','Valor'], ws, true)
  ;[
    ['Número de lote', lote||'L-2026-0416'],
    ['Producto', 'Harina Panadera W-280'],
    ['Fabricante', 'Industrias Alimentarias Levante S.L.'],
    ['Fecha producción', '16/04/2026'],
    ['Cantidad', '25.000 kg'],
    ['Análisis', 'Aprobado — Salmonella negativo'],
    ['Estado', 'Liberado para distribución'],
    ['Certificaciones lote', 'IFS Food v8 · BRC Grade A'],
    ['Alérgenos', 'Gluten (trigo). Sin trazas cruzadas.'],
  ].forEach(r => { y = tableRow(doc, y, r, ws, false) })

  y += 8
  doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.setTextColor(...rgb(NAVY))
  doc.text('Cadena de trazabilidad', 14, y); y += 8
  const ws2 = [50,40,42,50]
  y = tableRow(doc, y, ['Etapa','Fecha','Responsable','Estado'], ws2, true)
  ;[
    ['Fabricación','16/04/2026','Planta Levante','✓ Completado'],
    ['Control calidad','16/04/2026','Lab. interno','✓ Aprobado'],
    ['Almacén','17/04/2026','Almacén central','✓ Almacenado'],
    ['Expedición','18/04/2026','Transportista XYZ','✓ En ruta'],
    ['Entrega','19/04/2026','Cliente final','✓ Entregado'],
  ].forEach(r => { y = tableRow(doc, y, r, ws2, false) })

  footer(doc)
  doc.save(`trazabilidad-${lote||'L-2026-0416'}.pdf`)
}
