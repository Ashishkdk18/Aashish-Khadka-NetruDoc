import React from 'react'
import { Container, Typography } from '@mui/material'

const PaymentPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Payment
      </Typography>
      <Typography variant="body1">
        Payment processing functionality coming soon...
      </Typography>
    </Container>
  )
}

export default PaymentPage
