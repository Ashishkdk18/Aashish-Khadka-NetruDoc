import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  Chip,
  Avatar,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store'
import { loadUser } from '../../auth/authSlice'
import { User } from '../../auth/models/authModels'

const ProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const { user, loading } = useSelector((state: RootState) => state.auth)
  const [profileUser, setProfileUser] = useState<User | null>(null)

  useEffect(() => {
    if (!user) {
      dispatch(loadUser())
    } else {
      setProfileUser(user)
    }
  }, [user, dispatch])

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!profileUser) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Failed to load profile</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Profile
          </Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate('/profile/edit')}
          >
            Edit Profile
          </Button>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          {/* Profile Picture and Basic Info */}
          <Grid item xs={12} md={4} component="div">
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2 }}
                  src={profileUser.profilePicture}
                >
                  {profileUser.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {profileUser.name}
                </Typography>
                <Chip
                  label={profileUser.role.charAt(0).toUpperCase() + profileUser.role.slice(1)}
                  color={profileUser.role === 'admin' ? 'error' : profileUser.role === 'doctor' ? 'primary' : 'default'}
                  sx={{ mb: 1 }}
                />
                {profileUser.specialization && (
                  <Chip
                    label={profileUser.specialization.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                )}
                {profileUser.isVerified && (
                  <Chip label="Verified" color="success" size="small" />
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={8} component="div">
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography variant="body1">{profileUser.email}</Typography>
                  </Grid>
                  {profileUser.phone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Phone
                      </Typography>
                      <Typography variant="body1">{profileUser.phone}</Typography>
                    </Grid>
                  )}
                  {profileUser.address && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Address
                      </Typography>
                      <Typography variant="body1">
                        {[
                          profileUser.address.street,
                          profileUser.address.city,
                          profileUser.address.state,
                          profileUser.address.zipCode,
                          profileUser.address.country,
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Patient-specific Information */}
          {profileUser.role === 'patient' && (
            <>
              {profileUser.dateOfBirth && (
                <Grid item xs={12} md={6} component="div">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Personal Information
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Date of Birth
                      </Typography>
                      <Typography variant="body1">
                        {new Date(profileUser.dateOfBirth).toLocaleDateString()}
                      </Typography>
                      {profileUser.gender && (
                        <>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Gender
                          </Typography>
                          <Typography variant="body1">
                            {profileUser.gender.charAt(0).toUpperCase() + profileUser.gender.slice(1)}
                          </Typography>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {profileUser.emergencyContact && (
                <Grid item xs={12} md={6} component="div">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Emergency Contact
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">{profileUser.emergencyContact.name}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Phone
                      </Typography>
                      <Typography variant="body1">{profileUser.emergencyContact.phone}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Relationship
                      </Typography>
                      <Typography variant="body1">{profileUser.emergencyContact.relationship}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {profileUser.medicalHistory && profileUser.medicalHistory.length > 0 && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Medical History
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {profileUser.medicalHistory.map((item, index) => (
                        <Box key={index} sx={{ mb: 2 }}>
                          <Typography variant="subtitle1">{item.condition}</Typography>
                          {item.diagnosedDate && (
                            <Typography variant="body2" color="text.secondary">
                              Diagnosed: {new Date(item.diagnosedDate).toLocaleDateString()}
                            </Typography>
                          )}
                          {item.notes && (
                            <Typography variant="body2">{item.notes}</Typography>
                          )}
                        </Box>
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </>
          )}

          {/* Doctor-specific Information */}
          {profileUser.role === 'doctor' && (
            <>
              <Grid item xs={12} md={6} component="div">
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Professional Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    {profileUser.licenseNumber && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          License Number
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {profileUser.licenseNumber}
                        </Typography>
                      </>
                    )}
                    {profileUser.experience !== undefined && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Experience
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {profileUser.experience} years
                        </Typography>
                      </>
                    )}
                    {profileUser.hospital && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Hospital/Clinic
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {profileUser.hospital}
                        </Typography>
                      </>
                    )}
                    {profileUser.consultationFee !== undefined && (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          Consultation Fee
                        </Typography>
                        <Typography variant="body1">
                          NPR {profileUser.consultationFee}
                        </Typography>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {profileUser.qualifications && profileUser.qualifications.length > 0 && (
                <Grid item xs={12} md={6} component="div">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Qualifications
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      {profileUser.qualifications.map((qual, index) => (
                        <Chip key={index} label={qual} sx={{ mr: 1, mb: 1 }} />
                      ))}
                    </CardContent>
                  </Card>
                </Grid>
              )}

              {profileUser.rating !== undefined && profileUser.rating > 0 && (
                <Grid item xs={12} md={6} component="div">
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Ratings & Reviews
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="h4">{profileUser.rating.toFixed(1)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {profileUser.totalReviews || 0} reviews
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </>
          )}
        </Grid>
      </Paper>
    </Container>
  )
}

export default ProfilePage