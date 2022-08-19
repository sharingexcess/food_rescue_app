const { compose, withProps, lifecycle } = require('recompose')
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} = require('react-google-maps')

export const MapLocation = compose(
  withProps({
    googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_FIREBASE_API_KEY}&g&v=3.exp&libraries=geometry,drawing,places`,
    loadingElement: (
      <div
        style={{
          height: `100%`,
          width: '100%',
          backgroundColor: 'var(--chakra-colors-surface-background)',
        }}
      />
    ),
    containerElement: (
      <div
        style={{
          height: `320px`,
          width: '100%',
          position: 'relative',
          marginTop: window.innerWidth < 992 ? '64px' : 0,
          zIndex: '0',
          border: 'none',
          backgroundColor: 'var(--chakra-colors-surface-background)',
        }}
      />
    ),
    mapElement: (
      <div
        style={{
          height: `100%`,
          zIndex: '0',
          width: '100%',
          backgroundColor: 'var(--chakra-colors-surface-background)',
        }}
      />
    ),
  }),
  withScriptjs,
  withGoogleMap
)(props => (
  <GoogleMap
    defaultZoom={14}
    defaultCenter={{ lat: props.lat, lng: props.lng }}
  >
    <Marker position={{ lat: props.lat, lng: props.lng }} />
  </GoogleMap>
))
