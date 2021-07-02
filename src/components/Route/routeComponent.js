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
