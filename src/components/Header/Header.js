import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import LogoLight from '../../assets/logo.svg'
import ModeToggle from '../ModeToggle/ModeToggle'
import './Header.scss'

export default function Header() {
  const darkMode = useSelector(store => store.app.darkMode)
  return (
    <header id="Header">
      <Link to="/">
        <img
          id="Logo"
          src={darkMode ? LogoLight : '/logo512.png'}
          alt="Sharing Excess Logo"
        />
      </Link>
      <ModeToggle />
    </header>
  )
}
