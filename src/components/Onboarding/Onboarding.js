import React, { useState, useEffect } from 'react'
import FoodSafety from '../FoodSafety/FoodSafety'
import Privacy from '../Privacy/Privacy'
import Terms from '../Terms/Terms'
import Liability from '../Liability/Liability'
import Logo from '../../assets/logo.svg'
import Header from '../Header/Header'
import './Onboarding.scss'
import '../Auth/Auth.scss'
import '../FoodSafety/FoodSafety.scss'
import '../Privacy/Privacy.scss'
import '../Terms/Terms.scss'
import '../Liability/Liability.scss'

export default function Onboarding(props) {
  const [page, setPage] = useState(1)
  function Footer() {
    return (
      <>
        <div id="Navigation">
          <div className="inner">
            <button onClick={() => setPage(page - 1)}>Back</button>
          </div>
          <div className="inner">
            <button onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </>
    )
  }
  // scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])
  return page === 1 ? (
    <main id="Onboarding">
      <img src={Logo} alt="Sharing Excess Logo" />
      <h1>Welcome to Sharing Excess</h1>
      <button className="getstart" onClick={() => setPage(page + 1)}>
        Get Started
      </button>
      <button className="logout" onClick={props.handleClick}>
        Logout{' '}
      </button>
    </main>
  ) : page === 2 ? (
    <main id="VehicleAvailability">
      <Header text="Driver Availability and Vehicle" />
      <p>
        Use the form below to submit information about your vehicle and
        availability.
      </p>
      <iframe
        title="Driver Availability and Vehicle"
        src="https://docs.google.com/forms/d/e/1FAIpQLSewe9RVwIiTm_dkqyY5NSgmsTsajtKHHGu00LSbEztNEZ-_gg/viewform?usp=sf_link"
      ></iframe>
      <div className="inner">
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </main>
  ) : page === 3 ? (
    <main id="FoodSafety">
      <FoodSafety />
      <Footer />
    </main>
  ) : page === 4 ? (
    <main id="Privacy">
      <Privacy />
      <Footer />
    </main>
  ) : page === 5 ? (
    <main id="Terms">
      <Terms />
      <Footer />
    </main>
  ) : page === 6 ? (
    <main id="Liability">
      <Liability />
      <Footer />
    </main>
  ) : page === 7 ? (
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
      <button onClick={props.handleClick}>logout</button>
    </main>
  ) : null
}
