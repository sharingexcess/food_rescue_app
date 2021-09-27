import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from 'contexts'
import SELogo from '../../assets/logo.svg'
import { Menu } from 'components'
import { MOBILE_THRESHOLD } from '../../helpers/constants'
import { useIsMobile } from 'hooks'

export function Header() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const { user, handleLogin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(window.innerWidth > MOBILE_THRESHOLD)

  const path_components = location.pathname.split('/').filter(i => i.length)
  const text = path_components.length ? path_components[0] : 'Home'
  let back_url = `/${path_components
    .slice(0, path_components.length - 1)
    .join('/')}`

  if (
    ['admin', 'pickup', 'delivery', 'location'].includes(
      back_url.slice(back_url.lastIndexOf('/') + 1, back_url.length)
    )
  ) {
    back_url = back_url.substring(0, back_url.lastIndexOf('/'))
  }

  console.log(path_components, text, back_url)

  function UserProfile() {
    return user ? (
      <img
        src={user.icon}
        id="UserProfile"
        alt="User"
        onClick={() => setMenuOpen(true)}
      />
    ) : (
      <button className="login" onClick={handleLogin}>
        Log in
      </button>
    )
  }

  return (
    <>
      <header id="Header">
        <Link to="/">
          <img src={SELogo} id="Header-logo" alt="User" />
        </Link>
        <div id="Header-location">
          <h1>{text}</h1>
          {path_components.length > 1 ? (
            <Link to={back_url}>
              <i className="fa fa-arrow-left" /> back to {text}
            </Link>
          ) : null}
        </div>
        {isMobile ? <UserProfile /> : null}
      </header>
      <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />
    </>
  )
}
