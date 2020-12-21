import React, { memo, useEffect, useState } from 'react'
import Loading from '../Loading/Loading'
import firebase from 'firebase/app'
import 'firebase/firestore'
import './Schedule.scss'
import { Link } from 'react-router-dom'

function Schedule() {
  const [rescues, setRescues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    firebase
      .firestore()
      .collection('Rescues')
      .get()
      .then(querySnapshot => {
        const updated_rescues = []
        querySnapshot.forEach(doc =>
          updated_rescues.push({ id: doc.id, ...doc.data() })
        )
        setRescues(updated_rescues)
        setLoading(false)
      })
  }, [])

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
                <td>{r.pickup_timestamp.toString()}</td>
                <td>{r.delivery_timestamp.toString()}</td>
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
