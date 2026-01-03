/**
 * User API Service
 * Handles all user-related API calls
 * Separated from UI logic
 */

import apiClient from '../../../services/apiClient'
import { ApiResponse, PaginatedApiResponse } from '../../../types/api'
import { User } from '../models/userModels'

class UserApi {
  private readonly basePath = '/users'

  /**
   * Get all users (Admin only) - US8
   */
  async getUsers(params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedApiResponse<User>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const queryString = queryParams.toString()
    const url = queryString ? `${this.basePath}?${queryString}` : this.basePath
    
    return apiClient.get(url)
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.get<{ user: User }>(`${this.basePath}/${userId}`)
  }

  /**
   * Update user (Admin only) - US8
   */
  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    return apiClient.put<{ user: User }>(`${this.basePath}/${userId}`, userData)
  }

  /**
   * Delete user (Admin only) - US8
   */
  async deleteUser(userId: string): Promise<ApiResponse> {
    return apiClient.delete(`${this.basePath}/${userId}`)
  }

  /**
   * Activate user account (Admin only) - US8
   */
  async activateUser(userId: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.put<{ user: User }>(`${this.basePath}/${userId}/activate`)
  }

  /**
   * Deactivate user account (Admin only) - US8
   */
  async deactivateUser(userId: string): Promise<ApiResponse<{ user: User }>> {
    return apiClient.put<{ user: User }>(`${this.basePath}/${userId}/deactivate`)
  }

  /**
   * Get all doctors
   */
  async getDoctors(params?: {
    page?: number
    limit?: number
    specialization?: string
  }): Promise<PaginatedApiResponse<User>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.specialization) queryParams.append('specialization', params.specialization)
    
    const queryString = queryParams.toString()
    const url = queryString ? `${this.basePath}/doctors?${queryString}` : `${this.basePath}/doctors`
    
    return apiClient.get(url)
  }

  /**
   * Get all patients (Admin only)
   */
  async getPatients(params?: {
    page?: number
    limit?: number
  }): Promise<PaginatedApiResponse<User>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    
    const queryString = queryParams.toString()
    const url = queryString ? `${this.basePath}/patients?${queryString}` : `${this.basePath}/patients`
    
    return apiClient.get(url)
  }
}

export const userApi = new UserApi()
export default userApi
