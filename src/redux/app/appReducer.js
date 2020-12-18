import { createSlice } from '@reduxjs/toolkit'
import { MOBILE_THRESHOLD } from '../../helpers/constants'

// This is a Redux Reducer Slice, which we'll import in src/redux/store.js
// Slices are part of the ReduxJS Toolkit, used to write modern simple redux
// Learn more about Redux Slices:
// https://redux.js.org/tutorials/fundamentals/part-8-modern-redux#writing-slices

const initialState = {
  menu: false,
  modal: false,
  mobile: window.innerWidth < MOBILE_THRESHOLD,
}

const app = createSlice({
  // name of slice of global state
  name: 'app',
  initialState: initialState,
  // these 'reducers' will be exported as functions that can be called from React components
  reducers: {
    setMenu(state, action) {
      return {
        ...state,
        menu: action.payload,
      }
    },
    setModal(state, action) {
      return {
        ...state,
        modal: action.payload,
      }
    },
    resize(state, action) {
      // set mobile to true/false only when the screen width crosses the set width
      if (action.payload.width > MOBILE_THRESHOLD && state.mobile) {
        return { ...state, mobile: false }
      }
      if (action.payload.width < MOBILE_THRESHOLD && !state.mobile) {
        return { ...state, mobile: true }
      } else return state
    },
    reset() {
      // use this to return app state to defaults
      return initialState
    },
  },
})

export const { setMenu, setModal, resize } = app.actions

export default app.reducer
