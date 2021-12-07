import { ROUTE_STATUSES, setFirestoreData } from 'helpers'
import { useFirestore } from 'hooks'
import moment from 'moment'
import React from 'react'

export function UpdateDB() {
  const routes = useFirestore('routes')
  const dds = useFirestore('direct_donations')
  const retail_rescues = useFirestore('retail_rescues')
  const wholesale_rescues = useFirestore('wholesale_rescues')
  const pickups = useFirestore('pickups')
  const deliveries = useFirestore('deliveries')

  function handleClick() {
    updatePickups(pickups)
  }

  async function updateDeliveries(deliveries) {
    if (!deliveries || !deliveries.length) {
      alert('deliveries not populated')
    }

    const failed = []

    for (const i of deliveries) {
      try {
        const pickup_ids = []
        const parent = i.route_id
          ? retail_rescues.find(r => r.id === i.route_id)
          : wholesale_rescues.find(d => d.id === i.direct_donation_id)

        if (!parent) {
          console.log(
            'no parent found',
            i,
            retail_rescues,
            wholesale_rescues,
            routes,
            dds
          )
          continue
        } else if (i.route_id) {
          const route = routes.find(r => r.id === i.route_id)
          // we populate the array of delivery ids
          // by iterating over the list of stop in the route,
          let stop_index
          for (let j = route.stops.length - 1; j >= 0; j--) {
            if (route.stops[j].id === i.id) {
              // first finding the index of our pickup,
              stop_index = j
              continue
            }
            if (stop_index) {
              // then adding the id of every previous pickup
              if (route.stops[j].type === 'pickup') {
                pickup_ids.push(route.stops[j].id)
              } else {
                // unless we find a delivery where the entire load is dropped,
                // meaning we've looked far enough back, and no other pickups are relevant
                const d = deliveries.find(d => d.id === route.stops[j].id)
                if (
                  d &&
                  d.report &&
                  d.report.percent_of_total_dropped === 100
                ) {
                  break
                }
              }
            }
          }
        } else if (i.direct_donation_id) {
          pickup_ids.push(parent.pickup_id)
        }

        const impact_data = {
          dairy: 0,
          bakery: 0,
          produce: 0,
          meat_fish: 0,
          non_perishable: 0,
          prepared_frozen: 0,
          mixed: 0,
          other: 0,
          total_weight: 0,
        }

        if (i.report && i.report.percent_of_total_dropped) {
          impact_data.percent_of_total_dropped =
            i.report.percent_of_total_dropped

          const pickups_in_delivery = pickups.filter(p =>
            pickup_ids.includes(p.id)
          )

          function adjustForPercentOfTotalDropped(x) {
            return Math.round(x * (i.report.percent_of_total_dropped / 100))
          }

          for (const p of pickups_in_delivery) {
            impact_data.dairy += adjustForPercentOfTotalDropped(p.report.dairy)
            impact_data.bakery += adjustForPercentOfTotalDropped(
              p.report.bakery
            )
            impact_data.produce += adjustForPercentOfTotalDropped(
              p.report.produce
            )
            impact_data.meat_fish += adjustForPercentOfTotalDropped(
              p.report['meat/Fish']
            )
            impact_data.mixed += adjustForPercentOfTotalDropped(
              p.report['mixed groceries']
            )
            impact_data.non_perishable += adjustForPercentOfTotalDropped(
              p.report['non-perishable']
            )
            impact_data.prepared_frozen += adjustForPercentOfTotalDropped(
              p.report['prepared/Frozen']
            )
            impact_data.other += adjustForPercentOfTotalDropped(p.report.other)
            impact_data.total_weight += adjustForPercentOfTotalDropped(
              p.report.weight
            )
          }
        }

        const delivery = {
          id: i.id,
          handler_id: i.driver_id || i.handler_id,
          rescue_id: i.route_id || i.direct_donation_id,
          rescue_type: i.route_id ? 'retail' : 'wholesale',
          is_direct_link: parent && parent.is_direct_link,
          organization_id: i.org_id,
          location_id: i.location_id,
          status: ROUTE_STATUSES[i.status],
          notes: i.notes || null,
          pickup_ids,
          timestamps: {
            created: normalizeTimestamp(i.created_at),
            updated: normalizeTimestamp(i.updated_at),
            started: normalizeTimestamp(i.driver_left_at || i.time_finished),
            arrived: normalizeTimestamp(i.driver_arrived_at || i.time_finished),
            finished: normalizeTimestamp(i.time_finished),
          },
          impact_data,
        }
        console.log(delivery)
        await setFirestoreData(['deliveries', i.id], delivery)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
  }

  async function updatePickups(pickups) {
    if (!pickups || !pickups.length) {
      alert('pickups not populated')
    }

    const failed = []

    for (const i of pickups) {
      try {
        const delivery_ids = []
        const parent = i.route_id
          ? retail_rescues.find(r => r.id === i.route_id)
          : wholesale_rescues.find(d => d.id === i.direct_donation_id)
        if (!parent) {
          console.log(
            'no parent found',
            i,
            retail_rescues,
            wholesale_rescues,
            routes,
            dds
          )
          continue
        }
        if (i.route_id) {
          const route = routes.find(r => r.id === i.route_id)
          // we populate the array of delivery ids
          // by iterating over the list of stop in the route,
          let stop_index
          for (let j = 0; j < route.stops.length; j++) {
            if (route.stops[j].id === i.id) {
              // first finding the index of our pickup,
              stop_index = j
              continue
            }
            if (stop_index) {
              // then adding the id of ever subsequent delivery
              if (route.stops[j].type === 'delivery') {
                delivery_ids.push(route.stops[j].id)
                // until we find one where the entire load is dropped,
                // meaning our pickup weight is fully accounted for
                const d = deliveries.find(d => d.id === route.stops[j].id)
                if (d.report && d.report.percent_of_total_dropped === 100) {
                  break
                }
              }
            }
          }
        } else if (i.direct_donation_id) {
          delivery_ids.push(parent.delivery_id)
        }

        let impact_data = {
          dairy: 0,
          bakery: 0,
          produce: 0,
          meat_fish: 0,
          non_perishable: 0,
          prepared_frozen: 0,
          mixed: 0,
          other: 0,
          total_weight: 0,
        }

        if (i.report) {
          impact_data = {
            dairy: i.report.dairy || 0,
            bakery: i.report.bakery || 0,
            produce: i.report.produce || 0,
            meat_fish: i.report['meat/Fish'] || 0,
            mixed: i.report['mixed groceries'] || 0,
            non_perishable: i.report['non-perishable'] || 0,
            prepared_frozen: i.report['prepared/Frozen'] || 0,
            other: i.report.other || 0,
            total_weight: i.report.weight || 0,
          }
        }

        const pickup = {
          id: i.id,
          handler_id: i.driver_id || i.handler_id,
          rescue_id: i.route_id || i.direct_donation_id,
          rescue_type: i.route_id ? 'retail' : 'wholesale',
          is_direct_link: parent && parent.is_direct_link,
          location_id: i.location_id,
          organization_id: i.org_id,
          status: ROUTE_STATUSES[i.status],
          notes: i.notes || null,
          delivery_ids,
          timestamps: {
            created: normalizeTimestamp(i.created_at),
            updated: normalizeTimestamp(i.updated_at),
            started: normalizeTimestamp(i.driver_left_at || i.time_finished),
            arrived: normalizeTimestamp(i.driver_arrived_at || i.time_finished),
            finished: normalizeTimestamp(i.time_finished),
          },
          impact_data,
        }
        console.log(pickup)
        await setFirestoreData(['pickups', i.id], pickup)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
  }

  async function updateWholesaleRescues() {
    if (!dds || !dds.length) {
      alert('direct donations not populated')
    }

    const failed = []

    for (const i of dds) {
      try {
        let impact_data = {
          dairy: 0,
          bakery: 0,
          produce: 0,
          meat_fish: 0,
          non_perishable: 0,
          prepared_frozen: 0,
          mixed: 0,
          other: 0,
          total_weight: 0,
        }

        const p = pickups.find(p => p.id === i.pickup_id)

        if (p && p.report) {
          impact_data = {
            dairy: p.report.dairy,
            bakery: p.report.bakery,
            produce: p.report.produce,
            meat_fish: p.report['meat/Fish'],
            mixed: p.report['mixed groceries'],
            non_perishable: p.report['non-perishable'],
            prepared_frozen: p.report['prepared/Frozen'],
            other: p.report.other,
            total_weight: p.report.weight,
          }
        }

        const rescue = {
          id: i.id,
          handler_id: i.handler_id,
          pickup_id: i.pickup_id,
          delivery_id: i.delivery_id,
          is_direct_link: i.notes.toLowerCase().includes('direct link'),
          notes: i.notes || null,
          timestamps: {
            created: normalizeTimestamp(i.created_at),
            updated: normalizeTimestamp(i.created_at),
          },
          impact_data,
        }

        await setFirestoreData(['wholesale_rescues', i.id], rescue)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
  }

  async function updateRetailRescues() {
    if (!routes || !routes.length) {
      alert('routes not populated')
    }

    const failed = []

    for (const i of routes) {
      try {
        const impact_data = {
          dairy: 0,
          bakery: 0,
          produce: 0,
          meat_fish: 0,
          non_perishable: 0,
          prepared_frozen: 0,
          mixed: 0,
          other: 0,
          total_weight: 0,
        }

        if (i.status === 9) {
          const route_pickups = pickups.filter(
            p => p.route_id === i.id && p.report && p.status === 9
          )
          for (const p of route_pickups) {
            impact_data.dairy += p.report.dairy
            impact_data.bakery += p.report.bakery
            impact_data.produce += p.report.produce
            impact_data.meat_fish += p.report['meat/Fish']
            impact_data.mixed += p.report['mixed groceries']
            impact_data.non_perishable += p.report['non-perishable']
            impact_data.prepared_frozen += p.report['prepared/Frozen']
            impact_data.other += p.report.other
            impact_data.total_weight += p.report.weight
          }
        }

        const rescue = {
          id: i.id,
          handler_id: i.driver_id,
          google_calendar_event_id: i.google_calendar_event_id,
          is_direct_link: false,
          status: ROUTE_STATUSES[i.status],
          notes: i.notes || null,
          stop_ids: i.stops.map(s => s.id),
          timestamps: {
            created: normalizeTimestamp(i.created_at),
            updated: normalizeTimestamp(i.updated_at),
            scheduled_start: normalizeTimestamp(i.time_start),
            scheduled_finish: normalizeTimestamp(
              i.time_end || moment(i.time_start).add(2, 'hours').toDate()
            ),
            started: normalizeTimestamp(i.time_started),
            finished: normalizeTimestamp(i.time_finished),
          },
          impact_data,
        }

        await setFirestoreData(['retail_rescues', i.id], rescue)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
  }

  function normalizeTimestamp(t) {
    return t && t.toDate
      ? t.toDate().toString() // handle firestore date objects
      : t instanceof Date
      ? t.toString()
      : t
      ? new Date(t).toString()
      : null
  }

  return <button onClick={handleClick}>run handler</button>
}
