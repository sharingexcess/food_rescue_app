import React from 'react'
import './DeleteLocationModal.scss'
function DeleteLocationModal({
  setOpenModal,
  canDelete,
  locationRoutes,
  locationDeliveries,
  locationPickups,
}) {
  console.log('Can Delete in Modal >>>', canDelete)
  console.log('Location Routes in modal >>>', locationRoutes)
  console.log('Location deliveries in Modal >>>', locationDeliveries)
  console.log('Location Pickups in modal >>>', locationPickups)
  const handleDeleteLocation = () => {
    // remove the location id from the deliveries and pickups
    // then remove the location
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
            <button>Delete Location</button>
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
