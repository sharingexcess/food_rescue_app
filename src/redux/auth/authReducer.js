import { createSlice } from '@reduxjs/toolkit'

// This is a Redux Reducer Slice, which we'll import in src/redux/store.js
// Slices are part of the ReduxJS Toolkit, used to write modern simple redux
// Learn more about Redux Slices:
// https://redux.js.org/tutorials/fundamentals/part-8-modern-redux#writing-slices

const auth = createSlice({
  // name of slice of global state
  name: 'auth',
  initialState: {},
  // these 'reducers' will be exported as functions that can be called from React components
  reducers: {
    login(state, action) {
      return { ...state, ...action.payload }
    },
    logout(state, action) {
      return {}
    },
    updateAuth(state, action) {
      return { ...state, ...action.payload }
    },
  },
})
export const { login, logout, updateAuth } = auth.actions

export default auth.reducer
