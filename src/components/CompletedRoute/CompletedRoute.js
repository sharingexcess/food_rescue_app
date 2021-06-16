import { Link, Redirect, useParams } from 'react-router-dom'
import useDeliveryData from '../../hooks/useDeliveryData'
import usePickupData from '../../hooks/usePickupData'
import useRouteData from '../../hooks/useRouteData'
import Loading from '../Loading/Loading'
import './CompletedRoute.scss'

export default function CompletedRoute() {
  const { route_id } = useParams()
  const route = useRouteData(route_id)
  const deliveries = useDeliveryData(d => d.route_id === route_id)
  const pickups = usePickupData(p => p.route_id === route_id)

  function calculateWeight() {
    return deliveries
      ? deliveries
          .map(d => (d.report ? d.report.weight : 0))
          .reduce((a, b) => a + b, 0)
      : 0
  }

  function calculatedMileage() {
    const pickupMileage = pickups
      ? pickups
          .map(p => (p.report ? p.report.mileage : 0))
          .reduce((a, b) => a + b, 0)
      : 0
    const deliveryMileage = deliveries
      ? deliveries
          .map(d => (d.report ? d.report.weight : 0))
          .reduce((a, b) => a + b, 0)
      : 0
    return pickupMileage + deliveryMileage
  }

  return !route ? (
    <Loading />
  ) : route.status !== 9 ? (
    <Redirect to={`/routes/${route_id}`} />
  ) : (
    <main id="CompletedRoute">
      <i className="fa fa-truck primary" />
      <h1>Route Completed!</h1>
      <p>Thank you for driving with Sharing Excess!</p>
      <p>
        {' '}
        You rescued <span>{calculateWeight()} lbs.</span> of food and traveled{' '}
        <span>{calculatedMileage()} miles</span> today. Go you!
      </p>
      <Link to="/routes">
        <button>view more routes</button>
      </Link>
    </main>
  )
}
