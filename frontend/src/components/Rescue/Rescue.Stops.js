import { STATUSES, calculateCurrentLoad } from 'helpers'
import { useRescueContext } from './Rescue'
import { ActiveStop } from './Rescue.ActiveStop'
import { AddBackupDelivery } from './Rescue.AddBackupDelivery'
import { InactiveStop } from './Rescue.InactiveStop'

export function RescueStops() {
  const { rescue } = useRescueContext()
  // The max margin of error is equal to the number of stops,
  // assuming we needed to round the same direction for every stop.
  // If the remaining weight is greater than that, we need another
  // delivery to ensure all food finds a home.
  const remainingWeight = calculateCurrentLoad(rescue)
  const shouldAddStop =
    remainingWeight > rescue.stops.length &&
    rescue.stops[rescue.stops.length - 1].status === STATUSES.COMPLETED

  return (
    <>
      {rescue.stops.map((stop, i) =>
        stop.status === STATUSES.ACTIVE ? (
          <ActiveStop key={i} stop={stop} />
        ) : (
          <InactiveStop stop={stop} key={i} />
        )
      )}
      {shouldAddStop && <AddBackupDelivery />}
    </>
  )
}
