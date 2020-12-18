import React from 'react'
import { Link } from 'react-router-dom'
import Logo from '../../assets/logo.svg'
import './Header.scss'

export default function Header() {
  return (
    <header id="Header">
      <Link to="/">
        <img id="Logo" src={Logo} alt="Sharing Excess Logo" />
      </Link>
    </header>
  )
}
