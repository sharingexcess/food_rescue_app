import moment from 'moment'

export function getDefaultRangeStart() {
  return moment(new Date())
    .startOf('hour')
    .subtract(2, 'weeks')
    .format('yyyy-MM-DDTkk:mm')
}

export function getDefaultRangeEnd() {
  return moment(new Date()).startOf('hour').format('yyyy-MM-DDTkk:mm')
}
