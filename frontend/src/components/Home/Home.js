import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from 'hooks'
import { generateGreeting } from './utils'
import { Landing, NewDriver } from 'components'
import { Card, Spacer, Text } from '@sharingexcess/designsystem'
import { Emoji } from 'react-apple-emojis'

export function Home() {
  // access current user and admin state from the Auth Context in Auth.js
  const { user, admin, permission } = useAuth()

  function Tile({ name, icon, link }) {
    return (
      <Link to={link}>
        <Card classList={['Home-tile']}>
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
        <Tile name="Your Stats" icon="bar-chart" link="/stats" />
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
        <Tile name="Log Rescue" icon="writing-hand" link="admin/log-rescue" />
        <Tile name="Calendar" icon="spiral-calendar" link="/calendar" />
        <Tile
          name="Analytics"
          icon="chart-increasing"
          link="/admin/analytics"
        />
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

  const { headerText, emoji } = user
    ? generateGreeting(user.displayName)
    : { headerText: null, emoji: null }

  return !user ? (
    <Landing />
  ) : !permission ? (
    <NewDriver />
  ) : (
    <main id="Home">
      <Text type="secondary-header" color="white" align="center" shadow>
        {headerText} <Emoji name={emoji} width={50} />
      </Text>
      <Spacer height={4} />
      <Text type="subheader" color="white" align="center" shadow>
        Let's rescue some food today.
      </Text>
      <section id="Tiles">{admin ? <AdminTiles /> : <DriverTiles />}</section>
    </main>
  )
}
