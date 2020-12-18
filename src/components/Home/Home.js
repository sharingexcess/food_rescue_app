import React, { useContext } from 'react'
import Tile from '../Tile/Tile'
import './Home.scss'
import { AuthContext } from '../Auth/Auth'

const tiles = [
  {
    name: 'My Schedule',
    icon: 'fa-calendar',
    link: '/schedule',
  },
  {
    name: 'View All Rescues',
    icon: 'fa-calendar',
    link: '/rescues',
  },
  {
    name: 'Account',
    icon: 'fa-user',
    link: '/account',
  },
  {
    name: 'Create New Rescue',
    icon: 'fa-plus',
    link: '/create',
  },
]

export default function Home() {
  const { user } = useContext(AuthContext)

  function generateGreeting() {
    const today = new Date()
    const curHr = today.getHours()
    const formattedName = user.displayName
      ? user.displayName.includes(' ')
        ? user.displayName.split(' ')[0]
        : user.displayName
      : null
    let prefix, suffix
    if (curHr < 12) {
      prefix = 'Good Morning'
      suffix = `☀️`
    } else if (curHr < 18) {
      prefix = 'Good Afternoon'
      suffix = `😊`
    } else {
      prefix = 'Good Evening'
      suffix = `🌙`
    }
    return formattedName
      ? `${prefix}, ${formattedName} ${suffix}`
      : `${prefix} ${suffix}`
  }
  return (
    <main id="Home">
      <h1>{generateGreeting()}</h1>
      <section id="Tiles">
        {tiles.map(t => (
          <Tile key={t.name} {...t} />
        ))}
      </section>
    </main>
  )
}
