import React, { memo, useEffect, useState } from 'react'
import Loading from '../Loading/Loading'
import { Link } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import { getImageFromStorage } from '../../helpers/helpers'
import './Organizations.scss'
import { Input } from '../Input/Input'
import useOrganizationData from '../../hooks/useOrganizationData'
import Header from '../Header/Header'

const org_icon_urls = {}

function Organizations() {
  const organizations = useOrganizationData()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('donor')
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
    return filtered_by_search.filter(i => i.org_type === filter)
  }

  if (!organizations.length) return <Loading text="Loading organizations" />
  return (
    <main id="Organizations">
      <Header text="Network" />
      <section id="Filters">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="donor">Donors</option>
          <option value="recipient">Recipients</option>
          <option value="community fridge">Community Fridges</option>
          <option value="warehouse">Warehouse</option>
          <option value="home delivery">Home Deliveries</option>
        </select>
        <Link to="/admin/create-organization">
          <button>+ New Network</button>
        </Link>
      </section>
      <Input
        label="Search..."
        onChange={handleSearch}
        value={search}
        animation={false}
      />
      {filter === 'donor' ? (
        <h1>Donors</h1>
      ) : filter === 'recipient' ? (
        <h1>Recipients</h1>
      ) : filter === 'warehouse' ? (
        <h1>Warehouse</h1>
      ) : filter === 'home delivery' ? (
        <h1>Home Deliveries</h1>
      ) : (
        <h1>Community Fridges</h1>
      )}
      {filterBySearch(organizations).map(org => (
        <Link
          key={org.id}
          className="wrapper"
          to={`/admin/organizations/${org.id}`}
        >
          <section className="Organization">
            <img src={org_icon_urls[org.id] || UserIcon} alt={org.name} />
            <h3>{org.name}</h3>
            <h2
              className={
                org.org_type === 'donor'
                  ? 'donor'
                  : org.org_type === 'recipient'
                  ? 'recipient'
                  : org.org_type === 'warehouse'
                  ? 'warehouse'
                  : org.org_type === 'community'
                  ? 'community'
                  : org.org_type === 'home'
                  ? 'home'
                  : 'community'
              }
            >
              {org.org_type}
            </h2>
          </section>
        </Link>
      ))}
    </main>
  )
}

export default memo(Organizations)
