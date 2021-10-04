import {
  Button,
  Card,
  ExternalLink,
  Spacer,
  Text,
} from '@sharingexcess/designsystem'
import { GoogleMap } from 'components'
import {
  createServerTimestamp,
  formatPhoneNumber,
  setFirestoreData,
  STOP_STATUSES,
} from 'helpers'
import { useAuth, useFirestore } from 'hooks'
import React from 'react'
import { useHistory, useLocation, useParams } from 'react-router'
import { generateDirectionsLink, getNextIncompleteStopIndex } from './utils'

export function Stop({ stops, s, i }) {
  const location = useLocation()
  const history = useHistory()
  const { route_id } = useParams()
  const route = useFirestore('routes', route_id)
  const { user, admin } = useAuth()
  const pickups = useFirestore('pickups')
  const organizations = useFirestore('organizations')

  const isActiveStop = route
    ? i === getNextIncompleteStopIndex(route, stops)
    : false

  function hasEditPermissions() {
    return admin || user.uid === route.driver_id
  }

  function generateStopTitle() {
    return `${s.org.name}${
      s.location.name && s.location.name !== s.org.name
        ? ` (${s.location.name})`
        : ''
    }`
  }

  function StopHeader() {
    const headerText =
      s.type && s.status
        ? s.type === 'delivery'
          ? `⬇️ DELIVERY ${STOP_STATUSES[s.status].toUpperCase()}`
          : `⬆️ PICKUP ${STOP_STATUSES[s.status].toUpperCase()}`
        : 'loading...'

    return (
      <div className="Route-stop-header">
        <Text
          type="small-header"
          color={
            isActiveStop ? (s.type === 'pickup' ? 'green' : 'red') : 'white'
          }
        >
          {headerText}
        </Text>
        <Button
          id="Route-stop-edit-button"
          type="tertiary"
          size="large"
          color="black"
        >
          ···
        </Button>
      </div>
    )
  }

  function StopInstructions() {
    return s.location.upon_arrival_instructions ? (
      <>
        <Spacer height={16} />
        <Text
          type="small"
          color="black"
          classList={['Route-stop-instructions']}
        >
          <span>Instructions: </span>
          {s.location.upon_arrival_instructions}
        </Text>
      </>
    ) : null
  }

  function StopAddress() {
    return (
      <ExternalLink to={generateDirectionsLink(s.location)}>
        <Button
          classList={['Route-stop-address-button']}
          type="tertiary"
          size="small"
          color="blue"
        >
          <div>🏢</div>
          <Spacer width={16} />
          {s.location.address1}
          {s.location.address2 && ` - ${s.location.address2}`}
          <br />
          {s.location.city}, {s.location.state} {s.location.zip_code}
        </Button>
      </ExternalLink>
    )
  }

  function StopContact({ name, number }) {
    return (
      <ExternalLink
        to={`tel:${s.location.contact_phone || s.org.default_contact_phone}`}
      >
        <Button
          classList={['Route-stop-phone-button']}
          type="tertiary"
          size="small"
          color="blue"
        >
          <div>📞</div>
          <Spacer width={16} />
          {formatPhoneNumber(number)}
          {name && ` (ask for ${name})`}
        </Button>
      </ExternalLink>
    )
  }

  function StopMap() {
    return s.location.lat && s.location.lng ? (
      <GoogleMap address={s.location} style={{ height: 200 }} zoom={14} />
    ) : null
  }

  function StopDirectionsButton() {
    return (
      <ExternalLink to={generateDirectionsLink(s.location)}>
        <Button type="primary" color="blue">
          I'm On My Way
        </Button>
      </ExternalLink>
    )
  }

  function StopAdvanceButton() {
    function handleOpenReport() {
      const baseURL = location.pathname.includes('routes')
        ? 'routes'
        : 'history'
      history.push(`/${baseURL}/${route_id}/${s.type}/${s.id}`)
    }

    function handleSubmitHomeDelivery() {
      const pickup = pickups.find(p => p.route_id === route.id)
      const weight = pickup.report.weight
      const percent_of_total_dropped = weight / (route.stops.length - 1)
      setFirestoreData(['Deliveries', s.id], {
        report: {
          percent_of_total_dropped: parseInt(percent_of_total_dropped),
          weight: isNaN(weight) ? 0 : weight,
          created_at: createServerTimestamp(),
          updated_at: createServerTimestamp(),
        },
        time_finished: createServerTimestamp(),
        status: 9,
      })
        .then(() => history.push(`/routes/${route_id}`))
        .catch(e => console.error('Error writing document: ', e))
    }

    function handleClick() {
      const org = organizations.find(o => o.id === s.org_id)
      if (org.org_type === 'home delivery') {
        handleSubmitHomeDelivery()
      } else handleOpenReport()
    }

    return (
      <Button type="primary" color="green" onClick={handleClick}>
        Complete {s.type}
      </Button>
    )
  }

  function StopDetails() {
    return s.location.is_deleted ? (
      <Text type="paragraph">This location has been deleted.</Text>
    ) : (
      <>
        <Spacer height={16} />
        <StopAddress />
        <Spacer height={8} />
        <StopContact
          name={s.location.contact_name || s.org.default_contact_name}
          number={s.location.contact_phone || s.org.default_contact_phone}
        />
        <StopInstructions />
        <Spacer height={16} />
        <StopMap />
        <Spacer height={16} />
        <StopDirectionsButton />
        {s.status === 1 && <StopAdvanceButton />}
      </>
    )
  }

  return (
    <Card
      type={isActiveStop ? 'primary' : 'secondary'}
      classList={['Stop']}
      key={i}
    >
      <StopHeader />
      <Text type="section-header" color={isActiveStop ? 'black' : 'white'}>
        {generateStopTitle()}
      </Text>
      {isActiveStop && <StopDetails />}
      {/* {isCompleted && <StopSummary />} */}
      {hasEditPermissions() ? (
        <>
          {/* {isActiveStop ? (
            <>{s.status < 9 && admin ? <CancelStop stop={s} /> : null}</>
          ) : null} */}
        </>
      ) : null}
    </Card>
  )
}
