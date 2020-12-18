import { createSlice } from '@reduxjs/toolkit'
import { MOBILE_THRESHOLD } from '../../helpers/constants'

const initialState = {
  menu: false,
  modal: false,
  mobile: window.innerWidth < MOBILE_THRESHOLD,
}

const app = createSlice({
  name: 'app',
  initialState,
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
      if (action.payload.width > MOBILE_THRESHOLD && state.mobile) {
        return { ...state, mobile: false }
      }
      if (action.payload.width < MOBILE_THRESHOLD && !state.mobile) {
        return { ...state, mobile: true }
      } else return state
    },
    reset() {
      return initialState
    },
  },
})

export const { setMenu, setModal, resize } = app.actions

export default app.reducer
