import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ORG_TYPE_ICONS,
  prettyPrintDbFieldName,
  DONOR_TYPES,
  RECIPIENT_TYPES,
} from 'helpers'
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
import { useNavigate } from 'react-router'

export function Organizations() {
  const navigate = useNavigate()
  const organizations = useFirestore(
    'organizations',
    useCallback(i => !i.is_deleted, [])
  )
  const [search, setSearch] = useState('')
  const [type, setType] = useState(
    new URLSearchParams(window.location.search).get('type') || 'recipient'
  )
  const [subtype, setSubtype] = useState(
    new URLSearchParams(window.location.search).get('subtype') || 'all'
  )

  const query = useMemo(() => {
    return `?type=${type}&subtype=${subtype}`
  }, [type, subtype])

  useEffect(() => {
    if (window.location.search !== query) {
      navigate(`?type=${type}&subtype=${subtype}`, { replace: true })
    }
  }, [query]) // eslint-disable-line

  function handleSearch(e) {
    setSearch(e.target.value)
  }

  function filterByType(array) {
    return type === 'all' ? array : array.filter(i => i.type === type)
  }

  function filterBySubtype(array) {
    return subtype === 'all' ? array : array.filter(i => i.subtype === subtype)
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
        <select value={type} onChange={e => setType(e.target.value)}>
          <option value="all">All Types&nbsp;&nbsp;&nbsp;&nbsp;⬇️</option>
          <option value="recipient">
            Recipients&nbsp;&nbsp;&nbsp;&nbsp;⬇️
          </option>
          <option value="donor">Donors&nbsp;&nbsp;&nbsp;&nbsp;⬇️</option>
        </select>
        {['donor', 'recipient'].includes(type) ? (
          <select value={subtype} onChange={e => setSubtype(e.target.value)}>
            <option value="all">All Subtypes&nbsp;&nbsp;&nbsp;&nbsp;⬇️</option>
            {type === 'donor'
              ? Object.values(DONOR_TYPES).map(i => (
                  <option value={i} key={i}>
                    {i.replace('_', ' ')}&nbsp;&nbsp;&nbsp;&nbsp;<Emoji name="down-arrow" width={20} />3
                  </option>
                ))
              : type === 'recipient'
              ? Object.values(RECIPIENT_TYPES).map(i => (
                  <option value={i} key={i}>
                    {i.replace('_', ' ')}&nbsp;&nbsp;&nbsp;&nbsp;⬇️
                  </option>
                ))
              : null}
          </select>
        ) : null}
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
      {filterBySearch(filterByType(filterBySubtype(organizations))).map(org => (
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
