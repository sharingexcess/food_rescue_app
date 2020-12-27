import React from 'react'
import { useAuthContext } from '../Auth/Auth'
import Tile from '../Tile/Tile'
import './Home.scss'
import { generateGreeting, tiles } from './utils'

export default function Home() {
  // access current user and admin state from the Auth Context in Auth.js
  const { user, admin } = useAuthContext()

  function Tiles() {
    return tiles.map(t => <Tile key={t.name} {...t} />)
  }

  function AdminTiles() {
    if (!admin) return null
    return (
      <>
        <Tile name="Manage Orgs" icon="fa-gear" link="/admin/organizations" />
        <Tile name="Manage Users" icon="fa-users" link="/admin/users" />
      </>
    )
  }

  const header = generateGreeting(user.displayName)

  return (
    <main id="Home">
      <h1>{header}</h1>
      <section id="Tiles">
        <Tiles />
        <AdminTiles />
      </section>
    </main>
  )
}
