import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'
import { getFirestoreData, setFirestoreData, createTimestamp } from 'helpers'

export async function getAuthenticatedUser() {
  const provider = new firebase.auth.GoogleAuthProvider()
  const { user } = await firebase.auth().signInWithPopup(provider)
  return user
}

export async function updatePublicUserProfile(user) {
  // fetch existing data matching this user id
  const existing_user = await getFirestoreData(['users', user.uid])
  // update Users Collection with this new login info
  if (!existing_user) {
    setFirestoreData(['users', user.uid], {
      id: user.uid,
      email: user.email,
      name: user.displayName,
      icon: user.photoURL,
      is_admin: false,
      is_driver: false,
      insurance_policy_number: null,
      insurance_provider: null,
      license_number: null,
      license_state: null,
      vehicle_make_model: null,
      completed_app_tutorial: false,
      completed_food_safety: false,
      completed_liability_release: false,
      timestamp_created: createTimestamp(),
      timestamp_updated: createTimestamp(),
      timestamp_last_active: createTimestamp(),
      availability_sun_am: false,
      availability_sun_pm: false,
      availability_mon_am: false,
      availability_mon_pm: false,
      availability_tue_am: false,
      availability_tue_pm: false,
      availability_wed_am: false,
      availability_wed_pm: false,
      availability_thu_am: false,
      availability_thu_pm: false,
      availability_fri_am: false,
      availability_fri_pm: false,
      availability_sat_am: false,
      availability_sat_pm: false,
    })
  } else {
    setFirestoreData(['users', user.uid], {
      timestamp_last_active: createTimestamp(),
    })
  }
}
