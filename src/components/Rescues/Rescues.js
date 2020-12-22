import React, { memo, useEffect, useState } from 'react'
import Loading from '../Loading/Loading'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { Link } from 'react-router-dom'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import moment from 'moment'
import './Rescues.scss'
import { getImageFromStorage, isValidURL } from '../../helpers/helpers'

function Rescues() {
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
      for (const r of raw_rescue_data) {
        const rescue = JSON.parse(JSON.stringify(r))
        const pickup_org_ref = await firebase
          .firestore()
          .collection('Organizations')
          .doc(r.pickup_org_id)
          .get()
        rescue.pickup_org = pickup_org_ref.data()
        const delivery_org_ref = await firebase
          .firestore()
          .collection('Organizations')
          .doc(r.delivery_org_id)
          .get()
        rescue.delivery_org = delivery_org_ref.data()
        if (r.driver_id) {
          const driver_ref = await firebase
            .firestore()
            .collection('Users')
            .doc(r.driver_id)
            .get()
          const driver = driver_ref.data()
          if (!isValidURL(driver.icon)) {
            driver.icon = await getImageFromStorage(driver.icon)
          }
          rescue.driver = driver
        }
        full_data.push(rescue)
      }
      setRescues(full_data)
      setLoading(false)
    }
    raw_rescue_data.length && addData()
  }, [raw_rescue_data])

  return (
    <main id="Rescues">
      <Link className="back" to="/">
        {'< '}back to home
      </Link>
      <section id="RescuesHeader">
        <h1>All Rescues</h1>
        <Link to="/create">
          <button className="secondary">+ New Rescue</button>
        </Link>
      </section>
      {loading ? (
        <Loading text="Loading your rescues" />
      ) : (
        rescues.map(r => (
          <Link key={r.id} className="wrapper" to={`rescues/${r.id}`}>
            <div className="Rescue">
              <h3>{r.pickup_org.name}</h3>
              <p>{moment(r.pickup_timestamp).format('ddd, MMM Do, h:mm a')}</p>
              {r.driver && <img src={r.driver.icon} alt={r.driver.name} />}
            </div>
          </Link>
        ))
      )}
    </main>
  )
}

export default memo(Rescues)
