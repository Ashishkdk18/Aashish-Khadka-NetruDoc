import React from 'react'
import { Container, Typography } from '@mui/material'

const ConsultationPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Video Consultation
      </Typography>
      <Typography variant="body1">
        Video consultation functionality coming soon...
      </Typography>
    </Container>
  )
}

export default ConsultationPage
