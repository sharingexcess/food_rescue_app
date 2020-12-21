import React from 'react'
import { Link, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Loading from '../Loading/Loading'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import moment from 'moment'
import './Rescue.scss'
import { generateDirectionsLink, Spacer } from './utils'

export default function Rescue() {
  const { id } = useParams()
  // Using the useDocument hook from react-firebase-hooks. Reference:
  // https://github.com/csfrequency/react-firebase-hooks/tree/316301a128a9c5fbe41ac2c4fd393c972baf64da/firestore#usedocument
  const [rescue = {}, loading] = useDocumentData(
    firebase.firestore().collection('Rescues').doc(id)
  )
  const [driver = {}, loading_driver] = useDocumentData(
    firebase.firestore().collection('Users').doc(rescue.driver_id)
  )
  const [pickup_org = {}] = useDocumentData(
    firebase.firestore().collection('Organizations').doc(rescue.pickup_org_id)
  )
  const [delivery_org = {}] = useDocumentData(
    firebase.firestore().collection('Organizations').doc(rescue.delivery_org_id)
  )
  const [pickup_location = {}] = useDocumentData(
    firebase
      .firestore()
      .collection('Organizations')
      .doc(rescue.pickup_org_id)
      .collection('Locations')
      .doc(rescue.pickup_location_id)
  )
  const [delivery_location = {}] = useDocumentData(
    firebase
      .firestore()
      .collection('Organizations')
      .doc(rescue.delivery_org_id)
      .collection('Locations')
      .doc(rescue.delivery_location_id)
  )

  function Driver() {
    const name = driver.name
      ? driver.name
      : loading_driver
      ? 'Loading driver info...'
      : 'No Driver Assigned'
    const time = moment(rescue.pickup_timestamp).format('ddd, MMM Do, h:mm a')
    return (
      <h3>
        {name} - {time}
      </h3>
    )
  }

  function Locations() {
    const pickup_directions_url = generateDirectionsLink(pickup_location)
    const delivery_directions_url = generateDirectionsLink(delivery_location)
    return (
      <>
        <div className="Location">
          <h4>
            {pickup_org.name}{' '}
            {pickup_location.name && <span>({pickup_location.name})</span>}
          </h4>
          <h6>{moment(rescue.pickup_timestamp).format('h:mm a')}</h6>
          <p>
            {pickup_location.address1}, {pickup_location.city},{' '}
            {pickup_location.state} {pickup_location.zip_code}
          </p>
          <a
            href={pickup_directions_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions{' >'}
          </a>
        </div>
        <Spacer />
        <div className="Location">
          <h4>
            {delivery_org.name}
            {delivery_location.name && <span>({delivery_location.name})</span>}
          </h4>
          <h6>{moment(rescue.delivery_timestamp).format('h:mm a')}</h6>
          <p>
            {delivery_location.address1}, {delivery_location.city},{' '}
            {delivery_location.state} {delivery_location.zip_code}
          </p>
          <a
            href={delivery_directions_url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get Directions{' >'}
          </a>
        </div>
      </>
    )
  }

  return Object.keys(rescue).length ? ( // if rescue object is populated, render
    <div id="Rescue">
      <Link to="/schedule">{'< '}back to schedule</Link>
      <h1>Scheduled Rescue</h1>
      <Driver />
      <br />
      <Locations />
      <Link to={`/rescues/${id}/report`}>
        <button>start food rescue report</button>
      </Link>
    </div>
  ) : loading ? (
    <Loading text="Loading rescue info..." />
  ) : (
    <Loading text="Error fetching rescue!" />
  )
}
