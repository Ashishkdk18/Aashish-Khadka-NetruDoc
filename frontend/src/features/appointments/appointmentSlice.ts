import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// Enhanced Appointment interface
interface PreConsultationForm {
  symptoms: string[]
  currentMedications: string[]
  allergies: string[]
  medicalHistory: string
  additionalNotes: string
}

interface RescheduleInfo {
  rescheduleRequestedAt: string
  rescheduleRequestedBy: string
  rescheduleReason: string
  rescheduleStatus: 'none' | 'pending' | 'approved' | 'rejected'
  rescheduleNewDate: string
  rescheduleNewTime: string
  rescheduleApprovedAt?: string
  rescheduleApprovedBy?: string
}

interface Appointment {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  reason: string
  notes?: string
  preConsultationForm: PreConsultationForm
  rescheduleRequestedAt?: string
  rescheduleRequestedBy?: string
  rescheduleReason?: string
  rescheduleStatus: 'none' | 'pending' | 'approved' | 'rejected'
  rescheduleNewDate?: string
  rescheduleNewTime?: string
  rescheduleApprovedAt?: string
  rescheduleApprovedBy?: string
  consultationId?: string
  prescriptionId?: string
  paymentId?: string
  cancelledAt?: string
  cancelledBy?: string
  cancellationReason?: string
  createdAt: string
  updatedAt: string
}

// Request/Response interfaces
interface CreateAppointmentRequest {
  doctorId: string
  date: string
  time: string
  reason: string
  notes?: string
  preConsultationForm: PreConsultationForm
}

interface UpdateAppointmentRequest {
  date?: string
  time?: string
  reason?: string
  notes?: string
  preConsultationForm?: PreConsultationForm
}

interface CancelAppointmentRequest {
  reason?: string
}

interface RescheduleAppointmentRequest {
  newDate: string
  newTime: string
  reason: string
}

interface HandleRescheduleRequest {
  action: 'approve' | 'reject'
}

// Enhanced state interface
interface AppointmentState {
  appointments: Appointment[]
  currentAppointment: Appointment | null
  availableSlots: string[]
  doctorSchedule: Appointment[]
  loading: boolean
  loadingSlots: boolean
  loadingSchedule: boolean
  creating: boolean
  updating: boolean
  cancelling: boolean
  rescheduling: boolean
  confirming: boolean
  error: string | null
  slotsError: string | null
  scheduleError: string | null
}

const initialState: AppointmentState = {
  appointments: [],
  currentAppointment: null,
  availableSlots: [],
  doctorSchedule: [],
  loading: false,
  loadingSlots: false,
  loadingSchedule: false,
  creating: false,
  updating: false,
  cancelling: false,
  rescheduling: false,
  confirming: false,
  error: null,
  slotsError: null,
  scheduleError: null,
}

// Async thunks
export const getAppointments = createAsyncThunk(
  'appointments/getAppointments',
  async (params?: {
    status?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams()
      if (params?.status) queryParams.append('status', params.status)
      if (params?.startDate) queryParams.append('startDate', params.startDate)
      if (params?.endDate) queryParams.append('endDate', params.endDate)
      if (params?.page) queryParams.append('page', params.page.toString())
      if (params?.limit) queryParams.append('limit', params.limit.toString())

      const res = await axios.get(`/api/appointments?${queryParams.toString()}`)
      return res.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments')
    }
  }
)

export const getAppointmentById = createAsyncThunk(
  'appointments/getAppointmentById',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/appointments/${appointmentId}`)
      return res.data.data.appointment
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointment')
    }
  }
)

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: CreateAppointmentRequest, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/appointments', appointmentData)
      return res.data.data.appointment
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment')
    }
  }
)

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ appointmentId, updateData }: { appointmentId: string; updateData: UpdateAppointmentRequest }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/appointments/${appointmentId}`, updateData)
      return res.data.data.appointment
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment')
    }
  }
)

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async ({ appointmentId, reason }: { appointmentId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/appointments/${appointmentId}/cancel`, { reason })
      return res.data.data.appointment
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment')
    }
  }
)

export const confirmAppointment = createAsyncThunk(
  'appointments/confirmAppointment',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/appointments/${appointmentId}/confirm`)
      return res.data.data.appointment
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm appointment')
    }
  }
)

