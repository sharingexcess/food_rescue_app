import React, { memo, useEffect } from 'react'
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore'
import firebase from 'firebase/app'
import Loading from '../Loading/Loading'
import { Link, useParams } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import { formatPhoneNumber, getImageFromStorage } from '../../helpers/helpers'
import './Organization.scss'

function Organization() {
  const { id } = useParams()
  const [org = {}, loading] = useDocumentData(
    firebase.firestore().collection('Organizations').doc(id)
  )
  const [locations = []] = useCollectionData(
    firebase
      .firestore()
      .collection('Organizations')
      .doc(id)
      .collection('Locations')
  )

  useEffect(() => {
    async function getOrgImage() {
      const image = await getImageFromStorage(org.icon)
      const element = document.getElementById('org-icon')
      element.src = image
    }
    org.icon && getOrgImage()
  }, [org])

  function sortByPrimary(array) {
    return array.sort((x, y) => (x === y ? 0 : x ? 1 : -1))
  }

  return loading ? (
    <Loading text="Loading your organization" />
  ) : (
    <main id="Organization">
      <Link className="back" to="/admin/organizations">
        {'< '} back to organizations
      </Link>
      <div>
        <img src={UserIcon} id="org-icon" alt={org.name} />
        <div>
          <h1>{org.name}</h1>
          <p>
            <i className="fa fa-user" />
            Contact: {org.default_contact_name || 'unlisted'}
          </p>
          <p>
            <a
              href={`tel:${org.default_contact_phone}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-phone" />
              {formatPhoneNumber(org.default_contact_phone) ||
                'no contact phone'}
            </a>
          </p>
          <p>
            <a
              href={`mailto:${org.default_contact_email}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-envelope" />
              {org.default_contact_email || 'no contact email'}
            </a>
          </p>
          <Link to={`/admin/organizations/${id}/edit`}>
            <button className="secondary">Edit Org Details{' >'}</button>
          </Link>
        </div>
      </div>
      {locations.length ? (
        <>
          <h4>Locations</h4>
          {sortByPrimary(locations).map(loc => (
            <Link
              key={loc.name}
              className="wrapper"
              to={`/admin/organizations/${id}/location/${loc.id}`}
            >
              <section className="Location">
                <h5>{loc.name}</h5>
                {loc.is_primary && <i className="primary fa fa-star" />}
                <p>{loc.address1}</p>
                {loc.address2 && <p>{loc.address2}</p>}
                <p>
                  {loc.city}, {loc.state} {loc.zip_code}
                </p>
              </section>
            </Link>
          ))}
        </>
      ) : null}
      <br />
      <Link
        className="wrapper"
        to={`/admin/organizations/${id}/create-location`}
      >
        <button>+ add location</button>
      </Link>
    </main>
  )
}

export default memo(Organization)
