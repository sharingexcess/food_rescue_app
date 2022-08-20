import { useColorMode } from '@chakra-ui/react'
import { darkMode, lightMode } from '../../styles/mapStyles'

const { compose, withProps, lifecycle } = require('recompose')
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
} = require('react-google-maps')

export const Directions = compose(
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
  withGoogleMap,
  lifecycle({
    componentDidMount() {
      const { stops } = this.props
      const DirectionsService = new google.maps.DirectionsService()

      DirectionsService.route(
        {
          origin: new google.maps.LatLng(
            stops[0].location.lat,
            stops[0].location.lng
          ),
          destination: new google.maps.LatLng(
            stops[stops.length - 1].location.lat,
            stops[stops.length - 1].location.lng
          ),
          waypoints:
            stops.length > 2
              ? stops.slice(1, -1).map(i => ({
                  location: new google.maps.LatLng(
                    i.location.lat,
                    i.location.lng
                  ),
                }))
              : null,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            this.setState({
              directions: result,
            })
          } else {
            console.error(`error fetching directions ${result}`)
          }
        }
      )
    },
  })
)(props => {
  const { colorMode } = useColorMode()

  return (
    <GoogleMap
      defaultZoom={7}
      defaultCenter={
        new google.maps.LatLng(
          props.stops[0].location.lat,
          props.stops[0].location.lng
        )
      }
      zIndex="0"
      defaultOptions={{
        styles: colorMode === 'dark' ? darkMode : lightMode,
        disableDefaultUI: true,
      }}
    >
      {props.directions && <DirectionsRenderer directions={props.directions} />}
    </GoogleMap>
  )
})
