import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useFirestore } from 'hooks'
import { generateDriverStats, generateGreeting } from './utils'
import { Landing, NewDriver } from 'components'
import { Card, Text } from '@sharingexcess/designsystem'

export function Home() {
  // access current user and admin state from the Auth Context in Auth.js
  const { user, admin, permission } = useAuth()
  const my_routes = useFirestore(
    'routes',
    useCallback(r => r.driver_id === user.uid && r.status === 9, []) // eslint-disable-line
  )
  const my_deliveries = useFirestore(
    'deliveries',
    useCallback(d => d.driver_id === user.uid && d.status === 9, []) // eslint-disable-line
  )
  const stats = generateDriverStats(my_routes, my_deliveries)

  function Tile({ name, icon, link }) {
    return (
      <Link to={link}>
        <Card classList={['Home-tile']}>
          <i className={`fa ${icon}`} />
          <Text type="paragraph" color="black" align="center" bold>
            {name}
          </Text>
        </Card>
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
        <Tile name="Routes" icon="fa-route" link="/routes" />
        <Tile name="New Route" icon="fa-plus" link="/admin/create-route" />
        <Tile
          name="New Direct Donation"
          icon="fas fa-clipboard-check"
          link="admin/create-direct-donation"
        />
        <Tile
          name="Manage Organizations"
          icon="fa-map-marked-alt"
          link="/admin/organizations"
        />
        <Tile name="Manage Users" icon="fa-users" link="/admin/users" />
        <Tile name="Analytics" icon="fa-chart-bar" link="/admin/analytics" />
        <Tile
          name="Switch Environments"
          icon="fa-rocket"
          link="/admin/switch-environment"
        />
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
      <Text type="secondary-header" color="white" align="center" shadow>
        {header}
      </Text>
      {stats ? (
        <Text type="subheader" color="white" align="center" shadow>
          <span>{stats.routes}</span> route{stats.routes === 1 ? '' : 's'}{' '}
          driven, <span>{stats.weight}</span> lbs. rescued
        </Text>
      ) : null}
      <section id="Tiles">{admin ? <AdminTiles /> : <DriverTiles />}</section>
    </main>
  )
}
