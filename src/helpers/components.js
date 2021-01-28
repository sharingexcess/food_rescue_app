import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export function ExternalLink({ url, children }) {
  return (
    <a target="_blank" rel="noreferrer" href={url}>
      {children}
    </a>
  )
}

export function GoBack({ url }) {
  return (
    <Link to={url} className="back">
      {'< '}back
    </Link>
  )
}

export default function Ellipsis({ style }) {
  const [text, setText] = useState('.')

  useEffect(() => {
    const int = window.setInterval(() => {
      setText(text.length === 3 ? '.' : text + '.')
    }, 400)
    return () => window.clearInterval(int)
  }, [text])

  return (
    <div
      style={{
        display: 'inline-block',
        width: '1.1rem',
        textAlign: 'left',
        ...style,
      }}
    >
      {text}
    </div>
  )
}
