import { STATUSES } from 'helpers'
import { useRescueContext } from './Rescue'
import { ActiveStop } from './Rescue.ActiveStop'
import { InactiveStop } from './Rescue.InactiveStop'

export function RescueStops() {
  const { rescue } = useRescueContext()
  return rescue.stops.map((stop, i) =>
    stop.status === STATUSES.ACTIVE ? (
      <ActiveStop key={i} stop={stop} />
    ) : (
      <InactiveStop stop={stop} key={i} />
    )
  )
}
