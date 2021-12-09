import { RESCUE_STATUSES, setFirestoreData } from 'helpers'
import { useFirestore } from 'hooks'
import moment from 'moment'

export function UpdateDB() {
  const routes = useFirestore('routes')
  const dds = useFirestore('direct_donations')
  const retail_rescues = useFirestore('retail_rescues')
  const wholesale_rescues = useFirestore('wholesale_rescues')
  const pickups = useFirestore('pickups')
  const deliveries = useFirestore('deliveries')
  // const orgs = useFirestore('organizations')
  // const locs = useFirestore('locations')
  // const users = useFirestore('users')

  // function handleClick() {
  //   console.log('runnin...')
  //   updateUsers(users)
  // }

  async function updateUsers(users) {
    if (!users || !users.length) {
      alert('users not populated')
    }

    const failed = []

    for (const i of users) {
      try {
        const user = {
          id: i.id,
          is_driver: i.access_level === 'driver' || i.access_level === 'admin',
          is_admin: i.access_level === 'admin',
          name: i.name,
          icon: i.icon || null,
          email: i.email,
          phone: normalizePhoneNumber(i.phone),
          pronouns: i.pronouns || null,

          onboarding: {
            completed_app_tutorial:
              i.access_level === 'admin' || i.completed_app_tutorial || false,
            completed_food_safety:
              i.access_level === 'admin' || i.completed_food_safety || false,
          },

          driver_info: {
            insurance_policy_number: i.drivers_insurance_policy_number || null,
            insurance_provider: i.drivers_insurance_provider || null,
            license_number: i.drivers_license_number || null,
            license_state: i.drivers_license_state || null,
            liability_release_url: i.drivers_liability_release || null,
            vehicle_make_model: i.vehicle_make_model || null,
          },

          availability: {
            sun_am: i.driver_availability
              ? i.driver_availability.sun_am
              : false,
            sun_pm: i.driver_availability
              ? i.driver_availability.sun_pm
              : false,
            mon_am: i.driver_availability
              ? i.driver_availability.mon_am
              : false,
            mon_pm: i.driver_availability
              ? i.driver_availability.mon_pm
              : false,
            tue_am: i.driver_availability
              ? i.driver_availability.tue_am
              : false,
            tue_pm: i.driver_availability
              ? i.driver_availability.tue_pm
              : false,
            wed_am: i.driver_availability
              ? i.driver_availability.wed_am
              : false,
            wed_pm: i.driver_availability
              ? i.driver_availability.wed_pm
              : false,
            thu_am: i.driver_availability
              ? i.driver_availability.thu_am
              : false,
            thu_pm: i.driver_availability
              ? i.driver_availability.thu_pm
              : false,
            fri_am: i.driver_availability
              ? i.driver_availability.fri_am
              : false,
            fri_pm: i.driver_availability
              ? i.driver_availability.fri_pm
              : false,
            sat_am: i.driver_availability
              ? i.driver_availability.sat_am
              : false,
            sat_pm: i.driver_availability
              ? i.driver_availability.sat_pm
              : false,
          },
          timestamps: {
            created: normalizeTimestamp(i.created_at || new Date(Date.now())),
            updated: normalizeTimestamp(i.updated_at || new Date(Date.now())),
            last_active: normalizeTimestamp(
              i.last_login || i.updated_at || i.created_at
            ),
          },
        }
        console.log(user)
        await setFirestoreData(['users', i.id], user)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
  }

  async function updateLocations(locs) {
    if (!locs || !locs.length) {
      alert('locs not populated')
    }

    const failed = []

    for (const i of locs) {
      try {
        const location = {
          id: i.id,
          nickname: i.name || null,
          organization_id: i.org_id,
          notes: i.upon_arrival_instructions || null,

          address: {
            address1: i.address1,
            address2: i.address2,
            city: i.city,
            zip: i.zip_code,
            lat: i.lat || null,
            lng: i.lng || null,
          },

          contact: {
            name: i.contact_name || null,
            email: i.contact_email || null,
            phone: i.contact_phone || null,
          },

          timestamps: {
            created: normalizeTimestamp(i.created_at || new Date(Date.now())),
            updated: normalizeTimestamp(i.updated_at || new Date(Date.now())),
          },

          hours: {
            sun_open: null,
            sun_close: null,
            mon_open: null,
            mon_close: null,
            tue_open: null,
            tue_close: null,
            wed_open: null,
            wed_close: null,
            thu_open: null,
            thu_close: null,
            fri_open: null,
            fri_close: null,
            sat_open: null,
            sat_close: null,
          },
        }
        console.log(location)
        await setFirestoreData(['locations', i.id], location)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
  }

  async function updateOrganizations(orgs) {
    if (!orgs || !orgs.length) {
      alert('orgs not populated')
    }

    const failed = []

    for (const i of orgs) {
      try {
        const org = {
          id: i.id,
          name: i.name,
          icon: i.icon,
          primary_location_id: i.primary_location || null,
          type: 'recipient',
          timestamps: {
            created: normalizeTimestamp(i.created_at || new Date(Date.now())),
            updated: normalizeTimestamp(i.updated_at || new Date(Date.now())),
          },
        }
        console.log(org)
        await setFirestoreData(['organizations', i.id], org)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
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
          percent_of_total_dropped: 0,
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
          icon: i.route_id || i.direct_donation_id,
          rescue_type: i.route_id ? 'retail' : 'wholesale',
          is_direct_link: parent && parent.is_direct_link,
          organization_id: i.org_id,
          location_id: i.location_id,
          status: RESCUE_STATUSES[i.status],
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
          status: RESCUE_STATUSES[i.status],
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

  async function updateWholesaleRescues(dds) {
    if (!dds || !dds.length) {
      alert('direct donations not populated')
    }

    const failed = []

    for (const i of dds) {
      try {
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

  async function updateRetailRescues(routes) {
    if (!routes || !routes.length) {
      alert('routes not populated')
    }

    const failed = []

    for (const i of routes) {
      try {
        const rescue = {
          id: i.id,
          handler_id: i.driver_id,
          google_calendar_event_id: i.google_calendar_event_id,
          is_direct_link: false,
          status: RESCUE_STATUSES[i.status],
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
        }

        await setFirestoreData(['retail_rescues', i.id], rescue)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
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

  function normalizePhoneNumber(phone) {
    if (!phone) return null
    return phone.replace('+1', '').replace(/[^a-zA-Z0-9]/g, '')
  }
  return null
  // return <button onClick={handleClick}>run handler</button>
}
