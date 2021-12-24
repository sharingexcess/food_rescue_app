import { createTimestamp, setFirestoreData } from 'helpers'
import { useAuth } from 'hooks'
import { useState, createContext, useEffect } from 'react'
import { useLocation } from 'react-router'

const AppContext = createContext()
AppContext.displayName = 'App'

function App({ children }) {
  const { pathname } = useLocation()
  const [modal, setModal] = useState()
  const [modalState, setModalState] = useState()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      setFirestoreData(['users', user.id], {
        timestamp_last_active: createTimestamp(),
      })
    }
  }, [user])

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
