import { createSlice } from '@reduxjs/toolkit'

const auth = createSlice({
  name: 'auth',
  initialState: null,
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
