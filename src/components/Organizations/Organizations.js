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
      return filtered_by_search.filter(i => i.org_type === filter)
    } else return filtered_by_search
  }

  if (!organizations.length) return <Loading text="Loading organizations" />
  return (
    <main id="Organizations">
      <Header text="Organizations" />
      <section id="Filters">
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
      </section>
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
            <h2 className={org.org_type === 'donor' ? 'donor' : 'recipient'}>
              {org.org_type}
            </h2>
          </section>
        </Link>
      ))}
    </main>
  )
}

export default memo(Organizations)
