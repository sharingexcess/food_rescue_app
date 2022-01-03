import moment from 'moment'

export function getDefaultRangeStart() {
  return moment(new Date())
    .subtract(1, 'month')
    .startOf('month')
    .format('yyyy-MM-DDTkk:mm')
    .replace('24:00', '00:00')
}

export function getDefaultRangeEnd() {
  return moment(new Date())
    .startOf('month')
    .format('yyyy-MM-DDTkk:mm')
    .replace('24:00', '00:00')
}
