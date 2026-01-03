import React from 'react'
import { Container, Typography } from '@mui/material'

const PrescriptionListPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Prescriptions
      </Typography>
      <Typography variant="body1">
        Prescription management functionality coming soon...
      </Typography>
    </Container>
  )
}

export default PrescriptionListPage
