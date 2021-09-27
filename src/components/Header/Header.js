import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth, useIsMobile, useScroll } from 'hooks'
import { Menu } from 'components'
import { MOBILE_THRESHOLD } from 'helpers'
import { Text, Spacer, Logo, Button } from '@sharingexcess/designsystem'
import { generateHeaderText } from './utils'

export function Header() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const scroll = useScroll()
  const { user, handleLogin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(window.innerWidth > MOBILE_THRESHOLD)

  const scrolled = isMobile && scroll > 32

  const path_components = location.pathname.split('/').filter(i => i.length)

  const { title, back_label, back_url } = generateHeaderText(path_components)

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
      <header id="Header" className={scrolled ? 'with-background' : null}>
        <Link to="/">
          <Logo color={scrolled ? 'green' : 'white'} size={48} shadow />
        </Link>
        <Spacer width={12} />
        <div id="Header-location">
          <Text
            id="Header-page-title"
            type="section-header"
            color={scrolled ? 'black' : 'white'}
            wrap={false}
            shadow
          >
            {title}
          </Text>
          {path_components.length > 0 ? (
            <Link to={back_url}>
              <Button
                type="tertiary"
                size="small"
                color={scrolled ? 'black' : 'white'}
                id="Header-back-link"
              >
                &lt; back to {back_label}
              </Button>
            </Link>
          ) : null}
        </div>
        {isMobile ? <UserProfile /> : null}
      </header>
      <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} />
    </>
  )
}
