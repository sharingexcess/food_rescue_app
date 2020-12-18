import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setMenu } from '../../redux/app/appReducer'
import { logout } from '../../redux/auth/authReducer'
import './Menu.scss'

export default function Menu() {
  const isOpen = useSelector(store => store.app.menu)
  const { photoURL, displayName, email } = useSelector(store => store.auth)
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
            src={photoURL}
            id="ProfileImg"
            alt="User"
            onClick={() => dispatch(setMenu(true))}
          />
          <div>
            <h2 id="UserName">{displayName}</h2>
            <h3 id="UserEmail">{email}</h3>
          </div>
          <i id="Close" className="fa fa-times" onClick={close} />
        </div>
        <div id="MenuContent">
          <ul>
            <li onClick={() => dispatch(logout())}>Logout</li>
          </ul>
        </div>
      </aside>
    </>
  )
}
