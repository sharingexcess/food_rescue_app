import React, { useCallback, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  setFirestoreData,
  createTimestamp,
  STATUSES,
  updateImpactDataForRescue,
} from 'helpers'
import { allFoodDelivered, areAllStopsCompleted } from './utils'
import { useFirestore, useAuth } from 'hooks'
import { Spacer } from '@sharingexcess/designsystem'
import { Loading } from 'components'
import {
  BackupDelivery,
  RescueActionButton,
  RescueHeader,
  Stop,
} from './Rescue.children'

export function Rescue() {
  const { rescue_id } = useParams()
  const { admin } = useAuth()
  const history = useHistory()
  const rescue = useFirestore('rescues', rescue_id)
  const deliveries = useFirestore(
    'stops',
    useCallback(i => i.type === 'delivery', [])
  )

  useEffect(() => {
    // handle auto completing a rescue when all stops are finished
    async function handleAutoCompleteRoute() {
      if (rescue && rescue.status !== STATUSES.COMPLETED) {
        let completed_deliveries = 0
        const rescue_deliveries = rescue.stops.filter(
          s => s.type === 'delivery'
        )
        if (rescue_deliveries.length) {
          for (const d of rescue_deliveries) {
            if (
              d.status === STATUSES.COMPLETED ||
              d.status === STATUSES.CANCELLED
            )
              completed_deliveries++
          }
          if (
            completed_deliveries === rescue_deliveries.length &&
            allFoodDelivered(rescue.stops)
          ) {
            await updateImpactDataForRescue(rescue)
            setFirestoreData(['rescues', rescue_id], {
              status: STATUSES.COMPLETED,
              timestamp_logged_finish: createTimestamp(),
              timestamp_updated: createTimestamp(),
            }).then(() => history.push(`/rescues/${rescue_id}/completed`))
          }
        }
      }
    }
    handleAutoCompleteRoute()
  }, [deliveries, rescue_id, rescue]) // eslint-disable-line

  return (
    <main id="Rescue">
      {!rescue ? (
        <Loading />
      ) : (
        <>
          <RescueHeader />
          <RescueActionButton />
          <Spacer height={32} />
          {rescue.stops.length ? (
            <>
              <section className="Stops">
                {rescue.stops.map((s, i) => (
                  <Stop stops={rescue.stops} s={s} i={i} key={i} />
                ))}
              </section>
              {rescue.status === STATUSES.ACTIVE &&
                admin === true &&
                areAllStopsCompleted(rescue.stops) &&
                !allFoodDelivered(rescue.stops) && <BackupDelivery />}
            </>
          ) : (
            <Loading text="Loading stops on route..." relative />
          )}
        </>
      )}
    </main>
  )
}
