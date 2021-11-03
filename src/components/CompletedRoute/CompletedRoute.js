import React, { useCallback, useEffect, useState } from 'react'
import { Link, Redirect, useParams, useHistory } from 'react-router-dom'
import { useFirestore } from 'hooks'
import { Input, Loading } from 'components'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import { setFirestoreData } from 'helpers'

export function CompletedRoute() {
  const { route_id } = useParams()
  const history = useHistory()
  const [notes, setNotes] = useState('')
  const route = useFirestore('routes', route_id)
  const deliveries = useFirestore(
    'deliveries',
    useCallback(d => d.route_id === route_id, [route_id])
  )

  useEffect(() => {
    if (route && route.notes) {
      setNotes(route.notes)
    }
  }, [route])

  function calculateWeight() {
    return deliveries
      ? deliveries
          .map(d => (d.report ? d.report.weight || 0 : 0))
          .reduce((a, b) => a + b, 0)
      : 0
  }

  async function handleSubmitRouteNotes() {
    if (notes) {
      await setFirestoreData(['Routes', route_id], {
        notes,
        updated_at: createServerTimestamp(),
      })
    }
    history.push('/')
  }

  return !route ? (
    <Loading />
  ) : route.status !== 9 ? (
    <Redirect to={`/routes/${route_id}`} />
  ) : (
    <main id="CompletedRoute">
      <div id="CompletedRoute-icon">🎉</div>
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
