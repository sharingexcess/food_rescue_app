import React, { useEffect, useState } from 'react'
import useUserData from '../../hooks/useUserData'
import { useAuthContext } from '../Auth/Auth'
import Profile from '../Profile/Profile'

function Requirements({ children }) {
  const [hasPhone, setHasPhone] = useState(false)
  const { user } = useAuthContext()
  const profile = useUserData(user.uid)

  useEffect(() => {
    if (profile) {
      setHasPhone(profile.phone ? true : false)
    }
  }, [profile])
  // user has to complete this before moving on
  return hasPhone ? (
    <>{children}</>
  ) : (
    <Profile handleUpdateClick={() => setHasPhone(true)} inForm={true} />
  )
}

export default Requirements
