import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from 'contexts'
import { Menu } from 'components'
import { MOBILE_THRESHOLD } from '../../helpers/constants'
import { useIsMobile } from 'hooks'
import { Text, Spacer, Logo } from '@sharingexcess/designsystem'

export function Header() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const { user, handleLogin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(window.innerWidth > MOBILE_THRESHOLD)

  const path_components = location.pathname.split('/').filter(i => i.length)

  const page_title = path_components.length
    ? path_components[path_components.length - 1].replace(/[^a-zA-Z ]/g, ' ')
    : 'Home'

  const back_title =
    path_components.length > 1
      ? path_components[path_components.length - 2].replace('admin', 'home')
      : null

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
          <Logo color="white" size={48} shadow />
        </Link>
        <Spacer width={12} />
        <div id="Header-location">
          <Text
            id="Header-page-title"
            type="section-header"
            color="white"
            wrap={false}
          >
            {page_title}
          </Text>
          {path_components.length > 1 ? (
            <Link to={back_url}>
              <i className="fa fa-arrow-left" /> back to {back_title}
            </Link>
          ) : null}
        </div>
        {isMobile ? <UserProfile /> : null}
      </header>
      <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />
    </>
  )
}
