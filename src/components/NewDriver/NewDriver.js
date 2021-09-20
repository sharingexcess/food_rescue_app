import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../Auth/Auth'
import Header from '../Header/Header'
import Menu from '../Menu/Menu'
import './NewDriver.scss'

export default function NewDriver() {
  const { user } = useAuth()

  const sections = [
    {
      name: 'Complete your Profile',
      page: '/profile',
      completed: user.name && user.phone && user.pronouns,
    },
    {
      name: 'Liability Release',
      page: '/liability',
      completed: user.completed_liability_release,
    },
    {
      name: 'Driver Information',
      page: '/driver-info',
      completed: user.completed_driver_info,
    },
    {
      name: 'Food Safety Training',
      page: '/foodsafety',
      completed: user.completed_food_safety,
    },
    {
      name: 'Food Rescue App Tutorial',
      page: '/tutorial',
      completed: user.completed_app_tutorial,
    },
  ]

  return (
    <main id="NewDriver">
      <Menu />
      <Header text="Welcome to SE!" />
      <br />
      <p>
        {user.completed_driver_info &&
        user.completed_food_safety &&
        user.completed_liability_release
          ? "You've completed all the onboarding steps!\n\nHang tight while we approve your info, and grant you permission to start rescuing food."
          : 'Complete the onboarding steps below to begin rescuing food as soon as possible.'}
      </p>
      <br />
      <br />
      {sections.map(s => (
        <Link to={s.page} key={s.name}>
          <div
            className={`NewDriver-section${s.completed ? ' completed' : ''}`}
          >
            <i
              className={s.completed ? 'fa fa-check' : 'fa fa-clipboard-list'}
            />
            {s.name}
          </div>
        </Link>
      ))}
    </main>
  )
}
