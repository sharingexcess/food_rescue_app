import React, { memo, useEffect, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import firebase from 'firebase/app'
import Loading from '../Loading/Loading'
import { Link } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import { getImageFromStorage } from '../../helpers/helpers'
import './Organizations.scss'
import { Input } from '../Input/Input'

const org_icon_urls = {}

function Organizations() {
  const [organizations = [], loading] = useCollectionData(
    firebase.firestore().collection('Organizations')
  )
  const [search, setSearch] = useState('')
  const [, updated] = useState() // use this as a way to force re-render by calling a setState function

  useEffect(() => {
    async function updateImageSrc(org) {
      const image = await getImageFromStorage(org.icon)
      org_icon_urls[org.id] = image
      updated(image)
    }
    for (const org of organizations) {
      org.icon && updateImageSrc(org)
    }
  }, [organizations])

  function handleSearch(e) {
    setSearch(e.target.value)
  }

  function filterBySearch(array) {
    return array.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  return loading ? (
    <Loading text="Loading Organizations" />
  ) : (
    <main id="Organizations">
      <Link className="back" to="/">
        {'< '} back to home
      </Link>
      <h1>
        Organizations
        <Link to="/admin/create-organization">
          <button className="secondary">+ New Org</button>
        </Link>
      </h1>
      <Input
        label="Search..."
        onChange={handleSearch}
        value={search}
        animation={false}
      />
      {filterBySearch(organizations).map(org => (
        <Link
          key={org.id}
          className="wrapper"
          to={`/admin/organizations/${org.id}`}
        >
          <section className="Organization">
            <img src={org_icon_urls[org.id] || UserIcon} alt={org.name} />
            <h3>{org.name}</h3>
          </section>
        </Link>
      ))}
    </main>
  )
}

export default memo(Organizations)
