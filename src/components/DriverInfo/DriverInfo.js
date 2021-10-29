import React from 'react'
import { useAuth } from 'hooks'
import { useHistory } from 'react-router'
import { setFirestoreData } from 'helpers'
import { Link } from 'react-router-dom'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'

export function DriverInfo() {
  const history = useHistory()
  const { user } = useAuth()

  function handleComplete() {
    setFirestoreData(['Users', user.id], { completed_driver_info: true })
    history.push('/')
  }

  return (
    <main id="DriverInfo">
      {user.completed_driver_info ? (
        <>
          <Text type="paragraph" color="white" shadow>
            You've already completed this document.
          </Text>
          <Spacer height={16} />
          <Link to="/">
            <Button type="primary" color="white" handler={handleComplete}>
              Back to Home
            </Button>
          </Link>
        </>
      ) : (
        <>
          <iframe
            title="Driver Availability and Vehicle"
            src="https://www.sharingexcess.com/food-rescue-driver"
          />
          <br />
          <br />
          <Button type="primary" color="white" handler={handleComplete}>
            I've submitted the Availability Form
          </Button>
        </>
      )}
    </main>
  )
}
