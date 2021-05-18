import React from 'react'
import './TestEnv.scss'

export default function TestEnv() {
  return (
    <main id="TestEnv">
      <h1>Testing Environment</h1>
      <p>
        You can create and walkthrough mock routes, modify organizations and
        users on test environment
      </p>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://sharingexcess-dev.web.app/"
      >
        <button>Go to test environment</button>
      </a>
    </main>
  )
}
