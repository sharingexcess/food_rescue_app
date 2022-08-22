export function calculateCurrentLoad(rescue, delivery) {
  let weight = 0
  if (rescue) {
    for (const stop of rescue.stops) {
      if (stop.type === 'pickup') {
        weight += stop.impact_data_total_weight || 0
      } else if (stop.id === delivery?.id) {
        break
      } else {
        weight -= stop.impact_data_total_weight || 0
      }
    }
  } else return undefined
  return weight
}
