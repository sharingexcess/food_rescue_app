import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useFirestore } from 'hooks'
import { generateDriverStats, generateGreeting } from './utils'
import { Landing, NewDriver } from 'components'
import { Card, Text } from '@sharingexcess/designsystem'
import { STATUSES } from 'helpers'

export function Home() {
  // access current user and admin state from the Auth Context in Auth.js
  const { user, admin, permission } = useAuth()
  const my_routes = useFirestore(
    'routes',
    useCallback(
      r => r.driver_id === user.uid && r.status === STATUSES.COMPLETED,
      [user.uid]
    ) // eslint-disable-line
  )
  const my_deliveries = useFirestore(
    'deliveries',
    useCallback(
      d => d.driver_id === user.uid && d.status === STATUSES.COMPLETED,
      [user.uid]
    ) // eslint-disable-line
  )
  const stats = generateDriverStats(my_routes, my_deliveries)

  function Tile({ name, icon, link }) {
    return (
      <Link to={link}>
        <Card classList={['Home-tile']}>
          <div className="Home-tile-icon">{icon}</div>
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
        <Tile name="Rescues" icon="🚛" link="/rescues" />
        <Tile name="Contact" icon="🤔" link="/contact" />
        <Tile name="Profile" icon="💁‍♀️" link="/profile" />
      </>
    )
  }

  function AdminTiles() {
    if (!admin) return null
    return (
      <>
        <Tile name="Rescues" icon="🚛" link="/rescues" />
        <Tile name="New Rescue" icon="➕" link="/admin/create-route" />
        <Tile
          name="New Direct Donation"
          icon="🏃"
          link="admin/create-direct-donation"
        />
        <Tile name="Calendar" icon="🗓" link="/calendar" />
        <Tile name="Analytics" icon="📊" link="/admin/analytics" />
        <Tile
          name="Manage Organizations"
          icon="🏢"
          link="/admin/organizations"
        />
        <Tile name="Manage Users" icon="👨‍👩‍👧‍👦" link="/admin/users" />
        <Tile
          name="Switch Environments"
          icon="🔄"
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
