import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../Auth/Auth'
import './Footer.scss'

export default function Footer() {
  const { admin, user } = useAuth()
  const location = useLocation()

  function handleIsActive(route) {
    if (route === '') return location.pathname === '/' ? 'active' : ''
    return location.pathname.includes(route) ? 'active' : ''
  }

  return !user ? null : (
    <footer id="Footer">
      <Link to="/">
        <i className="fa fa-home" id={handleIsActive('')} />
      </Link>
      <Link to="/routes">
        <i className="fa fa-route" id={handleIsActive('routes')} />
      </Link>
      <Link to="/history">
        <i className="fa fa-clock" id={handleIsActive('history')} />
      </Link>

      {!admin ? (
        <Link to="/profile">
          <i className="fa fa-user" id={handleIsActive('profile')} />
        </Link>
      ) : null}
      {admin ? (
        <Link to="/calendar">
          <i className="fa fa-calendar" id={handleIsActive('calendar')} />
        </Link>
      ) : null}
      <Link to="/contact">
        <i className="fa fa-question" id={handleIsActive('contact')} />
      </Link>
    </footer>
  )
}
