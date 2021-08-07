import { Link } from 'react-router-dom'
import { ExternalLink } from '../../helpers/components'
import { generateDirectionsLink } from './utils'

// Instruction to finish route for driver after they filled all the reports
export const FinishRouteInstruction = ({ text }) => {
  return (
    <div className="warning-text">
      <p>{text}</p>
    </div>
  )
}

// Confirmation modal pops up when admin changes driver for a route
export function ChangeDriverModal({ openModal, text, onConfirm, onClose }) {
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

// warning modal pops up when the driver trying to complete the delivery report in less than 30 minutes into the route
export function WarningModal({
  stop,
  history,
  location,
  route_id,
  onShowModal,
}) {
  function handleOpenReport() {
    const baseURL = location.pathname.includes('routes') ? 'routes' : 'history'
    history.push(`/${baseURL}/${route_id}/${stop.type}/${stop.id}`)
  }
  return (
    <div className="warning modal">
      <div className="modal-content">
        <div className="footer">
          <p>
            <button
              className="red"
              onClick={() => {
                onShowModal()
                handleOpenReport()
              }}
            >
              x
            </button>
          </p>
        </div>
        <div className="header">
          <p>
            Woah there, partner. You zoomed through that route! In the future,
            be sure to fill out pickup and delivery reports in real time as you
            complete the route. This is especially important for food safety
            purposes and accurate data tracking.
          </p>
        </div>
      </div>
    </div>
  )
}

// Modal contains contact information
export function ContactModal({ onShowModal }) {
  return (
    <div className="warning modal">
      <div className="modal-content">
        <div className="footer">
          <p>
            <button
              className="red"
              onClick={() => {
                onShowModal()
              }}
            >
              x
            </button>
          </p>
        </div>
        <div className="header">
          <p>
            Please contact Hannah at{' '}
            <ExternalLink url="tel:1-833-7424-7397">
              1 (833) 7424-7397
            </ExternalLink>{' '}
            for further assist
          </p>
        </div>
      </div>
    </div>
  )
}

// Route components
export function StatusIndicator({ stop, location, route_id }) {
  let icon
  if (stop.status === 9) {
    icon = <i id="StatusIndicator" className="fa fa-check" />
  } else if (stop.status === 0) {
    icon = <i id="StatusIndicator" className="fa fa-times" />
  } else if (stop.status === 1) {
    icon = <i id="StatusIndicator" className="fa fa-clock-o" />
  }
  return icon ? (
    <Link
      to={`/${location.pathname.split('/')[1]}/${route_id}/${stop.type}/${
        stop.id
      }`}
    >
      {icon}
    </Link>
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

export function DirectionsButton({ stop, route }) {
  function handleOpenDirections() {
    window.open(generateDirectionsLink(stop.location), '_blank')
  }

  if (route.status < 3) return null
  if (stop.status === 1) {
    return (
      <button className="directions" onClick={handleOpenDirections}>
        Get Directions
      </button>
    )
  } else return null
}
