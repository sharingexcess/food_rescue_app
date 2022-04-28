import React, { useEffect } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { useAuth } from 'hooks'
import { Card, Spacer, Text } from '@sharingexcess/designsystem'
import { Profile, Header, Tutorial, Liability, FoodSafety } from 'components'
import { setFirestoreData } from 'helpers'

export function Onboarding() {
  const { user } = useAuth()

  useEffect(() => {
    if (
      user.completed_app_tutorial &&
      user.completed_food_safety &&
      user.completed_liability_release &&
      user.phone &&
      user.pronouns &&
      user.name &&
      !user.is_driver
    ) {
      setFirestoreData(['users', user.uid], { is_driver: true })
    }
  }, [user])

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

  function OnboardingHome() {
    return (
      <main id="Onboarding">
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
            <Card
              classList={['Onboarding-section', s.completed && 'completed']}
            >
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

  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<OnboardingHome />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/liability" element={<Liability />} />
        <Route path="/tutorial" element={<Tutorial />} />
        <Route path="/food-safety" element={<FoodSafety />} />
      </Routes>
    </>
  )
}
