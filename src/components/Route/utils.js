export const WarningText = ({ text }) => {
  return (
    <div className="warning-text">
      <p>{text}</p>
    </div>
  )
}

export function ConfirmationModal({ openModal, text, onConfirm, onClose }) {
  return openModal ? (
    <div id="confirmation modal" class="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>
          &times;
        </span>
        <span>{text}</span>
        <button className="confirm driver" onClick={onConfirm}>
          confirm
        </button>
      </div>
    </div>
  ) : null
}

export function generateDirectionsLink(addressObj) {
  const base_url = 'https://www.google.com/maps/dir/?api=1&destination='
  return `${base_url}${addressObj.address1}+${addressObj.city}+${addressObj.state}+${addressObj.zip_code}`
}

export function allFoodDelivered(stops) {
  if (stops.length === 0) {
    return false
  }
  let finalWeight = 0
  for (const stop of stops) {
    if (!stop.report) {
      return false
    }
    stop.type === 'pickup'
      ? (finalWeight += stop.report.weight)
      : (finalWeight -= stop.report.weight)
  }
  return finalWeight === 0
}
