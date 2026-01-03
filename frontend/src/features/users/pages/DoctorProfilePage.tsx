import React from 'react'
import { Container, Typography } from '@mui/material'

const DoctorProfilePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Doctor Profile
      </Typography>
      <Typography variant="body1">
        Doctor profile functionality coming soon...
      </Typography>
    </Container>
  )
}

export default DoctorProfilePage
