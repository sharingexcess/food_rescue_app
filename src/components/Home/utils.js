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
  } else if (curHr < 18) {
    prefix = 'Good Afternoon'
    suffix = `😊`
  } else {
    prefix = 'Good Evening'
    suffix = `🌙`
  }
  return formattedName
    ? `${prefix}, ${formattedName} ${suffix}`
    : `${prefix} ${suffix}`
}

export function generateDriverStats(my_routes, my_deliveries) {
  const routes = my_routes.length
  const weight = my_deliveries
    .map(d => (d.report ? d.report.weight : 0))
    .reduce((a, b) => a + b, 0)
  return { routes, weight }
}
