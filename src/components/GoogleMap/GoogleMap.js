import GoogleMapReact from 'google-map-react'
import './GoogleMap.scss'
import { generateDirectionsLink } from './utils'

const defaultAddress = {
  lat: 39.952583,
  lng: -75.165222,
  name: 'Location',
  isDefault: true,
}

export default function GoogleMap({
  address = defaultAddress,
  style,
  zoom = 15,
}) {
  function openDirections() {
    window.open(generateDirectionsLink(address), '_blank')
  }

  function Marker() {
    return (
      <div className="Marker">
        <i className="fa fa-map-marker" onClick={openDirections} />
      </div>
    )
  }
  return (
    <div className="GoogleMap" style={style}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: process.env.REACT_APP_FIREBASE_API_KEY }}
        defaultCenter={{ lat: address.lat, lng: address.lng }}
        defaultZoom={address.isDefault ? 12 : zoom}
      >
        {!address.isDefault && <Marker lat={address.lat} lng={address.lng} />}
      </GoogleMapReact>
    </div>
  )
}
