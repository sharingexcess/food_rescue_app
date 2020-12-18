import React, { useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { setMenu } from '../../redux/app/appReducer'
import { AuthContext } from '../Auth/Auth'
import './Menu.scss'

export default function Menu() {
  const isOpen = useSelector(store => store.app.menu)
  const { user, handleLogout } = useContext(AuthContext)
  const dispatch = useDispatch()

  function close() {
    dispatch(setMenu(false))
  }

  return (
    <>
      <div
        id="MenuBackground"
        className={isOpen ? 'open' : 'closed'}
        onClick={close}
      />
      <aside id="Menu" className={isOpen ? 'open' : 'closed'}>
        <div id="UserProfile">
          <img
            src={user.photoURL}
            id="ProfileImg"
            alt="User"
            onClick={() => dispatch(setMenu(true))}
          />
          <div>
            <h2 id="UserName">{user.displayName}</h2>
            <h3 id="UserEmail">{user.email}</h3>
          </div>
          <i id="Close" className="fa fa-times" onClick={close} />
        </div>
        <div id="MenuContent">
          <ul>
            <li onClick={() => dispatch(setMenu(false))}>
              <Link to="/">Home</Link>
            </li>
            <li onClick={() => dispatch(setMenu(false))}>
              <Link to="/schedule">Schedule</Link>
            </li>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
      </aside>
    </>
  )
}
