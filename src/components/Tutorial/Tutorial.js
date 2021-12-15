import React from 'react'
import { useAuth } from 'hooks'
import { useHistory } from 'react-router'
import { setFirestoreData } from 'helpers'
import { Button } from '@sharingexcess/designsystem'
import { Link } from 'react-router-dom'

export function Tutorial() {
  const history = useHistory()
  const { user } = useAuth()

  function handleComplete() {
    setFirestoreData(['users', user.id], {
      onboarding: { completed_app_tutorial: true },
    })
    history.push('/')
  }

  return (
    <main id="Tutorial">
      <section id="save1">
        <h3>0. Save Rescue App to Home Screen (iOS)</h3>
        <ul>
          <li>
            Tap the share icon (a box with an arrow pointing upwards) at the
            bottom of the screen, which brings up a list of options.
          </li>
          <li>
            Scroll down until you see the option "Add to Home Screen" and tap
            it.{' '}
          </li>
          <li>
            On the next screen, tap "Add" on the top-right corner of the screen.{' '}
          </li>
          <li>
            Now you will have a new app on your home screen that leads you to
            the website.{' '}
          </li>
        </ul>
        <div>
          <img src="/tutorial-ios-actions.jpg" alt="Home" />
          <img src="/tutorial-ios-add.jpg" alt="Routes" />
        </div>
      </section>
      <section id="save2">
        <h3>0. Save Rescue App to Home Screen (Android)</h3>
        <ul>
          <li>
            Tap the menu icon (3 dots) in the upper right-hand corner, which
            brings up a side menu.
          </li>
          <li>
            On the side menu that popped up, tap the option "Add to Home
            screen."
          </li>
          <li>On the new pop up, tap "Add" on the bottom-right corner.</li>
          <li>
            Now you will have a new app on your home screen that leads you to
            the website.
          </li>
        </ul>
        <div>
          <img src="/tutorial-android-actions.jpg" alt="Home" />
          <img src="/tutorial-android-add.jpg" alt="Routes" />
        </div>
      </section>
      <section id="start">
        <h3>1. Before You Start</h3>
        <ul>
          <li>Ensure vehicle interior is clean and free of personal items. </li>
          <li>Log onto app and click on assigned route guidance. </li>
        </ul>
        <div>
          <img src="/tutorial-home.jpg" alt="Home" />
          <img src="/tutorial-routes.jpg" alt="Routes" />
        </div>
      </section>
      <section id="pickup">
        <h3>2. Head to Your First Pickup Location</h3>
        <ul>
          <li>
            Click the Pick-up location in the app, press “Get Directions” which
            will open your GPS.
          </li>
          <li>Head to the pick-up location to begin your route. </li>
          <li>
            Read the specific instructions for parking and site contacts.{' '}
          </li>
          <li>
            Park in a safe location and call the donor when you arrive-they will
            be able to guide you to where to meet them for your pickup.
          </li>
          <li>
            Request the organization bring you the SE scale housed in their
            warehouse, click “complete pickup report” weigh and record weight
            based on the boxes type as guided on our app.{' '}
          </li>
          <li>Click “Submit Report” when complete</li>
          <li>Safely pack food in the vehicle.</li>
        </ul>
        <div>
          <img src="/tutorial-route.jpg" alt="Route" />
          <img src="/tutorial-report.jpg" alt="Report" />
        </div>
      </section>
      <section id="delivery">
        <h3>3. Head to Your First Delivery Location</h3>
        <ul>
          <li>
            Click on the drop-off location in the app, Click the “Get Directions
            Button” which will open your GPS.
          </li>
          <li>
            Read the specific instructions for parking and site contacts. - Park
            in a safe location and call recipient when you arrive.
          </li>
          <li>
            Safely unload donations from vehicle to recipient organization, then
            click to open the Delivery Report.
          </li>
          <li>
            Ensure accurate weight and mix is filled in and no error message has
            popped up
          </li>
          <li>
            Estimate percentage of donations that went to each recipient (100%
            if completing one pick up and delivery)
          </li>
          <li>Click “submit report” button</li>
          <li>
            If the message states you "still have food left in your pickup", the
            drop off amount does not match your pickup. Contact your volunteer
            coordinator to assist in correcting pound entry.
          </li>
        </ul>
        <div>
          <img src="/tutorial-percentage.jpg" alt="Percentage Dropoff" />
          <img src="/tutorial-completed.jpg" alt="Completed" />
        </div>
      </section>
      <br />
      {user && !user.onboarding.completed_app_tutorial ? (
        <Button type="primary" color="white" handler={handleComplete}>
          I've completed the Tutorial
        </Button>
      ) : (
        <Link to="/">
          <Button type="primary" color="white">
            Back to Home
          </Button>
        </Link>
      )}
    </main>
  )
}
