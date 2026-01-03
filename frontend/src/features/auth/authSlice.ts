import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import { authApi } from './api/authApi'
import { AuthState, RegistrationData, LoginCredentials, ProfileUpdate, ChangePasswordData } from './models/authModels'
import apiClient from '../../services/apiClient'

const initialState: AuthState = {
  user: null,
  token: apiClient.getAuthToken(),
  isAuthenticated: false,
  loading: true,
  error: null,
}


// Load user from token
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = apiClient.getAuthToken()
      if (!token) {
        throw new Error('No token found')
      }

      // Decode token to get user info
      const decoded: any = jwtDecode(token)

      // Check if token is expired
      const currentTime = Date.now() / 1000
      if (decoded.exp < currentTime) {
        throw new Error('Token expired')
      }

      const response = await authApi.getMe()
      return response.data.user
    } catch (error: any) {
      apiClient.removeAuthToken()
      return rejectWithValue(error.message || 'Failed to load user')
    }
  }
)

// Register user (US1, US2)
export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegistrationData, { rejectWithValue }) => {
    try {
      const response = await authApi.register(userData)

      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Registration failed')
      }

      const { token, user } = response.data

      apiClient.setAuthToken(token)

      return { token, user }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Registration failed'
      return rejectWithValue(message)
    }
  }
)

// Login user (US3)
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)

      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Login failed')
      }

      const { token, user } = response.data

      apiClient.setAuthToken(token)

      return { token, user }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Login failed'
      return rejectWithValue(message)
    }
  }
)

// Update profile (US6)
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: ProfileUpdate, { rejectWithValue }) => {
    try {
      const response = await authApi.updateProfile(profileData)

      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Profile update failed')
      }

      return response.data.user
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Profile update failed'
      return rejectWithValue(message)
    }
  }
)

// Change password (US6)
export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async (passwordData: ChangePasswordData, { rejectWithValue }) => {
    try {
      const response = await authApi.changePassword(passwordData)

      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Password change failed')
      }

      return 'Password updated successfully'
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Password change failed'
      return rejectWithValue(message)
    }
  }
)

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authApi.logout()
    } catch (error) {
      // Ignore logout errors
    } finally {
      apiClient.removeAuthToken()
    }
  }
)

// Forgot password (US7)
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await authApi.forgotPassword({ email })

      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Failed to send reset email')
      }

      return response.message || 'Password reset email sent'
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to send reset email'
      return rejectWithValue(message)
    }
  }
)

// Reset password (US7)
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ token, password }: { token: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authApi.resetPassword(token, password)

      if (response.status === 'error') {
        return rejectWithValue(response.message || 'Failed to reset password')
      }

      return response.message || 'Password reset successfully'
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || 'Failed to reset password'
      return rejectWithValue(message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload
        state.error = null
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.error = null
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = action.payload as string
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.error = null
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Change Password
      .addCase(changePassword.pending, (state) => {
        state.loading = true
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false
        state.error = null
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
