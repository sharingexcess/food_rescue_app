import moment from 'moment'

export function getDefaultStartTime() {
  return moment(new Date())
    .startOf('hour')
    .add(1, 'hour')
    .format('yyyy-MM-DDTkk:mm')
}

export function getDefaultEndTime() {
  return moment(new Date())
    .startOf('hour')
    .add(3, 'hour')
    .format('yyyy-MM-DDTkk:mm')
}
