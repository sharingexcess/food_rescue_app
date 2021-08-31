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
import './EditBulkDelivery.scss'

export default function EditBulkDelivery() {
  const { id } = useParams()
  const history = useHistory()
  const [pickup, setPickup] = useState()
  const [delivery, setDelivery] = useState()

  function handleSetPickup(p) {
    setPickup(p)
  }

  function handleSetDelivery(d) {
    setDelivery(d)
  }

  async function handleSubmit(event, data) {
    event.preventDefault()
    const pickup_id = generateStopId(pickup)
    console.log(data, pickup, pickup_id)
    debugger
    await setFirestoreData(['Pickups', pickup_id], {
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
        created_at:
          pickup.completed_at ||
          firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      },
      status: 9,
      time_finished: firebase.firestore.FieldValue.serverTimestamp(),
    }).catch(e => console.error('Error writing document: ', e))

    const delivery_id = generateStopId(delivery)
    console.log(delivery_id, {
      report: {
        percent_of_total_dropped: 100,
        weight: data.weight,
        notes: data.notes,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      },
      time_finished: firebase.firestore.FieldValue.serverTimestamp(),
      status: 9,
    })
    debugger
    await setFirestoreData(['Deliveries', delivery_id], {
      report: {
        percent_of_total_dropped: 100,
        weight: data.weight,
        notes: data.notes,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      },
      time_finished: firebase.firestore.FieldValue.serverTimestamp(),
      status: 9,
    }).catch(e => console.error('Error writing document: ', e))

    history.push(`/`)
  }

  return (
    <main id="EditBulkDelivery">
      <Header text={id ? 'Edit Direct Donation' : 'Create Direct Donation'} />
      <section id="Donor">
        <h3>Donor Information</h3>
        <EditPickup handleSubmit={handleSetPickup} />
      </section>
      {pickup ? (
        <section id="Recipient">
          <h3>Recipient Information</h3>
          <EditDelivery handleSubmit={handleSetDelivery} />
        </section>
      ) : null}
      {delivery ? (
        <section id="Report">
          <h3>Report</h3>
          <PickupReport customSubmitHandler={handleSubmit} />
        </section>
      ) : null}
    </main>
  )
}
