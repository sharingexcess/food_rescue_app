export const generateHeaderText = path_components => {
  let title = path_components.length
    ? path_components[path_components.length - 1].replace(/[^a-zA-Z ]/g, ' ')
    : 'Home'

  let back_label =
    path_components.length > 1
      ? path_components[path_components.length - 2].replace('admin', 'home')
      : 'Home'

  let back_url =
    path_components.length > 1
      ? `/${path_components.slice(0, path_components.length - 1).join('/')}`
      : '/'

  if (
    ['admin', 'pickup', 'delivery', 'location'].includes(
      back_url.slice(back_url.lastIndexOf('/') + 1, back_url.length)
    )
  ) {
    back_url = back_url.substring(0, back_url.lastIndexOf('/'))
  }

  if (path_components[0] === 'rescues' && path_components.length > 1) {
    title = 'rescue'
    back_label = 'All Rescues'
  }

  if (path_components.length > 2 && path_components[2] === 'delivery') {
    title = 'delivery'
    back_label = 'Rescue'
  }

  if (path_components.length > 2 && path_components[2] === 'pickup') {
    title = 'pickup'
    back_label = 'Rescue'
  }

  if (path_components.length > 2 && path_components[2] === 'edit') {
    title = 'Edit Rescue'
    back_label = 'Rescue'
  }

  if (path_components.length > 2 && path_components[2] === 'completed') {
    title = 'Completed Route'
    back_label = 'route'
  }

  if (path_components[1] === 'organizations' && path_components.length > 2) {
    title = 'Organization'
    back_label = 'organizations'
  }

  if (path_components[1] === 'organizations' && path_components.length > 3) {
    title = 'Location'
    back_label = 'organization'
  }

  if (path_components[1] === 'users' && path_components.length > 2) {
    title = 'User'
    back_label = 'users'
  }

  return { title, back_label, back_url }
}
