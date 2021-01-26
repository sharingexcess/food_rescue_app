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
    other: 0,
    weight: 0,
    notes: '',
  })
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    pickup && pickup.report
      ? setFormData(formData => ({ ...formData, ...pickup.report }))
      : setChanged(true)
  }, [pickup])

  function canEdit() {
    return [1, 3].includes(pickup.status) || admin
  }

  function handleChange(e) {
    setFormData({ ...formData, [e.target.id]: e.target.value })
    setChanged(true)
  }

  function increment(field) {
    setFormData({ ...formData, [field]: formData[field] + 1 })
    setChanged(true)
  }

  function decrement(field) {
    setFormData({ ...formData, [field]: Math.max(0, formData[field] - 1) })
    setChanged(true)
  }

  function handleSubmit(event) {
    event.preventDefault()
    setFirestoreData(['Pickups', pickup_id], {
      report: {
        dairy: parseInt(formData.dairy),
        bakery: parseInt(formData.bakery),
        produce: parseInt(formData.produce),
        'meat/Fish': parseInt(formData['meat/Fish']),
        'non-perishable': parseInt(formData['non-perishable']),
        'prepared/Frozen': parseInt(formData['prepared/Frozen']),
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
      {changed && canEdit() ? (
        <button onClick={handleSubmit}>
          {pickup.report ? 'update report' : 'submit report'}
        </button>
      ) : null}
    </main>
  )
}
