import { configureStore } from '@reduxjs/toolkit'
import appReducer from './app/appReducer'
import appHandler from './app/appHandler'
import authReducer from './auth/authReducer'
import authHandler from './auth/authHandler'

const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
  },
  middleware: [appHandler, authHandler],
})

export default store
