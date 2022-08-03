export const getActiveStopId = rescue => {
  let activeStopId
  for (const stop of rescue.stops) {
    if (stop.status !== 'cancelled' && stop.status !== 'completed') {
      activeStopId = stop.id
      break
    }
  }
  return activeStopId
}
