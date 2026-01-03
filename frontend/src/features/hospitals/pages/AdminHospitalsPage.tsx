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
import { hospitalApi } from '../api/hospitalApi'
import { Hospital } from '../models/hospitalModels'
import { PaginatedApiResponse } from '../../../types/api'

const AdminHospitalsPage: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const [hospitals, setHospitals] = useState<Hospital[]>([])
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
    loadHospitals()
  }, [page, searchTerm, currentUser])

  const loadHospitals = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: any = {}
      if (searchTerm) filters.search = searchTerm

      const response = await hospitalApi.getHospitals(filters, { page, limit: 10 }) as any
      
      if (response.status === 'success') {
        setHospitals(response.data.items || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
        setTotal(response.data.pagination?.total || 0)
      } else {
        setError(response.message || 'Failed to load hospitals')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load hospitals')
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
          Hospital Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search hospitals..."
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
                    <TableCell>City</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Emergency Services</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Verified</TableCell>
                    <TableCell>Rating</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {hospitals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No hospitals found
                      </TableCell>
                    </TableRow>
                  ) : (
                    hospitals.map((hospital) => (
                      <TableRow key={hospital.id}>
                        <TableCell>{hospital.name}</TableCell>
                        <TableCell>{hospital.address.city}</TableCell>
                        <TableCell>
                          <Chip
                            label={hospital.type}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {hospital.emergencyServices ? (
                            <Chip label="Yes" color="success" size="small" />
                          ) : (
                            <Chip label="No" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={hospital.isActive ? 'Active' : 'Inactive'}
                            color={hospital.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {hospital.isVerified ? (
                            <Chip label="Verified" color="success" size="small" />
                          ) : (
                            <Chip label="Not Verified" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {hospital.averageRating ? (
                            <Typography variant="body2">
                              {hospital.averageRating.toFixed(1)} ({hospital.totalReviews || 0})
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No ratings
                            </Typography>
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
                Showing {hospitals.length} of {total} hospitals
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  )
}

export default AdminHospitalsPage

