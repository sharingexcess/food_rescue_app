import React from 'react'
import { Link } from 'react-router-dom'
import useDeliveryData from '../../hooks/useDeliveryData'
import useRouteData from '../../hooks/useRouteData'
import { useAuthContext } from '../Auth/Auth'
import './Home.scss'
import { generateDriverStats, generateGreeting } from './utils'

export default function Home() {
  // access current user and admin state from the Auth Context in Auth.js
  const { user, admin } = useAuthContext()
  const my_routes = useRouteData(
    r => r.driver_id === user.uid && r.status === 9
  )
  const my_deliveries = useDeliveryData(
    d => d.driver_id === user.uid && d.status === 9
  )
  const stats = generateDriverStats(my_routes, my_deliveries)

  function Tile({ name, icon, link }) {
    return (
      <Link className="Tile" to={link}>
        <div>
          <i className={`fa ${icon}`} />
          <h4>{name}</h4>
        </div>
      </Link>
    )
  }

  function DriverTiles() {
    return (
      <>
        <Tile name="Routes" icon="fa-calendar" link="/routes" />
        <Tile name="History" icon="fa-route" link="/history" />
        <Tile name="Contact" icon="fa-question" link="/contact" />
        <Tile name="Profile" icon="fa-user" link="/profile" />
      </>
    )
  }

  function AdminTiles() {
    if (!admin) return null
    return (
      <>
        <Tile name="Calendar" icon="fa-calendar" link="/calendar" />
        <Tile name="New Route" icon="fa-route" link="/admin/create-route" />
        <Tile name="Manage Orgs" icon="fa-gear" link="/admin/organizations" />
        <Tile name="Manage Users" icon="fa-users" link="/admin/users" />
        <Tile name="Analytics" icon="fa-chart-bar" link="/admin/analytics" />
      </>
    )
  }

  const header = generateGreeting(user.displayName, my_routes, my_deliveries)

  return (
    <main id="Home">
      <h1>{header}</h1>
      {stats ? (
        <h3>
          <span>{stats.routes}</span> route{stats.routes === 1 ? '' : 's'}{' '}
          driven, <span>{stats.weight}</span> lbs. rescued
        </h3>
      ) : null}
      <section id="Tiles">{admin ? <AdminTiles /> : <DriverTiles />}</section>
    </main>
  )
}
