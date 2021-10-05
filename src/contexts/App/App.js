import { useState, createContext } from 'react'
import { useLocation } from 'react-router'
import { useEffect } from 'react/cjs/react.development'

const AppContext = createContext()
AppContext.displayName = 'App'

function App({ children }) {
  const { pathname } = useLocation()
  const [modal, setModal] = useState()
  const [modalState, setModalState] = useState()

  useEffect(() => {
    // handle clearing modalState on pathname change
    setModalState()
    setModal()
  }, [pathname])

  return (
    <AppContext.Provider value={{ modal, setModal, modalState, setModalState }}>
      {children}
    </AppContext.Provider>
  )
}
export { App, AppContext }
