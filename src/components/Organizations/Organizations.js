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
  const donors = organizations.filter(org => org.org_type === 'donor')
  const recipients = organizations.filter(org => org.org_type === 'recipient')
  const communityFridges = organizations.filter(
    org => org.org_type === 'community fridge'
  )
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
  if (!organizations.length) return <Loading text="Loading organizations" />
  return (
    <main id="Organizations">
      <Header text="Network" />
      <section id="Filters">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="donor">Donors</option>
          <option value="recipient">Recipients</option>
          <option value="community">Community Fridges</option>
        </select>
        <Link to="/admin/create-organization">
          <button className="grant">+ New Network</button>
        </Link>
      </section>
      <Input
        label="Search..."
        onChange={handleSearch}
        value={search}
        animation={false}
      />
      {filter === 'community' || filter === 'all' ? (
        <div id="donors">
          {' '}
          <p>Community Frigdes </p>{' '}
        </div>
      ) : null}

      {filter === 'community' || filter === 'all'
        ? communityFridges.map(org => (
            <Link
              key={org.id}
              className="wrapper"
              to={`/admin/organizations/${org.id}`}
            >
              <section className="Organization">
                <img src={org_icon_urls[org.id] || UserIcon} alt={org.name} />
                <h3>{org.name}</h3>
                <h2
                  className={org.org_type === 'donor' ? 'donor' : 'recipient'}
                >
                  {org.org_type}
                </h2>
              </section>
            </Link>
          ))
        : null}
      {filter === 'donor' || filter === 'all' ? (
        <div id="donors">
          {' '}
          <p>Donors</p>{' '}
        </div>
      ) : null}

      {filter === 'donor' || filter === 'all'
        ? donors.map(org => (
            <Link
              key={org.id}
              className="wrapper"
              to={`/admin/organizations/${org.id}`}
            >
              <section className="Organization">
                <img src={org_icon_urls[org.id] || UserIcon} alt={org.name} />
                <h3>{org.name}</h3>
                <h2
                  className={org.org_type === 'donor' ? 'donor' : 'recipient'}
                >
                  {org.org_type}
                </h2>
              </section>
            </Link>
          ))
        : null}

      {filter === 'recipient' || filter === 'all' ? (
        <div id="recipients">
          {' '}
          <p>Recipients</p>{' '}
        </div>
      ) : null}

      {filter === 'recipient' || filter === 'all'
        ? recipients.map(org => (
            <Link
              key={org.id}
              className="wrapper"
              to={`/admin/organizations/${org.id}`}
            >
              <section className="Organization">
                <img src={org_icon_urls[org.id] || UserIcon} alt={org.name} />
                <h3>{org.name}</h3>
                <h2
                  className={org.org_type === 'donor' ? 'donor' : 'recipient'}
                >
                  {org.org_type}
                </h2>
              </section>
            </Link>
          ))
        : null}
    </main>
  )
}

export default memo(Organizations)
