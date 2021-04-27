import React, { memo, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import UserIcon from '../../assets/user.svg'
import Loading from '../Loading/Loading'
import {
  handleOrgIcon,
  sortByPrimary,
  OrganizationContact,
  OrganizationEmail,
  OrganizationPhone,
  OrganizationHours,
} from './utils'
import useOrganizationData from '../../hooks/useOrganizationData'
import useLocationData from '../../hooks/useLocationData'
import Header from '../Header/Header'
import './Organization.scss'

function Organization() {
  // get org id from url parameters
  const { id } = useParams()
  // get org data using id from firestore data
  const org = useOrganizationData(id) || {}
  // get org's locations from firestore data
  const locations = useLocationData(i => i.org_id === id) || []
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
              <h2>{loc.name}</h2>
              {loc.id === org.primary_location && (
                <i className="primary fa fa-star" />
              )}
              {loc.is_philabundance_partner === true && (
                <p className="philabundance">Philabundance Partner</p>
              )}
              <p>{loc.address1}</p>
              {loc.address2 && <p>{loc.address2}</p>}
              <p>
                {loc.city}, {loc.state} {loc.zip_code}
              </p>
              <OrganizationHours org={loc} org_type={org.org_type} />
            </section>
          </Link>
        ))}
      </>
    )
  }

  if (!org) return <Loading text="Loading your organization" />
  return (
    <main id="Organization">
      <Header text="Manage Org" />
      <div>
        <img src={orgIconFullUrl || UserIcon} id="org-icon" alt={org.name} />
        <div>
          <div>
            <h3>{org.name}</h3>
            <h2 className={org.org_type === 'donor' ? 'donor' : 'recipient'}>
              {org.org_type}
            </h2>
          </div>
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
