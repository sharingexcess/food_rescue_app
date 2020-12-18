import React, { useEffect, useState } from 'react'
import Loading from '../Loading/Loading'
import './Schedule.scss'

export default function Schedule() {
  const [rescues, setRescues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setTimeout(() => {
      setRescues([])
      setLoading(false)
    }, 2000)
  }, [])

  return (
    <main id="Schedule">
      <section id="ScheduleHeader">
        <h1>My Scheduled Rescues</h1>
        <button className="secondary">View All</button>
      </section>
      {loading ? (
        <Loading text="Loading your rescues" />
      ) : rescues.length ? (
        rescues.map(r => <div key={r}>{r}</div>)
      ) : (
        <p>You're calendar is clear 😎</p>
      )}
    </main>
  )
}
