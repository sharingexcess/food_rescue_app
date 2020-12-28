import React from 'react'
import './Loading.scss'
import Logo from '../../assets/logo.svg'
import Ellipsis from '../../helpers/components'

export default function Loading({ text = 'Loading' }) {
  return (
    <div id="Loading">
      <img src={Logo} alt="Sharing Excess Logo" />
      <h1>
        {text}
        <Ellipsis />
      </h1>
    </div>
  )
}
