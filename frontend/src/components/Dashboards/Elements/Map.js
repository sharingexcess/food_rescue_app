import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const MyMap = ({ selectedRecipient, topRecipients }) => {
  const proximityThreshold = 0.1

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2))
  }

  const findClusters = () => {
    const clusters = []
    topRecipients.forEach(recipient => {
      const cluster = []
      topRecipients.forEach((otherRecipient, otherIdx) => {
        if (
          calculateDistance(
            recipient.lat,
            recipient.lng,
            otherRecipient.lat,
            otherRecipient.lng
          ) < proximityThreshold
        ) {
          cluster.push(otherIdx)
        }
      })
      clusters.push(cluster)
    })
    return clusters
  }

  const clusters = findClusters()
  const largestCluster = clusters.reduce(
    (a, b) => (a.length > b.length ? a : b),
    []
  )

  const randomIndex = Math.floor(Math.random() * largestCluster.length)
  const chosenPoint = topRecipients[largestCluster[randomIndex]]

  const selectedRecipientLat = selectedRecipient ? selectedRecipient.lat : null
  const selectedRecipientLng = selectedRecipient ? selectedRecipient.lng : null

  const position = [
    selectedRecipientLat || (chosenPoint ? chosenPoint.lat : 39.9481769),
    selectedRecipientLng || (chosenPoint ? chosenPoint.lng : -75.1926849),
  ]

  const customIcon = new L.DivIcon({
    html: `<div style="background-color: #4ea528; width: 20px; height: 20px; border-radius: 50%; display: flex; justify-content: center">se</div>`,
    className: 'my-div-icon',
    iconSize: [20, 20],
  })

  const markersRef = useRef({})

  useEffect(() => {
    if (selectedRecipient && markersRef.current[selectedRecipient.name]) {
      markersRef.current[selectedRecipient.name].openPopup()
    }
  }, [selectedRecipient])

  const renderMarkers = () => {
    return Object.entries(topRecipients)
      .map(([key, value]) => ({
        organizationName: value.name,
        weight: value.total_weight,
        lat: value.lat,
        lng: value.lng,
        key,
      }))
      .sort((a, b) => b.weight - a.weight)
      .map(({ organizationName, weight, lat, lng }) => {
        if (lat && lng) {
          return (
            <Marker
              position={[lat, lng]}
              icon={customIcon}
              key={organizationName}
              ref={ref => {
                markersRef.current[organizationName] = ref
              }}
            >
              <Popup>
                Donated <b>{weight}</b> lbs. to {organizationName}
              </Popup>
            </Marker>
          )
        } else {
          return null
        }
      })
  }

  return (
    topRecipients && (
      <MapContainer
        center={position}
        zoom={12}
        style={{ height: '500px', width: '100%', borderRadius: '10px' }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a target="_blank" href="http://sharingexcess.com">Sharing Excess</a>'
        />
        {renderMarkers()}
      </MapContainer>
    )
  )
}

export default MyMap
