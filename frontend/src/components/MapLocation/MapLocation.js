import { useColorMode } from '@chakra-ui/react'
import { darkMode, lightMode } from 'styles/maps'
import { compose, withProps } from 'recompose'
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from 'react-google-maps'

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
          height: `240px`,
          width: '100%',
          position: 'relative',
          zIndex: '0',
          border: 'none',
          backgroundColor: 'var(--chakra-colors-surface-background)',
          borderRadius: 8,
          overflow: 'hidden',
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
)(({ lat, lng }) => {
  const { colorMode } = useColorMode()
  return (
    <GoogleMap
      key={colorMode}
      defaultZoom={12}
      defaultCenter={{ lat, lng }}
      defaultOptions={{
        styles: colorMode === 'dark' ? darkMode : lightMode,
        disableDefaultUI: true,
      }}
    >
      <Marker position={{ lat, lng }} />
    </GoogleMap>
  )
})
