export function filterCompletedStopsByDateRange(stop, range_start, range_end) {
  if (stop.status === 9 && stop.time_finished) {
    const date =
      stop.time_finished && stop.time_finished.toDate
        ? stop.time_finished.toDate() // handle firestore date objects
        : new Date(stop.time_finished) // handle date strings created manually
    return date < range_end && date > range_start
  } else return false
}
