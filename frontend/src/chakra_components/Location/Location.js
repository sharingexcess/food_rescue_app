import { useColorMode } from '@chakra-ui/react'
import { darkMode, lightMode } from '../Directions/styles'

const { compose, withProps, lifecycle } = require('recompose')
const {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} = require('react-google-maps')

export const Location = compose(
  // withProps({
  //   googleMapURL: `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_FIREBASE_API_KEY}&g&v=3.exp&libraries=geometry,drawing,places`,
  //   loadingElement: (
  //     <div
  //       style={{
  //         height: `100%`,
  //         width: '100%',
  //         backgroundColor: 'var(--chakra-colors-surface-background)',
  //       }}
  //     />
  //   ),
  //   containerElement: (
  //     <div
  //       style={{
  //         height: `320px`,
  //         width: '100%',
  //         position: 'relative',
  //         marginTop: window.innerWidth < 992 ? '64px' : 0,
  //         zIndex: '0',
  //         border: 'none',
  //         backgroundColor: 'var(--chakra-colors-surface-background)',
  //       }}
  //     />
  //   ),
  //   mapElement: (
  //     <div
  //       style={{
  //         height: `100%`,
  //         zIndex: '0',
  //         width: '100%',
  //         backgroundColor: 'var(--chakra-colors-surface-background)',
  //       }}
  //     />
  //   ),
  // }),
  withScriptjs,
  withGoogleMap
  //   lifecycle({
  //     componentDidMount() {
  //       const { location } = this.props
  //       // const MapMarker = new google.maps.Marker()
  //       const myLatLng = { lat: -25.363, lng: 131.044 }
  //       const map = new google.maps.Map(document.getElementById('map'), {
  //         zoom: 4,
  //         center: myLatLng,
  //       })
  //
  //       new google.maps.Marker({
  //         position: myLatLng,
  //         map,
  //         title: 'Hello World!',
  //       })
  //     },
  //   })
)(location => {
  const { colorMode } = useColorMode()
  // { lat: -34.397, lng: 150.644 }
  const latlng = new google.maps.LatLng(location.lat, location.lng)
  const MapMarker = new google.maps.Marker()
  return (
    <GoogleMap
      defaultZoom={8}
      defaultCenter={{ lat: -34.397, lng: 150.644 }}
      zIndex="0"
      defaultOptions={{
        styles: colorMode === 'dark' ? darkMode : lightMode,
        disableDefaultUI: true,
      }}
    >
      {console.log('location', location)}
      {/* new google.maps.LatLng(location.lat, location.lng) */}
      {console.log('latlng', latlng)}
      <Marker position={{ lat: -34.397, lng: 150.644 }} />
    </GoogleMap>
  )
})

{
  /* <Location
  googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyC4R6AN7SmujjPUIGKdyao2Kqitzr1kiRg&v=3.exp&libraries=geometry,drawing,places"
  loadingElement={<div style={{ height: `100%` }} />}
  containerElement={<div style={{ height: `400px` }} />}
  mapElement={<div style={{ height: `100%` }} />}
/> */
}

/* 
react class
https://codesandbox.io/s/ln1hk?file=/src/SimpleMap.js
react function
https://codesandbox.io/s/google-map-react-markers-hover-and-click-example-forked-x7zup?file=/src/MyMarker.jsx

*/
