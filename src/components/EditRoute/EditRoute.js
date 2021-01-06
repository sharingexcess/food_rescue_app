import React, { memo, useEffect, useState } from 'react'
import { Input } from '../Input/Input'
import { GoBack } from '../../helpers/components'
import { useHistory } from 'react-router-dom'
import { createPickup, updateFieldSuggestions, formFields } from './utils'
import './EditRoute.scss'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import UserIcon from '../../assets/user.svg'
import { getCollection } from '../../helpers/helpers'
import moment from 'moment'
import EditDelivery from '../EditDelivery/EditDelivery'
import { v4 as generateUniqueId } from 'uuid'
import EditPickup from '../EditPickup/EditPickup'

function EditRoute() {
  const [formData, setFormData] = useState({
    // Any field used as an input value must be an empty string
    // others can and should be initialized as null
    driver_name: '',
    driver_id: null,
    stops: [],
  })
  const [suggestions, setSuggestions] = useState({
    // these will populate the dropdown suggestions for each input
    driver_name: [],
    driver_id: [],
  })
  const [list, setList] = useState('pickups')

  useEffect(() => {
    formData.driver_id &&
      getCollection('Users')
        .doc(formData.driver_id)
        .get()
        .then(res => {
          const driver = res.data()
          setFormData({ ...formData, driver })
        })
  }, [formData.driver_id])

  function handleAddPickup(pickup) {
    setList(false)
    setFormData({
      ...formData,
      stops: [
        ...formData.stops,
        { ...pickup, id: generateUniqueId(), type: 'pickup' },
      ],
    })
  }

  function handleAddDelivery(delivery) {
    console.log(delivery)
    debugger
    setList(false)
    setFormData({
      ...formData,
      stops: [
        ...formData.stops,
        { ...delivery, id: generateUniqueId(), type: 'delivery' },
      ],
    })
  }

  function handleRemoveStop(id) {
    setFormData({
      ...formData,
      stops: formData.stops.filter(s => s.id !== id),
    })
  }

  function isValidRoute() {
    if (
      formData.stops.find(s => s.type === 'pickup') &&
      formData.stops.find(s => s.type === 'delivery')
    ) {
      return true
    }
    return false
  }

  function Stop({ s }) {
    return (
      <div className={`Stop ${s.type}`}>
        <div>
          <i className="fa fa-times" onClick={() => handleRemoveStop(s.id)} />
          <h4>
            <i
              className={
                s.type === 'pickup' ? 'fa fa-arrow-up' : 'fa fa-arrow-down'
              }
            />
            {s.type}
          </h4>
          <h2>{s.org.name}</h2>
          <p>
            {s.location.address1}
            {s.location.address2 && ` - ${s.location.address2}`}
          </p>
          <p>
            {s.location.city}, {s.location.state} {s.location.zip_code}
          </p>
        </div>
      </div>
    )
  }

  function Driver() {
    function handleChange(e, field) {
      if (field.suggestionQuery) {
        updateFieldSuggestions(
          e.target.value,
          field,
          suggestions,
          setSuggestions
        )
      }
      setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    function handleSelect(e, selected, field) {
      if (field.type !== 'select') {
        setSuggestions({ ...suggestions, [field.id]: null })
      }
      const updated_fields = field.handleSelect(selected)
      updated_fields && setFormData({ ...formData, ...updated_fields })
    }

    return formData.time_end ? (
      <div id="Driver">
        <img
          src={formData.driver.icon || UserIcon}
          alt={formData.driver.name}
        />
        <div>
          <h3>{formData.driver.name}</h3>
          <h4>{moment(formData.time_start).format('dddd, MMMM D')}</h4>
          <h5>
            {moment(formData.time_start).format('h:mma')} -{' '}
            {moment(formData.time_end).format('h:mma')}
          </h5>
        </div>
      </div>
    ) : (
      formFields.map(field =>
        !field.preReq || formData[field.preReq] ? (
          <Input
            key={field.id}
            element_id={field.id}
            type={field.type}
            label={field.label}
            value={formData[field.id]}
            onChange={e => handleChange(e, field)}
            suggestions={suggestions[field.id]}
            onSuggestionClick={(e, s) => handleSelect(e, s, field)}
            animation={false}
          />
        ) : null
      )
    )
  }

  return (
    <div id="EditRoute">
      <GoBack label="back to rescues" url="/rescues" />
      <h1>New Route</h1>
      <Driver />
      {formData.stops.map(s => (
        <Stop s={s} />
      ))}
      {formData.time_end ? (
        <>
          <section id="AddStop">
            {list === 'pickups' ? (
              <EditPickup handleSubmit={handleAddPickup} />
            ) : list === 'delivery' ? (
              <EditDelivery handleSubmit={handleAddDelivery} />
            ) : null}
          </section>
          <div className="add">
            {list ? (
              <button className="cancel" onClick={() => setList()}>
                cancel
              </button>
            ) : (
              <>
                <button className="pickup" onClick={() => setList('pickups')}>
                  add pickup
                </button>
                {formData.stops.length ? (
                  <button
                    className="delivery"
                    onClick={() => setList('delivery')}
                  >
                    add delivery
                  </button>
                ) : null}
                {isValidRoute() && (
                  <button className="complete">complete route</button>
                )}
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  )
}

export default memo(EditRoute)
