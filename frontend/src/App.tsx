import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import { useDispatch } from 'react-redux'
import { AppDispatch } from './store'
import { loadUser } from './features/auth/authSlice'

import Layout from './components/layout/Layout'
import ProtectedRoute from './components/auth/ProtectedRoute'

// Feature pages
import HomePage from './features/dashboard/pages/HomePage'
import LoginPage from './features/auth/pages/LoginPage'
import RegisterPage from './features/auth/pages/RegisterPage'
import ForgotPasswordPage from './features/auth/pages/ForgotPasswordPage'
import ResetPasswordPage from './features/auth/pages/ResetPasswordPage'
import DoctorListPage from './features/users/pages/DoctorListPage'
import DoctorProfilePage from './features/users/pages/DoctorProfilePage'
import DoctorAvailabilityPage from './features/users/pages/DoctorAvailabilityPage'
import ProfilePage from './features/users/pages/ProfilePage'
import EditProfilePage from './features/users/pages/EditProfilePage'
import UserManagementPage from './features/users/pages/UserManagementPage'
import AdminDoctorsPage from './features/users/pages/AdminDoctorsPage'
import AdminPatientsPage from './features/users/pages/AdminPatientsPage'
import AdminPatientProfilePage from './features/users/pages/AdminPatientProfilePage'
import AppointmentBookingPage from './features/appointments/pages/AppointmentBookingPage'
import MyAppointmentsPage from './features/appointments/pages/MyAppointmentsPage'
import DoctorSchedulePage from './features/appointments/pages/DoctorSchedulePage'
import ConsultationPage from './features/consultations/pages/ConsultationPage'
import PrescriptionListPage from './features/prescriptions/pages/PrescriptionListPage'
import PaymentPage from './features/payments/pages/PaymentPage'
import DashboardPage from './features/dashboard/pages/DashboardPage'
import AdminDashboardPage from './features/dashboard/pages/AdminDashboardPage'
import AdminHospitalsPage from './features/hospitals/pages/AdminHospitalsPage'
import AdminHospitalProfilePage from './features/hospitals/pages/AdminHospitalProfilePage'
import AdminAppointmentsPage from './features/appointments/pages/AdminAppointmentsPage'

function App() {
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    // Load user on app startup if token exists
    dispatch(loadUser())
  }, [dispatch])

  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/doctors" element={<DoctorListPage />} />
        <Route path="/doctors/:id" element={<DoctorProfilePage />} />

        {/* Protected routes - require authentication */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/profile/edit" element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/appointments/book/:doctorId" element={
          <ProtectedRoute>
            <AppointmentBookingPage />
          </ProtectedRoute>
        } />

        <Route path="/appointments/my" element={
          <ProtectedRoute>
            <MyAppointmentsPage />
          </ProtectedRoute>
        } />

        <Route path="/appointments/doctor/schedule" element={
          <ProtectedRoute roles={['doctor']}>
            <DoctorSchedulePage />
          </ProtectedRoute>
        } />

        <Route path="/profile/availability" element={
          <ProtectedRoute roles={['doctor']}>
            <DoctorAvailabilityPage />
          </ProtectedRoute>
        } />

        <Route path="/consultation/:appointmentId" element={
          <ProtectedRoute>
            <ConsultationPage />
          </ProtectedRoute>
        } />

        <Route path="/prescriptions" element={
          <ProtectedRoute>
            <PrescriptionListPage />
          </ProtectedRoute>
        } />

        <Route path="/payment/:appointmentId" element={
          <ProtectedRoute>
            <PaymentPage />
          </ProtectedRoute>
        } />

        {/* Role-based routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        <Route path="/admin/dashboard" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute roles={['admin']}>
            <UserManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/doctors" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDoctorsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/patients" element={
          <ProtectedRoute roles={['admin']}>
            <AdminPatientsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/hospitals" element={
          <ProtectedRoute roles={['admin']}>
            <AdminHospitalsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/doctors/:id" element={
          <ProtectedRoute roles={['admin']}>
            <DoctorProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/admin/patients/:id" element={
          <ProtectedRoute roles={['admin']}>
            <AdminPatientProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/admin/hospitals/:id" element={
          <ProtectedRoute roles={['admin']}>
            <AdminHospitalProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/admin/appointments" element={
          <ProtectedRoute roles={['admin']}>
            <AdminAppointmentsPage />
          </ProtectedRoute>
        } />

        {/* 404 - Page not found */}
        <Route path="*" element={
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <h1>404 - Page Not Found</h1>
          </Box>
        } />
      </Routes>
    </Layout>
  )
}

export default App
