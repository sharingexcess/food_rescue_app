import { CLOUD_FUNCTION_URLS } from '../../helpers/constants'
import { createServerTimestamp, setFirestoreData } from '../../helpers/helpers'

export async function addAccessLevelToAllUsers(users) {
  for (const user of users) {
    // Make fetch requests to check on the current access_level of the user
    if (user.access_level) {
      console.log(`${user.name} already has ${user.access_level} access.`)
      continue
    }
    console.log('Checking admin permission for', user.name)
    const is_admin = await checkUserAdminPermissions(user.id)
    if (is_admin) {
      setFirestoreData(['Users', user.id], {
        access_level: 'admin',
        updated_at: createServerTimestamp(),
        granted_access_by: 'Ryan McHenry',
      })
      console.log(`Made ${user.name} an admin.`)
      continue
    } else console.log(user.name, 'is not an admin.')

    console.log('Checking driver permission for', user.name)
    const is_driver = await checkUserBasicAccess(user.id)
    if (is_driver) {
      setFirestoreData(['Users', user.id], {
        access_level: 'driver',
        updated_at: createServerTimestamp(),
        granted_access_by: 'Ryan McHenry',
      })
      console.log(`Made ${user.name} a driver.`)
      continue
    } else console.log(user.name, 'is not a driver.')

    setFirestoreData(['Users', user.id], {
      access_level: 'none',
      updated_at: createServerTimestamp(),
    })
    console.log(`Made ${user.name} have no access.`)
    continue
  }

  window.alert('Finished!')
}

export async function checkUserAdminPermissions(id) {
  const check_admin_url = `${CLOUD_FUNCTION_URLS.isUserAdmin}?id=${id}`
  const response = await fetch(check_admin_url).then(data => data.text())
  return response === 'true'
}

export async function checkUserBasicAccess(id) {
  const check_admin_url = `${CLOUD_FUNCTION_URLS.isUserBasicAccess}?id=${id}`
  const response = await fetch(check_admin_url).then(data => data.text())
  return response === 'true'
}
