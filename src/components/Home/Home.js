import React, { useContext } from 'react'
import Tile from '../Tile/Tile'
import './Home.scss'
import { AuthContext } from '../Auth/Auth'
import { generateGreeting } from './utils'

const tiles = [
  {
    name: 'My Schedule',
    icon: 'fa-calendar',
    link: '/schedule',
  },
  {
    name: 'View All Rescues',
    icon: 'fa-truck',
    link: '/rescues',
  },
  {
    name: 'User Profile',
    icon: 'fa-user',
    link: '/profile',
  },
  {
    name: 'Create New Rescue',
    icon: 'fa-plus',
    link: '/create',
  },
]

export default function Home() {
  const { user } = useContext(AuthContext)
  return (
    <main id="Home">
      <h1>{generateGreeting(user.displayName)}</h1>
      <section id="Tiles">
        {tiles.map(t => (
          <Tile key={t.name} {...t} />
        ))}
      </section>
    </main>
  )
}
