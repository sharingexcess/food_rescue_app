import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import 'firebase/storage'
import moment from 'moment'
import { generateStopId, setFirestoreData } from 'helpers'
import { generateDirectDonationId } from './utils'
import { Input, EditDelivery, PickupReport, EditPickup } from 'components'
import { useAuth } from 'hooks'
import { Spacer, Text } from '@sharingexcess/designsystem'

export function EditDirectDonation() {
  const { user } = useAuth()
  const history = useHistory()
  const [donor, setDonor] = useState()
  const [recipient, setRecipient] = useState()
  const [time, setTime] = useState(
    moment(new Date()).startOf('hour').format('yyyy-MM-DDTkk:mm')
  )

  async function handleSubmit(event, data) {
    event.preventDefault()

    const direct_donation_id = generateDirectDonationId(user.displayName)
    const pickup_id = generateStopId(donor)
    const delivery_id = generateStopId(recipient)

    await setFirestoreData(['Pickups', pickup_id], {
      id: pickup_id,
      direct_donation_id: direct_donation_id,
      handler_id: user.uid,
      org_id: donor.org_id,
      location_id: donor.location_id,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      time_finished: time,
      status: 9,
      report: {
        dairy: parseInt(data.dairy),
        bakery: parseInt(data.bakery),
        produce: parseInt(data.produce),
        'meat/Fish': parseInt(data['meat/Fish']),
        'non-perishable': parseInt(data['non-perishable']),
        'prepared/Frozen': parseInt(data['prepared/Frozen']),
        'mixed groceries': parseInt(data['mixed groceries']),
        other: parseInt(data.other),
        weight: parseInt(data.weight),
        notes: data.notes,
      },
    }).catch(e => console.error('Error writing document: ', e))

    await setFirestoreData(['Deliveries', delivery_id], {
      id: delivery_id,
      direct_donation_id: direct_donation_id,
      handler_id: user.uid,
      org_id: recipient.org_id,
      location_id: recipient.location_id,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      time_finished: time,
      status: 9,
      pickup_ids: [pickup_id],
      report: {
        percent_of_total_dropped: 100,
        weight: data.weight,
        notes: data.notes,
      },
    }).catch(e => console.error('Error writing document: ', e))

    await setFirestoreData(['DirectDonations', direct_donation_id], {
      id: direct_donation_id,
      time_finished: time,
      pickup_id: pickup_id,
      delivery_id: delivery_id,
      notes: data.notes,
      handler_id: user.uid,
      created_at: firebase.firestore.FieldValue.serverTimestamp(),
      updated_at: firebase.firestore.FieldValue.serverTimestamp(),
    })
    history.push(`/`)
  }

  return (
    <main id="EditDirectDonation">
      <Text type="section-header" color="white" shadow>
        New Direct Donation
      </Text>
      <Text type="subheader" color="white" shadow>
        Use this form to register a donation without a route or driver.
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
