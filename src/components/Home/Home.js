import React, { useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth, useFirestore } from 'hooks'
import { generateDriverStats, generateGreeting } from './utils'
import { Landing, NewDriver } from 'components'
import { Card, Text } from '@sharingexcess/designsystem'
import { STATUSES } from 'helpers'
import { Emoji } from 'react-apple-emojis'

export function Home() {
  // access current user and admin state from the Auth Context in Auth.js
  const { user, admin, permission } = useAuth()
  const my_routes = useFirestore(
    'routes',
    useCallback(
      r => r.driver_id === user && user.uid && r.status === STATUSES.COMPLETED,
      [user]
    ) // eslint-disable-line
  )
  const my_deliveries = useFirestore(
    'deliveries',
    useCallback(
      d => d.driver_id === user && user.uid && d.status === STATUSES.COMPLETED,
      [user]
    ) // eslint-disable-line
  )
  const stats = generateDriverStats(my_routes, my_deliveries)

  function Tile({ name, icon, link }) {
    return (
      <Link to={link}>
        <Card classList={['Home-tile']}>
          {/* <div className="Home-tile-icon">{icon}</div> */}
          <Emoji name={icon} />
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
        <Tile name="Rescues" icon="articulated-lorry" link="/rescues" />
        <Tile name="Calendar" icon="spiral-calendar" link="/calendar" />
        <Tile name="Profile" icon="woman-tipping-hand" link="/profile" />
        <Tile name="Help" icon="person-raising-hand" link="/contact" />
      </>
    )
  }

  function AdminTiles() {
    if (!admin) return null
    return (
      <>
        <Tile name="Rescues" icon="articulated-lorry" link="/rescues" />
        <Tile name="Schedule Rescue" icon="plus" link="/admin/create-rescue" />
        <Tile
          name="Log Rescue"
          icon="writing-hand"
          link="admin/create-direct-donation"
        />
        <Tile name="Calendar" icon="spiral-calendar" link="/calendar" />
        <Tile name="Analytics" icon="bar-chart" link="/admin/analytics" />
        <Tile name="Users" icon="family" link="/admin/users" />
        <Tile
          name="Organizations"
          icon="office-building"
          link="/admin/organizations"
        />
        <Tile name="Help" icon="person-raising-hand" link="/contact" />
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
