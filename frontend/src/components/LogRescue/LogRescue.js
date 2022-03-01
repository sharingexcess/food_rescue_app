import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createTimestamp,
  generateUniqueId,
  setFirestoreData,
  STATUSES,
} from 'helpers'
import { Input, EditDelivery, PickupReport, EditPickup } from 'components'
import { Spacer, Text } from '@sharingexcess/designsystem'
import { useAuth } from 'hooks'
import moment from 'moment'

export function LogRescue() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [donor, setDonor] = useState()
  const [recipient, setRecipient] = useState()
  const [time, setTime] = useState(
    moment(new Date()).startOf('hour').format('yyyy-MM-DDTkk:mm')
  )
  const [is_direct_link, set_is_direct_link] = useState(false)

  async function handleSubmit(event, data) {
    event.preventDefault()

    const rescue_id = await generateUniqueId('rescues')
    const pickup_id = await generateUniqueId('stops')
    const delivery_id = await generateUniqueId('stops')

    await setFirestoreData(['stops', pickup_id], {
      id: pickup_id,
      type: 'pickup',
      handler_id: user.uid,
      rescue_id: rescue_id,
      organization_id: donor.organization_id,
      location_id: donor.location_id,
      status: STATUSES.COMPLETED,
      timestamp_created: createTimestamp(),
      timestamp_updated: createTimestamp(),
      timestamp_logged_start: createTimestamp(),
      timestamp_logged_finish: createTimestamp(),
      timestamp_scheduled_start: createTimestamp(time),
      timestamp_scheduled_finish: createTimestamp(time),
      impact_data_dairy: parseInt(data.impact_data_dairy),
      impact_data_bakery: parseInt(data.impact_data_bakery),
      impact_data_produce: parseInt(data.impact_data_produce),
      impact_data_meat_fish: parseInt(data.impact_data_meat_fish),
      impact_data_non_perishable: parseInt(data.impact_data_non_perishable),
      impact_data_prepared_frozen: parseInt(data.impact_data_prepared_frozen),
      impact_data_mixed: parseInt(data.impact_data_mixed),
      impact_data_other: parseInt(data.impact_data_other),
      impact_data_total_weight: parseInt(data.impact_data_total_weight),
      notes: data.notes,
    }).catch(e => console.error('Error writing document: ', e))

    await setFirestoreData(['stops', delivery_id], {
      id: delivery_id,
      type: 'delivery',
      handler_id: user.uid,
      rescue_id: rescue_id,
      organization_id: recipient.organization_id,
      location_id: recipient.location_id,
      status: STATUSES.COMPLETED,
      timestamp_created: createTimestamp(),
      timestamp_updated: createTimestamp(),
      timestamp_logged_start: createTimestamp(),
      timestamp_logged_finish: createTimestamp(),
      timestamp_scheduled_start: createTimestamp(time),
      timestamp_scheduled_finish: createTimestamp(time),
      impact_data_dairy: parseInt(data.impact_data_dairy),
      impact_data_bakery: parseInt(data.impact_data_bakery),
      impact_data_produce: parseInt(data.impact_data_produce),
      impact_data_meat_fish: parseInt(data.impact_data_meat_fish),
      impact_data_non_perishable: parseInt(data.impact_data_non_perishable),
      impact_data_prepared_frozen: parseInt(data.impact_data_prepared_frozen),
      impact_data_mixed: parseInt(data.impact_data_mixed),
      impact_data_other: parseInt(data.impact_data_other),
      impact_data_total_weight: parseInt(data.impact_data_total_weight),
      percent_of_total_dropped: 100,
      notes: data.notes,
    }).catch(e => console.error('Error writing document: ', e))

    await setFirestoreData(['rescues', rescue_id], {
      id: rescue_id,
      handler_id: user.uid,
      google_calendar_event_id: null,
      stop_ids: [pickup_id, delivery_id],
      is_direct_link: is_direct_link,
      status: STATUSES.COMPLETED,
      notes: data.notes,
      timestamp_created: createTimestamp(),
      timestamp_updated: createTimestamp(),
      timestamp_scheduled_start: createTimestamp(time),
      timestamp_scheduled_finish: createTimestamp(time),
      timestamp_logged_start: createTimestamp(time),
      timestamp_logged_finish: createTimestamp(time),
    })
    navigate(`/`)
  }

  return (
    <main id="LogRescue">
      <Text type="subheader" color="white" shadow>
        Use this form to register a donation of food without scheduling a route
        or a driver.
      </Text>
      <Spacer height={24} />
      <Text type="section-header" color="white" shadow>
        Date + Time
      </Text>
      <section id="Time">
        <Input
          value={time}
          label="Time"
          onChange={e => setTime(e.target.value)}
          type="datetime-local"
        />
        <Input
          type="checkbox"
          value={is_direct_link}
          label="This is a direct link rescue"
          onChange={() => set_is_direct_link(!is_direct_link)}
        />
      </section>
      {time ? (
        <section id="Donor">
          <EditPickup
            handleSubmit={i => setDonor(i)}
            title="Donor Information"
          />
        </section>
      ) : null}
      {donor ? (
        <section id="Recipient">
          <EditDelivery
            handleSubmit={i => setRecipient(i)}
            title="Recipient Information"
          />
        </section>
      ) : null}
      {recipient ? (
        <section id="Report">
          <PickupReport customSubmitHandler={handleSubmit} />
        </section>
      ) : null}
    </main>
  )
}
