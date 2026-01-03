import React from 'react'
import { Container, Typography, Box, Grid, Card, CardContent, CardActionArea, Button } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import {
  People as PeopleIcon,
  LocalHospital as HospitalIcon,
  MedicalServices as DoctorIcon,
  Person as PatientIcon
} from '@mui/icons-material'

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()

  const adminCards = [
    {
      title: 'All Users',
      description: 'View and manage all users',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/admin/users',
      color: '#1976d2'
    },
    {
      title: 'Doctors',
      description: 'View and manage all doctors',
      icon: <DoctorIcon sx={{ fontSize: 40 }} />,
      path: '/admin/doctors',
      color: '#2e7d32'
    },
    {
      title: 'Patients',
      description: 'View and manage all patients',
      icon: <PatientIcon sx={{ fontSize: 40 }} />,
      path: '/admin/patients',
      color: '#ed6c02'
    },
    {
      title: 'Hospitals',
      description: 'View and manage all hospitals',
      icon: <HospitalIcon sx={{ fontSize: 40 }} />,
      path: '/admin/hospitals',
      color: '#d32f2f'
    }
  ]

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Manage users, doctors, patients, and hospitals
      </Typography>

      <Grid container spacing={3}>
        {adminCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.path}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6
                }
              }}
            >
              <CardActionArea
                onClick={() => navigate(card.path)}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3
                }}
              >
                <Box
                  sx={{
                    color: card.color,
                    mb: 2
                  }}
                >
                  {card.icon}
                </Box>
                <CardContent sx={{ textAlign: 'center', pt: 0 }}>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {card.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {card.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  )
}

export default AdminDashboardPage
