import { RESCUE_STATUSES, setFirestoreData } from 'helpers'
import { useFirestore } from 'hooks'
import moment from 'moment'

export function UpdateDB() {
  const Routes = useFirestore('Routes')
  const dds = useFirestore('DirectDonations')
  // const retail_rescues = useFirestore('retail_rescues')
  // const wholesale_rescues = useFirestore('wholesale_rescues')
  const Pickups = useFirestore('Pickups')
  // const Deliveries = useFirestore('Deliveries')
  const Orgs = useFirestore('Organizations')
  // const Locs = useFirestore('Locations')
  // const Users = useFirestore('Users')

  function handleClick() {
    console.log('doing nothing...')
    // updateRetailRescues(Routes)
  }

  async function updateUsers(Users) {
    if (!Users || !Users.length) {
      alert('Users not populated')
    }

    const failed = []

    for (const i of Users) {
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

          // onboarding
          completed_app_tutorial: true,
          completed_food_safety: true,
          completed_liability_release: true,

          // driver info
          insurance_policy_number: i.drivers_insurance_policy_number || null,
          insurance_provider: i.drivers_insurance_provider || null,
          license_number: i.drivers_license_number || null,
          license_state: i.drivers_license_state || null,
          vehicle_make_model: i.vehicle_make_model || null,

          // availability
          availability_sun_am: i.driver_availability
            ? i.driver_availability.sun_am
            : false,
          availability_sun_pm: i.driver_availability
            ? i.driver_availability.sun_pm
            : false,
          availability_mon_am: i.driver_availability
            ? i.driver_availability.mon_am
            : false,
          availability_mon_pm: i.driver_availability
            ? i.driver_availability.mon_pm
            : false,
          availability_tue_am: i.driver_availability
            ? i.driver_availability.tue_am
            : false,
          availability_tue_pm: i.driver_availability
            ? i.driver_availability.tue_pm
            : false,
          availability_wed_am: i.driver_availability
            ? i.driver_availability.wed_am
            : false,
          availability_wed_pm: i.driver_availability
            ? i.driver_availability.wed_pm
            : false,
          availability_thu_am: i.driver_availability
            ? i.driver_availability.thu_am
            : false,
          availability_thu_pm: i.driver_availability
            ? i.driver_availability.thu_pm
            : false,
          availability_fri_am: i.driver_availability
            ? i.driver_availability.fri_am
            : false,
          availability_fri_pm: i.driver_availability
            ? i.driver_availability.fri_pm
            : false,
          availability_sat_am: i.driver_availability
            ? i.driver_availability.sat_am
            : false,
          availability_sat_pm: i.driver_availability
            ? i.driver_availability.sat_pm
            : false,

          timestamp_created: normalizeTimestamp(
            i.created_at || new Date(Date.now())
          ),
          timestamp_updated: normalizeTimestamp(
            i.updated_at || new Date(Date.now())
          ),
          timestamp_last_active: normalizeTimestamp(
            i.last_login || i.updated_at || i.created_at
          ),
        }
        // console.log(user)
        await setFirestoreData(['users', i.id], user)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
  }

  async function updateLocations(Locs) {
    if (!Locs || !Locs.length) {
      alert('Locs not populated')
    }

    const failed = []

    for (const i of Locs) {
      try {
        const parent = Orgs.find(j => j.id === i.org_id)
        const location = {
          id: i.id,
          nickname: i.name || null,
          parent_type: parent.type === 'donor' ? 'donor' : 'recipient',
          parent_id: i.org_id,
          notes: i.upon_arrival_instructions || null,

          address1: i.address1,
          address2: i.address2,
          state: i.state,
          city: i.city,
          zip: i.zip_code,
          lat: i.lat || null,
          lng: i.lng || null,

          contact_name: i.contact_name || null,
          contact_email: i.contact_email || null,
          contact_phone: i.contact_phone || null,

          timestamp_created: normalizeTimestamp(
            i.created_at || new Date(Date.now())
          ),
          timestamp_updated: normalizeTimestamp(
            i.updated_at || new Date(Date.now())
          ),
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

  async function updateOrganizations(Orgs) {
    if (!Orgs || !Orgs.length) {
      alert('Orgs not populated')
    }

    const failed = []

    for (const i of Orgs) {
      try {
        const type = i.org_type === 'donor' ? 'donors' : 'recipients'
        if (type === 'donor') {
          const donor = {
            id: i.id,
            name: i.name,
            icon: i.icon,
            type: 'retail',
            timestamp_created: normalizeTimestamp(
              i.created_at || new Date(Date.now())
            ),
            timestamp_updated: normalizeTimestamp(
              i.updated_at || new Date(Date.now())
            ),
          }
          console.log(type, donor)
          await setFirestoreData([type, i.id], donor)
        } else {
          const recipient = {
            id: i.id,
            name: i.name,
            icon: i.icon,
            type: 'food_bank',
            timestamp_created: normalizeTimestamp(
              i.created_at || new Date(Date.now())
            ),
            timestamp_updated: normalizeTimestamp(
              i.updated_at || new Date(Date.now())
            ),
          }
          console.log(type, recipient)
          await setFirestoreData([type, i.id], recipient)
        }
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
  }

  async function updateDeliveries(Deliveries) {
    if (!Deliveries || !Deliveries.length) {
      alert('Deliveries not populated')
    }

    const failed = []

    for (const i of Deliveries) {
      try {
        const pickup_ids = []
        const parent = i.route_id
          ? Routes.find(r => r.id === i.route_id)
          : dds.find(d => d.id === i.direct_donation_id)

        if (!parent) {
          console.log('no parent found', i)
          continue
        } else if (i.route_id) {
          const route = Routes.find(r => r.id === i.route_id)
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
                const d = Deliveries.find(d => d.id === route.stops[j].id)
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
          impact_data_dairy: 0,
          impact_data_bakery: 0,
          impact_data_produce: 0,
          impact_data_meat_fish: 0,
          impact_data_non_perishable: 0,
          impact_data_prepared_frozen: 0,
          impact_data_mixed: 0,
          impact_data_other: 0,
          impact_data_total_weight: 0,
          impact_data_percent_of_total_dropped: 0,
        }

        if (i.report && i.report.percent_of_total_dropped) {
          impact_data.percent_of_total_dropped =
            i.report.percent_of_total_dropped

          const pickups_in_delivery = Pickups.filter(p =>
            pickup_ids.includes(p.id)
          )

          function adjustForPercentOfTotalDropped(x) {
            return Math.round(x * (i.report.percent_of_total_dropped / 100))
          }

          for (const p of pickups_in_delivery) {
            impact_data.impact_data_dairy += adjustForPercentOfTotalDropped(
              p.report.dairy
            )
            impact_data.impact_data_bakery += adjustForPercentOfTotalDropped(
              p.report.bakery
            )
            impact_data.impact_data_produce += adjustForPercentOfTotalDropped(
              p.report.produce
            )
            impact_data.impact_data_meat_fish += adjustForPercentOfTotalDropped(
              p.report['meat/Fish']
            )
            impact_data.impact_data_mixed += adjustForPercentOfTotalDropped(
              p.report['mixed groceries']
            )
            impact_data.impact_data_non_perishable += adjustForPercentOfTotalDropped(
              p.report['non-perishable']
            )
            impact_data.impact_data_prepared_frozen += adjustForPercentOfTotalDropped(
              p.report['prepared/Frozen']
            )
            impact_data.impact_data_other += adjustForPercentOfTotalDropped(
              p.report.other
            )
            impact_data.impact_data_total_weight += adjustForPercentOfTotalDropped(
              p.report.weight
            )
          }
        }

        const delivery = {
          id: i.id,
          handler_id: i.driver_id || i.handler_id || null,
          rescue_id: i.route_id || i.direct_donation_id,
          is_direct_link: (parent && parent.is_direct_link) || false,
          recipient_id: i.org_id,
          location_id: i.location_id,
          status: RESCUE_STATUSES[i.status],
          notes: i.notes || '',

          timestamp_created: normalizeTimestamp(i.created_at),
          timestamp_updated: normalizeTimestamp(i.updated_at),
          timestamp_started: normalizeTimestamp(
            i.driver_left_at || i.time_finished || i.updated_at
          ),
          timestamp_finished: normalizeTimestamp(
            i.time_finished || i.updated_at
          ),
          ...impact_data,
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

  async function updatePickups(Pickups) {
    if (!Pickups || !Pickups.length) {
      alert('Pickups not populated')
    }

    const failed = []

    for (const i of Pickups) {
      try {
        const parent = i.route_id
          ? Routes.find(r => r.id === i.route_id)
          : dds.find(d => d.id === i.direct_donation_id)
        if (!parent) {
          console.log('no parent found', i)
          continue
        }

        let impact_data = {
          impact_data_dairy: 0,
          impact_data_bakery: 0,
          impact_data_produce: 0,
          impact_data_meat_fish: 0,
          impact_data_non_perishable: 0,
          impact_data_prepared_frozen: 0,
          impact_data_mixed: 0,
          impact_data_other: 0,
          impact_data_total_weight: 0,
        }

        if (i.report) {
          impact_data = {
            impact_data_dairy: i.report.dairy || 0,
            impact_data_bakery: i.report.bakery || 0,
            impact_data_produce: i.report.produce || 0,
            impact_data_meat_fish: i.report['meat/Fish'] || 0,
            impact_data_mixed: i.report['mixed groceries'] || 0,
            impact_data_non_perishable: i.report['non-perishable'] || 0,
            impact_data_prepared_frozen: i.report['prepared/Frozen'] || 0,
            impact_data_other: i.report.other || 0,
            impact_data_total_weight: i.report.weight || 0,
          }
        }

        const pickup = {
          id: i.id,
          handler_id: i.driver_id || i.handler_id || null,
          rescue_id: i.route_id || i.direct_donation_id,
          is_direct_link: (parent && parent.is_direct_link) || false,
          donor_id: i.org_id,
          location_id: i.location_id,
          status: RESCUE_STATUSES[i.status],
          notes: i.notes || '',
          timestamp_created: normalizeTimestamp(i.created_at),
          timestamp_updated: normalizeTimestamp(i.updated_at),
          timestamp_started: normalizeTimestamp(
            i.driver_left_at || i.time_finished || i.updated_at
          ),
          timestamp_finished: normalizeTimestamp(
            i.time_finished || i.updated_at
          ),
          ...impact_data,
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
          type: 'wholesale',
          handler_id: i.handler_id,
          stop_ids: [i.pickup_id, i.delivery_id],
          google_calendar_event_id: null,
          is_direct_link: false,
          status: 'completed',
          notes: i.notes || '',
          timestamp_created: normalizeTimestamp(i.created_at),
          timestamp_updated: normalizeTimestamp(i.created_at),
          timestamp_logged_start: normalizeTimestamp(i.created_at),
          timestamp_logged_finish: normalizeTimestamp(i.created_at),
          timestamp_scheduled_start: normalizeTimestamp(i.created_at),
          timestamp_scheduled_finish: normalizeTimestamp(i.created_at),
        }
        console.log(rescue)
        await setFirestoreData(['rescues', i.id], rescue)
      } catch (e) {
        console.error('Error while writing', i.id, e)
        failed.push(i)
      }
    }
    failed.length && console.log('Failed to write:', failed)
    console.log('done!')
  }

  async function updateRetailRescues(Routes) {
    if (!Routes || !Routes.length) {
      alert('Routes not populated')
    }

    const failed = []

    for (const i of Routes) {
      try {
        const rescue = {
          id: i.id,
          type: 'retail',
          handler_id: i.driver_id,
          google_calendar_event_id: i.google_calendar_event_id,
          is_direct_link: false,
          status: RESCUE_STATUSES[i.status],
          notes: i.notes || '',
          stop_ids: i.stops.map(s => s.id),
          timestamp_created: normalizeTimestamp(i.created_at),
          timestamp_updated: normalizeTimestamp(i.updated_at),
          timestamp_scheduled_start: normalizeTimestamp(i.time_start),
          timestamp_scheduled_finish: normalizeTimestamp(
            i.time_end || moment(i.time_start).add(2, 'hours').toDate()
          ),
          timestamp_logged_start: normalizeTimestamp(i.time_started),
          timestamp_logged_finish: normalizeTimestamp(i.time_finished),
        }
        console.log(rescue)
        await setFirestoreData(['rescues', i.id], rescue)
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

  return <button onClick={handleClick}>run handler</button>
}
