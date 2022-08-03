export const getActiveStop = rescue => {
  if (!rescue) return null
  let activeStop = null
  for (const stop of rescue.stops) {
    if (stop.status !== 'cancelled' && stop.status !== 'completed') {
      activeStop = stop
      break
    }
  }
  return activeStop
}
