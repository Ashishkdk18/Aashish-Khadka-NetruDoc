import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Grid,
  Chip,
  Avatar,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material'
import {
  CalendarToday as CalendarIcon,
  Add as AddIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  EventAvailable as EventIcon,
  MedicalServices as MedicalIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'

import { RootState, AppDispatch } from '../../../store'
import { getAppointments } from '../../appointments/appointmentSlice'

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { user } = useSelector((state: RootState) => state.auth)
  const { appointments, loading, error } = useSelector((state: RootState) => state.appointments)

  const [stats, setStats] = useState({
    total: 0,
    upcoming: 0,
    pending: 0,
    completed: 0
  })

  // Load appointments on component mount
  useEffect(() => {
    dispatch(getAppointments({ limit: 5 })) // Load recent 5 appointments
  }, [dispatch])

  // Calculate statistics when appointments change
  useEffect(() => {
    const now = new Date()
    const statsData = appointments.reduce((acc, appointment) => {
      acc.total++
      if (appointment.status === 'pending') acc.pending++
      if (appointment.status === 'completed') acc.completed++

      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
      if (appointmentDateTime > now && appointment.status !== 'cancelled' && appointment.status !== 'completed') {
        acc.upcoming++
      }

      return acc
    }, { total: 0, upcoming: 0, pending: 0, completed: 0 })

    setStats(statsData)
  }, [appointments])

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments
      .filter(appointment => {
        const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
        return appointmentDateTime > now && appointment.status !== 'cancelled' && appointment.status !== 'completed'
      })
      .slice(0, 3) // Show only next 3 upcoming appointments
  }

  const handleBookAppointment = () => {
    navigate('/doctors')
  }

  const handleViewAppointments = () => {
    navigate('/appointments/my')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <section className="pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <span className="inline-block text-sm font-sans font-medium uppercase tracking-widest text-secondary mb-4">
              <span className="mr-2 text-accent">+</span>
              Dashboard
            </span>
            <h1 className="text-5xl md:text-7xl font-display font-medium text-primary leading-[0.9] -ml-1">
              Welcome back,<br />
              <span className="text-secondary opacity-60">{user?.name}!</span>
            </h1>
            <p className="text-lg text-secondary mt-4 max-w-2xl">
              Manage your healthcare appointments and stay connected with your doctors.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="pb-12 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600 mb-1">Total Appointments</p>
                    <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
                  </div>
                  <MedicalIcon className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">Upcoming</p>
                    <p className="text-3xl font-bold text-green-900">{stats.upcoming}</p>
                  </div>
                  <EventIcon className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-yellow-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
                  </div>
                  <ScheduleIcon className="w-8 h-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-600 mb-1">Completed</p>
                    <p className="text-3xl font-bold text-purple-900">{stats.completed}</p>
                  </div>
                  <CheckCircleIcon className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <span className="text-accent text-2xl">01</span>
                    <h3 className="text-xl font-display font-medium text-primary">Quick Actions</h3>
                  </div>

                  <div className="space-y-4">
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleBookAppointment}
                      size="large"
                      className="bg-accent hover:bg-accent/90"
                    >
                      Book New Appointment
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<CalendarIcon />}
                      onClick={handleViewAppointments}
                      size="large"
                    >
                      View All Appointments
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<MedicalIcon />}
                      component={Link}
                      to="/doctors"
                      size="large"
                    >
                      Find Doctors
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-accent text-2xl">02</span>
                      <h3 className="text-xl font-display font-medium text-primary">Upcoming Appointments</h3>
                    </div>
                    <IconButton
                      onClick={() => dispatch(getAppointments({ limit: 5 }))}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                    </IconButton>
                  </div>

                  {error && (
                    <Alert severity="error" className="mb-4">
                      {error}
                    </Alert>
                  )}

                  {loading ? (
                    <div className="flex justify-center py-8">
                      <CircularProgress />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {getUpcomingAppointments().length === 0 ? (
                        <div className="text-center py-8">
                          <EventIcon className="w-16 h-16 text-secondary mx-auto mb-4" />
                          <Typography variant="h6" color="text.secondary" gutterBottom>
                            No upcoming appointments
                          </Typography>
                          <Typography variant="body2" color="text.secondary" className="mb-4">
                            Book your first appointment to get started
                          </Typography>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={handleBookAppointment}
                          >
                            Book Appointment
                          </Button>
                        </div>
                      ) : (
                        getUpcomingAppointments().map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center space-x-4">
                              <Avatar className="bg-primary">
                                {appointment.doctorId?.name?.charAt(0) || 'D'}
                              </Avatar>
                              <div>
                                <Typography variant="subtitle2" className="font-medium">
                                  Dr. {appointment.doctorId?.name || 'Unknown Doctor'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {appointment.doctorId?.specialization?.replace('-', ' ').toUpperCase() || 'Specialization not specified'}
                                </Typography>
                                <div className="flex items-center space-x-2 mt-1">
                                  <CalendarIcon className="w-4 h-4 text-secondary" />
                                  <Typography variant="caption">
                                    {formatDate(appointment.date)} at {formatTime(appointment.time)}
                                  </Typography>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Chip
                                label={appointment.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                                color={appointment.status === 'confirmed' ? 'success' : 'warning'}
                                size="small"
                              />
                              <Button
                                size="small"
                                variant="outlined"
                                component={Link}
                                to={`/appointments/my`}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))
                      )}

                      {getUpcomingAppointments().length > 0 && (
                        <div className="text-center pt-4">
                          <Button
                            variant="text"
                            onClick={handleViewAppointments}
                            endIcon={<span>→</span>}
                          >
                            View All Appointments
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default DashboardPage
