import React from 'react'
import { useSelector } from 'react-redux'
import './Home.scss'

export default function Home() {
  const displayName = useSelector(store => store.auth.displayName)

  function generateGreeting() {
    var today = new Date()
    var curHr = today.getHours()
    const formattedName = displayName.includes(' ')
      ? displayName.split(' ')[0]
      : displayName
    if (curHr < 12) {
      return `Good Morning, ${formattedName} ☀️`
    } else if (curHr < 18) {
      return `Good Afternoon, ${formattedName} 😊`
    } else {
      return `Good Evening, ${formattedName} 🌙`
    }
  }
  return (
    <main id="Home">
      <h1>{generateGreeting()}</h1>
    </main>
  )
}
