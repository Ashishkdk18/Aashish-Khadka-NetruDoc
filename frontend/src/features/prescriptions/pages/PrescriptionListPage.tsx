import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Pagination,
} from '@mui/material'
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Medication as MedicationIcon,
} from '@mui/icons-material'
import { AppDispatch, RootState } from '../../../store/index'
import { getPrescriptions, downloadPrescription, clearError } from '../prescriptionSlice'
import { usePagination } from '../../../utils/pagination'
import { Prescription } from '../api/prescriptionApi'
import dayjs from 'dayjs'

const PrescriptionListPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { prescriptions, loading, error, downloading } = useSelector((state: RootState) => state.prescriptions)

  const { page, limit, goToPage } = usePagination(1, 10)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const isDoctor = user?.role === 'doctor'
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    loadPrescriptions()
  }, [page, limit, statusFilter])

  const loadPrescriptions = () => {
    const params: any = {
      page,
      limit,
      sort: '-createdAt',
    }

    if (statusFilter !== 'all') {
      // Note: Backend filters by isActive, but we'll filter client-side for now
    }

    dispatch(getPrescriptions(params))
  }

  const handleDownload = async (prescriptionId: string) => {
    try {
      await dispatch(downloadPrescription(prescriptionId)).unwrap()
    } catch (error) {
      console.error('Failed to download prescription:', error)
    }
  }

  const filteredPrescriptions = prescriptions.filter((prescription) => {
    if (statusFilter !== 'all' && prescription.isActive !== (statusFilter === 'active')) {
      return false
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const doctor = typeof prescription.doctorId === 'object' ? prescription.doctorId : null
      const patient = typeof prescription.patientId === 'object' ? prescription.patientId : null
      return (
        prescription.medications?.some((m) => m.name.toLowerCase().includes(query)) ||
        prescription.diagnoses?.some((d) =>
          typeof d === 'object' ? d.condition.toLowerCase().includes(query) : d.toLowerCase().includes(query)
        ) ||
        doctor?.name?.toLowerCase().includes(query) ||
        (isAdmin && patient?.name?.toLowerCase().includes(query))
      )
    }

    return true
  })

  const paginationMeta = (prescriptions as any)?.pagination || null
  const totalPages = paginationMeta?.totalPages || 1

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          {isDoctor ? 'My Prescriptions' : 'My Prescriptions'}
        </Typography>
        {isDoctor && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/prescriptions/create')}
          >
            Create Prescription
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => dispatch(clearError())}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              placeholder="Search prescriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadPrescriptions}
              disabled={loading}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : filteredPrescriptions.length === 0 ? (
        <Alert severity="info">
          {searchQuery || statusFilter !== 'all'
            ? 'No prescriptions found matching your filters'
            : 'No prescriptions found'}
        </Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  {isAdmin && <TableCell>Patient</TableCell>}
                  <TableCell>Doctor</TableCell>
                  <TableCell>Medications</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPrescriptions.map((prescription: Prescription) => {
                  const prescriptionId = prescription._id || prescription.id
                  const doctor = typeof prescription.doctorId === 'object' ? prescription.doctorId : null
                  const patient = typeof prescription.patientId === 'object' ? prescription.patientId : null

                  return (
                    <TableRow key={prescriptionId} hover>
                      <TableCell>
                        {prescription.createdAt
                          ? dayjs(prescription.createdAt).format('MMM D, YYYY')
                          : '—'}
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          {patient?.name || '—'}
                        </TableCell>
                      )}
                      <TableCell>
                        {doctor?.name ? `Dr. ${doctor.name}` : '—'}
                      </TableCell>
                      <TableCell>
                        {prescription.medications && prescription.medications.length > 0 ? (
                          <Chip
                            icon={<MedicationIcon />}
                            label={`${prescription.medications.length} medication(s)`}
                            size="small"
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={prescription.isActive ? 'Active' : 'Inactive'}
                          color={prescription.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              component={Link}
                              to={`/prescriptions/${prescriptionId}`}
                            >
                              <ViewIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Download PDF">
                            <IconButton
                              size="small"
                              onClick={() => handleDownload(prescriptionId!)}
                              disabled={downloading}
                            >
                              <DownloadIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => goToPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  )
}

export default PrescriptionListPage

