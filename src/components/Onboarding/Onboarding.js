import React, { useState, useEffect } from 'react'
import FoodSafety from '../FoodSafety/FoodSafety'
import Privacy from '../Privacy/Privacy'
import Terms from '../Terms/Terms'
import Logo from '../../assets/logo.svg'
import Header from '../Header/Header'
import './Onboarding.scss'
import '../Auth/Auth.scss'
import '../FoodSafety/FoodSafety.scss'
import '../Privacy/Privacy.scss'
import '../Terms/Terms.scss'

export default function Onboarding(props) {
  const [page, setPage] = useState(1)
  function Footer() {
    return (
      <>
        <div id="Navigation">
          {page !== 2 ? (
            <div className="inner">
              <button onClick={() => setPage(page - 1)}>Back</button>
            </div>
          ) : (
            <div className="inner"></div>
          )}
          <div className="inner">
            <button onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      </>
    )
  }
  function GoogleFormEmbedded({ text, source }) {
    return (
      <>
        <p>{text}</p>
        <p>
          {' '}
          If the form fails to render, please try to{' '}
          <strong className="red">
            <a
              target="_blank"
              rel="noreferrer"
              href="https://support.google.com/chromebook/thread/17608433/having-drive-google-com-redirected-you-too-many-times-problem?hl=en"
            >
              clear your cookies
            </a>
          </strong>
        </p>
        <iframe
          title="Driver Availability and Vehicle"
          src={source}
          width="640"
          height="1447"
          frameborder="0"
          marginheight="0"
          marginwidth="0"
        >
          Loading…
        </iframe>
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
      <GoogleFormEmbedded
        text="Use the form below to submit information about your vehicle and
          availability."
        source="https://docs.google.com/forms/d/e/1FAIpQLSewe9RVwIiTm_dkqyY5NSgmsTsajtKHHGu00LSbEztNEZ-_gg/viewform?usp=sf_link"
      />
      <Footer />
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
      <Header text="Driver Liability" />
      <GoogleFormEmbedded
        text="Use the form below to sign the liability."
        source="https://docs.google.com/forms/d/e/1FAIpQLSf06ZcN0bQNgPglue7B0WoAWbesFN6Fo4c_0HA5sCCCm-MPoQ/viewform?embedded=true"
      />
      <Footer />
    </main>
  ) : (
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
  )
}
