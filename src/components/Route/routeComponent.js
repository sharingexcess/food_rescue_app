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

export function StopNotes({ stop }) {
  return stop.status === 1 ? (
    <>
      {stop.location.upon_arrival_instructions ? (
        <h6>
          <span>Instructions: </span>
          {stop.location.upon_arrival_instructions}
        </h6>
      ) : null}
    </>
  ) : [0, 9].includes(stop.status) && stop.report && stop.report.notes ? (
    <h6>
      <span>Notes: </span>
      {stop.report.notes}
    </h6>
  ) : null
}
