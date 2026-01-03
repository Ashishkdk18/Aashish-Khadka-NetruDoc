import React from 'react'
import { Container, Typography } from '@mui/material'

const AppointmentBookingPage: React.FC = () => {
    return (
        <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Book Appointment
            </Typography>
            <Typography variant="body1">
                Appointment booking functionality coming soon...
            </Typography>
        </Container>
    )
}

export default AppointmentBookingPage
