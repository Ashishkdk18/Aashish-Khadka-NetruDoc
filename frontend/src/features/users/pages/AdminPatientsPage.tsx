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

const AdminPatientsPage: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const [patients, setPatients] = useState<User[]>([])
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
    loadPatients()
  }, [page, searchTerm, currentUser])

  const loadPatients = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await userApi.getPatients({ page, limit: 10 }) as any
      
      if (response.status === 'success') {
        // Filter by search term on client side if needed, or add search to API
        let filteredPatients = response.data.items || []
        if (searchTerm) {
          filteredPatients = filteredPatients.filter((patient: User) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        setPatients(filteredPatients)
        setTotalPages(response.data.pagination?.totalPages || 1)
        setTotal(response.data.pagination?.total || 0)
      } else {
        setError(response.message || 'Failed to load patients')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load patients')
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
          Patient Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Search */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <TextField
            placeholder="Search patients by name, email, or phone..."
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
                    <TableCell>Phone</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>Gender</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Verified</TableCell>
                    <TableCell>Joined</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patients.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No patients found
                      </TableCell>
                    </TableRow>
                  ) : (
                    patients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>{patient.name}</TableCell>
                        <TableCell>{patient.email}</TableCell>
                        <TableCell>{patient.phone || 'N/A'}</TableCell>
                        <TableCell>{patient.address?.city || 'N/A'}</TableCell>
                        <TableCell>
                          {patient.gender ? (
                            <Chip
                              label={patient.gender}
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={patient.isActive ? 'Active' : 'Inactive'}
                            color={patient.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {patient.isVerified ? (
                            <Chip label="Verified" color="success" size="small" />
                          ) : (
                            <Chip label="Not Verified" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.createdAt ? (
                            <Typography variant="body2">
                              {new Date(patient.createdAt).toLocaleDateString()}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              N/A
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
                Showing {patients.length} of {total} patients
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  )
}

export default AdminPatientsPage

