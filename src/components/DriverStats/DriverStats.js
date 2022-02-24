import { Spacer, Text } from '@sharingexcess/designsystem'
import {
  ORG_SUBTYPES,
  STATUSES,
  CLOUD_FUNCTION_URLS,
  formatLargeNumber,
} from 'helpers'
import { useAuth, useFirestore } from 'hooks'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { PoundsByMonthChart } from './PoundsByMonthChart'
import { PoundsByOrgChart } from './PoundsByOrgChart'
import { TotalPounds } from './TotalPounds'
import { useNavigate } from 'react-router-dom'
import { Loading } from 'components'

export function DriverStats() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { loadAllData } = useFirestore()
  const driver_stops = useFirestore(
    'stops',
    useCallback(
      i =>
        i.handler_id === user.id &&
        // i.handler_id === 'jvC1BuuhYiXzMvbuog9b9YcUkDy1' && // (Use Jacob's ID for testing)
        // i.handler_id === 'jiBBxAvncBSNWwjizdmsxM7EALz1' && // Sarah DiPasquale
        // i.handler_id === '1yxUOZ53OOg0T3SJ2SqolPI3UK12' && // Alex Havertine
        // [
        //   'sUqgP36KAiPgDaU7V4z8N0GirIc2',
        //   'K2eYju4PtaejTIiOdHQrERMoRnk2',
        // ].includes(i.handler_id) && // Evan Ehlers (he has 2 accounts)
        i.status === STATUSES.COMPLETED,
      [user]
    )
  )
  const organizations = useFirestore('organizations')

  // const filteredByHolding = useMemo(
  //   () =>
  //     driver_stops.filter(i => {
  //       const org = organizations.find(o => i.organization_id === o.id)
  //       return org.subtype !== ORG_SUBTYPES.HOLDING
  //     }),
  //   [organizations, driver_stops]
  // )

  // const driver_pickups = useMemo(
  //   () => filteredByHolding.filter(i => i.type === 'pickup'),
  //   [filteredByHolding]
  // )
  // const driver_deliveries = useMemo(
  //   () => filteredByHolding.filter(i => i.type === 'delivery'),
  //   [filteredByHolding]
  // )
  const [working, setWorking] = useState(true)
  const [apiData, setApiData] = useState()

  const query = useMemo(() => {
    return `?user=${encodeURIComponent(user.id)}`
  }, [user.id])

  useEffect(() => {
    if (window.location.search !== query) {
      setWorking(true)
      navigate(query, { replace: true })
    } else {
      console.log('fetching', CLOUD_FUNCTION_URLS.myStats + query)
      fetch(CLOUD_FUNCTION_URLS.myStats)
        .then(res => res.json())
        .then(data => {
          setApiData(data)
          setWorking(false)
        })
    }
  }, [query]) // eslint-disable-line
  console.log('apiData: ', apiData)

  return (
    <main id="DriverStats">
      {apiData && !working ? (
        <>
          <Text type="section-header" color="white" shadow>
            You and Sharing Excess
          </Text>
          <Spacer height={8} />
          <Text type="paragraph" color="white" shadow>
            Let's take a look at all the impact you've made rescuing and
            redistributing food.
          </Text>
          <Spacer height={32} />
          <Text type="primary-header" color="black">
            {formatLargeNumber(apiData.total_weight)} lbs
          </Text>

          {/* <TotalPounds stops={driver_deliveries} /> */}
          <Spacer height={64} />
          {/* <Text type="section-header" color="white" shadow>
        Looking back on the year:
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        Here's a breakdown of all the food you've rescued in the last 12 months.
      </Text>
      <Spacer height={16} />
      <PoundsByMonthChart stops={driver_deliveries} />
      <Spacer height={64} />
      <Text type="section-header" color="white" shadow>
        Where You Like to Rescue:
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        Click on a block to see exactly how much food you rescued from each
        organization.
      </Text>
      <Spacer height={16} />
      <PoundsByOrgChart stops={driver_pickups} />
      <Spacer height={64} />
      <Text type="section-header" color="white" shadow>
        Where You Like to Deliver:
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        Click on a block to see exactly how much food you delivered to each
        organization.
      </Text>
      <Spacer height={16} />
      <PoundsByOrgChart stops={driver_deliveries} /> */}
        </>
      ) : (
        <>
          <Spacer height={32} />
          <Loading relative text="Calculating" />
        </>
      )}
    </main>
  )
}
