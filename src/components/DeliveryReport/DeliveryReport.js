import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { setFirestoreData } from 'helpers'
import { Input, Loading } from 'components'
import { useAuth, useFirestore } from 'hooks'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'

export function DeliveryReport() {
  const { delivery_id, route_id } = useParams()
  const history = useHistory()
  const delivery = useFirestore('deliveries', delivery_id)
  const deliveries = useFirestore('deliveries')
  const pickups = useFirestore('pickups')
  const routes = useFirestore('routes')
  const [formData, setFormData] = useState({
    percent_of_total_dropped: 100,
    notes: '',
  })
  const [changed, setChanged] = useState(false)
  const [weight, setWeight] = useState()
  const { admin } = useAuth()

  useEffect(() => {
    delivery && delivery.report
      ? setFormData(formData => ({ ...formData, ...delivery.report }))
      : setChanged(true)
  }, [delivery])

  useEffect(() => {
    async function calculateWeight() {
      let updated_weight = 0
      const route = routes.find(r => r.id === delivery.route_id)
      const stop_index = route.stops.findIndex(stop => stop.id === delivery_id)
      for (let i = route.stops.length - 1; i >= 0; i--) {
        const stop = route.stops[i]
        if (i !== stop_index) {
          if (stop.type === 'pickup') {
            const pickup = pickups.find(p => p.id === stop.id)
            if (pickup.status === 9) updated_weight += pickup.report.weight
          } else if (stop.type === 'delivery') {
            const delivery = deliveries.find(d => d.id === stop.id)
            if (delivery.status === 9) updated_weight -= delivery.report.weight
          }
        }
      }
      if (isNaN(updated_weight)) updated_weight = 0
      setWeight(updated_weight)
    }
    if (delivery && delivery.pickup_ids && delivery.pickup_ids.length) {
      calculateWeight()
    }
  }, [delivery, delivery_id, routes, pickups]) //eslint-disable-line react-hooks/exhaustive-deps

  function canEdit() {
    return [1, 3, 6].includes(delivery.status) || admin
  }

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
    const calculated_weight = parseInt(
      (weight * formData.percent_of_total_dropped) / 100
    )
    setFirestoreData(['Deliveries', delivery_id], {
      report: {
        percent_of_total_dropped: parseInt(formData.percent_of_total_dropped),
        weight: isNaN(calculated_weight) ? 0 : calculated_weight,
        notes: formData.notes,
        created_at:
          delivery.completed_at ||
          firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      },
      time_finished: firebase.firestore.FieldValue.serverTimestamp(),
      status: 9,
    })
      .then(() => history.push(`/routes/${route_id}`))
      .catch(e => console.error('Error writing document: ', e))
  }
  if (!delivery) return <Loading text="Loading report" />
  return (
    <main id="DeliveryReport">
      <Text type="section-header" color="white" align="center" shadow>
        You're carrying <span>{weight}lbs.</span> of food. How much are you
        dropping at this location?
      </Text>
      <Spacer height={64} />
      <Text type="primary-header" color="white" align="center" shadow>
        {parseInt(formData.percent_of_total_dropped)}%
      </Text>
      <input
        id="percent_of_total_dropped"
        type="range"
        min={0}
        max={100}
        step={1}
        label="How much of the load was dropped here?"
        value={formData.percent_of_total_dropped}
        onChange={handleChange}
        disabled={!canEdit()}
      />
      <Spacer height={32} />
      <Input
        type="textarea"
        label="Notes..."
        element_id="notes"
        row={3}
        value={formData.notes}
        onChange={handleChange}
        readOnly={!canEdit()}
      />
      {changed && canEdit() ? (
        <Button
          type="primary"
          color="white"
          size="large"
          fullWidth
          handler={handleSubmit}
        >
          {delivery.report ? 'Update Report' : 'Submit Report'}
        </Button>
      ) : null}
    </main>
  )
}
