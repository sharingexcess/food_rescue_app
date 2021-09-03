import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import 'firebase/firestore'
import 'firebase/storage'
import Header from '../Header/Header'
import EditPickup from '../EditPickup/EditPickup'
import { generateStopId, setFirestoreData } from '../../helpers/helpers'
import EditDelivery from '../EditDelivery/EditDelivery'
import PickupReport from '../PickupReport/PickupReport'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { Input } from '../Input/Input'
import moment from 'moment'
import { useAuthContext } from '../Auth/Auth'
import { generateDirectDonationId } from './utils'
import './EditDirectDonation.scss'

export default function EditDirectDonation() {
  const { id } = useParams()
  const { user } = useAuthContext()
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
      <Header text={id ? 'Edit Direct Donation' : 'Create Direct Donation'} />
      <h3>Donation Date + Time</h3>
      <section id="Time">
        <Input
          value={time}
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
          <PickupReport customSubmitHandler={handleSubmit} hideHeader />
        </section>
      ) : null}
    </main>
  )
}
