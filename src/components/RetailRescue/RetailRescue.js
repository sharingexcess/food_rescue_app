import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { setFirestoreData, createTimestamp } from 'helpers'
import { allFoodDelivered, areAllStopsCompleted } from './utils'
import { useFirestore, useAuth } from 'hooks'
import { Spacer } from '@sharingexcess/designsystem'
import { Loading } from 'components'
import {
  BackupDelivery,
  RetailRescueActionButton,
  RetailRescueHeader,
  Stop,
} from './RetailRescue.children'

export function RetailRescue() {
  const { rescue_id } = useParams()
  const { admin } = useAuth()
  const history = useHistory()
  const retail_rescue = useFirestore('retail_rescues', rescue_id)
  const deliveries = useFirestore('deliveries')

  useEffect(() => {
    // handle auto completing a retail_rescue when all stops are finished
    if (retail_rescue && retail_rescue.status !== 'completed') {
      let completed_deliveries = 0
      const retail_rescue_deliveries = retail_rescue.stops.filter(
        s => s.type === 'delivery'
      )
      if (retail_rescue_deliveries.length) {
        for (const d of retail_rescue_deliveries) {
          if (d.status === 'completed' || d.status === 'cancelled')
            completed_deliveries++
        }
        if (
          completed_deliveries === retail_rescue_deliveries.length &&
          allFoodDelivered(retail_rescue.stops)
        ) {
          setFirestoreData(['retail_rescues', rescue_id], {
            status: 'completed',
            timestamps: {
              ...retail_rescue.timestamps,
              finished: createTimestamp(),
              updated: createTimestamp(),
            },
          }).then(() => history.push(`/rescues/${rescue_id}/completed`))
        }
      }
    }
  }, [deliveries, rescue_id, retail_rescue]) // eslint-disable-line

  return (
    <main id="RetailRescue">
      {!retail_rescue ? (
        <Loading />
      ) : (
        <>
          <RetailRescueHeader />
          <RetailRescueActionButton />
          <Spacer height={32} />
          {retail_rescue.stops.length ? (
            <>
              <section className="Stops">
                {retail_rescue.stops.map((s, i) => (
                  <Stop stops={retail_rescue.stops} s={s} i={i} key={i} />
                ))}
              </section>
              {retail_rescue.status === 3 &&
                admin === true &&
                areAllStopsCompleted(retail_rescue.stops) &&
                !allFoodDelivered(retail_rescue.stops) && <BackupDelivery />}
            </>
          ) : (
            <Loading text="Loading stops on route..." relative />
          )}
        </>
      )}
    </main>
  )
}
