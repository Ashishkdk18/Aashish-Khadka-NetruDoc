import { createSlice } from '@reduxjs/toolkit'

interface PrescriptionState {
  prescriptions: any[]
  loading: boolean
  error: string | null
}

const initialState: PrescriptionState = {
  prescriptions: [],
  loading: false,
  error: null,
}

const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { clearError } = prescriptionSlice.actions
export default prescriptionSlice.reducer
