import { Link, Redirect, useParams } from 'react-router-dom'
import useDeliveryData from '../../hooks/useDeliveryData'
import useRouteData from '../../hooks/useRouteData'
import Loading from '../Loading/Loading'
import './CompletedRoute.scss'

export default function CompletedRoute() {
  const { route_id } = useParams()
  const route = useRouteData(route_id)
  const deliveries = useDeliveryData(d => d.route_id === route_id)

  function calculateWeight() {
    return deliveries
      ? deliveries
          .map(d => (d.report ? d.report.weight || 0 : 0))
          .reduce((a, b) => a + b, 0)
      : 0
  }

  return !route ? (
    <Loading />
  ) : route.status !== 9 ? (
    <Redirect to={`/routes/${route_id}`} />
  ) : (
    <main id="CompletedRoute">
      <i className="fa fa-truck primary" />
      <h1>Route Completed!</h1>
      <p>
        Thank you for driving with Sharing Excess! You rescued{' '}
        <span>{calculateWeight()}lbs.</span> of food today. Go you!
      </p>
      <Link to="/routes">
        <button>view more routes</button>
      </Link>
    </main>
  )
}
