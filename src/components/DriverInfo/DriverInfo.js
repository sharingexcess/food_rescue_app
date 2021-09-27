import React from 'react'
import Header from '../Header/Header'
import { useAuth } from '../Auth/Auth'
import './DriverInfo.scss'
import { useHistory } from 'react-router'
import { setFirestoreData } from '../../helpers/helpers'
import { Link } from 'react-router-dom'

export default function DriverInfo() {
  const history = useHistory()
  const { user } = useAuth()

  function handleComplete() {
    setFirestoreData(['Users', user.id], { completed_driver_info: true })
    history.push('/')
  }

  return (
    <main id="DriverInfo">
      <Header text="Driver Information" />
      {user.completed_driver_info ? (
        <>
          <p>You've already completed this document.</p>
          <Link to="/">
            <button>Back to Home</button>
          </Link>
        </>
      ) : (
        <>
          <iframe
            title="Driver Availability and Vehicle"
            src="https://docs.google.com/forms/d/e/1FAIpQLSewe9RVwIiTm_dkqyY5NSgmsTsajtKHHGu00LSbEztNEZ-_gg/viewform?usp=sf_link"
          />
          <br />
          <br />
          <button onClick={handleComplete}>
            I've submitted the Availability Form
          </button>
        </>
      )}
    </main>
  )
}