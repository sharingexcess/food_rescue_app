import React, { memo, useState } from 'react'
import firebase from 'firebase/app'
import './CreateRescue.scss'
import { Input } from '../Input/Input'
import { useHistory } from 'react-router-dom'

const formFields = [
  {
    label: 'Pickup Organization',
    id: 'pickup_org_name',
    pre_req: null,
    type: 'text',
    suggestion_query: name =>
      firebase
        .firestore()
        .collection('Organizations')
        .where('name', '>=', name)
        .where('name', '<=', name + '\uf8ff'),
    handle_select: org => ({
      pickup_org_name: org.name,
      pickup_org_id: org.id,
    }),
  },
  {
    label: 'Pickup Location',
    id: 'pickup_location_id',
    pre_req: 'pickup_org_id',
    type: 'select',
    suggestion_query: org_id =>
      firebase
        .firestore()
        .collection('Organizations')
        .doc(org_id)
        .collection('Locations'),
    handle_select: loc => ({
      pickup_location_id: loc.id,
    }),
    load_suggestions_on_init: true,
  },
  {
    label: 'Delivery Organization',
    id: 'delivery_org_name',
    pre_req: 'pickup_location_id',
    type: 'text',
    suggestion_query: name =>
      firebase
        .firestore()
        .collection('Organizations')
        .where('name', '>=', name)
        .where('name', '<=', name + '\uf8ff'),
    handle_select: org => ({
      delivery_org_name: org.name,
      delivery_org_id: org.id,
    }),
  },
  {
    label: 'Delivery Location',
    id: 'delivery_location_id',
    pre_req: 'delivery_org_id',
    type: 'select',
    suggestion_query: org_id =>
      firebase
        .firestore()
        .collection('Organizations')
        .doc(org_id)
        .collection('Locations'),
    handle_select: loc => ({
      delivery_location_id: loc.id,
    }),
    load_suggestions_on_init: true,
  },
  {
    label: 'Pickup Time',
    id: 'pickup_timestamp',
    pre_req: 'delivery_location_id',
    type: 'datetime-local',
  },
  {
    label: 'Delivery Time',
    id: 'delivery_timestamp',
    pre_req: 'pickup_timestamp',
    type: 'datetime-local',
  },
]

function CreateRescue() {
  const history = useHistory()
  const [formData, setFormData] = useState({
    pickup_org_name: '',
    pickup_org_id: null,
    pickup_location_id: '',
    delivery_org_name: '',
    delivery_org_id: null,
    delivery_location_id: '',
    pickup_timestamp: '',
    delivery_timestamp: '',
  })
  const [suggestions, setSuggestions] = useState({
    pickup_org_name: [],
    pickup_org_id: [],
    pickup_location_id: [],
    delivery_org_name: [],
    delivery_org_id: [],
    delivery_location_id: [],
    pickup_timestamp: [],
    delivery_timestamp: [],
  })

  function handleChange(event, field) {
    field.suggestion_query &&
      field
        .suggestion_query(event.target.value)
        .get()
        .then(querySnapshot => {
          const updatedSuggestions = []
          querySnapshot.forEach(doc => {
            updatedSuggestions.push({ id: doc.id, ...doc.data() })
          })
          if (suggestions[field.id].length !== updatedSuggestions.length) {
            setSuggestions({ ...suggestions, [field.id]: updatedSuggestions })
          }
        })

    setFormData({ ...formData, [event.target.id]: event.target.value })
  }

  function handleSelect(event, selected, field) {
    field.type !== 'select' &&
      setSuggestions({ ...suggestions, [field.id]: [] })
    setFormData({ ...formData, ...field.handle_select(selected) })
  }

  function handleSubmit(event) {
    event.preventDefault()
    firebase
      .firestore()
      .collection('Rescues')
      .add({
        pickup_org_id: formData.pickup_org_id,
        pickup_location_id: formData.pickup_location_id,
        delivery_org_id: formData.delivery_org_id,
        delivery_location_id: formData.delivery_location_id,
        pickup_timestamp: formData.pickup_timestamp,
        delivery_timestamp: formData.delivery_timestamp,
        created_at: firebase.firestore.FieldValue.serverTimestamp(),
        updated_at: firebase.firestore.FieldValue.serverTimestamp(),
      })
      .then(docRef => {
        history.push(`/rescues/${docRef.id}`)
      })
      .catch(function (error) {
        console.error('Error writing document: ', error)
      })
  }

  function renderFieldInput(field) {
    if (!field.pre_req || formData[field.pre_req]) {
      if (field.load_suggestions_on_init && !formData[field.id]) {
        field
          .suggestion_query(formData[field.pre_req])
          .get()
          .then(querySnapshot => {
            const updatedSuggestions = []
            querySnapshot.forEach(doc => {
              updatedSuggestions.push({ id: doc.id, ...doc.data() })
            })
            if (suggestions[field.id].length !== updatedSuggestions.length) {
              setSuggestions({ ...suggestions, [field.id]: updatedSuggestions })
            }
          })
      }
      return (
        <Input
          key={field.id}
          element_id={field.id}
          type={field.type}
          label={field.label}
          value={formData[field.id]}
          onChange={e => handleChange(e, field)}
          suggestions={suggestions[field.id]}
          onSuggestionClick={
            field.type === 'select'
              ? e => {
                  handleSelect(
                    e,
                    suggestions[field.id].find(s => s.id === e.target.value),
                    field
                  )
                }
              : (e, s) => handleSelect(e, s, field)
          }
        />
      )
    }
  }

  return (
    <div id="CreateRescue">
      <h1>New Rescue</h1>
      <p>Use this form to create a new rescue assignment.</p>
      <form onSubmit={handleSubmit}>
        {formFields.map(f => renderFieldInput(f))}
        {formData['delivery_timestamp'] && (
          <button type="submit">Create New Rescue</button>
        )}
      </form>
    </div>
  )
}

export default memo(CreateRescue)
