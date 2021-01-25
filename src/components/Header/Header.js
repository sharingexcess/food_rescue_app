import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Header.scss'

export default function Header({ text }) {
  const location = useLocation()
  const path_components = location.pathname.split('/').filter(i => i.length)
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
  return (
    <header id="Header">
      <h1>
        {path_components.length > 1 ? (
          <Link to={back_url}>
            <i className="fa fa-arrow-left" />
          </Link>
        ) : null}
        {text}
      </h1>
    </header>
  )
}
