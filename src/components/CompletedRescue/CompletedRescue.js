import React, { useCallback, useEffect, useState } from 'react'
import { Link, Redirect, useParams, useHistory } from 'react-router-dom'
import { useFirestore } from 'hooks'
import { Input, Loading } from 'components'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import { setFirestoreData, createTimestamp, STATUSES } from 'helpers'

export function CompletedRescue() {
  const { rescue_id } = useParams()
  const history = useHistory()
  const [notes, setNotes] = useState('')
  const rescue = useFirestore('rescues', rescue_id)
  const deliveries = useFirestore(
    'stops',
    useCallback(i => i.type === 'delivery' && i.rescue_id === rescue_id, [
      rescue_id,
    ])
  )

  useEffect(() => {
    if (rescue && rescue.notes) {
      setNotes(rescue.notes)
    }
  }, [rescue])

  function calculateWeight() {
    return deliveries
      ? deliveries
          .map(d => d.impact_data_total_weight)
          .reduce((a, b) => a + b, 0)
      : 0
  }

  async function handleSubmitRouteNotes() {
    if (notes) {
      await setFirestoreData(['rescues', rescue_id], {
        notes,
        timestamp_updated: createTimestamp(),
      })
    }
    history.push('/')
  }

  return !rescue ? (
    <Loading />
  ) : rescue.status !== STATUSES.COMPLETED ? (
    <Redirect to={`/rescues/${rescue_id}`} />
  ) : (
    <main id="CompletedRescue">
      <div id="CompletedRescue-icon">🎉</div>
      <Spacer height={32} />
      <Text type="primary-header" color="white" shadow align="center">
        Route Completed!
      </Text>
      <Spacer height={16} />
      <Text type="subheader" color="white" shadow align="center">
        Thank you for driving with Sharing Excess! You rescued{' '}
        <span>{calculateWeight()}lbs.</span> of food today. Go you!
      </Text>
      <Spacer height={32} />
      <Input
        label="Add notes to your route..."
        animation={false}
        type="textarea"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />
      <Button
        type="primary"
        size="large"
        color="white"
        fullWidth
        handler={handleSubmitRouteNotes}
      >
        Submit Route Notes
      </Button>
      <Spacer height={24} />
      <Link to="/">
        <Button type="secondary" color="white">
          Back to Home
        </Button>
      </Link>
    </main>
  )
}
