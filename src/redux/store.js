import { configureStore } from '@reduxjs/toolkit'
import appReducer from './app/appReducer'
import appHandler from './app/appHandler'

// This is our root redux object, created using configureStore method
// configureStore is part of the ReduxJS Toolkit, a library used to write modern simple redux
// Learn more about configureStore:
// https://redux.js.org/tutorials/fundamentals/part-8-modern-redux#using-configurestore

const store = configureStore({
  // import slices for reducers
  reducer: {
    app: appReducer,
  },
  // import handlers for middleware
  middleware: [appHandler],
})

export default store
