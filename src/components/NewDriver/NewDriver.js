import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from 'hooks'
import { Menu } from 'components'
import { Card, Spacer, Text } from '@sharingexcess/designsystem'

export function NewDriver() {
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
      page: '/food-safety',
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
      <Text type="secondary-header" color="white" shadow>
        Welcome to Sharing Excess!
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        {user.completed_driver_info &&
        user.completed_food_safety &&
        user.completed_liability_release
          ? "You've completed all the onboarding steps!\n\nHang tight while we approve your info, and grant you permission to start rescuing food."
          : 'Complete the onboarding steps below to begin rescuing food as soon as possible.'}
      </Text>
      <Spacer height={16} />
      {sections.map(s => (
        <Link to={s.page} key={s.name}>
          <Card classList={['NewDriver-section', s.completed && 'completed']}>
            <i
              className={s.completed ? 'fa fa-check' : 'fa fa-clipboard-list'}
            />
            {s.name}
          </Card>
        </Link>
      ))}
    </main>
  )
}
