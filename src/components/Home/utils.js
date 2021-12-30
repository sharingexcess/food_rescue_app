export function generateGreeting(name) {
  const today = new Date()
  const curHr = today.getHours()
  const formattedName = name
    ? name.includes(' ')
      ? name.split(' ')[0]
      : name
    : null
  let prefix, suffix
  if (curHr < 4) {
    prefix = 'Get some sleep'
    suffix = '😴'
  } else if (curHr < 7) {
    prefix = "You're up early"
    suffix = '☕️'
  } else if (curHr < 12) {
    prefix = 'Good Morning'
    suffix = `☀️`
  } else {
    prefix = "How's it going"
    suffix = `😊`
  }
  return formattedName
    ? `${prefix}, ${formattedName} ${suffix}`
    : `${prefix} ${suffix}`
}

export function generateDriverStats(my_rescues, my_deliveries) {
  const rescues = my_rescues.length
  const weight = my_deliveries
    .map(d => d.impact_data_total_weight)
    .reduce((a, b) => a + b, 0)
  return { rescues, weight }
}
