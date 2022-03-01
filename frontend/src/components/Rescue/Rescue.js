import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  setFirestoreData,
  createTimestamp,
  STATUSES,
  updateImpactDataForRescue,
} from 'helpers'
import { allFoodDelivered, areAllStopsCompleted } from './utils'
import { useAuth, useApi } from 'hooks'
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
  const navigate = useNavigate()
  const [rescue, loading, error, refresh] = useApi(`/rescue/${rescue_id}`)
  const [working, setWorking] = useState(false)

  useEffect(() => {
    // handle auto completing a rescue when all stops are finished
    async function handleAutoCompleteRescue() {
      if (rescue && rescue.status === STATUSES.ACTIVE) {
        const rescue_deliveries = rescue.stops.filter(
          s => s.type === 'delivery'
        )
        for (const d of rescue_deliveries) {
          if (![STATUSES.CANCELLED, STATUSES.COMPLETED].includes(d.status)) {
            // this rescue is not yet complete, return early
            return
          }
        }
        if (allFoodDelivered(rescue.stops) && !working) {
          setWorking(true)
          await updateImpactDataForRescue(rescue)
          await setFirestoreData(['rescues', rescue_id], {
            status: STATUSES.COMPLETED,
            timestamp_logged_finish: createTimestamp(),
            timestamp_updated: createTimestamp(),
          })
          setWorking(false)
          navigate(`/rescues/${rescue_id}/completed`)
        }
      }
    }
    handleAutoCompleteRescue()
  }, [rescue_id, rescue]) // eslint-disable-line

  return (
    <main id="Rescue">
      {!rescue ? (
        <Loading />
      ) : (
        <>
          <RescueHeader rescue={rescue} />
          <RescueActionButton rescue={rescue} refresh={refresh} />
          <Spacer height={32} />
          {rescue.stops.length ? (
            <>
              <section className="Stops">
                {rescue.stops.map((s, i) => (
                  <Stop
                    rescue={rescue}
                    stops={rescue.stops}
                    s={s}
                    i={i}
                    key={i}
                  />
                ))}
              </section>
              {rescue.status === STATUSES.ACTIVE &&
                admin === true &&
                areAllStopsCompleted(rescue.stops) &&
                !allFoodDelivered(rescue.stops) && (
                  <BackupDelivery rescue={rescue} />
                )}
            </>
          ) : (
            <Loading text="Loading stops on route..." relative />
          )}
        </>
      )}
    </main>
  )
}
