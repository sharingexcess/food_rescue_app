import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import UserIcon from 'assets/user.svg'
import { Input, Loading } from 'components'
import { useFirestore } from 'hooks'
import { Card, Spacer, Text } from '@sharingexcess/designsystem'
import { Emoji } from 'react-apple-emojis'

export function Users() {
  const users = useFirestore('users')
  const [search, setSearch] = useState('')
  const [showAdmin, setShowAdmin] = useState(true)
  const [showDriver, setShowDriver] = useState(true)
  const [showNoAccess, setShowNoAccess] = useState(false)

  function handleSearch(e) {
    setSearch(e.target.value)
  }

  function filterBySearch(array) {
    return array.filter(
      i => i.id && i.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  const permissionFilters = [
    {
      checked: showAdmin,
      onChange: () => setShowAdmin(!showAdmin),
      label: 'Admin',
    },
    {
      checked: showDriver,
      onChange: () => setShowDriver(!showDriver),
      label: 'Driver',
    },
    {
      checked: showNoAccess,
      onChange: () => setShowNoAccess(!showNoAccess),
      label: 'NoAccess',
    },
  ]

  function filterByPermissions(array) {
    const filteredByAdmin = !showAdmin ? array.filter(i => !i.is_admin) : array
    const filteredByDriver = !showDriver
      ? filteredByAdmin.filter(i => !i.is_driver || i.is_admin)
      : filteredByAdmin
    const filteredByNoAccess = !showNoAccess
      ? filteredByDriver.filter(i => i.is_driver || i.is_admin)
      : filteredByDriver
    return filteredByNoAccess
  }

  function PermissionFilter({ checked, onChange, label }) {
    const id = `Users-permission-filters-${label}`
    return (
      <div className="Users-permission-filter">
        <input id={id} type="checkbox" checked={checked} onChange={onChange} />
        <Text type="paragraph" color="white">
          {label}
        </Text>
      </div>
    )
  }

  return !users.length ? (
    <Loading text="Loading users" />
  ) : (
    <main id="Users">
      <Text type="section-header" color="white" shadow>
        Users
      </Text>
      <Text type="subheader" color="white" shadow>
        Use the filters below to sort and search users by name and permission
        level.
      </Text>
      <Input
        label="Search..."
        onChange={handleSearch}
        value={search}
        animation={false}
      />

      <section id="Users-permission-filters">
        {permissionFilters.map(i => (
          <PermissionFilter
            key={i.label}
            checked={i.checked}
            onChange={i.onChange}
            label={i.label}
          />
        ))}
      </section>

      <Spacer height={16} />

      {filterByPermissions(filterBySearch(users)).map(user => (
        <Link key={user.id} className="wrapper" to={`/admin/users/${user.id}`}>
          <Card classList={['User']}>
            <img
              className="User-icon"
              src={user.icon || UserIcon}
              alt={user.name}
            />
            <div>
              <Text type="section-header" color="black">
                {user.name}
              </Text>
              <Text type="small" color="blue">
                {user.email}
              </Text>
            </div>
            {user.is_admin ? (
              <Emoji className="access-level" name="crown" size={32} />
            ) : user.is_driver && !user.is_admin ? (
              <Emoji
                className="access-level"
                name="articulated-lorry"
                size={32}
              />
            ) : null}
          </Card>
        </Link>
      ))}
    </main>
  )
}
