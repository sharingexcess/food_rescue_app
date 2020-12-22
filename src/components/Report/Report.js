import React, { useEffect, useState } from 'react'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import { Link, useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import './Report.scss'
import Spacer from '../Spacer/Spacer'
import Loading from '../Loading/Loading'

export default function Report() {
  const { id } = useParams()
  const history = useHistory()
  const [rescue = {}, loading] = useDocumentData(
    firebase.firestore().collection('Rescues').doc(id)
  )
  const [pickup_org = {}] = useDocumentData(
    firebase.firestore().collection('Organizations').doc(rescue.pickup_org_id)
  )
  const [delivery_org = {}] = useDocumentData(
    firebase.firestore().collection('Organizations').doc(rescue.delivery_org_id)
  )
  const [formData, setFormData] = useState({
    dairy: 0,
    produce: 0,
    meat: 0,
    grains: 0,
    weight: 0,
  })
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    rescue.report ? setFormData(rescue.report) : setChanged(true)
  }, [rescue.report])

  function handleChange(e) {
    console.log('handling change', e.target.id, e.target.value)
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
      .collection('Rescues')
      .doc(id)
      .set(
        {
          report: {
            dairy: parseInt(formData.dairy),
            produce: parseInt(formData.produce),
            meat: parseInt(formData.meat),
            grains: parseInt(formData.grains),
            weight: parseInt(formData.weight),
          },
          status: Math.max(rescue.status, 6),
        },
        { merge: true }
      )
      .then(() => history.push(`/rescues/${id}`))
      .catch(e => console.error('Error writing document: ', e))
  }

  return loading ? (
    <Loading text="Loading report" />
  ) : (
    <main id="Report">
      <Link className="back" to={`/rescues/${id}`}>
        {'< '} back to rescue
      </Link>
      <h1>Rescue Report</h1>
      <h3>
        {pickup_org.name} <Spacer direction="horizontal" /> {delivery_org.name}
      </h3>
      {Object.keys(formData)
        .sort()
        .map(field =>
          field !== 'weight' ? (
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
      {changed ? (
        <button onClick={handleSubmit}>
          {rescue.report ? 'update report' : 'submit report'}
        </button>
      ) : null}
    </main>
  )
}
