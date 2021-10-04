import React from 'react'
import { useLocation } from 'react-router'
import { Link } from 'react-router-dom'
import { useAuth, useFirestore } from 'hooks'
import UserIcon from 'assets/user.svg'
import { MOBILE_THRESHOLD } from 'helpers'
import { Text, ExternalLink, Spacer } from '@sharingexcess/designsystem'

export function Menu({ isOpen, setIsOpen }) {
  const { pathname } = useLocation()
  // get current user state from AuthContext
  const { user, admin, handleLogout, handleLogin } = useAuth()

  // get public user profile state
  const profile = useFirestore('users', user ? user.uid : {})

  function closeMenu() {
    setIsOpen(false)
  }

  function isCurrentRoute(url) {
    return pathname.includes(url)
  }

  function MenuLink({ url, label }) {
    return (
      <>
        <li onClick={() => setIsOpen(false)}>
          <Link to={url}>
            <Text
              type="subheader"
              classList={['Menu-link']}
              color={isCurrentRoute(url) ? 'green' : 'black'}
            >
              {label}
            </Text>
          </Link>
        </li>
        <Spacer height={16} />
      </>
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
        <Link to="/profile">
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
        </Link>
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
          {admin ? (
            <>
              <MenuLink label="New Route" url="/admin/create-route" />
              <MenuLink
                label="New Direct Donation"
                url="/admin/create-direct-donation"
              />
              <MenuLink label="Organizations" url="/admin/organizations" />
              <MenuLink label="Users" url="/admin/users" />
            </>
          ) : (
            <>
              <MenuLink label="Food Safety" url="/food-safety" />
              <MenuLink label="Tutorial" url="/tutorial" />
            </>
          )}
          <li
            onClick={() => {
              setIsOpen(false)
              handleLogout()
            }}
          >
            <Text type="subheader" color="black" classList={['Menu-link']}>
              Logout
            </Text>
          </li>
        </ul>
      </div>
      <nav>
        <ExternalLink to="/privacy">privacy policy</ExternalLink>
        <ExternalLink to="/tos">terms of service</ExternalLink>
      </nav>
    </aside>
  )
}
