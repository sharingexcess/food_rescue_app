import React, { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ORG_TYPE_ICONS, prettyPrintDbFieldName } from 'helpers'
import { Input, Loading } from 'components'
import { useFirestore } from 'hooks'
import {
  Button,
  Card,
  FlexContainer,
  Spacer,
  Text,
} from '@sharingexcess/designsystem'
import { Emoji } from 'react-apple-emojis'

export function Organizations() {
  const organizations = useFirestore(
    'organizations',
    useCallback(i => !i.is_deleted, [])
  )
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('donor')

  function handleSearch(e) {
    setSearch(e.target.value)
  }

  function filterByType(array) {
    return array.filter(i => i.type === filter)
  }

  function filterBySearch(array) {
    return array.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase())
    )
  }

  if (!organizations.length) return <Loading text="Loading organizations" />
  return (
    <main id="Organizations">
      <section id="Filters">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">Filter by type...</option>
          <option value="donor">Donors&nbsp;&nbsp;&nbsp;&nbsp;⬇️</option>
          <option value="recipient">
            Recipients&nbsp;&nbsp;&nbsp;&nbsp;⬇️
          </option>
        </select>
        <Link to="/admin/create-organization">
          <Button type="secondary" color="white">
            + New
          </Button>
        </Link>
      </section>
      <Input
        label="🔎 Search..."
        onChange={handleSearch}
        value={search}
        animation={false}
      />
      <Spacer height={16} />
      {filterBySearch(filterByType(organizations)).map(org => (
        <Link
          key={org.id}
          className="wrapper"
          to={`/admin/organizations/${org.id}`}
        >
          <Card classList={['Organization']}>
            <Emoji name={ORG_TYPE_ICONS[org.subtype]} width={32} />
            <Spacer width={16} />
            <FlexContainer
              direction="vertical"
              primaryAlign="start"
              secondaryAlign="start"
            >
              <Text type="section-header">{org.name}</Text>
              <Text type="small" color="grey">
                {prettyPrintDbFieldName(org.subtype)} {org.type}
              </Text>
            </FlexContainer>
          </Card>
        </Link>
      ))}
    </main>
  )
}
