import { darkMode, lightMode } from '../../styles/maps'
import { compose, withProps, lifecycle } from 'recompose'
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  DirectionsRenderer,
} from 'react-google-maps'
import { useColorMode } from '@chakra-ui/react'

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
      const { transfers } = this.props
      const DirectionsService = new window.google.maps.DirectionsService()

      DirectionsService.route(
        {
          origin: new window.google.maps.LatLng(
            transfers[0].location.lat,
            transfers[0].location.lng
          ),
          destination: new window.google.maps.LatLng(
            transfers[transfers.length - 1].location.lat,
            transfers[transfers.length - 1].location.lng
          ),
          waypoints:
            transfers.length > 2
              ? transfers.slice(1, -1).map(i => ({
                  location: new window.google.maps.LatLng(
                    i.location.lat,
                    i.location.lng
                  ),
                }))
              : null,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
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
      key={colorMode} // this is necessary to force re-render when the colorMode changes
      defaultZoom={6}
      defaultCenter={
        new window.google.maps.LatLng(
          props.transfers[0].location.lat,
          props.transfers[0].location.lng
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
