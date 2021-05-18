import React from 'react'
import './TestEnv.scss'

export default function TestEnv() {
  return (
    <main id="TestEnv">
      <h1>Testing Environment</h1>
      <p>
        Users can create and walk through mock routes, modify organizations and
        users, or access Driver view in Test Environment
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
