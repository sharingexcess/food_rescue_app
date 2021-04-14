import React, { useState } from 'react'
import { getDriverLicenseFileName, getInsuranceFileName } from './utils'
import firebase from 'firebase/app'
import './PaperWorkForm.scss'

function PaperWorkForm({ profile, user }) {
  const [driverLicense, setDriverLicense] = useState()
  const [insurance, setInsurance] = useState()
  const [licenseInsuranceButton, setLicenseInsuranceButton] = useState()
  const handleUploadForLicenseAndInsurance = e => {
    if (e.target.id === 'driver-license') {
      setDriverLicense(e.target.files[0])
    } else if (e.target.id === 'insurance') {
      setInsurance(e.target.files[0])
    }
    setLicenseInsuranceButton('update paperwork')
  }
  const handleLicenseAndInsuranceSubmit = async () => {
    const storage = firebase.storage()
    const paperWorkRef = storage.ref().child(`/Users/${user.uid}`)
    const promises = []
    if (driverLicense) {
      promises.push(
        paperWorkRef
          .child(`driverLicense/${driverLicense.name}`)
          .put(driverLicense, { contentType: driverLicense.type })
          .then(snapshot => snapshot.ref.fullPath)
          .then(storagePath => {
            return { driver_license_url: storagePath }
          })
      )
    }
    if (insurance) {
      promises.push(
        paperWorkRef
          .child(`insurance/${insurance.name}`)
          .put(insurance, { contentType: insurance.type })
          .then(snapshot => snapshot.ref.fullPath)
          .then(storagePath => {
            return { insurance_url: storagePath }
          })
      )
    }
    await Promise.all(promises)
      .then(values => {
        const paperWorkData = { driver_license_url: '', insurance_url: '' }
        values.forEach(value => {
          if (value.driver_license_url) {
            paperWorkData.driver_license_url = value.driver_license_url
          } else if (value.insurance_url) {
            paperWorkData.insurance_url = value.insurance_url
          }
        })
        firebase
          .firestore()
          .collection('Users')
          .doc(user.uid)
          .set(paperWorkData, { merge: true })
          .then(() => {
            setLicenseInsuranceButton('paperwork updated!')
            setTimeout(() => setLicenseInsuranceButton(), 3000)
          })
          .catch(e => console.error('Error updating profile: ', e))
      })
      .catch(error => {
        console.error('Error >>>', error)
      })
  }

  return (
    <div>
      <div className="PaperWork">
        <fieldset>
          <legend>Driver License</legend>
          <p>
            {profile?.driver_license_url
              ? getDriverLicenseFileName(profile)
              : 'No license selected'}
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadForLicenseAndInsurance}
            id="driver-license"
          />
        </fieldset>
      </div>
      <div className="PaperWork">
        <fieldset>
          <legend>Insurance</legend>
          <p>
            {profile?.insurance_url
              ? getInsuranceFileName(profile)
              : 'No insurance selected'}
          </p>
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadForLicenseAndInsurance}
            id="insurance"
          />
        </fieldset>
      </div>
      {licenseInsuranceButton && (
        <button
          disabled={licenseInsuranceButton !== 'update paperwork'}
          onClick={handleLicenseAndInsuranceSubmit}
        >
          {licenseInsuranceButton}
        </button>
      )}
    </div>
  )
}

export default PaperWorkForm
