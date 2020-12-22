import React, { memo, useContext } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { setMenu } from '../../redux/app/appReducer'
import { AuthContext } from '../Auth/Auth'
import firebase from 'firebase/app'
import UserIcon from '../../assets/user.svg'
import './Menu.scss'

function Menu() {
  const isOpen = useSelector(store => store.app.menu)
  const { user, admin, handleLogout } = useContext(AuthContext)
  const [profile = {}] = useDocumentData(
    firebase.firestore().collection('Users').doc(user.uid)
  )
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
            src={user.photoURL || UserIcon}
            id="ProfileImg"
            alt="User"
            onClick={() => dispatch(setMenu(true))}
          />
          <div>
            <h2 id="UserName">{profile.name || user.displayName}</h2>
            <h3 id="UserEmail">{user.email}</h3>
            {admin && (
              <h4 id="UserIsAdmin">
                <i className="fa fa-crown" />
                Sharing Excess Admin
              </h4>
            )}
          </div>
          <i id="Close" className="fa fa-times" onClick={close} />
        </div>
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
            {admin ? (
              <li onClick={() => dispatch(setMenu(false))}>
                <Link to="/admin/organizations">Organizations</Link>
              </li>
            ) : null}
            <li onClick={handleLogout}>Logout</li>
          </ul>
        </div>
      </aside>
    </>
  )
}

export default memo(Menu)
