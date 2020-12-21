import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import firebase from 'firebase/app'
import 'firebase/firestore'
import './Rescue.scss'
import Loading from '../Loading/Loading'

export default function Rescue() {
  const { id } = useParams()
  const [rescue, setRescue] = useState({})
  const [pickupOrg, setPickupOrg] = useState({})
  const [deliveryOrg, setDeliveryOrg] = useState({})
  const [driver, setDriver] = useState({})
  const [loading, setLoading] = useState()

  useEffect(() => {
    firebase
      .firestore()
      .collection('Rescues')
      .doc(id)
      .get()
      .then(doc => {
        doc.exists && setRescue({ id, ...doc.data() })
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    rescue.pickup_org_id &&
      firebase
        .firestore()
        .collection('Organizations')
        .doc(rescue.pickup_org_id)
        .get()
        .then(doc => {
          doc.exists && setPickupOrg(doc.data())
        })
    rescue.pickup_org_id &&
      firebase
        .firestore()
        .collection('Organizations')
        .doc(rescue.delivery_org_id)
        .get()
        .then(doc => {
          doc.exists && setDeliveryOrg(doc.data())
        })
    rescue.driver_id &&
      firebase
        .firestore()
        .collection('Users')
        .doc(rescue.driver_id)
        .get()
        .then(doc => {
          doc.exists && setDriver(doc.data())
        })
  }, [rescue.pickup_org_id, rescue.delivery_org_id, rescue.driver_id])

  return rescue.id ? (
    <div id="Rescue">
      <h3>Scheduled Rescue</h3>
      {Object.keys(rescue).map(field => (
        <div key={field}>
          <p>{field}: </p>
          <p style={{ color: '#fff' }}>{rescue[field].toString()}</p>
        </div>
      ))}
      <h3>Pickup Organization</h3>
      {Object.keys(pickupOrg).map(field => (
        <div key={field}>
          <p>{field}: </p>
          <p style={{ color: '#fff' }}>{pickupOrg[field].toString()}</p>
        </div>
      ))}
      <h3>Delivery Organization</h3>
      {Object.keys(deliveryOrg).map(field => (
        <div key={field}>
          <p>{field}: </p>
          <p style={{ color: '#fff' }}>{deliveryOrg[field].toString()}</p>
        </div>
      ))}
      <h3>Driver Info</h3>
      {Object.keys(driver).map(field => (
        <div key={field}>
          <p>{field}: </p>
          <p style={{ color: '#fff' }}>
            {field === 'icon' ? (
              <img src={driver[field]} alt="driver" />
            ) : (
              driver[field]
            )}
          </p>
        </div>
      ))}
    </div>
  ) : loading ? (
    <Loading text="Loading rescue info..." />
  ) : (
    <Loading text="Error fetching rescue!" />
  )
}
