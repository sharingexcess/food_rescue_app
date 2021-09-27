import React from 'react'
import { useLocation } from 'react-router'
import { Link } from 'react-router-dom'
import { useAuth } from 'contexts'
import UserIcon from '../../assets/user.svg'
import { ExternalLink } from '../../helpers/components'
import { useUserData } from 'hooks'
import { MOBILE_THRESHOLD } from '../../helpers/constants'
import { Text } from '@sharingexcess/designsystem'

export function Menu({ isOpen, setIsOpen }) {
  const { pathname } = useLocation()
  // get current user state from AuthContext
  const { user, admin, handleLogout, handleLogin } = useAuth()

  // get public user profile state
  const profile = useUserData(user ? user.uid : {})

  function closeMenu() {
    setIsOpen(false)
  }

  function isCurrentRoute(url) {
    return pathname.includes(url)
  }

  function MenuLink({ url, label }) {
    return (
      <li onClick={() => setIsOpen(false)}>
        <Link to={url}>
          <Text
            type="section-header"
            classList={['Menu-link']}
            color={isCurrentRoute(url) ? 'green' : 'white'}
          >
            {label}
          </Text>
        </Link>
      </li>
    )
  }

  function UserProfile() {
    const AdminIndicator = () => {
      if (!admin) return null
      return (
        <h4 id="UserIsAdmin">
          <i className="fa fa-crown" />
          Sharing Excess Admin
        </h4>
      )
    }

    return user ? (
      <div id="UserProfile">
        <img
          src={user.photoURL || UserIcon}
          id="ProfileImg"
          alt="User"
          onClick={() => setIsOpen(true)}
        />
        <div>
          <h2 id="UserName">
            {profile && profile.name ? profile.name : user.displayName}
          </h2>
          <h3 id="UserEmail">{user.email}</h3>
          <AdminIndicator />
        </div>
        {window.innerWidth > MOBILE_THRESHOLD ? null : (
          <i id="Close" className="fa fa-times" onClick={closeMenu} />
        )}
      </div>
    ) : (
      <button className="login" onClick={handleLogin}>
        Log in
      </button>
    )
  }

  return (
    <aside id="Menu" className={isOpen ? 'open' : 'closed'}>
      <UserProfile />
      <div id="MenuContent">
        <ul>
          <MenuLink label="Routes" url="/routes" />
          <MenuLink label="History" url="/history" />
          <MenuLink label="Profile" url="/profile" />
          <MenuLink label="Food Safety" url="/foodsafety" />
          <li
            onClick={() => {
              setIsOpen(false)
              handleLogout()
            }}
          >
            <Text type="section-header" color="white">
              Logout
            </Text>
          </li>
        </ul>
      </div>
      <nav>
        <ExternalLink url="/privacy">privacy policy</ExternalLink>
        <ExternalLink url="/tos">terms of service</ExternalLink>
      </nav>
    </aside>
  )
}
