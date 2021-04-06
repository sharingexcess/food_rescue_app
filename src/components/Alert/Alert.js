import React from 'react'
import './Alert.scss'

function Alert({ alertMessage }) {
  return (
    <div id="Alert">
      <p>{alertMessage}</p>
    </div>
  )
}

export default Alert
