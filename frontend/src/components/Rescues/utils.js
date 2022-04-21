import UserIcon from 'assets/user.svg'
import { Card, Image, Spacer, Text } from '@sharingexcess/designsystem'
import { STATUSES, formatTimestamp } from 'helpers'
import { Link } from 'react-router-dom'
import PickupIcon from 'assets/pickup.png'
import DeliveryIcon from 'assets/delivery.png'

export function getRescueWeight(rescue) {
  const deliveries = rescue.stops.filter(s => s.type === 'delivery')
  let totalWeight = 0
  for (const d of deliveries) {
    totalWeight += d.impact_data_total_weight || 0
  }
  return totalWeight
}

export function generateStopLabel(stop) {
  return `${stop.organization.name} (${
    stop.location.nickname || stop.location.address1
  })${stop.status === STATUSES.CANCELLED ? ' - Cancelled' : ''}`
}

export function generateDeliveryWeight(delivery) {
  const baseText = `${delivery.organization.name} (${
    delivery.location.nickname || delivery.location.address1
  })`
  if (delivery.status === STATUSES.CANCELLED) {
    return `${baseText} - Cancelled`
  } else if (delivery.status === STATUSES.COMPLETED) {
    return `${baseText} - ${delivery.impact_data_total_weight} lbs.`
  } else return `${baseText}`
}

export function generateRescueStart(rescue) {
  if (rescue.status === STATUSES.COMPLETED) {
    return rescue.timestamp_logged_start
      ? formatTimestamp(rescue.timestamp_logged_start, 'h:mma')
      : 'No start time'
  }
}

export function generateRescueFinish(rescue) {
  if (rescue.status === STATUSES.COMPLETED) {
    return rescue.timestamp_logged_finish
      ? formatTimestamp(rescue.timestamp_logged_finish, 'h:mma')
      : 'No end time'
  }
}

export function StatusIndicator({ rescue }) {
  if (rescue.status === STATUSES.COMPLETED) {
    return <div className="Rescues-route-status">✅</div>
  } else if (rescue.status === STATUSES.CANCELLED) {
    return <div className="Rescues-route-status">❌</div>
  } else if (rescue.status === STATUSES.SCHEDULED) {
    return <div className="Rescues-route-status">🗓</div>
  } else if (rescue.status === STATUSES.ACTIVE) {
    return <div className="Rescues-route-status">🚛</div>
  } else return null
}

export function sortRescues(rescues, status) {
  if ([STATUSES.ACTIVE, STATUSES.SCHEDULED].includes(status)) {
    return rescues.reverse() // show the oldest first for active and scheduled rescues
  } else return rescues // show the newest first for cancelled and completed
}

export function RescueCard({ r }) {
  return (
    <Link to={`/rescues/${r.id}`} key={r.id}>
      <Card classList={['Route']}>
        <div className="Rescues-route-header">
          {r.handler && (
            <img src={r.handler.icon || UserIcon} alt={r.handler.name} />
          )}
          <div>
            <Text type="section-header" color="black" wrap={false}>
              {r.handler.name || 'Unassigned Route'}
            </Text>
            <Text type="small" color="blue">
              {r.status === STATUSES.COMPLETED
                ? `${formatTimestamp(
                    r.timestamp_scheduled_start,
                    'ddd, MMM Do'
                  )}, ${generateRescueStart(r)} - ${generateRescueFinish(r)}`
                : formatTimestamp(
                    r.timestamp_scheduled_start,
                    'ddd, MMM Do, h:mma'
                  )}
            </Text>
            {r.status === STATUSES.COMPLETED && (
              <>
                <Spacer height={4} />
                <Text type="small" color="green">
                  {getRescueWeight(r)} lbs. delivered
                </Text>
              </>
            )}

            {r.notes ? (
              <>
                <Spacer height={4} />
                <Text type="small" color="grey">
                  Notes: {r.notes}
                </Text>
              </>
            ) : null}
          </div>
          <StatusIndicator rescue={r} />
        </div>
        <Spacer height={12} />
        <Text type="small" color="grey" classList={['pickups']}>
          <Image src={PickupIcon} />
          {'  '}
          {r.stops
            .filter(s => s.type === 'pickup')
            .map(stop => generateStopLabel(stop))
            .join('\n')}
        </Text>
        <Spacer height={8} />
        <Text type="small" color="grey" classList={['deliveries']}>
          <Image src={DeliveryIcon} />
          {'  '}
          {r.stops
            .filter(s => s.type === 'delivery')
            .map(s => generateDeliveryWeight(s))
            .join('\n')}
        </Text>
      </Card>
    </Link>
  )
}
