import { createSlice } from '@reduxjs/toolkit'

interface ConsultationState {
  currentConsultation: any
  loading: boolean
  error: string | null
}

const initialState: ConsultationState = {
  currentConsultation: null,
  loading: false,
  error: null,
}

const consultationSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
})

export const { clearError } = consultationSlice.actions
export default consultationSlice.reducer
