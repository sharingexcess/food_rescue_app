import React from 'react'
import './RoutesHeaders.scss'

export default function RouteHeader({ text }) {
    return (
        <header id="RouteHeader">
            <h1>
                {text}
            </h1>
        </header>
    )
}