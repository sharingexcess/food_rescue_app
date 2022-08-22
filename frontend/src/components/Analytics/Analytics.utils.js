import { formatTimestamp } from 'helpers'
import moment from 'moment'

export function getDefaultRangeStart() {
  const params = new URLSearchParams(window.location.search)
  const param = params.get('date_range_start')
  if (param) {
    return formatTimestamp(
      new Date(new Date(param).setDate(new Date(param).getDate() + 1)),
      'yyyy-MM-DD'
    )
  } else
    return moment(new Date())
      .subtract(1, 'month')
      .startOf('month')
      .format('yyyy-MM-DD')
      .replace('24:00', '00:00')
}

export function getDefaultRangeEnd() {
  const params = new URLSearchParams(window.location.search)
  const param = params.get('date_range_end')
  if (param) {
    return formatTimestamp(
      new Date(new Date(param).setDate(new Date(param).getDate() + 1)),
      'yyyy-MM-DD'
    )
  } else
    return moment(new Date())
      .startOf('month')
      .format('yyyy-MM-DD')
      .replace('24:00', '00:00')
}
