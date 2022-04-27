import React, { useEffect } from 'react'
import { useLocation } from 'react-router'
import { Link } from 'react-router-dom'
import { useAuth, useIsMobile } from 'hooks'
import UserIcon from 'assets/user.svg'
import { Text, ExternalLink, Spacer } from '@sharingexcess/designsystem'
import { IS_DEV_ENVIRONMENT, VERSION } from 'helpers'
import { Emoji } from 'react-apple-emojis'

export function Menu({ isOpen, setIsOpen }) {
  const { pathname } = useLocation()
  // get current user state from AuthContext
  const { user, admin, permission, handleLogout, handleLogin } = useAuth()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) setIsOpen(false)
  }, [isMobile]) // eslint-disable-line

  function closeMenu() {
    setIsOpen(false)
  }

  function isCurrentRoute(url) {
    return pathname.includes(url)
  }

  function MenuLink({ url, label, emoji, num }) {
    return (
      <>
        <li onClick={() => setIsOpen(false)}>
          <Link to={url}>
            <Text
              type="subheader"
              classList={['Menu-link']}
              color={isCurrentRoute(url) ? 'green' : 'black'}
            >
              <Emoji name={emoji} width={num} />
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
              {user && user.name ? user.name : user.displayName}
            </h2>
            <h3 id="UserEmail">{user.email}</h3>
            <AdminIndicator />
          </div>
        </Link>
        {isMobile ? (
          <i id="Close" className="fa fa-times" onClick={closeMenu} />
        ) : null}
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
                <MenuLink
                  emoji="articulated-lorry"
                  num={20}
                  label="&nbsp;&nbsp;Rescues"
                  url="/rescues"
                />
                <MenuLink
                  emoji="bar-chart"
                  num={20}
                  label="&nbsp;&nbsp;Your Impact"
                  url="/stats"
                />
              </>
            ) : null}
            {admin && (
              <>
                <MenuLink
                  emoji="plus"
                  num={20}
                  label="&nbsp;&nbsp;Schedule Rescue"
                  url="/admin/create-rescue"
                />
                <MenuLink
                  emoji="writing-hand"
                  num={20}
                  label="&nbsp;&nbsp;Log Rescue"
                  url="/admin/log-rescue"
                />
                <MenuLink
                  emoji="office-building"
                  num={20}
                  label="&nbsp;&nbsp;Organizations"
                  url="/admin/organizations"
                />
                <MenuLink
                  emoji="family"
                  num={20}
                  label="&nbsp;&nbsp;Users"
                  url="/admin/users"
                />
                <MenuLink
                  emoji="chart-increasing"
                  num={20}
                  label="&nbsp;&nbsp;Analytics"
                  url="/admin/analytics"
                />
              </>
            )}
            <MenuLink
              emoji="red-apple"
              num={20}
              label="&nbsp;&nbsp;Food Safety"
              url="/food-safety"
            />
            <MenuLink
              emoji="light-bulb"
              num={20}
              label="&nbsp;&nbsp;Tutorial"
              url="/tutorial"
            />
            <MenuLink
              emoji="person-raising-hand"
              num={20}
              label="&nbsp;&nbsp;Help"
              url="/contact"
            />

            <li
              onClick={() => {
                setIsOpen(false)
                handleLogout()
              }}
            >
              <Text type="subheader" color="black" classList={['Menu-link']}>
                <Emoji name="door" width={20} />
                &nbsp;&nbsp;Logout
              </Text>
            </li>
          </ul>
        </div>
        <nav>
          <ExternalLink to="https://github.com/sharingexcess/rescue">
            v{VERSION}
            {IS_DEV_ENVIRONMENT ? ' (DEV)' : ''}
          </ExternalLink>
          <ExternalLink to="/privacy">privacy</ExternalLink>
          <ExternalLink to="/tos">terms of service</ExternalLink>
        </nav>
      </aside>
    </>
  ) : null
}
