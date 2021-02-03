import React, { useState } from 'react'
import FoodSafety from '../FoodSafety/FoodSafety'
import Logo from '../../assets/logo.svg'
import './Onboarding.scss'
import '../Auth/Auth.scss'
import '../FoodSafety/FoodSafety.scss'

export default function Onboarding(props) {
  const [page, setPage] = useState(1)
  return page === 1 ? (
    <main id="Onboarding">
      <img src={Logo} alt="Sharing Excess Logo" />
      <h1>Welcome to Sharing Excess</h1>
      <button className="getstart" onClick={() => setPage(page + 1)}>
        Get Start
      </button>
      <button className="logout" onClick={props.handleClick}>
        Logout{' '}
      </button>
    </main>
  ) : page === 2 ? (
    <main id="FoodSafety">
      <FoodSafety />
      <div id="Navigation">
        <div className="inner">
          <button onClick={() => setPage(page - 1)}>Back</button>
        </div>
        <div className="inner">
          <button onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>
    </main>
  ) : page === 3 ? (
    <main id="Auth" className="request-access">
      <h1>
        <span className="green">Sharing</span> Excess
      </h1>
      <p>Hi, {props.userName}!</p>
      <div>
        You've logged in successfully with Google. Before you gain access to
        rescue data, you'll need to be given permission by an admin.
        <br />
        <br />
        Updating your permissions requires logging out and back in again. Once
        you've been granted permissions, log back in to gain access!
      </div>
      <br />
      <img className="background" src={Logo} alt="Sharing Excess Logo" />
      <button onClick={props.handleClick}>
        <i className="fas fa-sign-out-alt" />
        logout
      </button>
    </main>
  ) : null
}
