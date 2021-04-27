import React from 'react'
import './DeleteLocationModal.scss'
import 'firebase/firestore'
import { getCollection } from '../../helpers/helpers'

function DeleteLocationModal({
  setOpenModal,
  canDelete,
  locationRoutes,
  locationDeliveries,
  locationPickups,
  locationId,
}) {
  console.log('Can Delete in Modal >>>', canDelete)
  console.log('Location Routes in modal >>>', locationRoutes)
  console.log('Location deliveries in Modal >>>', locationDeliveries)
  console.log('Location Pickups in modal >>>', locationPickups)
  const handleDeleteLocation = async () => {
    // remove the location id from the deliveries and pickups
    for (const delivery of locationDeliveries) {
      await getCollection('Deliveries')
        .doc(delivery.id)
        .set({ location_id: '' }, { merge: true })
    }
    for (const pickup of locationPickups) {
      await getCollection('Pickups')
        .doc(pickup.id)
        .set({ location_id: '' }, { merge: true })
    }

    // then remove the location
    await getCollection('Locations').doc(locationId).delete()
  }

  const renderModal = () => {
    if (canDelete) {
      return (
        <div className="modal-main">
          <p>
            All the routes connected with this location are already complete
          </p>
          <div className="modal-buttons">
            <button onClick={() => setOpenModal(false)}>Cancel</button>
            <button onClick={handleDeleteLocation}>Delete Location</button>
          </div>
        </div>
      )
    } else {
      return (
        <div className="modal-main">
          <p>Can not delete</p>
          <button>Confirm</button>
        </div>
      )
    }
  }
  return (
    <div id="Modal">
      <div className="modal-content">
        <span className="close" onClick={() => setOpenModal(false)}>
          &times;
        </span>
        {renderModal()}
      </div>
    </div>
  )
}

export default DeleteLocationModal
