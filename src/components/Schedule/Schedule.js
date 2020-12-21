import React, { memo, useContext } from 'react'
import Loading from '../Loading/Loading'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { Link } from 'react-router-dom'
import { AuthContext } from '../Auth/Auth'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import moment from 'moment'
import './Schedule.scss'

function Schedule() {
  const { user } = useContext(AuthContext)
  const [rescues = [], loading] = useCollectionData(
    firebase
      .firestore()
      .collection('Rescues')
      .where('driver_id', '==', user.uid)
  )

  return (
    <main id="Schedule">
      <section id="ScheduleHeader">
        <h1>My Scheduled Rescues</h1>
        <Link to="/rescues">
          <button className="secondary">View All Rescues</button>
        </Link>
      </section>
      {loading ? (
        <Loading text="Loading your rescues" />
      ) : rescues.length ? (
        <table id="ScheduleTable">
          <thead>
            <tr>
              <th>Rescue Id</th>
              <th>Pickup Time</th>
              <th>Delivery Time</th>
            </tr>
          </thead>
          <tbody>
            {rescues.map(r => (
              <tr key={r.id}>
                <td>
                  <Link to={`rescues/${r.id}`}>{r.id}</Link>
                </td>
                <td>
                  {moment(r.pickup_timestamp).format('ddd, MMM Do, h:mm a')}
                </td>
                <td>
                  {moment(r.delivery_timestamp).format('ddd, MMM Do, h:mm a')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>You're calendar is clear 😎</p>
      )}
    </main>
  )
}

export default memo(Schedule)
