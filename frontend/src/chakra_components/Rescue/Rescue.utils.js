import { STATUSES } from 'helpers'

export function getActiveStop(rescue) {
  if (!rescue) return null
  let activeStop = null
  for (const stop of rescue.stops) {
    if (
      stop.status !== STATUSES.CANCELLED &&
      stop.status !== STATUSES.COMPLETED
    ) {
      activeStop = stop
      break
    }
  }

  return activeStop
}
