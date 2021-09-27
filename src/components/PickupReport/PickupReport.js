import React, { useEffect, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { Loading, Input } from 'components'
import { setFirestoreData } from '../../helpers/helpers'
import { usePickupData, useOrganizationData } from 'hooks'
import { useAuth } from 'contexts'
import validator from 'validator'
import { CalcModal } from '../../helpers/Calculator/Calculator'

export function PickupReport({ customSubmitHandler }) {
  const { pickup_id, route_id } = useParams()
  const { admin } = useAuth()
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
    weight: 0,
    notes: '',
  })
  const [changed, setChanged] = useState(false)
  const [errors, setErrors] = useState([])
  const [showErrors, setShowErrors] = useState(false)
  const resetInput = e => {
    if (e.target.value === '0') {
      e.target.value = ''
    }
  }
  const [showCal, setShowCal] = useState(false)
  useEffect(() => {
    pickup && pickup.report
      ? setFormData(formData => ({ ...formData, ...pickup.report }))
      : setChanged(true)
  }, [pickup])

  useEffect(() => {
    setFormData(formData => ({ ...formData, weight: sumWeight(formData) }))
  }, [errors])

  function canEdit() {
    return [1, 3].includes(pickup.status) || admin
  }
  function sumWeight(object) {
    let sum = 0
    for (const field in object) {
      if (field === 'weight' || field === 'notes') {
        //pass
      } else {
        sum += parseFloat(object[field])
      }
    }
    return sum
  }
  function handleChange(e) {
    // TODO: take the sum of all the field
    setErrors([])
    setShowErrors(false)
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
    setChanged(true)
  }
  function validateFormData(data) {
    if (
      data.dairy +
        data.bakery +
        data.produce +
        data['meat/Fish'] +
        data['non-perishable'] +
        data['prepared/Frozen'] +
        data['mixed groceries'] +
        data.other ===
      0
    ) {
      errors.push('Invalid Input: number of items must be greater than zero')
    }
    if (isNaN(data.weight) || /\s/g.test(data.weight)) {
      errors.push('Invalid Input: Total Weight is not a number')
    }
    if (data.weight <= 0) {
      errors.push('Invalid Input: Total Weight must be greater than zero')
    }
    for (const field in data) {
      if (
        field !== 'weight' &&
        field !== 'notes' &&
        field !== 'created_at' &&
        field !== 'updated_at' &&
        !validator.isInt(data[field].toString())
      ) {
        errors.push('Invalid Input: Item weight must be whole number')
        break
      }
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

  function handleSubmit(event, data) {
    event.preventDefault()
    if (validateFormData(data)) {
      setFirestoreData(['Pickups', pickup_id], {
        report: {
          dairy: parseInt(data.dairy),
          bakery: parseInt(data.bakery),
          produce: parseInt(data.produce),
          'meat/Fish': parseInt(data['meat/Fish']),
          'non-perishable': parseInt(data['non-perishable']),
          'prepared/Frozen': parseInt(data['prepared/Frozen']),
          'mixed groceries': parseInt(data['mixed groceries']),
          other: parseInt(data.other),
          weight: parseInt(data.weight),
          notes: data.notes,
          created_at:
            pickup.completed_at ||
            firebase.firestore.FieldValue.serverTimestamp(),
          updated_at: firebase.firestore.FieldValue.serverTimestamp(),
        },
        status: 9,
        time_finished: firebase.firestore.FieldValue.serverTimestamp(),
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
      <h3>{pickup_org.name}</h3>
      <h1 className="center">Input Category Weight in Pounds (lbs)</h1>

      <div>
        <button onClick={() => setShowCal(true)} class="fas fa-calculator">
          {' '}
        </button>
        {showCal === true ? (
          <CalcModal onShowModal={() => setShowCal(false)} />
        ) : null}
      </div>

      {Object.keys(formData)
        .sort(function (a, b) {
          if (a === 'other') {
            return 1
          }
          if (b === 'other') {
            return -1
          }
          return a.localeCompare(b)
        })
        .map(field =>
          !['weight', 'notes', 'created_at', 'updated_at'].includes(field) ? (
            <section key={field}>
              <h5>{field}</h5>
              <input
                id={field}
                type="string"
                defaultValue="0"
                value={formData[field]}
                onFocus={resetInput}
                onChange={handleChange}
                readOnly={!canEdit()}
              />
            </section>
          ) : null
        )}
      <section className="weight">
        <h4>Total Weight (lbs.)</h4>
        {isNaN(formData.weight) ? (
          <h4>Weight cannot be blank</h4>
        ) : (
          <h6>{formData.weight}</h6>
        )}
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
        <button
          onClick={
            customSubmitHandler
              ? e => customSubmitHandler(e, formData)
              : e => handleSubmit(e, formData)
          }
        >
          {pickup.report ? 'update report' : 'submit report'}
        </button>
      ) : null}
    </main>
  )
}
