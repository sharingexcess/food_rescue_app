import { createTimestamp, SE_API, STATUSES } from 'helpers'
import { useAuth } from 'hooks'

export async function getActiveStop(rescue) {
  if (!rescue) return null
  const { user } = useAuth()
  let activeStop = null
  for (const stop of rescue.stops) {
    if (stop.status !== 'cancelled' && stop.status !== 'completed') {
      await SE_API.post(
        `/stops/${stop.id}/update`,
        {
          status: STATUSES.ACTIVE,
          timestamp_logged_start: createTimestamp(),
          timestamp_updated: createTimestamp(),
        },
        user.accessToken
      )
      activeStop = stop
      break
    }
  }
  return activeStop
}
