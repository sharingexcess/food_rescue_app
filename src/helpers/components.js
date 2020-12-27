import { Link } from 'react-router-dom'

export function ExternalLink({ url, children }) {
  return (
    <a target="_blank" rel="noopener noreferrer" href={url}>
      {children}
    </a>
  )
}

export function GoBack({ url, label }) {
  return (
    <Link className="back" to={url}>
      {'< '}
      {label}
    </Link>
  )
}
