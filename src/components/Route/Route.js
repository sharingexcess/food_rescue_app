import React, { useEffect, useState } from 'react'
import firebase from 'firebase/app'
import { useHistory, useParams, useLocation } from 'react-router-dom'
import { setFirestoreData } from 'helpers'
import { allFoodDelivered, areAllStopsCompleted } from './utils'
import { useFirestore, useAuth, useApp } from 'hooks'
import { Spacer } from '@sharingexcess/designsystem'
import { Loading } from 'components'
import {
  BackupDelivery,
  RouteActionButton,
  RouteHeader,
  Stop,
} from './Route.children'

export function Route() {
  const { route_id } = useParams()
  const { admin } = useAuth()
  const { setModalState } = useApp()
  const history = useHistory()
  const route = useFirestore('routes', route_id)
  const drivers = useFirestore('users')
  const pickups = useFirestore('pickups')
  const deliveries = useFirestore('deliveries')
  const organizations = useFirestore('organizations')
  const locations = useFirestore('locations')
  const location = useLocation()
  const [stops, setStops] = useState([])

  useEffect(() => {
    // handle populating full driver info based on route.driver_id
    if (drivers && route) {
      route.driver = drivers.find(d => d.id === route.driver_id)
    }
  }, [drivers, route])

  useEffect(() => {
    // handle auto completing a route when all stops are finished
    if (route && route.status !== 9) {
      let completed_deliveries = 0
      const route_deliveries = deliveries.filter(d => d.route_id === route_id)
      if (route_deliveries.length && !location.pathname.includes('history')) {
        for (const d of route_deliveries) {
          if (d.status === 9 || d.status === 0) completed_deliveries++
        }
        if (
          completed_deliveries === route_deliveries.length &&
          allFoodDelivered(stops)
        ) {
          setFirestoreData(['Routes', route_id], {
            status: 9,
            time_finished: firebase.firestore.FieldValue.serverTimestamp(),
            updated_at: createServerTimestamp(),
          }).then(() => history.push(`/routes/${route_id}/completed`))
        }
      }
    }
  }, [deliveries, route_id, stops, route]) // eslint-disable-line

  useEffect(() => {
    // handle populating full pickup and delivery info based on stop ids
    async function updateStops() {
      const updated_stops = []
      for (const s of route.stops) {
        let stop =
          s.type === 'pickup'
            ? pickups.find(p => p.id === s.id)
            : deliveries.find(d => d.id === s.id)
        stop = { ...s, ...stop }
        stop.org = organizations.find(o => o.id === stop.org_id) || {}
        stop.location = locations.find(l => l.id === stop.location_id) || {}
        updated_stops.push(stop)
      }
      setStops(updated_stops)
      setModalState({ route: { ...route, stops: updated_stops } })
    }
    route && route.stops && updateStops()
  }, [route, pickups, deliveries, organizations, locations]) // eslint-disable-line

  return (
    <main id="Route">
      {!route ? (
        <Loading />
      ) : (
        <>
          <RouteHeader />
          <RouteActionButton />
          <Spacer height={32} />
          {stops.length ? (
            <>
              <section className="Stops">
                {stops.map((s, i) => (
                  <Stop stops={stops} s={s} i={i} key={i} />
                ))}
              </section>
              {route.status === 3 &&
                admin === true &&
                areAllStopsCompleted(stops) &&
                !allFoodDelivered(stops) && <BackupDelivery />}
            </>
          ) : (
            <Loading text="Loading stops on route" relative />
          )}
        </>
      )}
    </main>
  )
}
