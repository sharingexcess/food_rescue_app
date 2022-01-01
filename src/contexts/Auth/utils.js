import firebase from 'firebase/app'
import 'firebase/auth'
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
      available_sun_am: false,
      available_sun_pm: false,
      available_mon_am: false,
      available_mon_pm: false,
      available_tue_am: false,
      available_tue_pm: false,
      available_wed_am: false,
      available_wed_pm: false,
      available_thu_am: false,
      available_thu_pm: false,
      available_fri_am: false,
      available_fri_pm: false,
      available_sat_am: false,
      available_sat_pm: false,
    })
  } else {
    setFirestoreData(['users', user.uid], {
      timestamps: { last_active: createTimestamp() },
    })
  }
}
