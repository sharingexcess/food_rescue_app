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
    suffix = 'sleeping-face'
  } else if (curHr < 7) {
    prefix = "You're up early"
    suffix = 'hot-beverage'
  } else if (curHr < 12) {
    prefix = 'Good Morning'
    suffix = `sun`
  } else {
    prefix = "How's it going"
    suffix = `smiling-face-with-smiling-eyes`
  }
  const headerText = formattedName ? `${prefix}, ${formattedName}` : `${prefix}`
  return { headerText, emoji: suffix }
}
