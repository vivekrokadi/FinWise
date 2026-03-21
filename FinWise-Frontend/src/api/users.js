import { apiClient } from './client'

/**
 * Users API calls
 * Based on backend userController.js
 */

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  const response = await apiClient.get('/users/dashboard')
  return response.data
}

/**
 * Delete user account (permanent)
 */
export const deleteUserAccount = async () => {
  const response = await apiClient.delete('/users/account')
  return response
}

/**
 * Upload avatar image
 * @param {File} avatarFile - Avatar image file
 */
export const uploadAvatar = async (avatarFile) => {
  const formData = new FormData()
  formData.append('avatar', avatarFile)
  
  const response = await apiClient.postFormData('/users/avatar', formData)
  return response.data
}