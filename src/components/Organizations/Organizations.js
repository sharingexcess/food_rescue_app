import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import UserIcon from 'assets/user.svg'
import { getImageFromStorage } from 'helpers'
import { Input, Loading } from 'components'
import { useFirestore } from 'hooks'
import { Button, Card, Spacer, Text } from '@sharingexcess/designsystem'

const org_icon_urls = {}

export function Organizations() {
  const organizations = useFirestore('organizations')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState()
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
    return filtered_by_search.filter(i =>
      filter ? i.org_type === filter : true
    )
  }

  if (!organizations.length) return <Loading text="Loading organizations" />
  return (
    <main id="Organizations">
      <Text type="section-header" color="white" shadow>
        Organizations
      </Text>
      <Text type="subheader" color="white" shadow>
        Use the filters below to sort and search organizations by name and type.
      </Text>
      <Spacer height={32} />
      <section id="Filters">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Filter by type...</option>
          <option value="donor">Donors</option>
          <option value="recipient">Recipients</option>
          <option value="community fridge">Community Fridges</option>
          <option value="warehouse">Warehouse</option>
          <option value="home delivery">Home Deliveries</option>
        </select>
        <Link to="/admin/create-organization">
          <Button type="secondary" color="white">
            + New
          </Button>
        </Link>
      </section>
      <Input
        label="Search..."
        onChange={handleSearch}
        value={search}
        animation={false}
      />
      <Spacer height={16} />
      {filterBySearch(organizations).map(org => (
        <Link
          key={org.id}
          className="wrapper"
          to={`/admin/organizations/${org.id}`}
        >
          <Card classList={['Organization']}>
            <img src={org_icon_urls[org.id] || UserIcon} alt={org.name} />
            <Text type="paragraph" color="black">
              {org.name}
            </Text>
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
          </Card>
        </Link>
      ))}
    </main>
  )
}
