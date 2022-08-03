import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth, useIsMobile } from 'hooks'
import { Menu } from 'components'
import { MOBILE_THRESHOLD } from 'helpers'
import { Text, Spacer, Logo, Button } from '@sharingexcess/designsystem'
import { generateHeaderText } from './utils'

export function Header() {
  const location = useLocation()
  const isMobile = useIsMobile()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(window.innerWidth > MOBILE_THRESHOLD)

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
    ) : null
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
            shadow
          >
            {user ? title : ''}
          </Text>
          {path_components.length > 0 ? (
            <Link to={back_url}>
              <Button
                type="tertiary"
                size="small"
                color="white"
                id="Header-back-link"
              >
                &lt; back to {back_label}
              </Button>
            </Link>
          ) : null}
        </div>
        {isMobile ? <UserProfile /> : null}
      </header>
      {/* <Menu isOpen={menuOpen} setIsOpen={setMenuOpen} /> */}
      {Menu({ isOpen: menuOpen, setIsOpen: setMenuOpen })}
    </>
  )
}
