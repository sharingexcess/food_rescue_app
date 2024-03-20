import { useEffect, useState } from 'react'
import { Input } from '@chakra-ui/react'
import { Helmet } from 'react-helmet'

export function AddressAutocomplete({ handleSelect }) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!window.google?.maps) {
      setTimeout(configureAutocomplete, 500)
    } else configureAutocomplete()

    function configureAutocomplete() {
      const autoComplete = new window.google.maps.places.Autocomplete(
        document.getElementById('autocomplete'),
        {
          componentRestrictions: { country: ['ca', 'us'] },
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
            city: getCityFromAddressObject(addressObject),
            state: addressObject.address_components.find(a =>
              a.types.includes('administrative_area_level_1')
            ).short_name,
            zip: addressObject.address_components.find(a =>
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
    }
  }, []) //eslint-disable-line

  function getCityFromAddressObject(addressObject) {
    let component = addressObject.address_components.find(a =>
      a.types.includes('locality')
    )
    if (!component) {
      component = addressObject.address_components.find(a =>
        a.types.includes('neighborhood')
      )
    }
    return component ? component.long_name : ''
  }

  return (
    <>
      <Helmet>
        <script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_FIREBASE_API_KEY}&libraries=places`}
        ></script>
      </Helmet>
      <Input
        id="autocomplete"
        type="text"
        onChange={e => setQuery(e.target.value)}
        value={query}
        placeholder="Start typing an address..."
      />
    </>
  )
}
