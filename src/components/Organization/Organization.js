import React, { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import UserIcon from 'assets/user.svg'
import { Loading } from 'components'
import {
  handleOrgIcon,
  sortByPrimary,
  OrganizationContact,
  OrganizationEmail,
  OrganizationPhone,
  LocationPhone,
  OrganizationHours,
} from './utils'
import { useFirestore } from 'hooks'
import { Button, Card, Spacer, Text } from '@sharingexcess/designsystem'

export function Organization() {
  // get org id from url parameters
  const { id } = useParams()
  // get org data using id from firestore data
  const org = useFirestore('organizations', id) || {}
  // get org's locations from firestore data
  const locations =
    useFirestore(
      'locations',
      useCallback(
        i =>
          i.organization_id === id && (!i.is_deleted || i.is_deleted === false),
        [id]
      )
    ) || []
  // orgIconFullUrl defines the URL we build based on the path stored in org.icon
  const [orgIconFullUrl, setOrgIconFullUrl] = useState()

  useEffect(() => {
    handleOrgIcon(org.icon, setOrgIconFullUrl)
  }, [org.icon])

  function OrgLocations() {
    if (!locations.length) {
      return (
        <Text id="NoLocations" color="white" shadow>
          This organization does not have any locations.
        </Text>
      )
    }
    return (
      <>
        <Text type="section-header" color="white" shadow>
          Locations
        </Text>

        {sortByPrimary(locations).map(loc => (
          <Link
            key={loc.name}
            className="wrapper"
            to={`/admin/organizations/${id}/location/${loc.id}`}
          >
            <Card classList={['Organization-location']}>
              <Text type="section-header" color="black">
                {loc.address.address1}
                {loc.nickname && ` (${loc.nickname})`}
              </Text>
              {/* {loc.is_philabundance_partner && (
                  <p className="philabundance">Philabundance Partner</p>
                )} */}
              {loc.address.address2 && (
                <Text type="paragraph" color="grey">
                  {loc.address.address2}
                </Text>
              )}
              <Text type="paragraph" color="grey">
                {loc.address.city}, {loc.address.state} {loc.address.zip}
              </Text>
              <LocationPhone loc={loc} />
              <OrganizationHours org={loc} org_type={org.type} />
              {loc.id === org.primary_location_id && (
                <i className="primary fa fa-star" />
              )}
            </Card>
          </Link>
        ))}
      </>
    )
  }

  if (!org) return <Loading text="Loading your organization" />
  return (
    <main id="Organization">
      <div id="Organization-info">
        <img src={orgIconFullUrl || UserIcon} id="org-icon" alt={org.name} />
        <div id="Organization-info-text">
          <Text type="section-header" color="white" shadow>
            {org.name}
          </Text>
          <Spacer height={8} />
          <Spacer height={16} />
          <Link to={`/admin/organizations/${id}/edit`}>
            <Button type="secondary">Edit Org Details</Button>
          </Link>
        </div>
      </div>
      <Spacer height={32} />
      <OrgLocations />
      <Spacer height={24} />
      <Link to={`/admin/organizations/${id}/create-location`}>
        <Button id="Organization-new-location" type="primary" color="white">
          + New Location
        </Button>
      </Link>
    </main>
  )
}
