import React, { useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Loading } from 'components'
import { LocationPhone } from './utils'
import { useFirestore } from 'hooks'
import {
  Button,
  Card,
  FlexContainer,
  Image,
  Spacer,
  Text,
} from '@sharingexcess/designsystem'
import { ORG_TYPE_ICONS, prettyPrintDbFieldName, DAYS } from 'helpers'
import { Emoji } from 'react-apple-emojis'
import PhilabundanceLogo from 'assets/philabundance.png'

export function Organization() {
  const { organization_id } = useParams()
  const org = useFirestore('organizations', organization_id)

  const locations = useFirestore(
    'locations',
    useCallback(
      i => i.organization_id === organization_id && !i.is_deleted,
      [organization_id]
    )
  )

  function OrgLocations() {
    if (!locations.length) {
      return (
        <Text id="NoLocations" color="white" align="center" shadow>
          This organization does not have any locations.
        </Text>
      )
    }
    return (
      <section id="Organization-locations">
        <Text type="section-header" color="white" shadow>
          Locations
        </Text>
        <Spacer height={16} />

        {locations.map(loc => (
          <Link
            key={loc.id}
            to={`/admin/organizations/${organization_id}/location/${loc.id}`}
          >
            <Card classList={['Organization-location']}>
              <Text
                classList={['Organization-location-header']}
                type="section-header"
                color="black"
              >
                {loc.address1}
                {loc.nickname && ` (${loc.nickname})`}
                {loc.is_philabundance_partner && (
                  <Image
                    classList={['Organization-philabundance']}
                    src={PhilabundanceLogo}
                  />
                )}
              </Text>
              {loc.address2 && (
                <Text type="paragraph" color="grey">
                  {loc.address2}
                </Text>
              )}
              <Text type="small" color="grey">
                {loc.city}, {loc.state} {loc.zip}
              </Text>
              <Spacer height={4} />
              <LocationPhone loc={loc} />
              {loc.id === org.primary_location_id && (
                <i className="primary fa fa-star" />
              )}
              {loc.hours && (
                <>
                  <Spacer height={10} />
                  <Text type="small" color="black" bold>
                    Open Hours
                  </Text>
                </>
              )}
              {loc.hours &&
                loc.hours.map((hour, index) => {
                  return (
                    <div key={index}>
                      <Text type="small" color="grey">
                        &nbsp;&nbsp; {DAYS[hour.day_of_week]}: {hour.time_open}{' '}
                        - {hour.time_close}
                      </Text>
                    </div>
                  )
                })}
            </Card>
          </Link>
        ))}
      </section>
    )
  }

  if (!org) return <Loading text="Loading organization" />
  return (
    <main id="Organization">
      <FlexContainer direction="vertical">
        <Emoji id="Organization-icon" name={ORG_TYPE_ICONS[org.subtype]} />
        <Spacer height={16} />
        <Text type="section-header" color="white" shadow>
          {org.name}
        </Text>
        <Text id="Organization-details" type="paragraph" color="white" shadow>
          {org.type} ({prettyPrintDbFieldName(org.subtype)})
        </Text>
        <Spacer height={8} />
        <Link to={`/admin/organizations/${organization_id}/edit`}>
          <Button type="secondary">Edit Organization</Button>
        </Link>
      </FlexContainer>
      <Spacer height={32} />
      <OrgLocations />
      <Spacer height={24} />
      <FlexContainer>
        <Link to={`/admin/organizations/${organization_id}/create-location`}>
          <Button id="Organization-new-location" type="primary" color="white">
            + New Location
          </Button>
        </Link>
      </FlexContainer>
    </main>
  )
}
