import React from 'react'
import { Route, Switch } from 'react-router-dom'
import { useAuthContext } from '../components/Auth/Auth'
import Error from '../components/Error/Error'
import EditRoute from '../components/EditRoute/EditRoute'
import EditOrganization from '../components/EditOrganization/EditOrganization'
import Organizations from '../components/Organizations/Organizations'
import EditLocation from '../components/EditLocation/EditLocation'
import Users from '../components/Users/Users'
import User from '../components/User/User'
import Organization from '../components/Organization/Organization'
import Analytics from '../components/Analytics/Analytics'
import SwithEnv from '../components/SwitchEnd/SwitchEnv'

export default function AdminRoutes() {
  // the AuthContext contains a value 'admin' which tells us if the current authenticated user is an admin or not
  const { admin } = useAuthContext()

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
      {/* Wrap in a switch so that only one route can render at a time */}
      <AdminRoute exact path="/admin/create-route">
        <EditRoute />
      </AdminRoute>
      <AdminRoute exact path="/admin/create-organization">
        <EditOrganization />
      </AdminRoute>
      <AdminRoute exact path="/admin/organizations">
        <Organizations />
      </AdminRoute>
      <AdminRoute exact path="/admin/organizations/:id">
        {/* adding a colon creates a variable url parameter */}
        {/* we can access that variable using const { id } = useParams() */}
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
      <AdminRoute exact path="/admin/analytics">
        <Analytics />
      </AdminRoute>
      <AdminRoute exact path="/admin/switchenv">
        <SwithEnv />
      </AdminRoute>
      <Route>
        {/* This route has no path, and therefore will be the 'catch all' */}
        <Error />
        {/* this 404 page component will render if the url does not match any other routes */}
      </Route>
    </Switch>
  )
}
