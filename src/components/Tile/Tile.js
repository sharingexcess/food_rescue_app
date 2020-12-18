import React from 'react'
import { Link } from 'react-router-dom'
import './Tile.scss'

export default function Tile({ name, icon, link, color }) {
  return (
    <Link className="Tile" id={name} to={link}>
      <div>
        <i className={`fa ${icon}`} />
        <h4>{name}</h4>
      </div>
    </Link>
  )
}
