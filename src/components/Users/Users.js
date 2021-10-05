import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import UserIcon from 'assets/user.svg'
import { getImageFromStorage, isValidURL } from 'helpers'
import { Input, Loading } from 'components'
import { useFirestore } from 'hooks'
import { Card, Spacer, Text } from '@sharingexcess/designsystem'

const user_icon_urls = {}

export function Users() {
  const users = useFirestore('users')
  const [search, setSearch] = useState('')
  const [showAdmin, setShowAdmin] = useState(true)
  const [showDriver, setShowDriver] = useState(true)
  const [showNoAccess, setShowNoAccess] = useState(false)
  const [, updated] = useState() // use this as a way to force re-render by calling a setState function

  useEffect(() => {
    async function updateImageSrc(user) {
      if (user.icon && !isValidURL(user.icon)) {
        const image = await getImageFromStorage(user.icon)
        user_icon_urls[user.id] = image
        updated(image)
      }
    }
    for (const user of users) {
      user.icon && updateImageSrc(user)
    }
  }, [users])

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
    const filteredByAdmin = !showAdmin
      ? array.filter(i => i.access_level !== 'admin')
      : array
    const filteredByDriver = !showDriver
      ? filteredByAdmin.filter(i => i.access_level !== 'driver')
      : filteredByAdmin
    const filteredByNoAccess = !showNoAccess
      ? filteredByDriver.filter(i => i.access_level !== 'none')
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
              src={user_icon_urls[user.id] || user.icon || UserIcon}
              alt={user.name}
            />
            <div>
              <Text type="section-header" color="black">
                {user.name}
              </Text>
              <Text type="paragraph" color="blue">
                {user.email}
              </Text>
            </div>
            {user.access_level === 'admin' ? (
              <i className="access-level fa fa-crown" />
            ) : user.access_level === 'driver' ? (
              <i className="access-level fa fa-truck" />
            ) : null}
          </Card>
        </Link>
      ))}
    </main>
  )
}
