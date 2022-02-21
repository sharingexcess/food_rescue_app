import { AuthContext } from 'contexts'
import { useContext } from 'react'

export const useAuth = () =>
  useContext(AuthContext) || {
    user: null,
    admin: false,
    permission: null,
    driver: false,
    handleLogout: () => null,
  }
