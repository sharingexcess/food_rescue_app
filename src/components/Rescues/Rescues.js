import React, { memo } from 'react'
import Loading from '../Loading/Loading'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { Link } from 'react-router-dom'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import moment from 'moment'
import './Rescues.scss'

function Rescues() {
  const [rescues = [], loading] = useCollectionData(
    firebase.firestore().collection('Rescues').orderBy('pickup_timestamp')
  )

  return (
    <main id="Rescues">
      <section id="RescuesHeader">
        <h1>All Rescues</h1>
        <Link to="/schedule">
          <button className="secondary">View Your Schedule</button>
        </Link>
      </section>
      {loading ? (
        <Loading text="Loading your rescues" />
      ) : rescues.length ? (
        <table id="RescuesTable">
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

export default memo(Rescues)
