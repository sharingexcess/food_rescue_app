import React, { useEffect, useState } from 'react'
import { Input } from '../Input/Input'

function GoogleAutoComplete({ handleSelect }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const autoComplete = new window.google.maps.places.Autocomplete(
      document.getElementById('autocomplete'),
      {
        componentRestrictions: { country: 'us' },
      }
    )
    autoComplete.addListener('place_changed', () => {
      try {
        const addressObject = autoComplete.getPlace()
        const query = addressObject.formatted_address
        setQuery(query)
        const parsedAddressObject = {
          address1:
            addressObject.address_components.find(a =>
              a.types.includes('street_number')
            ).long_name +
            ' ' +
            addressObject.address_components.find(a =>
              a.types.includes('route')
            ).long_name,
          city: addressObject.address_components.find(a =>
            a.types.includes('locality')
          ).long_name,
          state: addressObject.address_components.find(a =>
            a.types.includes('administrative_area_level_1')
          ).short_name,
          zip_code: addressObject.address_components.find(a =>
            a.types.includes('postal_code')
          ).long_name,
          lat: addressObject.geometry.location.lat(),
          lng: addressObject.geometry.location.lng(),
        }
        handleSelect(parsedAddressObject)
      } catch (e) {
        console.error(e)
        alert('Could not use this address, please select another!')
        setQuery('')
      }
    })
  }, []) //eslint-disable-line

  return (
    <Input
      element_id="autocomplete"
      type="text"
      onChange={e => setQuery(e.target.value)}
      value={query}
      label="Address *"
    />
  )
}

export default GoogleAutoComplete
