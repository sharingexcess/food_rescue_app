import React, { useEffect, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  createTimestamp,
  setFirestoreData,
  STATUSES,
  updateImpactDataForRescue,
} from 'helpers'
import { Input, Loading } from 'components'
import { useAuth, useFirestore } from 'hooks'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'

export function DeliveryReport() {
  const { delivery_id, rescue_id } = useParams()
  const rescue = useFirestore('rescues', rescue_id)
  const history = useHistory()
  const delivery = useFirestore('stops', delivery_id)
  const [formData, setFormData] = useState({
    percent_of_total_dropped: 100,
    notes: '',
  })
  const [changed, setChanged] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { admin } = useAuth()

  const currentLoad = useMemo(() => {
    let weight = 0
    if (rescue) {
      for (const stop of rescue.stops) {
        if (stop.type === 'pickup') {
          weight += stop.impact_data_total_weight || 0
        } else if (stop.id === delivery_id) {
          break
        } else {
          weight -= stop.impact_data_total_weight || 0
        }
      }
    }
    return weight
  }, [rescue, delivery_id])

  useEffect(() => {
    if (rescue && delivery.status === STATUSES.COMPLETED && submitted) {
      async function update() {
        await updateImpactDataForRescue(rescue)
        history.push(`/rescues/${rescue_id}`)
      }
      update()
    }
  }, [rescue, delivery, history, rescue_id, submitted])

  useEffect(() => {
    delivery
      ? setFormData(formData => ({
          ...formData,
          percent_of_total_dropped: delivery.percent_of_total_dropped,
        }))
      : setChanged(true)
  }, [delivery])

  function canEdit() {
    return (
      ![STATUSES.COMPLETED, STATUSES.CANCELLED].includes(delivery.status) ||
      admin
    )
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

  async function handleSubmit(event) {
    event.preventDefault()
    try {
      const delivery = {
        ...formData,
        timestamp_logged_finish: createTimestamp(),
        timestamp_updated: createTimestamp(),
        status: STATUSES.COMPLETED,
      }
      await setFirestoreData(['stops', delivery_id], delivery)
      setSubmitted(true)
      // This logic will trigger a useEffect above to redirect after the rescue object updates
    } catch (e) {
      console.error('Error writing document: ', e)
    }
  }

  if (!delivery) return <Loading text="Loading report" />
  return (
    <main id="DeliveryReport">
      <Text type="section-header" color="white" align="center" shadow>
        How much of your current load ({currentLoad} lbs.) are you delivering?
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
