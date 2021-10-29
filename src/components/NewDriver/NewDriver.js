import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from 'hooks'
import { Card, Spacer, Text } from '@sharingexcess/designsystem'

export function NewDriver() {
  const { user } = useAuth()

  const completed_availability =
    user.driver_availability &&
    Object.keys(user.driver_availability).filter(
      key => user.driver_availability[key]
    ).length

  const sections = [
    {
      name: 'Complete your Profile',
      page: '/profile',
      completed:
        user.name &&
        user.phone &&
        user.pronouns &&
        completed_availability &&
        user.driver_availability &&
        user.vehicle_make_model &&
        user.drivers_license_number &&
        user.drivers_license_state &&
        user.drivers_insurance_policy_number &&
        user.drivers_insurance_provider,
    },
    {
      name: 'Liability Release',
      page: '/liability',
      completed: user.driver_liability_release,
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
        {user.completed_driver_info &&
        user.completed_food_safety &&
        user.driver_liability_release
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
