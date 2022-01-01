import { STATUSES } from 'helpers'

export function allFoodDelivered(stops) {
  if (stops.length === 0) {
    return false
  }
  let finalWeight = 0
  for (const stop of stops) {
    if (stop.impact_data_total_weight) {
      stop.type === 'pickup'
        ? (finalWeight += stop.impact_data_total_weight)
        : (finalWeight -= stop.impact_data_total_weight)
    }
  }
  return finalWeight === 0
}

export function areAllStopsCompleted(stops) {
  let completed = true
  for (const s of stops) {
    // if stop is not completed or cancelled
    if (s.status !== STATUSES.COMPLETED && s.status !== STATUSES.CANCELLED) {
      completed = false
      break
    }
  }
  return completed
}

export function getNextIncompleteStopIndex(rescue, stops) {
  if (rescue.status !== STATUSES.ACTIVE) return null
  let index
  for (const [idx, j] of rescue.stops.entries()) {
    const stop = stops.find(s => j.id === s.id)
    if (
      stop &&
      stop.status &&
      ![STATUSES.CANCELLED, STATUSES.COMPLETED].includes(stop.status)
    ) {
      index = idx
      break
    }
  }
  return index
}

export function getDeliveryWeight(deliveries, rescue) {
  const deliveredWeight = deliveries.filter(r => r.rescue_id === rescue.id)
  let totalWeight = 0
  for (let i = 0; i < deliveredWeight.length; i++) {
    totalWeight += deliveredWeight[i].report?.weight
      ? deliveredWeight[i].report?.weight
      : 0
  }
  return totalWeight
}
