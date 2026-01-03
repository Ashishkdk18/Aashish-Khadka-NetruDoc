import React from 'react'
import { Container, Typography } from '@mui/material'

const DoctorListPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Find Doctors
      </Typography>
      <Typography variant="body1">
        Doctor listing functionality coming soon...
      </Typography>
    </Container>
  )
}

export default DoctorListPage
