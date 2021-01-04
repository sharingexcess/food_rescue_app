import React, { memo, useEffect, useState } from 'react'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import firebase from 'firebase/app'
import Loading from '../Loading/Loading'
import { Link } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import { getCollection, getImageFromStorage } from '../../helpers/helpers'
import './Organizations.scss'
import { Input } from '../Input/Input'
import { GoBack } from '../../helpers/components'

const org_icon_urls = {}

function Organizations() {
  const [organizations = [], loading] = useCollectionData(
    getCollection('Organizations').orderBy('name')
  )
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
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
    const filtered_by_search = array.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase())
    )
    if (filter !== 'all') {
      console.log(filter)
      return filtered_by_search.filter(i => i.org_type === filter)
    } else return filtered_by_search
  }
  if (loading) return <Loading text="Loading organizations" />
  return (
    <main id="Organizations">
      <GoBack label="back" url="/" />
      <h1>
        Organizations
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">View{filter === 'all' ? 'ing' : ''} All</option>
          <option value="donor">
            View{filter === 'donor' ? 'ing' : ''} Donors
          </option>
          <option value="recipient">
            View{filter === 'recipient' ? 'ing' : ''} Recipients
          </option>
        </select>
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
