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
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Delete as DeleteIcon,
  CheckCircle as ActivateIcon,
  Cancel as DeactivateIcon,
  Search as SearchIcon,
} from '@mui/icons-material'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { userApi } from '../api/userApi'
import { User, UserRole } from '../models/userModels'

const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useSelector((state: RootState) => state.auth)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [actionType, setActionType] = useState<'activate' | 'deactivate' | 'delete' | null>(null)

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      return
    }
    loadUsers()
  }, [page, roleFilter, statusFilter, currentUser])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters: any = {}
      if (roleFilter !== 'all') filters.role = roleFilter
      if (statusFilter === 'active') filters.isActive = true
      if (statusFilter === 'inactive') filters.isActive = false

      const response = await userApi.getUsers({ page, limit: 10 })
      
      if (response.status === 'success') {
        setUsers(response.data.items || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
      } else {
        setError(response.message || 'Failed to load users')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleActivate = async (userId: string) => {
    try {
      const response = await userApi.activateUser(userId)
      if (response.status === 'success') {
        loadUsers()
        setDialogOpen(false)
      } else {
        setError(response.message || 'Failed to activate user')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate user')
    }
  }

  const handleDeactivate = async (userId: string) => {
    try {
      const response = await userApi.deactivateUser(userId)
      if (response.status === 'success') {
        loadUsers()
        setDialogOpen(false)
      } else {
        setError(response.message || 'Failed to deactivate user')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to deactivate user')
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const response = await userApi.deleteUser(userId)
      if (response.status === 'success') {
        loadUsers()
        setDialogOpen(false)
      } else {
        setError(response.message || 'Failed to delete user')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete user')
    }
  }

  const openDialog = (user: User, action: 'activate' | 'deactivate' | 'delete') => {
    setSelectedUser(user)
    setActionType(action)
    setDialogOpen(true)
  }

  const handleDialogConfirm = () => {
    if (!selectedUser) return

    switch (actionType) {
      case 'activate':
        handleActivate(selectedUser.id)
        break
      case 'deactivate':
        handleDeactivate(selectedUser.id)
        break
      case 'delete':
        handleDelete(selectedUser.id)
        break
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
          User Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1, minWidth: 200 }}
          />

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Role</InputLabel>
            <Select
              value={roleFilter}
              label="Role"
              onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
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
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Verified</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            color={user.role === 'admin' ? 'error' : user.role === 'doctor' ? 'primary' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.isVerified ? (
                            <Chip label="Verified" color="success" size="small" />
                          ) : (
                            <Chip label="Not Verified" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {user.isActive ? (
                            <IconButton
                              color="warning"
                              onClick={() => openDialog(user, 'deactivate')}
                              title="Deactivate"
                            >
                              <DeactivateIcon />
                            </IconButton>
                          ) : (
                            <IconButton
                              color="success"
                              onClick={() => openDialog(user, 'activate')}
                              title="Activate"
                            >
                              <ActivateIcon />
                            </IconButton>
                          )}
                          <IconButton
                            color="error"
                            onClick={() => openDialog(user, 'delete')}
                            title="Delete"
                          >
                            <DeleteIcon />
                          </IconButton>
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
          </>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>
            {actionType === 'activate' && 'Activate User'}
            {actionType === 'deactivate' && 'Deactivate User'}
            {actionType === 'delete' && 'Delete User'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to {actionType} {selectedUser?.name}?
            </Typography>
            {actionType === 'delete' && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This action cannot be undone. The user will be permanently deleted.
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDialogConfirm}
              color={actionType === 'delete' ? 'error' : 'primary'}
              variant="contained"
            >
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  )
}

export default UserManagementPage
