import React, { memo, useEffect, useState } from 'react'
import Loading from '../Loading/Loading'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { Link } from 'react-router-dom'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import moment from 'moment'
import UserIcon from '../../assets/user.svg'
import {
  getCollection,
  getImageFromStorage,
  isValidURL,
} from '../../helpers/helpers'
import './Rescues.scss'
import { RESCUE_STATUSES } from '../../helpers/constants'
import { GoBack } from '../../helpers/components'
import { isValidRescue } from './utils'

function Rescues() {
  const [showCompleted, setShowCompleted] = useState(false)
  const [raw_rescue_data = []] = useCollectionData(
    firebase
      .firestore()
      .collection('Rescues')
      .orderBy('pickup_timestamp', 'desc')
      .limit(100)
  )
  const [rescues, setRescues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function addData() {
      const full_data = []
      for (const r of raw_rescue_data.filter(r => isValidRescue(r))) {
        const rescue = JSON.parse(JSON.stringify(r))
        const pickup_org_ref = await await getCollection('Organizations')
          .doc(r.pickup_org_id)
          .get()
        rescue.pickup_org = pickup_org_ref.data()
        const delivery_org_ref = await getCollection('Organizations')
          .doc(r.delivery_org_id)
          .get()
        rescue.delivery_org = delivery_org_ref.data()
        if (r.driver_id) {
          const driver_ref = await getCollection('Users').doc(r.driver_id).get()
          const driver = driver_ref.data()
          if (driver.icon && !isValidURL(driver.icon)) {
            driver.icon = await getImageFromStorage(driver.icon)
          }
          rescue.driver = driver
        }
        if (rescue.pickup_org && rescue.delivery_org) {
          full_data.push(rescue)
        }
      }
      setRescues(full_data)
      setLoading(false)
    }
    raw_rescue_data.length && addData()
  }, [raw_rescue_data])

  function filterByCompleted(array) {
    const status_limit = showCompleted ? 10 : 8
    return array.filter(i => i.status < status_limit)
  }

  return (
    <main id="Rescues">
      <GoBack url="/" label="back to home" />
      <section id="RescuesHeader">
        <h1>All Rescues</h1>
        <button
          className="secondary"
          onClick={() => setShowCompleted(!showCompleted)}
        >
          {showCompleted ? 'Hide Completed' : 'Show Completed'}
        </button>
      </section>
      {loading ? (
        <Loading text="Loading your rescues" />
      ) : filterByCompleted(rescues).length ? (
        filterByCompleted(rescues).map(r => (
          <Link key={r.id} className="wrapper" to={`rescues/${r.id}`}>
            <div className="Rescue">
              <h6>ID: {r.id.split('-')[0]}</h6>
              <h3>{r.pickup_org.name}</h3>
              <p className="status">{RESCUE_STATUSES[r.status]}</p>
              <p>{moment(r.pickup_timestamp).format('ddd, MMM Do, h:mm a')}</p>
              {r.driver && (
                <img src={r.driver.icon || UserIcon} alt={r.driver.name} />
              )}
            </div>
          </Link>
        ))
      ) : (
        <>
          <p id="no-rescues">No currently scheduled rescues!</p>
          <Link to="/create">
            <button>create new rescue</button>
          </Link>
        </>
      )}
    </main>
  )
}

export default memo(Rescues)
