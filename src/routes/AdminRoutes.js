import React, { useContext, lazy } from 'react'
import { Route, Switch } from 'react-router-dom'
import { AuthContext } from '../components/Auth/Auth'
import Error from '../components/Error/Error'

export default function AdminRoutes() {
  const { admin } = useContext(AuthContext)
  // We dynamically import all admin routes for security
  // React lazy lets us wait to load the admin component code until the user is authenticated
  const Organizations = lazy(() => {
    return admin ? import('../components/Organizations/Organizations') : null
  })
  const Organization = lazy(() => {
    return admin ? import('../components/Organization/Organization') : null
  })
  const EditOrganization = lazy(() => {
    return admin
      ? import('../components/EditOrganization/EditOrganization')
      : null
  })
  const EditLocation = lazy(() => {
    return admin ? import('../components/EditLocation/EditLocation') : null
  })
  const Users = lazy(() => {
    return admin ? import('../components/Users/Users') : null
  })
  const User = lazy(() => {
    return admin ? import('../components/User/User') : null
  })

  // AdminRoute is a wrapper function around Route to ensure that no admin components
  // can render if the user is not authenticated as an admin
  function AdminRoute({ children, exact, path }) {
    return admin ? (
      <Route exact={exact} path={path}>
        {children}
      </Route>
    ) : (
      <Error />
    )
  }

  return (
    <Switch>
      <AdminRoute exact path="/admin/create-organization">
        <EditOrganization />
      </AdminRoute>
      <AdminRoute exact path="/admin/organizations">
        <Organizations />
      </AdminRoute>
      <AdminRoute exact path="/admin/organizations/:id">
        <Organization />
      </AdminRoute>
      <AdminRoute exact path="/admin/organizations/:id/edit">
        <EditOrganization />
      </AdminRoute>
      <AdminRoute exact path="/admin/organizations/:id/create-location">
        <EditLocation />
      </AdminRoute>
      <AdminRoute exact path="/admin/organizations/:id/location/:loc_id">
        <EditLocation />
      </AdminRoute>
      <AdminRoute exact path="/admin/users">
        <Users />
      </AdminRoute>
      <AdminRoute exact path="/admin/users/:id">
        <User />
      </AdminRoute>
    </Switch>
  )
}
