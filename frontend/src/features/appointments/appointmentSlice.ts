import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  reason: string
  notes?: string
}

interface AppointmentState {
  appointments: Appointment[]
  currentAppointment: Appointment | null
  loading: boolean
  error: string | null
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  loading: false,
  error: null,
}

export const getAppointments = createAsyncThunk(
  'appointments/getAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/appointments')
      return res.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments')
    }
  }
)

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAppointments.pending, (state) => {
        state.loading = true
      })
      .addCase(getAppointments.fulfilled, (state, action) => {
        state.loading = false
        state.appointments = action.payload
        state.error = null
      })
      .addCase(getAppointments.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = appointmentSlice.actions
export default appointmentSlice.reducer
