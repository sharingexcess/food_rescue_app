import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/Auth/Auth'
import Error from '../components/Error/Error'

export function ProtectedRoutes({ children }) {
  const { permission } = useAuth()

  return permission ? (
    children
  ) : (
    <Error message="You do not have permission to view this page yet!" />
  )
}

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
