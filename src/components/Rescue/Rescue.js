import React, { useState } from 'react'
import { Link, useHistory, useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import Loading from '../Loading/Loading'
import { useDocumentData } from 'react-firebase-hooks/firestore'
import moment from 'moment'
import './Rescue.scss'
import { generateDirectionsLink } from './utils'
import Spacer from '../Spacer/Spacer'
import { RESCUE_STATUSES } from '../../helpers/constants'

export default function Rescue() {
  const { id } = useParams()
  const history = useHistory()
  // Using the useDocument hook from react-firebase-hooks. Reference:
  // https://github.com/csfrequency/react-firebase-hooks/tree/316301a128a9c5fbe41ac2c4fd393c972baf64da/firestore#usedocument
  const [rescue = {}, loading] = useDocumentData(
    firebase.firestore().collection('Rescues').doc(id)
  )
  const [driver = {}, loading_driver] = useDocumentData(
    rescue.driver_id
      ? firebase.firestore().collection('Users').doc(rescue.driver_id)
      : null
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
  const [willDelete, setWillDelete] = useState()
  const [willComplete, setWillComplete] = useState()

  function handleDelete() {
    firebase
      .firestore()
      .collection('Rescues')
      .doc(id)
      .delete()
      .then(() => history.push('/rescues'))
      .catch(e => console.error('Error removing document: ', e))
  }

  function handleComplete() {
    firebase
      .firestore()
      .collection('Rescues')
      .doc(id)
      .set({ status: 9 }, { merge: true })
      .then(() => history.push('/schedule'))
      .catch(e => console.error('Error removing document: ', e))
  }

  function Driver() {
    const name = driver.name
      ? driver.name
      : loading_driver
      ? 'Loading driver info...'
      : 'No Driver Assigned'
    const time = moment(rescue.pickup_timestamp).format('ddd, MMM Do, h:mm a')
    return (
      <h3>
        {driver.icon && <img src={driver.icon} alt={driver.name} />}
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
            className="back"
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
            className="back"
          >
            Get Directions{' >'}
          </a>
        </div>
      </>
    )
  }

  return Object.keys(rescue).length ? ( // if rescue object is populated, render
    <div id="Rescue">
      <Link className="back" to="/rescues">
        {'< '}back to rescues
      </Link>
      <h1>{RESCUE_STATUSES[rescue.status]} Rescue</h1>
      <Driver />
      <br />
      <Locations />
      <br />
      {rescue.status === 6 ? (
        willComplete ? (
          <button className="complete" onClick={handleComplete}>
            are you sure?
          </button>
        ) : (
          <button className="complete" onClick={() => setWillComplete(true)}>
            make rescue completed
          </button>
        )
      ) : null}
      <Link to={`/rescues/${id}/report`}>
        <button>open food rescue report</button>
      </Link>
      {willDelete ? (
        <button className="delete" onClick={handleDelete}>
          are you sure?
        </button>
      ) : (
        <button className="delete" onClick={() => setWillDelete(true)}>
          delete rescue
        </button>
      )}
    </div>
  ) : loading ? (
    <Loading text="Loading rescue info" />
  ) : (
    <Loading text="Error fetching rescue" />
  )
}
