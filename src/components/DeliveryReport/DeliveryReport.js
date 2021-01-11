import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Loading from '../Loading/Loading'
import { Input } from '../Input/Input'
import { GoBack } from '../../helpers/components'
import { setFirestoreData } from '../../helpers/helpers'
import useDeliveryData from '../../hooks/useDeliveryData'
import useOrganizationData from '../../hooks/useOrganizationData'
import './DeliveryReport.scss'
import usePickupData from '../../hooks/usePickupData'

export default function DeliveryReport() {
  const { delivery_id, route_id } = useParams()
  const history = useHistory()
  const delivery = useDeliveryData(delivery_id)
  const delivery_org =
    useOrganizationData(delivery ? delivery.org_id : {}) || {}
  const pickups = usePickupData()
  const [formData, setFormData] = useState({
    percent_of_total_dropped: 100,
    notes: '',
  })
  const [changed, setChanged] = useState(false)
  const [weight, setWeight] = useState()

  useEffect(() => {
    delivery && delivery.report
      ? setFormData(formData => ({ ...formData, ...delivery.report }))
      : setChanged(true)
  }, [delivery])

  useEffect(() => {
    async function calculateWeight() {
      let updated_weight = 0
      for (const id of delivery.pickup_ids) {
        const pickup = pickups.find(i => i.id === id) || {}
        if (pickup.report && pickup.report.weight) {
          updated_weight += parseInt(pickup.report.weight)
        }
      }
      setWeight(updated_weight)
    }
    if (delivery && delivery.pickup_ids && delivery.pickup_ids.length) {
      calculateWeight()
    }
  }, [delivery, pickups])

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.id]:
        e.target.id === 'percent_of_total_dropped'
          ? parseInt(e.target.value)
          : e.target.value,
    })
    setChanged(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFirestoreData(['Deliveries', delivery_id], {
      report: {
        percent_of_total_dropped: parseInt(formData.percent_of_total_dropped),
        weight: parseInt((weight * formData.percent_of_total_dropped) / 100),
        notes: formData.notes,
        created_at:
          delivery.completed_at ||
          firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      },
      status: 9,
    })
      .then(() => history.push(`/routes/${route_id}`))
      .catch(e => console.error('Error writing document: ', e))
  }
  if (!delivery) return <Loading text="Loading report" />
  return (
    <main id="DeliveryReport">
      <GoBack />
      <h1>Delivery Report</h1>
      <h3>{delivery_org.name}</h3>
      <h4>
        You're carrying <span>{weight}lbs.</span> of food.
        <br />
        How much are you dropping at this location?
      </h4>
      <h5>{parseInt(formData.percent_of_total_dropped)}%</h5>
      <input
        id="percent_of_total_dropped"
        type="range"
        min={0}
        max={100}
        step={1}
        label="How much of the load was dropped here?"
        value={formData.percent_of_total_dropped}
        onChange={handleChange}
      />
      <Input
        type="textarea"
        label="Notes..."
        element_id="notes"
        row={3}
        value={formData.notes}
        onChange={handleChange}
      />
      {changed ? (
        <button onClick={handleSubmit}>
          {delivery.report ? 'update report' : 'submit report'}
        </button>
      ) : null}
    </main>
  )
}
