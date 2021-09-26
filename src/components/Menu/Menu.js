import React, { memo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/Auth/Auth'
import UserIcon from '../../assets/user.svg'
import { ExternalLink } from '../../helpers/components'
import { useUserData } from 'hooks'
import { MOBILE_THRESHOLD } from '../../helpers/constants'

function Menu({ isOpen, setIsOpen }) {
  // get current user state from AuthContext
  const { user, admin, handleLogout, handleLogin } = useAuth()

  // get public user profile state
  const profile = useUserData(user ? user.uid : {})

  function closeMenu() {
    setIsOpen(false)
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
        {window.innerWidth > MOBILE_THRESHOLD ? null : (
          <i id="Close" className="fa fa-times" onClick={closeMenu} />
        )}
      </div>
    ) : (
      <button className="login" onClick={handleLogin}>
        Log in
      </button>
    )
  }

  return (
    <aside id="Menu" className={isOpen ? 'open' : 'closed'}>
      <UserProfile />
      <div id="MenuContent">
        <ul>
          <li onClick={() => setIsOpen(false)}>
            <Link to="/">Home</Link>
          </li>
          <li onClick={() => setIsOpen(false)}>
            <Link to="/routes">Routes</Link>
          </li>
          <li onClick={() => setIsOpen(false)}>
            <Link to="/history">History</Link>
          </li>
          <li onClick={() => setIsOpen(false)}>
            <Link to="/profile">Profile</Link>
          </li>
          <li onClick={() => setIsOpen(false)}>
            <Link to="/foodsafety">Safety</Link>
          </li>

          <li
            onClick={() => {
              setIsOpen(false)
              handleLogout()
            }}
          >
            Logout
          </li>
        </ul>
      </div>
      <nav>
        <ExternalLink url="/privacy">privacy policy</ExternalLink>
        <ExternalLink url="/tos">terms of service</ExternalLink>
      </nav>
    </aside>
  )
}

export memo(Menu)
