import React, { memo, useEffect, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import Loading from '../Loading/Loading'
import { Link } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import {
  getCollection,
  getImageFromStorage,
  isValidURL,
} from '../../helpers/helpers'
import './Users.scss'
import { Input } from '../Input/Input'
import { GoBack } from '../../helpers/components'

const user_icon_urls = {}

function Users() {
  const [users = [], loading] = useCollectionData(
    getCollection('Users').orderBy('name')
  )
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

  return loading ? (
    <Loading text="Loading users" />
  ) : (
    <main id="Users">
      <GoBack url="/" label="back to home" />
      <h1>Users</h1>
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
              <h3>{user.name}</h3>
              <p>{user.email}</p>
            </div>
          </section>
        </Link>
      ))}
    </main>
  )
}

export default memo(Users)
