import apiClient from './apiClient'
import { NotificationResponse, ApiResponse } from '../types/api'

interface CreateNotificationRequest {
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
}

class NotificationService {
  // Get user's notifications
  async getNotifications(): Promise<ApiResponse<NotificationResponse[]>> {
    return apiClient.get<NotificationResponse[]>('/notifications')
  }

  // Get notification by ID
  async getNotification(notificationId: string): Promise<ApiResponse<NotificationResponse>> {
    return apiClient.get<NotificationResponse>(`/notifications/${notificationId}`)
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<ApiResponse> {
    return apiClient.put(`/notifications/${notificationId}/read`)
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<ApiResponse> {
    return apiClient.put('/notifications/read-all')
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<ApiResponse> {
    return apiClient.delete(`/notifications/${notificationId}`)
  }

  // Create notification (Admin only)
  async createNotification(notificationData: CreateNotificationRequest): Promise<ApiResponse<NotificationResponse>> {
    return apiClient.post<NotificationResponse>('/notifications', notificationData)
  }

  // Get unread notification count
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return apiClient.get<{ count: number }>('/notifications/unread-count')
  }

  // Get notifications by type
  async getNotificationsByType(type: 'info' | 'success' | 'warning' | 'error'): Promise<ApiResponse<NotificationResponse[]>> {
    return apiClient.get<NotificationResponse[]>(`/notifications?type=${type}`)
  }

  // Get notifications by date range
  async getNotificationsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<ApiResponse<NotificationResponse[]>> {
    return apiClient.get<NotificationResponse[]>(`/notifications?startDate=${startDate}&endDate=${endDate}`)
  }
}

const notificationService = new NotificationService()
export default notificationService
