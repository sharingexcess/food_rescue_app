import { ROUTE_STATUSES, setFirestoreData } from 'helpers'
import { useFirestore } from 'hooks'
import React from 'react'
import { useEffect } from 'react/cjs/react.development'

export function UpdateDB() {
  const routes = useFirestore('routes')

  useEffect(() => {
    if (routes && routes.length) {
      handleRoutes(routes)
    }
  }, [routes])

  function normalizeTimestamp(t) {
    if (t.)
  }

  function handleRoutes(routes) {
    const failed = []
    for (const i of routes) {
      try {
        const route = {
          id: i.id,
          handler_id: i.driver_id,
          google_calendar_event_id: i.google_calendar_event_id,
          is_wholesale: false,
          is_direct_link: false,
          status: ROUTE_STATUSES[i.status],
          notes: i.notes || '',
          time_created: i.created_at,
          time_updated: i.updated_at,

        }
        setFirestoreData(['routes', i.id], route)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    console.log('Failed to write:', failed)
  }

  return <button>update db</button>
}
