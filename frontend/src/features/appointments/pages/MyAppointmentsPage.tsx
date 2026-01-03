import React from 'react'
import { Container, Typography } from '@mui/material'

const MyAppointmentsPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Appointments
      </Typography>
      <Typography variant="body1">
        Appointments management functionality coming soon...
      </Typography>
    </Container>
  )
}

export default MyAppointmentsPage
