import React from 'react'
import './Modal.scss'
function Modal({ setOpenModal }) {
  return (
    <div id="Modal">
      <div className="modal-content">
        <span className="close" onClick={() => setOpenModal(false)}>
          &times;
        </span>
        <p>Some text in the Modal..</p>
      </div>
    </div>
  )
}

export default Modal
