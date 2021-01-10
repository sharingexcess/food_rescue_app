import React, { useEffect, useState } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import './PickupReport.scss'
import Loading from '../Loading/Loading'
import { Input } from '../Input/Input'
import { GoBack } from '../../helpers/components'
import { getCollection } from '../../helpers/helpers'

export default function PickupReport() {
  const { pickup_id, route_id } = useParams()
  const history = useHistory()
  const [pickup = {}, loading] = useDocumentData(
    getCollection('Pickups').doc(pickup_id)
  )
  const [pickup_org = {}] = useDocumentData(
    pickup.org_id ? getCollection('Organizations').doc(pickup.org_id) : null
  )
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
    pickup.report
      ? setFormData(formData => ({ ...formData, ...pickup.report }))
      : setChanged(true)
  }, [pickup])

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
    firebase
      .firestore()
      .collection('Pickups')
      .doc(pickup_id)
      .set(
        {
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
        },
        { merge: true }
      )
      .then(() => history.push(`/routes/${route_id}`))
      .catch(e => console.error('Error writing document: ', e))
  }
  if (loading) return <Loading text="Loading report" />
  return (
    <main id="PickupReport">
      <GoBack url={`/routes/${route_id}`} label="back to rescue" />
      <h1>Rescue Report</h1>
      <h3>{pickup_org.name}</h3>
      {Object.keys(formData)
        .sort()
        .map(field =>
          !['weight', 'notes', 'created_at', 'updated_at'].includes(field) ? (
            <section key={field}>
              <h5>{field}</h5>
              <button className="decrement" onClick={() => decrement(field)}>
                -
              </button>
              <input
                readOnly
                id={field}
                type="tel"
                value={formData[field]}
                onChange={handleChange}
              />
              <button className="increment" onClick={() => increment(field)}>
                +
              </button>
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
        />
      </section>
      <Input
        type="textarea"
        label="Notes..."
        element_id="notes"
        row={3}
        value={formData.notes}
        onChange={handleChange}
      />
      {changed ? (
        <button onClick={handleSubmit}>
          {pickup.report ? 'update report' : 'submit report'}
        </button>
      ) : null}
    </main>
  )
}
