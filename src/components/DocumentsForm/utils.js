import firebase from 'firebase/app'

export function getDriverLicenseUrl(profile) {
  return profile.driver_license_url
}

export function getInsuranceUrl(profile) {
  return profile.insurance_url
}

export function getDriverLicenseFileName(profile) {
  const path = getDriverLicenseUrl(profile)
  const storageRef = firebase.storage().ref().child(path)
  return storageRef.name
}

export function getInsuranceFileName(profile) {
  const path = getInsuranceUrl(profile)
  const storageRef = firebase.storage().ref().child(path)
  return storageRef.name
}
