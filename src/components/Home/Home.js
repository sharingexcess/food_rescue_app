import React, { useContext } from 'react'
import Tile from '../Tile/Tile'
import './Home.scss'
import { AuthContext } from '../Auth/Auth'
import { generateGreeting } from './utils'

const tiles = [
  {
    name: 'View Rescues',
    icon: 'fa-truck',
    link: '/rescues',
  },
  {
    name: 'New Rescue',
    icon: 'fa-plus',
    link: '/create',
  },
  {
    name: 'User Profile',
    icon: 'fa-user',
    link: '/profile',
  },
]

export default function Home() {
  const { user, admin } = useContext(AuthContext)
  return (
    <main id="Home">
      <h1>{generateGreeting(user.displayName)}</h1>
      <section id="Tiles">
        {tiles.map(t => (
          <Tile key={t.name} {...t} />
        ))}
        {admin ? (
          <Tile name="Manage Orgs" icon="fa-gear" link="/admin/organizations" />
        ) : null}
      </section>
    </main>
  )
}
