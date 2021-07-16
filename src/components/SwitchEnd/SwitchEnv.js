import React from 'react'
import './SwitchEnv.scss'

function TestEnv() {
  return (
    <main id="SwitchEnv">
      <h1>Test Environment</h1>
      <p>
        Create and walk through routes, modify organizations and users, or
        access Driver view in Test Environment
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

function ProdEnv() {
  return (
    <main id="SwitchEnv">
      <h1>Prod Environment</h1>
      <p>Go Back to Production Environment</p>
      <a
        target="_blank"
        rel="noopener noreferrer"
        href="https://sharingexcess.web.app/"
      >
        <button>Go to production environment</button>
      </a>
    </main>
  )
}

export default function SwithEnv() {
  return (
    <>
      {window.location.href ===
      'https://sharingexcess.web.app/admin/switchenv' ? (
        <TestEnv />
      ) : (
        <ProdEnv />
      )}
    </>
  )
}
