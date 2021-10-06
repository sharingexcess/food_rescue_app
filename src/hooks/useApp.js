import { AppContext } from 'contexts'
import { useContext } from 'react'

export const useApp = () =>
  useContext(AppContext) || {
    modal: null,
    modalState: null,
  }
