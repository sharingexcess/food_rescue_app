import React, { memo, useEffect, useState } from 'react'
import {
  useCollectionData,
  useDocumentData,
} from 'react-firebase-hooks/firestore'
import { Link, useParams } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import { getCollection } from '../../helpers/helpers'
import { GoBack } from '../../helpers/components'
import Loading from '../Loading/Loading'
import {
  handleOrgIcon,
  sortByPrimary,
  OrganizationContact,
  OrganizationEmail,
  OrganizationPhone,
} from './utils'
import './Organization.scss'

function Organization() {
  // get org id from url parameters
  const { id } = useParams()
  // get org data using id from firestore data
  const [org = {}, loading] = useDocumentData(
    getCollection('Organizations').doc(id)
  )
  // get org's locations from firestore data
  const [locations = []] = useCollectionData(
    getCollection('Organizations').doc(id).collection('Locations')
  )
  // orgIconFullUrl defines the URL we build based on the path stored in org.icon
  const [orgIconFullUrl, setOrgIconFullUrl] = useState()

  useEffect(() => {
    handleOrgIcon(org.icon, setOrgIconFullUrl)
  }, [org.icon])

  function OrgLocations() {
    if (!locations.length) {
      return (
        <p id="NoLocations">This organization does not have any locations.</p>
      )
    }
    return (
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
    )
  }

  if (loading) return <Loading text="Loading your organization" />
  return (
    <main id="Organization">
      <GoBack url="/admin/organizations" label="back to organizations" />
      <div>
        <img src={orgIconFullUrl || UserIcon} id="org-icon" alt={org.name} />
        <div>
          <h1>{org.name}</h1>
          <OrganizationContact org={org} />
          <OrganizationPhone org={org} />
          <OrganizationEmail org={org} />
          <Link to={`/admin/organizations/${id}/edit`}>
            <button className="secondary">Edit Org Details{' >'}</button>
          </Link>
        </div>
      </div>
      <OrgLocations />
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
