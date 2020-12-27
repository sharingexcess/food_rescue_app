import React, { memo } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { setMenu } from '../../redux/app/appReducer'
import { useAuthContext } from '../Auth/Auth'
import UserIcon from '../../assets/user.svg'
import { getCollection } from '../../helpers/helpers'
import './Menu.scss'

function Menu() {
  // get state from Redux Store to determine whether menu is open
  const isOpen = useSelector(store => store.app.menu)
  // get current user state from AuthContext
  const { user, admin, handleLogout } = useAuthContext()
  // get public user profile state
  const [profile = {}] = useDocumentData(getCollection('Users').doc(user.uid))
  // get access to the Redux update state function 'dispatch'
  const dispatch = useDispatch()

  function closeMenu() {
    dispatch(setMenu(false))
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

    return (
      <div id="UserProfile">
        <img
          src={user.photoURL || UserIcon}
          id="ProfileImg"
          alt="User"
          onClick={() => dispatch(setMenu(true))}
        />
        <div>
          <h2 id="UserName">{profile.name || user.displayName}</h2>
          <h3 id="UserEmail">{user.email}</h3>
          <AdminIndicator />
        </div>
        <i id="Close" className="fa fa-times" onClick={closeMenu} />
      </div>
    )
  }

  return (
    <>
      <div
        id="MenuBackground"
        className={isOpen ? 'open' : 'closed'}
        onClick={closeMenu}
      />
      <aside id="Menu" className={isOpen ? 'open' : 'closed'}>
        <UserProfile />
        <div id="MenuContent">
          <ul>
            <li onClick={() => dispatch(setMenu(false))}>
              <Link to="/rescues">View Rescues</Link>
            </li>
            <li onClick={() => dispatch(setMenu(false))}>
              <Link to="/create">Create Rescue</Link>
            </li>
            <li onClick={() => dispatch(setMenu(false))}>
              <Link to="/profile">User Profile</Link>
            </li>
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
      </aside>
    </>
  )
}

export default memo(Menu)
