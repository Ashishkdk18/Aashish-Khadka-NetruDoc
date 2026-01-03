import { useEffect, useState } from 'react'
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  Alert,
} from '@mui/material'
import { Search as SearchIcon } from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { userApi } from '../api/userApi'
import { User } from '../models/userModels'
import { PaginatedApiResponse } from '../../../types/api'

const AdminDoctorsPage: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const [doctors, setDoctors] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      return
    }
    loadDoctors()
  }, [page, searchTerm, currentUser])

  const loadDoctors = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await userApi.getDoctors({ page, limit: 10 }) as any
      
      if (response.status === 'success') {
        // Filter by search term on client side if needed, or add search to API
        let filteredDoctors = response.data.items || []
        if (searchTerm) {
          filteredDoctors = filteredDoctors.filter((doctor: User) =>
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        setDoctors(filteredDoctors)
        setTotalPages(response.data.pagination?.totalPages || 1)
        setTotal(response.data.pagination?.total || 0)
      } else {
        setError(response.message || 'Failed to load doctors')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load doctors')
    } finally {
      setLoading(false)
    }
  }

  if (currentUser?.role !== 'admin') {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Access denied. Admin privileges required.</Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Doctor Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search doctors by name, email, or specialization..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(1)
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Specialization</TableCell>
                    <TableCell>Hospital</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell>Rating</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Verified</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {doctors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No doctors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    doctors.map((doctor) => (
                      <TableRow key={doctor.id}>
                        <TableCell>{doctor.name}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>
                          {doctor.specialization ? (
                            <Chip
                              label={doctor.specialization}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{doctor.hospital || 'N/A'}</TableCell>
                        <TableCell>
                          {doctor.experience ? `${doctor.experience} years` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {doctor.rating ? (
                            <Typography variant="body2">
                              {doctor.rating.toFixed(1)} ⭐
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No rating
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={doctor.isActive ? 'Active' : 'Inactive'}
                            color={doctor.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {doctor.isVerified ? (
                            <Chip label="Verified" color="success" size="small" />
                          ) : (
                            <Chip label="Not Verified" size="small" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}

            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Showing {doctors.length} of {total} doctors
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  )
}

export default AdminDoctorsPage

