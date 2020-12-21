import React, { memo, useEffect, useState } from 'react'
import Loading from '../Loading/Loading'
import firebase from 'firebase/app'
import 'firebase/firestore'
import './Rescues.scss'
import { Link } from 'react-router-dom'

function Rescues() {
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
                <td>{r.id}</td>
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

export default memo(Rescues)
