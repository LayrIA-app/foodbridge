import { createContext, useContext, useState } from 'react'

const AppContext = createContext()

export function AppProvider({ children }) {
  const [currentRole, setCurrentRole] = useState(null)
  const [inPanel, setInPanel] = useState(false)
  const [fabProfile, setFabProfile] = useState('directivo')

  return (
    <AppContext.Provider value={{
      currentRole, inPanel, fabProfile,
      enterAs: (id) => { setCurrentRole(id); setInPanel(false) },
      enterPanel: (fp) => { if (fp) setFabProfile(fp); setInPanel(true) },
      goHome: () => { setCurrentRole(null); setInPanel(false); setFabProfile('directivo') },
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
