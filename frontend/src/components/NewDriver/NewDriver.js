import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from 'hooks'
import { Card, Spacer, Text } from '@sharingexcess/designsystem'

export function NewDriver() {
  const { user } = useAuth()

  const sections = [
    {
      name: 'Complete your Profile',
      page: '/profile',
      completed:
        user.name &&
        user.phone &&
        user.pronouns &&
        user.vehicle_make_model &&
        user.license_number &&
        user.license_state &&
        user.insurance_policy_number &&
        user.insurance_provider,
    },
    {
      name: 'Liability Release',
      page: '/liability',
      completed: user.completed_liability_release,
    },
    {
      name: 'App Tutorial',
      page: '/tutorial',
      completed: user.completed_app_tutorial,
    },
    {
      name: 'Food Safety Training',
      page: '/food-safety',
      completed: user.completed_food_safety,
    },
  ]

  return (
    <main id="NewDriver">
      <Text type="secondary-header" color="white" shadow>
        Welcome to Sharing Excess!
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        {user.name &&
        user.phone &&
        user.pronouns &&
        user.license_number &&
        user.license_state &&
        user.insurance_policy_number &&
        user.insurance_provider &&
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
