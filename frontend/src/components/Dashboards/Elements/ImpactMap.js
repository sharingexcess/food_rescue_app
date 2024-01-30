import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const ImpactMap = ({ selectedEntity, sortedEntities, dashboardType }) => {
  const proximityThreshold = 0.1

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2))
  }

  const findClusters = () => {
    const clusters = []
    sortedEntities.forEach(recipient => {
      const cluster = []
      sortedEntities.forEach((otherRecipient, otherIdx) => {
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
  const chosenPoint = sortedEntities[largestCluster[randomIndex]]

  const selectedEntityLat = selectedEntity ? selectedEntity.lat : null
  const selectedEntityLng = selectedEntity ? selectedEntity.lng : null

  const position = [
    selectedEntityLat || (chosenPoint ? chosenPoint.lat : 39.9481769),
    selectedEntityLng || (chosenPoint ? chosenPoint.lng : -75.1926849),
  ]

  const customIcon = new L.DivIcon({
    html: `<div style="background-color: #4ea528; width: 20px; height: 20px; border-radius: 50%; display: flex; justify-content: center">se</div>`,
    className: 'my-div-icon',
    iconSize: [20, 20],
  })

  const markersRef = useRef({})

  useEffect(() => {
    if (selectedEntity && markersRef.current[selectedEntity.name]) {
      markersRef.current[selectedEntity.name].openPopup()
    }
  }, [selectedEntity])

  const renderMarkers = () => {
    return Object.entries(sortedEntities)
      .map(([key, value]) => ({
        organizationName: value.name,
        weight: value.total_weight,
        lat: value.lat,
        lng: value.lng,
        key,
      }))
      .sort((a, b) => b.weight - a.weight)
      .map(({ organizationName, weight, lat, lng, key }) => {
        if (lat && lng) {
          return (
            <Marker
              position={[lat, lng]}
              icon={customIcon}
              key={key}
              ref={ref => {
                markersRef.current[organizationName] = ref
              }}
            >
              <Popup>
                {dashboardType === 'donor' ? 'Donated' : 'Recieved'}{' '}
                <b>{weight}</b> lbs. {dashboardType === 'donor' ? 'to' : 'from'}{' '}
                {organizationName}
              </Popup>
            </Marker>
          )
        } else {
          return null
        }
      })
  }

  return (
    sortedEntities && (
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

export default ImpactMap
