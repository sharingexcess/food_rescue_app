import React from 'react'
import { Link } from 'react-router-dom'
import './Error.scss'

export default function Error({ crash }) {
  return (
    <main id="Error">
      <h1>Uh oh!</h1>
      <p>
        {crash
          ? 'Uh oh... looks like something broke on this page.'
          : "The page you're looking for may have moved, or doesn't exist."}
      </p>
      <Link to="/">
        <button>back to home page</button>
      </Link>
    </main>
  )
}
