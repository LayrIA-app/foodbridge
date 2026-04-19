import { AppProvider, useApp } from './context/AppContext'
import HomeScreen from './pages/HomeScreen'
import LoginScreen from './pages/LoginScreen'
import FabricantePage from './pages/fabricante/FabricantePage'
import ComercialPage from './pages/comercial/ComercialPage'
import ClientePage from './pages/cliente/ClientePage'

function Router() {
  const { currentRole, inPanel } = useApp()
  if (!currentRole) return <HomeScreen />
  if (!inPanel) return <LoginScreen />
  if (currentRole === 'fabricante') return <FabricantePage />
  if (currentRole === 'comercial') return <ComercialPage />
  if (currentRole === 'cliente') return <ClientePage />
  return <HomeScreen />
}

export default function App() {
  return <AppProvider><Router /></AppProvider>
}
