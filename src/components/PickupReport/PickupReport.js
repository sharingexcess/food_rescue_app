import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Loading from '../Loading/Loading'
import { Input } from '../Input/Input'
import { setFirestoreData } from '../../helpers/helpers'
import usePickupData from '../../hooks/usePickupData'
import useOrganizationData from '../../hooks/useOrganizationData'
import { useAuthContext } from '../Auth/Auth'
import './PickupReport.scss'
import Header from '../Header/Header'

export default function PickupReport() {
  const { pickup_id, route_id } = useParams()
  const { admin } = useAuthContext()
  const history = useHistory()
  const pickup = usePickupData(pickup_id)
  const pickup_org = useOrganizationData(pickup ? pickup.org_id : {}) || {}
  const [formData, setFormData] = useState({
    dairy: 0,
    bakery: 0,
    produce: 0,
    'meat/Fish': 0,
    'non-perishable': 0,
    'prepared/Frozen': 0,
    'mixed groceries': 0,
    other: 0,
    weight: '',
    notes: '',
  })
  const [changed, setChanged] = useState(false)
  const [errors, setErrors] = useState([])
  const [showErrors, setShowErrors] = useState(false)

  useEffect(() => {
    pickup && pickup.report
      ? setFormData(formData => ({ ...formData, ...pickup.report }))
      : setChanged(true)
  }, [pickup])

  function canEdit() {
    return [1, 3].includes(pickup.status) || admin
  }

  function handleChange(e) {
    setErrors([])
    setShowErrors(false)
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setChanged(true)
  }

  function increment(field) {
    setErrors([])
    setShowErrors(false)
    setFormData({ ...formData, [field]: formData[field] + 1 })
    setChanged(true)
  }

  function decrement(field) {
    setErrors([])
    setShowErrors(false)
    setFormData({ ...formData, [field]: Math.max(0, formData[field] - 1) })
    setChanged(true)
  }

  function validateFormData() {
    if (
      formData.dairy +
        formData.bakery +
        formData.produce +
        formData['meat/Fish'] +
        formData['non-perishable'] +
        formData['prepared/Frozen'] +
        formData['mixed groceries'] +
        formData.other ===
      0
    ) {
      errors.push('Invalid Input: number of items must be greater than zero')
    }
    if (isNaN(formData.weight) || /\s/g.test(formData.weight)) {
      errors.push('Invalid Input: Total Weight is not a number')
    }
    if (formData.weight <= 0) {
      errors.push('Invalid Input: Total Weight must be greater than zero')
    }
    if (errors.length === 0) {
      return true
    }
    return false
  }

  function FormError() {
    if (showErrors === true) {
      return errors.map(error => <p id="FormError">{error}</p>)
    } else return null
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (validateFormData()) {
      console.log('valid')
      setFirestoreData(['Pickups', pickup_id], {
        report: {
          dairy: parseInt(formData.dairy),
          bakery: parseInt(formData.bakery),
          produce: parseInt(formData.produce),
          'meat/Fish': parseInt(formData['meat/Fish']),
          'non-perishable': parseInt(formData['non-perishable']),
          'prepared/Frozen': parseInt(formData['prepared/Frozen']),
          'mixed groceries': parseInt(formData['mixed groceries']),
          other: parseInt(formData.other),
          weight: parseInt(formData.weight),
          notes: formData.notes,
          created_at:
            pickup.completed_at ||
            firebase.firestore.FieldValue.serverTimestamp(),
          updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        },
        status: 9,
      })
        .then(() => history.push(`/routes/${route_id}`))
        .catch(e => console.error('Error writing document: ', e))
    } else {
      setShowErrors(true)
    }
  }
  if (!pickup) return <Loading text="Loading report" />
  return (
    <main id="PickupReport">
      <Header text="Rescue Report" />
      <h3>{pickup_org.name}</h3>
      {Object.keys(formData)
        .sort()
        .map(field =>
          !['weight', 'notes', 'created_at', 'updated_at'].includes(field) ? (
            <section key={field}>
              <h5>{field}</h5>
              {canEdit() ? (
                <button className="decrement" onClick={() => decrement(field)}>
                  -
                </button>
              ) : null}
              <input
                readOnly
                id={field}
                type="tel"
                value={formData[field]}
                onChange={handleChange}
              />
              {canEdit() ? (
                <button className="increment" onClick={() => increment(field)}>
                  +
                </button>
              ) : null}
            </section>
          ) : null
        )}
      <section className="weight">
        <h4>Total Weight (lbs.)</h4>
        <input
          id="weight"
          type="tel"
          value={formData.weight}
          onChange={handleChange}
          readOnly={!canEdit()}
        />
      </section>
      <Input
        type="textarea"
        label="Notes..."
        element_id="notes"
        row={3}
        value={formData.notes}
        onChange={handleChange}
        readOnly={!canEdit()}
      />
      <FormError />
      {changed && canEdit() ? (
        <button onClick={handleSubmit}>
          {pickup.report ? 'update report' : 'submit report'}
        </button>
      ) : null}
    </main>
  )
}
