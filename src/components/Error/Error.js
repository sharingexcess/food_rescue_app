import React from 'react'
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
      <a href="/">
        <button>back to home page</button>
      </a>
    </main>
  )
}
