import React, { useEffect, useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { Input } from '../Input/Input'
import { v4 as generateUniqueId } from 'uuid'
import './EditLocation.scss'
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore'

export default function EditLocation() {
  const { id, loc_id } = useParams()
  const history = useHistory()
  const [locations = []] = useCollectionData(
    firebase
      .firestore()
      .collection('Organizations')
      .doc(id)
      .collection('Locations')
  )
  const [location = {}] = useDocumentData(
    loc_id
      ? firebase
          .firestore()
          .collection('Organizations')
          .doc(id)
          .collection('Locations')
          .doc(loc_id)
      : null
  )
  const [formData, setFormData] = useState({
    name: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip_code: '',
    is_primary: false,
  })

  useEffect(() => {
    if (location.name && !formData.name) {
      console.log(location)
      setFormData({
        name: location.name,
        address1: location.address1,
        address2: location.address2,
        city: location.city,
        state: location.state,
        zip_code: location.zip_code,
        is_primary: location.is_primary,
      })
    }
  }, [location, formData])

  function handleChange(e) {
    console.log(e.target.id, e.target.value)
    setFormData({ ...formData, [e.target.id]: e.target.value })
  }

  function handleSubmit() {
    const new_loc_id = loc_id || generateUniqueId()
    firebase
      .firestore()
      .collection('Organizations')
      .doc(id)
      .collection('Locations')
      .doc(new_loc_id)
      .set(
        {
          id: new_loc_id,
          ...formData,
          is_primary: !locations.length ? true : formData.is_primary, // default to primary if first location
        },
        { merge: true }
      )
      .then(() => history.push(`/admin/organizations/${id}`))
      .catch(e => console.error('Error writing document: ', e))
  }

  return (
    <main id="EditLocation">
      <Link className="back" to={`/admin/organizations/${id}`}>
        {'< '} back to organization
      </Link>
      <h1>{loc_id ? 'Edit Location' : 'Add Location'}</h1>
      <Input
        type="text"
        label="Location Nickname *"
        element_id="name"
        value={formData.name}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="Address Line 1 *"
        element_id="address1"
        value={formData.address1}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="Address Line 2"
        element_id="address2"
        value={formData.address2}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="City *"
        element_id="city"
        value={formData.city}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="State *"
        element_id="state"
        value={formData.state}
        onChange={handleChange}
      />
      <Input
        type="text"
        label="Zip Code *"
        element_id="zip_code"
        value={formData.zip_code}
        onChange={handleChange}
      />
      <div className="is_primary">
        <input
          type="checkbox"
          id="is_primary"
          name="is_primary"
          checked={formData.is_primary}
          onChange={() =>
            setFormData({ ...formData, is_primary: !formData.is_primary })
          }
        />
        <p>
          Make this the Organization's
          <br />
          Primary Address
        </p>
      </div>
      <button onClick={handleSubmit}>
        {loc_id ? 'update location' : 'add location'}
      </button>
    </main>
  )
}
