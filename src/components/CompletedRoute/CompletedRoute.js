import React, { useCallback } from 'react'
import { Link, Redirect, useParams } from 'react-router-dom'
import { useFirestore } from 'hooks'
import { Loading } from 'components'
import { Button, Spacer, Text } from '@sharingexcess/designsystem'

export function CompletedRoute() {
  const { route_id } = useParams()
  const route = useFirestore('routes', route_id)
  const deliveries = useFirestore(
    'deliveries',
    useCallback(d => d.route_id === route_id, [route_id])
  )

  function calculateWeight() {
    return deliveries
      ? deliveries
          .map(d => (d.report ? d.report.weight || 0 : 0))
          .reduce((a, b) => a + b, 0)
      : 0
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
      <Link to="/">
        <Button type="primary" size="large" color="white">
          Back to Home
        </Button>
      </Link>
    </main>
  )
}
