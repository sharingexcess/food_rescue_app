import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import { getImageFromStorage, isValidURL } from '../../helpers/helpers'
import { Input, Loading } from 'components'
import { useUserData } from 'hooks'

const user_icon_urls = {}

export function Users() {
  const users = useUserData()
  const [search, setSearch] = useState('')
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
      {filterBySearch(users).map(user => (
        <Link key={user.id} className="wrapper" to={`/admin/users/${user.id}`}>
          <section className="User">
            <img
              src={user_icon_urls[user.id] || user.icon || UserIcon}
              alt={user.name}
            />
            <div>
              <h2>{user.name}</h2>
              <p>{user.email}</p>
            </div>
            {user.access_level === 'admin' ? (
              <i className="access-level fa fa-crown" />
            ) : user.access_level === 'driver' ? (
              <i className="access-level fa fa-truck" />
            ) : null}
          </section>
        </Link>
      ))}
    </main>
  )
}
