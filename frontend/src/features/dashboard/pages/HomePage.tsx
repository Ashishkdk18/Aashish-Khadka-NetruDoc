import React from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
} from '@mui/material'
import {
  LocalHospital,
  VideoCall,
  CalendarToday,
  Payment,
  Search,
  Security,
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'

const HomePage: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const features = [
    {
      icon: <Search sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Find Doctors',
      description: 'Search and book appointments with qualified healthcare professionals',
      link: '/doctors',
    },
    {
      icon: <CalendarToday sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Easy Booking',
      description: 'Schedule appointments online with just a few clicks',
      link: isAuthenticated ? '/doctors' : '/register',
    },
    {
      icon: <VideoCall sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Video Consultations',
      description: 'Connect with doctors through secure video calls from anywhere',
      link: isAuthenticated ? '/dashboard' : '/register',
    },
    {
      icon: <LocalHospital sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Digital Prescriptions',
      description: 'Receive and manage prescriptions electronically',
      link: isAuthenticated ? '/prescriptions' : '/register',
    },
    {
      icon: <Payment sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Secure Payments',
      description: 'Safe and secure payment processing for all services',
      link: isAuthenticated ? '/dashboard' : '/register',
    },
    {
      icon: <Security sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Data Security',
      description: 'Your health information is protected with industry-standard security',
      link: '/register',
    },
  ]

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Welcome to NetruDoc
          </Typography>
          <Typography variant="h5" component="p" gutterBottom>
            Smart Healthcare Appointment & Consultation System
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Connect with qualified doctors, book appointments, and receive healthcare services from the comfort of your home.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/doctors"
              sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              Find Doctors
            </Button>
            {!isAuthenticated && (
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/register"
                sx={{ borderColor: 'white', color: 'white', '&:hover': { borderColor: '#f5f5f5', bgcolor: 'rgba(255,255,255,0.1)' } }}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom>
          Why Choose NetruDoc?
        </Typography>
        <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
          Experience healthcare like never before with our comprehensive digital platform
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                  <Button
                    size="small"
                    component={Link}
                    to={feature.link}
                    variant="outlined"
                  >
                    Learn More
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 6 }}>
        <Container>
          <Grid container spacing={4} textAlign="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                1000+
              </Typography>
              <Typography variant="h6">Registered Doctors</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                5000+
              </Typography>
              <Typography variant="h6">Happy Patients</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                15000+
              </Typography>
              <Typography variant="h6">Appointments Booked</Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  )
}

export default HomePage
