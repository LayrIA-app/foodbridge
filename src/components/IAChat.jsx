import { useState, useRef, useEffect } from 'react'
import { askIA } from '../services/ia'
import { useApp } from '../context/AppContext'

export default function IAChat({ role, accent = '#E87420', collapsed = false }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: role === 'fabricante'
        ? '¡Hola Martín! Soy tu asistente IA de FoodBridge. Puedo ayudarte a optimizar tu catálogo, encontrar clientes ideales y analizar tendencias del mercado. ¿Por dónde empezamos?'
        : role === 'cliente'
        ? '¡Hola Sara! Estoy aquí para ayudarte a encontrar los mejores fabricantes según tus necesidades. Puedo comparar productos, analizar precios y recomendarte opciones. ¿Qué buscas hoy?'
        : '¡Hola! Panel de administración activo. Puedo ayudarte a analizar métricas globales, detectar anomalías y optimizar el matching de la plataforma. ¿Qué analizamos?'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(!collapsed)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)
    try {
      const history = messages.slice(-6)
      const reply = await askIA(userMsg, role, history)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error de conexión. Inténtalo de nuevo.' }])
    }
    setLoading(false)
  }

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }

  const QUICK = role === 'fabricante'
    ? ['¿Cómo optimizo mi catálogo?', '¿Qué tendencias hay en lácteos?', 'Analiza mis ventas']
    : role === 'cliente'
    ? ['Busco quesos artesanales', '¿Mejores fabricantes de conservas?', 'Compara precios']
    : ['Métricas del mes', 'Usuarios inactivos', 'Optimizar matching']

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold z-40"
        style={{ background: accent }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
        </svg>
        IA Asistente
        <div className="w-2 h-2 rounded-full bg-white animate-pulse-icon" />
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full animate-slideIn" style={{ background: '#fff', borderLeft: '1px solid rgba(26,47,74,.08)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(26,47,74,.08)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg ia-gradient flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: '#1A2F4A' }}>Asistente IA</div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full animate-dotPulse" style={{ background: '#22A06B' }} />
              <span className="text-[10px] font-semibold" style={{ color: '#22A06B' }}>En línea</span>
            </div>
          </div>
        </div>
        {collapsed && (
          <button onClick={() => setOpen(false)} className="text-[#7A8899] hover:text-[#1A2F4A] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 scrollable px-3 py-3 space-y-3" style={{ minHeight: 0 }}>
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-lg ia-gradient flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
            )}
            <div className="max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed"
              style={{
                background: m.role === 'user' ? accent : 'rgba(26,47,74,.04)',
                color: m.role === 'user' ? '#fff' : '#1A2F4A',
                borderRadius: m.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
              }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-lg ia-gradient flex items-center justify-center mr-2 flex-shrink-0">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <div className="px-3 py-2 rounded-xl flex items-center gap-1" style={{ background: 'rgba(26,47,74,.04)' }}>
              {[0,1,2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full animate-dotPulse" style={{ background: accent, animationDelay: `${i * .15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
        {QUICK.map((q, i) => (
          <button key={i} onClick={() => { setInput(q); }}
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all hover:opacity-80"
            style={{ color: accent, borderColor: `${accent}40`, background: `${accent}0D` }}>
            {q}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: 'rgba(26,47,74,.05)', border: '1px solid rgba(26,47,74,.08)' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Pregunta algo..."
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-[#7A8899]"
            style={{ color: '#1A2F4A' }}
          />
          <button onClick={send} disabled={!input.trim() || loading}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
            style={{ background: accent }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
