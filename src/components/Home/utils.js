export const tiles = [
  {
    name: 'View Rescues',
    icon: 'fa-truck',
    link: '/rescues',
  },
  {
    name: 'New Rescue',
    icon: 'fa-plus',
    link: '/create',
  },
  {
    name: 'User Profile',
    icon: 'fa-user',
    link: '/profile',
  },
]

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
