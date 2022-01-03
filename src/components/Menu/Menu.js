import React, { useEffect } from 'react'
import { useLocation } from 'react-router'
import { Link } from 'react-router-dom'
import { useAuth, useFirestore, useIsMobile } from 'hooks'
import UserIcon from 'assets/user.svg'
import { Text, ExternalLink, Spacer } from '@sharingexcess/designsystem'

export function Menu({ isOpen, setIsOpen }) {
  const { pathname } = useLocation()
  // get current user state from AuthContext
  const { user, admin, permission, handleLogout, handleLogin } = useAuth()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) setIsOpen(false)
  }, [isMobile]) // eslint-disable-line

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
        <Link to="/profile" onClick={() => setIsOpen(false)}>
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
        {isMobile ? null : (
          <i id="Close" className="fa fa-times" onClick={closeMenu} />
        )}
      </div>
    ) : (
      <button className="login" onClick={handleLogin}>
        Log in
      </button>
    )
  }
  return user ? (
    <>
      {isOpen && isMobile ? (
        <div id="MenuBackground" onClick={closeMenu} />
      ) : null}
      <aside id="Menu" className={isOpen ? 'open' : 'closed'}>
        <UserProfile />
        <div id="MenuContent">
          <ul>
            {permission ? (
              <>
                <MenuLink label="🚛&nbsp;&nbsp;Rescues" url="/rescues" />
                <MenuLink label="📊&nbsp;&nbsp;Your Stats" url="/stats" />
              </>
            ) : null}
            {admin && (
              <>
                <MenuLink
                  label="➕&nbsp;&nbsp;Schedule Rescue"
                  url="/admin/create-rescue"
                />
                <MenuLink
                  label="✍️&nbsp;&nbsp;Log Rescue"
                  url="/admin/log-rescue"
                />
                <MenuLink
                  label="🏢&nbsp;&nbsp;Organizations"
                  url="/admin/organizations"
                />
                <MenuLink label="👪&nbsp;&nbsp;Users" url="/admin/users" />
                <MenuLink
                  label="📈&nbsp;&nbsp;Analytics"
                  url="/admin/analytics"
                />
              </>
            )}
            <MenuLink label="🍎&nbsp;&nbsp;Food Safety" url="/food-safety" />
            <MenuLink label="💡&nbsp;&nbsp;Tutorial" url="/tutorial" />
            <MenuLink label="🙋&nbsp;&nbsp;Help" url="/contact" />

            <li
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
            >
              <Text type="subheader" color="black" classList={['Menu-link']}>
                🚪&nbsp;&nbsp;Logout
              </Text>
            </li>
          </ul>
        </div>
        <nav>
          <ExternalLink to="/privacy">privacy policy</ExternalLink>
          <ExternalLink to="/tos">terms of service</ExternalLink>
        </nav>
      </aside>{' '}
    </>
  ) : null
}
