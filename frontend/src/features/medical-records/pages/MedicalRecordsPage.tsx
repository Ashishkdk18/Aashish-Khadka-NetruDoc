import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material'
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/lab'
import {
  LocalHospital as ConsultationIcon,
  Medication as PrescriptionIcon,
  Event as AppointmentIcon,
  History as HistoryIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { AppDispatch, RootState } from '../../../store/index'
import { getMedicalRecords, clearError } from '../medicalRecordsSlice'
import {
  ConsultationRecord,
  PrescriptionRecord,
  AppointmentRecord,
  MedicalHistoryRecord,
  MedicalRecord,
  MedicalRecordType,
} from '../types/medicalRecordsTypes'
import dayjs from 'dayjs'

const MedicalRecordsPage: React.FC = () => {
  const { patientId } = useParams<{ patientId?: string }>()
  const dispatch = useDispatch<AppDispatch>()

  const { records, loading, error } = useSelector((state: RootState) => state.medicalRecords)

  const [filterType, setFilterType] = useState<MedicalRecordType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    dispatch(getMedicalRecords(patientId || undefined))
    return () => {
      dispatch(clearError())
    }
  }, [dispatch, patientId])

  const getRecordIcon = (type: MedicalRecordType) => {
    switch (type) {
      case 'consultation':
        return <ConsultationIcon />
      case 'prescription':
        return <PrescriptionIcon />
      case 'appointment':
        return <AppointmentIcon />
      case 'medical_history':
        return <HistoryIcon />
      default:
        return null
    }
  }

  const getRecordColor = (type: MedicalRecordType) => {
    switch (type) {
      case 'consultation':
        return 'primary'
      case 'prescription':
        return 'success'
      case 'appointment':
        return 'info'
      case 'medical_history':
        return 'warning'
      default:
        return 'grey'
    }
  }

  const getRecordDate = (record: MedicalRecord): Date => {
    if (record.recordType === 'consultation') {
      return new Date((record as ConsultationRecord).startTime || (record as ConsultationRecord).createdAt)
    }
    if (record.recordType === 'prescription') {
      return new Date((record as PrescriptionRecord).createdAt)
    }
    if (record.recordType === 'appointment') {
      return new Date((record as AppointmentRecord).date || (record as AppointmentRecord).createdAt)
    }
    if (record.recordType === 'medical_history') {
      return new Date((record as MedicalHistoryRecord).diagnosedDate || new Date(0))
    }
    return new Date(0)
  }

  const filteredRecords = records?.records.filter((record) => {
    // Filter by type
    if (filterType !== 'all' && record.recordType !== filterType) {
      return false
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      if (record.recordType === 'consultation') {
        const r = record as ConsultationRecord
        return (
          r.notes?.toLowerCase().includes(query) ||
          r.diagnosis?.some((d) => d.toLowerCase().includes(query)) ||
          r.symptoms?.some((s) => s.toLowerCase().includes(query)) ||
          r.doctorId?.name?.toLowerCase().includes(query)
        )
      }
      if (record.recordType === 'prescription') {
        const r = record as PrescriptionRecord
        return (
          r.medications?.some((m) => m.name.toLowerCase().includes(query)) ||
          r.diagnoses?.some((d) => d.condition.toLowerCase().includes(query)) ||
          r.doctorId?.name?.toLowerCase().includes(query)
        )
      }
      if (record.recordType === 'appointment') {
        const r = record as AppointmentRecord
        return (
          r.reason?.toLowerCase().includes(query) ||
          r.doctorId?.name?.toLowerCase().includes(query)
        )
      }
      if (record.recordType === 'medical_history') {
        const r = record as MedicalHistoryRecord
        return (
          r.condition?.toLowerCase().includes(query) ||
          r.notes?.toLowerCase().includes(query)
        )
      }
      return false
    }

    return true
  }) || []

  const renderRecordContent = (record: MedicalRecord) => {
    switch (record.recordType) {
      case 'consultation': {
        const r = record as ConsultationRecord
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                <Typography variant="h6">Consultation</Typography>
                <Chip label={r.status} size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Doctor: {r.doctorId?.name || 'N/A'}
              </Typography>
              {r.notes && (
                <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                  {r.notes.length > 200 ? `${r.notes.substring(0, 200)}...` : r.notes}
                </Typography>
              )}
              {r.diagnosis && r.diagnosis.length > 0 && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Diagnosis:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {r.diagnosis.map((d, idx) => (
                      <Chip key={idx} label={d} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
              {r.symptoms && r.symptoms.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Symptoms:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {r.symptoms.map((s, idx) => (
                      <Chip key={idx} label={s} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              {r._id && (
                <Link to={`/consultations/${r._id}`}>
                  <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                    View Details →
                  </Typography>
                </Link>
              )}
            </CardContent>
          </Card>
        )
      }
      case 'prescription': {
        const r = record as PrescriptionRecord
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                <Typography variant="h6">Prescription</Typography>
                <Chip label={r.isActive ? 'Active' : 'Inactive'} size="small" color={r.isActive ? 'success' : 'default'} />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Doctor: {r.doctorId?.name || 'N/A'}
              </Typography>
              {r.medications && r.medications.length > 0 && (
                <Box sx={{ mt: 1, mb: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Medications:
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {r.medications.map((med, idx) => (
                      <Typography key={idx} variant="body2">
                        • {med.name} - {med.dosage}, {med.frequency} for {med.duration}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              )}
              {r.diagnoses && r.diagnoses.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Diagnoses:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {r.diagnoses.map((d, idx) => (
                      <Chip key={idx} label={d.condition} size="small" />
                    ))}
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        )
      }
      case 'appointment': {
        const r = record as AppointmentRecord
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                <Typography variant="h6">Appointment</Typography>
                <Chip label={r.status} size="small" />
              </Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Doctor: {r.doctorId?.name || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                {dayjs(r.date).format('MMMM D, YYYY')} at {r.time}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Reason: {r.reason}
              </Typography>
              {r._id && (
                <Link to={`/appointments/${r._id}`}>
                  <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
                    View Details →
                  </Typography>
                </Link>
              )}
            </CardContent>
          </Card>
        )
      }
      case 'medical_history': {
        const r = record as MedicalHistoryRecord
        return (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medical History
              </Typography>
              <Typography variant="body1">{r.condition}</Typography>
              {r.diagnosedDate && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Diagnosed: {dayjs(r.diagnosedDate).format('MMMM D, YYYY')}
                </Typography>
              )}
              {r.notes && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {r.notes}
                </Typography>
              )}
            </CardContent>
          </Card>
        )
      }
      default:
        return null
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      </Container>
    )
  }

  if (!records) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info">No medical records found</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Medical Records
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {patientId ? `Viewing records for ${records.patientName}` : 'Your complete medical history'}
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="primary">
              {records.summary.totalConsultations}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Consultations
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="success.main">
              {records.summary.totalPrescriptions}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Prescriptions
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {records.summary.totalAppointments}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Appointments
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {records.summary.medicalHistoryItems}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              History Items
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label="Filter by Type"
                onChange={(e) => setFilterType(e.target.value as MedicalRecordType | 'all')}
              >
                <MenuItem value="all">All Records</MenuItem>
                <MenuItem value="consultation">Consultations</MenuItem>
                <MenuItem value="prescription">Prescriptions</MenuItem>
                <MenuItem value="appointment">Appointments</MenuItem>
                <MenuItem value="medical_history">Medical History</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Timeline */}
      {filteredRecords.length === 0 ? (
        <Alert severity="info">No records found matching your filters</Alert>
      ) : (
        <Timeline>
          {filteredRecords.map((record, index) => {
            const date = getRecordDate(record)
            return (
              <TimelineItem key={index}>
                <TimelineOppositeContent sx={{ flex: 0.2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {dayjs(date).format('MMM D, YYYY')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {dayjs(date).format('h:mm A')}
                  </Typography>
                </TimelineOppositeContent>
                <TimelineSeparator>
                  <TimelineDot color={getRecordColor(record.recordType)}>
                    {getRecordIcon(record.recordType)}
                  </TimelineDot>
                  {index < filteredRecords.length - 1 && <TimelineConnector />}
                </TimelineSeparator>
                <TimelineContent sx={{ flex: 0.7 }}>
                  {renderRecordContent(record)}
                </TimelineContent>
              </TimelineItem>
            )
          })}
        </Timeline>
      )}
    </Container>
  )
}

export default MedicalRecordsPage
