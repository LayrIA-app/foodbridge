import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export const roles = {
  fabricante: { id: 'fabricante', label: 'Fabricante', user: { name: 'Martín Larrea', company: 'Lácteos Larrea S.L.', avatar: 'ML' } },
  comercial:  { id: 'comercial',  label: 'Comercial',  user: { name: 'José Luis Díaz', company: 'FoodBridge Comercial', avatar: 'JL' } },
  cliente:    { id: 'cliente',    label: 'Cliente',    user: { name: 'Sara Gómez', company: 'Distribuciones SG', avatar: 'SG' } },
}

export function AppProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(null)
  return (
    <AppContext.Provider value={{
      currentRole,
      roleData: currentRole ? roles[currentRole] : null,
      enterAs: (id) => setCurrentRole(id),
      goHome: () => setCurrentRole(null),
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
