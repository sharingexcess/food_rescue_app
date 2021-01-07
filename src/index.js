import React, { Suspense, useEffect } from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { FIREBASE_CONFIG } from './helpers/constants'
import firebase from 'firebase/app'
import Header from './components/Header/Header'
import Error from './components/Error/Error'
import Auth from './components/Auth/Auth'
import Menu from './components/Menu/Menu'
import useWidth from './hooks/useWidth'
import { Provider } from 'react-redux'
import { resize } from './redux/app/appReducer'
import store from './redux/store'
import AdminRoutes from './routes/AdminRoutes'
import Loading from './components/Loading/Loading'
import Home from './components/Home/Home'
import PickupReport from './components/PickupReport/PickupReport'
import Profile from './components/Profile/Profile'
import './styles/index.scss'
import Routes from './components/Routes/Routes'
import { Route as DriverRoute } from './components/Route/Route'
import Calendar from './components/Calendar/Calendar'
import DeliveryReport from './components/DeliveryReport/DeliveryReport'

// This function call connects us to Firebase and initializes all of our API access
firebase.initializeApp(FIREBASE_CONFIG)

function App() {
  // this is a state variable that will update whenever the window size changes
  const width = useWidth()

  // useEffect function will run when the component is mounted,
  // then each time the component's state changes, and finally when a component is un-mounting.
  // The first argument is the function to run on change, and the second is an array of dependencies.
  // If the second argument is present, useEffect will only run when those values change, not all state.
  // Read more: https://reactjs.org/docs/hooks-effect.html
  useEffect(() => {
    // any time the screen width changes, handle the resize with this dispatch call
    store.dispatch(resize({ width }))
  }, [width])

  return (
    <Suspense fallback={<Loading />}>
      {/* 
        Suspense component provides a fallback for any dynamically loaded components (see AdminRoutes.js) that aren't loaded yet
        This follows the practice of Code Splitting. Read more here: https://reactjs.org/docs/code-splitting.html
      */}
      <Provider store={store}>
        {/* This Provider component wraps our app in a component that gives access to the Redux store */}
        <Auth>
          {/* Auth component handles login and will show a login page if no user is authenticated */}
          <BrowserRouter>
            {/* Header and Menu will be rendered on all routes because it is outside the Switch */}
            <Header />
            <Menu />
            {/* Switch will only allows the first matching route to be rendered */}
            <Switch>
              <Route exact path="/">
                <Home />
              </Route>
              <Route exact path="/calendar">
                <Calendar />
              </Route>
              <Route exact path="/routes">
                <Routes />
              </Route>
              <Route exact path="/routes/:route_id">
                <DriverRoute />
              </Route>
              <Route exact path="/routes/:route_id/pickup/:pickup_id/report">
                <PickupReport />
              </Route>
              <Route
                exact
                path="/routes/:route_id/delivery/:delivery_id/report"
              >
                <DeliveryReport />
              </Route>
              <Route exact path="/profile">
                <Profile />
              </Route>
              {/* We import all the Admin Routes from a separate file for security, see routes/AdminRoutes.js */}
              <Route path="/admin">
                <AdminRoutes />
              </Route>
              <Route>
                {/* This route has no path, and therefore will be the 'catch all' */}
                <Error />
                {/* this 404 page component will render if the url does not match any other routes */}
              </Route>
            </Switch>
          </BrowserRouter>
        </Auth>
      </Provider>
    </Suspense>
  )
}

// this function call will render our React app into the DOM inside <div id='root'>
// you can find that div in public/index.html
ReactDOM.render(<App />, document.getElementById('root'))
