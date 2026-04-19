import { useState } from 'react'
import AppShell from '../../components/AppShell'

export default function ComercialPage() {
  const [activeSection, setActiveSection] = useState('dashboard')
  return (
    <AppShell activeSection={activeSection} setActiveSection={setActiveSection}>
      <div className="flex-1 scrollable" style={{ background: '#F5F6F8' }}>
        <div className="px-6 py-4 border-b" style={{ background: '#fff', borderColor: 'rgba(26,47,74,.07)' }}>
          <h1 className="text-base font-bold" style={{ color: '#1A2F4A' }}>Panel Comercial</h1>
        </div>
        <div className="p-6">
          <div className="rounded-2xl p-8 text-center" style={{ background: '#fff', border: '1px solid rgba(26,47,74,.07)' }}>
            <div style={{ fontFamily: 'Barlow Condensed', fontSize: '1.6rem', fontWeight: 900, color: '#1A2F4A' }}>Panel Comercial</div>
            <div className="mt-2 text-sm" style={{ color: '#7A8899' }}>En construcción — próxima entrega</div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
