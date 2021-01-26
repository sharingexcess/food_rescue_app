import React from 'react'
import './Footer.scss'

export default function Footer(props) {
  return (
    <footer id="Footer">
      <p>{props.text}</p>
    </footer>
  )
}
