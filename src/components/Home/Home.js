import React from 'react'
import { Link } from 'react-router-dom'
import useDeliveryData from '../../hooks/useDeliveryData'
import useRouteData from '../../hooks/useRouteData'
import { useAuth } from '../Auth/Auth'
import { generateDriverStats, generateGreeting } from './utils'
import './Home.scss'
import NewDriver from '../NewDriver/NewDriver'
import Landing from '../Landing/Landing'

export default function Home() {
  // access current user and admin state from the Auth Context in Auth.js
  const { user, admin, permission } = useAuth()
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
        <Tile name="Routes" icon="fa-route" link="/routes" />
        <Tile name="History" icon="fa-clock" link="/history" />
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
        <Tile name="New Route" icon="fa-plus" link="/admin/create-route" />
        <Tile
          name="New Direct Donation"
          icon="fas fa-clipboard-check"
          link="admin/create-direct-donation"
        />
        <Tile
          name="Manage Network"
          icon="fa-map-marked-alt"
          link="/admin/organizations"
        />
        <Tile name="Manage Users" icon="fa-users" link="/admin/users" />
        <Tile name="Analytics" icon="fa-chart-bar" link="/admin/analytics" />

        {window.location.href === 'https://sharingexcess.web.app/' ? (
          <Tile
            name="Test Environment"
            icon="fa-flask"
            link="/admin/switchenv"
          />
        ) : (
          <Tile
            name="Prod Environment"
            icon="fa-rocket"
            link="/admin/switchenv"
          />
        )}
      </>
    )
  }

  const header = user
    ? generateGreeting(user.displayName, my_routes, my_deliveries)
    : null

  return !user ? (
    <Landing />
  ) : !permission ? (
    <NewDriver />
  ) : (
    <main id="Home">
      {window.location.href === 'https://sharingexcess.web.app/' ? null : (
        <h2>Test Environment</h2>
      )}
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
