import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar
} from '@mui/material'
import {
  FilterList as FilterIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
  Cancel as CancelIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs, { Dayjs } from 'dayjs'

import { RootState, AppDispatch } from '../../../store'
import {
  getAppointments,
  cancelAppointment,
  requestReschedule,
  clearError
} from '../appointmentSlice'
import { userApi } from '../../users/api/userApi'
import { User } from '../../auth/models/authModels'

const statusColors = {
  pending: 'warning',
  confirmed: 'success',
  completed: 'info',
  cancelled: 'error'
} as const

const statusLabels = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled'
} as const

const MyAppointmentsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const location = useLocation()

  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all')
  const [startDate, setStartDate] = useState<Dayjs | null>(null)
  const [endDate, setEndDate] = useState<Dayjs | null>(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [rescheduleDate, setRescheduleDate] = useState<Dayjs | null>(null)
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [rescheduleReasonText, setRescheduleReasonText] = useState('')
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success')

  const {
    appointments,
    loading,
    error,
    cancelling,
    rescheduling
  } = useSelector((state: RootState) => state.appointments)

  // Load appointments on component mount and when filters change
  useEffect(() => {
    loadAppointments()
  }, [statusFilter, startDate, endDate])

  // Show success message if redirected from booking
  useEffect(() => {
    if (location.state?.message) {
      setSnackbarMessage(location.state.message)
      setSnackbarSeverity('success')
      setSnackbarOpen(true)
      // Clear the message from location state
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const loadAppointments = () => {
    const params: any = {}

    if (statusFilter !== 'all') {
      params.status = statusFilter
    }

    if (startDate) {
      params.startDate = startDate.format('YYYY-MM-DD')
    }

    if (endDate) {
      params.endDate = endDate.format('YYYY-MM-DD')
    }

    dispatch(getAppointments(params))
  }

  const handleCancelAppointment = (appointment: any) => {
    setSelectedAppointment(appointment)
    setCancelDialogOpen(true)
  }

  const handleConfirmCancel = async () => {
    if (!selectedAppointment || !cancelReason.trim()) return

    try {
      await dispatch(cancelAppointment({
        appointmentId: selectedAppointment.id,
        reason: cancelReason
      })).unwrap()

      setCancelDialogOpen(false)
      setCancelReason('')
      setSelectedAppointment(null)
      setSnackbarMessage('Appointment cancelled successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)

      // Reload appointments
      loadAppointments()
    } catch (error) {
      setSnackbarMessage('Failed to cancel appointment')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const handleRescheduleAppointment = (appointment: any) => {
    setSelectedAppointment(appointment)
    setRescheduleDialogOpen(true)
    setRescheduleDate(null)
    setRescheduleTime('')
    setRescheduleReasonText('')
  }

  const handleConfirmReschedule = async () => {
    if (!selectedAppointment || !rescheduleDate || !rescheduleTime || !rescheduleReasonText.trim()) return

    try {
      await dispatch(requestReschedule({
        appointmentId: selectedAppointment.id,
        rescheduleData: {
          newDate: rescheduleDate.format('YYYY-MM-DD'),
          newTime: rescheduleTime,
          reason: rescheduleReasonText
        }
      })).unwrap()

      setRescheduleDialogOpen(false)
      setRescheduleDate(null)
      setRescheduleTime('')
      setRescheduleReasonText('')
      setSelectedAppointment(null)
      setSnackbarMessage('Reschedule request submitted successfully')
      setSnackbarSeverity('success')
      setSnackbarOpen(true)

      // Reload appointments
      loadAppointments()
    } catch (error) {
      setSnackbarMessage('Failed to request reschedule')
      setSnackbarSeverity('error')
      setSnackbarOpen(true)
    }
  }

  const canCancelAppointment = (appointment: any) => {
    const status = appointment.status
    return status === 'pending' || status === 'confirmed'
  }

  const canRescheduleAppointment = (appointment: any) => {
    const status = appointment.status
    return status === 'pending' || status === 'confirmed'
  }

  const getAppointmentActions = (appointment: any) => {
    const actions = []

    if (canCancelAppointment(appointment)) {
      actions.push(
        <Button
          key="cancel"
          size="small"
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => handleCancelAppointment(appointment)}
          sx={{ mr: 1 }}
        >
          Cancel
        </Button>
      )
    }

    if (canRescheduleAppointment(appointment)) {
      actions.push(
        <Button
          key="reschedule"
          size="small"
          color="warning"
          startIcon={<EditIcon />}
          onClick={() => handleRescheduleAppointment(appointment)}
          sx={{ mr: 1 }}
        >
          Reschedule
        </Button>
      )
    }

    actions.push(
      <Button
        key="view"
        size="small"
        variant="outlined"
        startIcon={<ViewIcon />}
        onClick={() => {/* TODO: Navigate to appointment details */}}
      >
        View Details
      </Button>
    )

    return actions
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Appointments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your upcoming and past appointments
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <FilterIcon sx={{ mr: 1 }} />
            <Typography variant="h6">Filters</Typography>
            <Button
              startIcon={<RefreshIcon />}
              onClick={loadAppointments}
              sx={{ ml: 'auto' }}
            >
              Refresh
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="confirmed">Confirmed</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { size: 'small', fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                onClick={() => {
                  setStatusFilter('all')
                  setStartDate(null)
                  setEndDate(null)
                }}
                fullWidth
                sx={{ height: '40px' }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : (
        <>
          {/* Results Count */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* Appointments List */}
          {appointments.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No appointments found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  {statusFilter !== 'all' || startDate || endDate
                    ? 'Try adjusting your filters or clearing them to see all appointments.'
                    : 'You haven\'t booked any appointments yet.'}
                </Typography>
                {(statusFilter !== 'all' || startDate || endDate) && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setStatusFilter('all')
                      setStartDate(null)
                      setEndDate(null)
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {appointments.map((appointment) => (
                <Grid item xs={12} key={appointment.id}>
                  <Card>
                    <CardContent>
                      <Grid container spacing={3} alignItems="center">
                        {/* Doctor Info */}
                        <Grid item xs={12} sm={4}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                              {appointment.doctorId?.name?.charAt(0) || 'D'}
                            </Avatar>
                            <Box>
                              <Typography variant="h6">
                                Dr. {appointment.doctorId?.name || 'Unknown Doctor'}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {appointment.doctorId?.specialization?.replace('-', ' ').toUpperCase() || 'Specialization not specified'}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        {/* Appointment Details */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <CalendarIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">
                              {new Date(appointment.date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TimeIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2">{appointment.time}</Typography>
                          </Box>
                        </Grid>

                        {/* Status and Reason */}
                        <Grid item xs={12} sm={3}>
                          <Box sx={{ mb: 1 }}>
                            <Chip
                              label={statusLabels[appointment.status as keyof typeof statusLabels]}
                              color={statusColors[appointment.status as keyof typeof statusColors]}
                              size="small"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            {appointment.reason}
                          </Typography>

                          {/* Reschedule Status */}
                          {appointment.rescheduleStatus === 'pending' && (
                            <Typography variant="caption" color="warning.main" sx={{ mt: 1, display: 'block' }}>
                              Reschedule pending approval
                            </Typography>
                          )}
                          {appointment.rescheduleStatus === 'approved' && (
                            <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                              Reschedule approved
                            </Typography>
                          )}
                          {appointment.rescheduleStatus === 'rejected' && (
                            <Typography variant="caption" color="error.main" sx={{ mt: 1, display: 'block' }}>
                              Reschedule rejected
                            </Typography>
                          )}
                        </Grid>

                        {/* Actions */}
                        <Grid item xs={12} sm={2}>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {getAppointmentActions(appointment)}
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Cancel Appointment Dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Are you sure you want to cancel your appointment with Dr. {selectedAppointment?.doctorId?.name}?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Cancellation Reason (Optional)"
            placeholder="Please provide a reason for cancellation..."
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>Keep Appointment</Button>
          <Button
            onClick={handleConfirmCancel}
            color="error"
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reschedule Appointment Dialog */}
      <Dialog open={rescheduleDialogOpen} onClose={() => setRescheduleDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Reschedule</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Request to reschedule your appointment with Dr. {selectedAppointment?.doctorId?.name}.
            The doctor will need to approve your request.
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="New Date"
              value={rescheduleDate}
              onChange={setRescheduleDate}
              minDate={dayjs()}
              maxDate={dayjs().add(90, 'day')}
              slotProps={{
                textField: { fullWidth: true, sx: { mb: 2 } }
              }}
            />
          </LocalizationProvider>

          <TextField
            fullWidth
            label="New Time"
            placeholder="HH:MM"
            value={rescheduleTime}
            onChange={(e) => setRescheduleTime(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Reason for Reschedule"
            placeholder="Please explain why you need to reschedule..."
            value={rescheduleReasonText}
            onChange={(e) => setRescheduleReasonText(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirmReschedule}
            variant="contained"
            disabled={rescheduling || !rescheduleDate || !rescheduleTime || !rescheduleReasonText.trim()}
          >
            {rescheduling ? 'Submitting...' : 'Submit Request'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  )
}

export default MyAppointmentsPage
