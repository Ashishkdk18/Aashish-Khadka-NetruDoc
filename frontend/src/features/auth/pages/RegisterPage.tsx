import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stepper,
  Step,
  StepLabel,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useDispatch, useSelector } from 'react-redux'
import { RootState, AppDispatch } from '../../../store'
import { register, clearError } from '../authSlice'
import { PatientRegistrationData, DoctorRegistrationData, Specialization } from '../models/authModels'
import { hospitalApi } from '../../hospitals/api'
import { Hospital } from '../../hospitals/models/hospitalModels'
import dayjs, { Dayjs } from 'dayjs'

const specializations: Specialization[] = [
  'general-medicine',
  'cardiology',
  'dermatology',
  'neurology',
  'orthopedics',
  'pediatrics',
  'psychiatry',
  'radiology',
  'surgery',
  'urology',
  'gynecology',
  'ophthalmology'
]

const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [activeStep, setActiveStep] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [hospitalsLoading, setHospitalsLoading] = useState(false)

  const { loading, error, isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  // Patient validation schema
  const patientValidationSchema = Yup.object({
    name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    phone: Yup.string().optional(),
    dateOfBirth: Yup.date().max(new Date(), 'Date of birth cannot be in the future').optional(),
    gender: Yup.string().oneOf(['male', 'female', 'other']).optional(),
    emergencyContactName: Yup.string().when('emergencyContactPhone', {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema.required('Emergency contact name is required'),
      otherwise: (schema) => schema.optional()
    }),
    emergencyContactPhone: Yup.string().optional(),
    emergencyContactRelationship: Yup.string().when('emergencyContactPhone', {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema.required('Relationship is required'),
      otherwise: (schema) => schema.optional()
    }),
  })

  // Doctor validation schema
  const doctorValidationSchema = Yup.object({
    name: Yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords must match')
      .required('Please confirm your password'),
    phone: Yup.string().optional(),
    licenseNumber: Yup.string().required('License number is required for doctors'),
    specialization: Yup.string().required('Specialization is required'),
    experience: Yup.number().min(0, 'Experience must be positive').optional(),
    hospital: Yup.string().optional(),
    consultationFee: Yup.number().min(0, 'Consultation fee must be positive').optional(),
  })

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient' as 'patient' | 'doctor',
      phone: '',
      // Patient fields
      dateOfBirth: null as Dayjs | null,
      gender: '' as 'male' | 'female' | 'other' | '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      // Doctor fields
      licenseNumber: '',
      specialization: '' as Specialization | '',
      qualifications: [] as string[],
      experience: 0,
      hospital: '',
      consultationFee: 0,
      // Address
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Nepal',
    },
    validate: (values) => {
      try {
        const schema = values.role === 'doctor' ? doctorValidationSchema : patientValidationSchema;
        schema.validateSync(values, { abortEarly: false });
        return {};
      } catch (error: any) {
        const errors: Record<string, string> = {};
        error.inner?.forEach((err: any) => {
          errors[err.path] = err.message;
        });
        return errors;
      }
    },
    onSubmit: async (values) => {
      const { confirmPassword, dateOfBirth, ...submitData } = values

      const address = {
        street: submitData.street || undefined,
        city: submitData.city || undefined,
        state: submitData.state || undefined,
        zipCode: submitData.zipCode || undefined,
        country: submitData.country || 'Nepal',
      }

      if (submitData.role === 'patient') {
        const patientData: PatientRegistrationData = {
          name: submitData.name,
          email: submitData.email,
          password: submitData.password,
          role: 'patient',
          phone: submitData.phone || undefined,
          address: Object.keys(address).length > 0 ? address : undefined,
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
          gender: submitData.gender || undefined,
          emergencyContact: submitData.emergencyContactName
            ? {
              name: submitData.emergencyContactName,
              phone: submitData.emergencyContactPhone,
              relationship: submitData.emergencyContactRelationship,
            }
            : undefined,
        }
        await dispatch(register(patientData))
      } else {
        const doctorData: DoctorRegistrationData = {
          name: submitData.name,
          email: submitData.email,
          password: submitData.password,
          role: 'doctor',
          phone: submitData.phone || undefined,
          address: Object.keys(address).length > 0 ? address : undefined,
          licenseNumber: submitData.licenseNumber,
          specialization: submitData.specialization as Specialization,
          qualifications: submitData.qualifications.length > 0 ? submitData.qualifications : undefined,
          experience: submitData.experience || undefined,
          hospital: submitData.hospital || undefined,
          consultationFee: submitData.consultationFee || undefined,
        }
        await dispatch(register(doctorData))
      }
    },
  })

  // Fetch hospitals when component mounts or role changes to doctor
  useEffect(() => {
    const fetchHospitals = async () => {
      if (formik.values.role === 'doctor') {
        setHospitalsLoading(true)
        try {
          const response = await hospitalApi.getHospitals({}, { limit: 100 })
          if (response && response.status === 'success' && response.data && response.data.items && Array.isArray(response.data.items)) {
            setHospitals(response.data.items)
          } else {
            setHospitals([])
          }
        } catch (error) {
          console.error('Failed to fetch hospitals:', error)
          setHospitals([])
        } finally {
          setHospitalsLoading(false)
        }
      } else {
        // Clear hospitals when role is not doctor
        setHospitals([])
      }
    }

    fetchHospitals()
  }, [formik.values.role])

  const handleRoleChange = (event: SelectChangeEvent) => {
    const role = event.target.value as 'patient' | 'doctor'
    formik.setFieldValue('role', role)
    // Validation schema will be updated automatically via useMemo
    formik.setFieldTouched('role', false)
  }

  const steps = ['Basic Information', formik.values.role === 'doctor' ? 'Professional Details' : 'Medical Information', 'Address']

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">I am a</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                name="role"
                value={formik.values.role}
                label="I am a"
                onChange={handleRoleChange}
                error={formik.touched.role && Boolean(formik.errors.role)}
              >
                <MenuItem value="patient">Patient</MenuItem>
                <MenuItem value="doctor">Doctor</MenuItem>
              </Select>
            </FormControl>

            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="Phone Number"
              name="phone"
              autoComplete="tel"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.phone && Boolean(formik.errors.phone)}
              helperText={formik.touched.phone && formik.errors.phone}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
              helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )

      case 1:
        if (formik.values.role === 'doctor') {
          return (
            <Box>
              <TextField
                margin="normal"
                required
                fullWidth
                id="licenseNumber"
                label="License Number"
                name="licenseNumber"
                value={formik.values.licenseNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.licenseNumber && Boolean(formik.errors.licenseNumber)}
                helperText={formik.touched.licenseNumber && formik.errors.licenseNumber}
              />

              <FormControl fullWidth margin="normal" required>
                <InputLabel id="specialization-label">Specialization</InputLabel>
                <Select
                  labelId="specialization-label"
                  id="specialization"
                  name="specialization"
                  value={formik.values.specialization}
                  label="Specialization"
                  onChange={formik.handleChange}
                  error={formik.touched.specialization && Boolean(formik.errors.specialization)}
                >
                  {specializations.map((spec) => (
                    <MenuItem key={spec} value={spec}>
                      {spec.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                fullWidth
                id="experience"
                label="Years of Experience"
                name="experience"
                type="number"
                value={formik.values.experience}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.experience && Boolean(formik.errors.experience)}
                helperText={formik.touched.experience && formik.errors.experience}
              />

              <FormControl fullWidth margin="normal">
                <InputLabel id="hospital-label">Hospital/Clinic Name</InputLabel>
                <Select
                  labelId="hospital-label"
                  id="hospital"
                  name="hospital"
                  value={formik.values.hospital}
                  label="Hospital/Clinic Name"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={hospitalsLoading}
                >
                  {hospitalsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading hospitals...
                    </MenuItem>
                  ) : Array.isArray(hospitals) && hospitals.length > 0 ? (
                    hospitals.map((hospital) => (
                      <MenuItem key={hospital.id} value={hospital.name}>
                        {hospital.name} - {hospital.address.city}, {hospital.address.state}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No hospitals available</MenuItem>
                  )}
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                fullWidth
                id="consultationFee"
                label="Consultation Fee (NPR)"
                name="consultationFee"
                type="number"
                value={formik.values.consultationFee}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.consultationFee && Boolean(formik.errors.consultationFee)}
                helperText={formik.touched.consultationFee && formik.errors.consultationFee}
              />
            </Box>
          )
        } else {
          return (
            <Box>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Date of Birth"
                  value={formik.values.dateOfBirth}
                  onChange={(value) => formik.setFieldValue('dateOfBirth', value)}
                  maxDate={dayjs()}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: 'normal',
                    },
                  }}
                />
              </LocalizationProvider>

              <FormControl fullWidth margin="normal">
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formik.values.gender}
                  label="Gender"
                  onChange={formik.handleChange}
                >
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                Emergency Contact (Optional)
              </Typography>

              <TextField
                margin="normal"
                fullWidth
                id="emergencyContactName"
                label="Emergency Contact Name"
                name="emergencyContactName"
                value={formik.values.emergencyContactName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactName && Boolean(formik.errors.emergencyContactName)}
                helperText={formik.touched.emergencyContactName && formik.errors.emergencyContactName}
              />

              <TextField
                margin="normal"
                fullWidth
                id="emergencyContactPhone"
                label="Emergency Contact Phone"
                name="emergencyContactPhone"
                value={formik.values.emergencyContactPhone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactPhone && Boolean(formik.errors.emergencyContactPhone)}
                helperText={formik.touched.emergencyContactPhone && formik.errors.emergencyContactPhone}
              />

              <TextField
                margin="normal"
                fullWidth
                id="emergencyContactRelationship"
                label="Relationship"
                name="emergencyContactRelationship"
                value={formik.values.emergencyContactRelationship}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.emergencyContactRelationship && Boolean(formik.errors.emergencyContactRelationship)}
                helperText={formik.touched.emergencyContactRelationship && formik.errors.emergencyContactRelationship}
              />
            </Box>
          )
        }

      case 2:
        return (
          <Box>
            <TextField
              margin="normal"
              fullWidth
              id="street"
              label="Street Address"
              name="street"
              value={formik.values.street}
              onChange={formik.handleChange}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="city"
                  label="City"
                  name="city"
                  value={formik.values.city}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="state"
                  label="State/Province"
                  name="state"
                  value={formik.values.state}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="zipCode"
                  label="Zip Code"
                  name="zipCode"
                  value={formik.values.zipCode}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  id="country"
                  label="Country"
                  name="country"
                  value={formik.values.country}
                  onChange={formik.handleChange}
                  disabled
                />
              </Grid>
            </Grid>
          </Box>
        )

      default:
        return null
    }
  }

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate basic info
      const fields = ['name', 'email', 'password', 'confirmPassword', 'role']
      fields.forEach((field) => formik.setFieldTouched(field, true))
      if (formik.values.name && formik.values.email && formik.values.password && formik.values.confirmPassword && formik.values.role) {
        setActiveStep(activeStep + 1)
      }
    } else {
      setActiveStep(activeStep + 1)
    }
  }

  const handleBack = () => {
    setActiveStep(activeStep - 1)
  }

  return (
    <Container component="main" maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Join NetruDoc
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Create your account to access healthcare services
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box component="form" onSubmit={formik.handleSubmit}>
          {getStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>
            {activeStep < steps.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            )}
          </Box>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default RegisterPage