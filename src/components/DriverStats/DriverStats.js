import { Spacer, Text } from '@sharingexcess/designsystem'
import { ORG_SUBTYPES } from 'helpers'
import { useFirestore } from 'hooks'
import React, { useMemo } from 'react'
import { PoundsByMonthChart } from './PoundsByMonthChart'
import { PoundsByOrgChart } from './PoundsByOrgChart'
import { TotalPounds } from './TotalPounds'

export function DriverStats() {
  // const { user } = useAuth()
  // const { loadAllData } = useFirestore()
  // const driver_stops = useFirestore(
  //   'stops',
  //   useCallback(
  //     i =>
  //       i.handler_id === user.id &&
  //       // i.handler_id === 'jvC1BuuhYiXzMvbuog9b9YcUkDy1' && // (Use Jacob's ID for testing)
  //       // i.handler_id === 'jiBBxAvncBSNWwjizdmsxM7EALz1' && // Sarah DiPasquale
  //       // i.handler_id === '1yxUOZ53OOg0T3SJ2SqolPI3UK12' && // Alex Havertine
  //       // [
  //       //   'sUqgP36KAiPgDaU7V4z8N0GirIc2',
  //       //   'K2eYju4PtaejTIiOdHQrERMoRnk2',
  //       // ].includes(i.handler_id) && // Evan Ehlers (he has 2 accounts)
  //       i.status === STATUSES.COMPLETED,
  //     [user]
  //   )
  // )
  // TEMP FIX => ACTIVELY BEING REFACTORED IN ANOTHER PR
  const driver_stops = [] // eslint-disable-line
  const organizations = useFirestore('organizations')

  const filteredByHolding = useMemo(
    () =>
      driver_stops.filter(i => {
        const org = organizations.find(o => i.organization_id === o.id)
        return org.subtype !== ORG_SUBTYPES.HOLDING
      }),
    [organizations, driver_stops]
  )

  const driver_pickups = useMemo(
    () => filteredByHolding.filter(i => i.type === 'pickup'),
    [filteredByHolding]
  )
  const driver_deliveries = useMemo(
    () => filteredByHolding.filter(i => i.type === 'delivery'),
    [filteredByHolding]
  )

  // useEffect(() => loadAllData(), []) // eslint-disable-line

  return (
    <main id="DriverStats">
      <Text type="section-header" color="white" shadow>
        You and Sharing Excess
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        Let's take a look at all the impact you've made rescuing and
        redistributing food.
      </Text>
      <Spacer height={32} />
      <TotalPounds stops={driver_deliveries} />
      <Spacer height={64} />
      <Text type="section-header" color="white" shadow>
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
      <PoundsByOrgChart stops={driver_deliveries} />
    </main>
  )
}