export const requestReschedule = createAsyncThunk(
  'appointments/requestReschedule',
  async ({ appointmentId, rescheduleData }: { appointmentId: string; rescheduleData: RescheduleAppointmentRequest }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/appointments/${appointmentId}/reschedule`, rescheduleData)
      return res.data.data.appointment
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request reschedule')
    }
  }
)

export const handleRescheduleRequest = createAsyncThunk(
  'appointments/handleRescheduleRequest',
  async ({ appointmentId, action }: { appointmentId: string; action: 'approve' | 'reject' }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`/api/appointments/${appointmentId}/handle-reschedule`, { action })
      return res.data.data.appointment
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to handle reschedule request')
    }
  }
)

export const getAvailableSlots = createAsyncThunk(
  'appointments/getAvailableSlots',
  async ({ doctorId, date }: { doctorId: string; date?: string }, { rejectWithValue }) => {
    try {
      const params = date ? { date } : {}
      const res = await axios.get(`/api/appointments/available-slots/${doctorId}`, { params })
      return res.data.data.slots
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available slots')
    }
  }
)

export const getDoctorSchedule = createAsyncThunk(
  'appointments/getDoctorSchedule',
  async ({ startDate, endDate }: { startDate: string; endDate: string }, { rejectWithValue }) => {
    try {
      const params = { startDate, endDate }
      const res = await axios.get('/api/appointments/doctor/schedule', { params })
      return res.data.data.appointments
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor schedule')
    }
  }
)

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
      state.slotsError = null
      state.scheduleError = null
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null
    },
    clearAvailableSlots: (state) => {
      state.availableSlots = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Get appointments
      .addCase(getAppointments.pending, (state) => {
        state.loading = true
        state.error = null
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

      // Get appointment by ID
      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(getAppointmentById.fulfilled, (state, action) => {
        state.loading = false
        state.currentAppointment = action.payload
        state.error = null
      })
      .addCase(getAppointmentById.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

      // Create appointment
      .addCase(createAppointment.pending, (state) => {
        state.creating = true
        state.error = null
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.creating = false
        state.appointments.unshift(action.payload) // Add to beginning of list
        state.error = null
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.creating = false
        state.error = action.payload as string
      })

      // Update appointment
      .addCase(updateAppointment.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.updating = false
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id)
        if (index !== -1) {
          state.appointments[index] = action.payload
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload
        }
        state.error = null
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload as string
      })

      // Cancel appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.cancelling = true
        state.error = null
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.cancelling = false
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id)
        if (index !== -1) {
          state.appointments[index] = action.payload
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload
        }
        state.error = null
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.cancelling = false
        state.error = action.payload as string
      })

      // Confirm appointment
      .addCase(confirmAppointment.pending, (state) => {
        state.confirming = true
        state.error = null
      })
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        state.confirming = false
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id)
        if (index !== -1) {
          state.appointments[index] = action.payload
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload
        }
        state.error = null
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.confirming = false
        state.error = action.payload as string
      })

      // Request reschedule
      .addCase(requestReschedule.pending, (state) => {
        state.rescheduling = true
        state.error = null
      })
      .addCase(requestReschedule.fulfilled, (state, action) => {
        state.rescheduling = false
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id)
        if (index !== -1) {
          state.appointments[index] = action.payload
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload
        }
        state.error = null
      })
      .addCase(requestReschedule.rejected, (state, action) => {
        state.rescheduling = false
        state.error = action.payload as string
      })

      // Handle reschedule request
      .addCase(handleRescheduleRequest.pending, (state) => {
        state.updating = true
        state.error = null
      })
      .addCase(handleRescheduleRequest.fulfilled, (state, action) => {
        state.updating = false
        const index = state.appointments.findIndex(apt => apt.id === action.payload.id)
        if (index !== -1) {
          state.appointments[index] = action.payload
        }
        if (state.currentAppointment?.id === action.payload.id) {
          state.currentAppointment = action.payload
        }
        state.error = null
      })
      .addCase(handleRescheduleRequest.rejected, (state, action) => {
        state.updating = false
        state.error = action.payload as string
      })

      // Get available slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.loadingSlots = true
        state.slotsError = null
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loadingSlots = false
        state.availableSlots = action.payload
        state.slotsError = null
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loadingSlots = false
        state.slotsError = action.payload as string
      })

      // Get doctor schedule
      .addCase(getDoctorSchedule.pending, (state) => {
        state.loadingSchedule = true
        state.scheduleError = null
      })
      .addCase(getDoctorSchedule.fulfilled, (state, action) => {
        state.loadingSchedule = false
        state.doctorSchedule = action.payload
        state.scheduleError = null
      })
      .addCase(getDoctorSchedule.rejected, (state, action) => {
        state.loadingSchedule = false
        state.scheduleError = action.payload as string
      })
  },
})

export const { clearError, clearCurrentAppointment, clearAvailableSlots } = appointmentSlice.actions
export default appointmentSlice.reducer
