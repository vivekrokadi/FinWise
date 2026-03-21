import { apiClient } from './client'

/**
 * Authentication API calls
 * Based on backend authController.js
 */

/**
 * Register new user
 * @param {Object} userData - { name, email, password }
 */
export const register = async (userData) => {
  const response = await apiClient.post('/auth/register', userData)
  
  // Store token on successful registration
  if (response.success && response.data?.token) {
    apiClient.setToken(response.data.token)
  }
  
  return response
}

/**
 * Login user
 * @param {Object} credentials - { email, password }
 */
export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials)
  
  // Store token on successful login
  if (response.success && response.data?.token) {
    apiClient.setToken(response.data.token)
  }
  
  return response
}

/**
 * Get current user profile
 */
export const getCurrentUser = async () => {
  return apiClient.get('/auth/me')
}

/**
 * Update user profile
 * @param {Object} profileData - { name?, currency?, monthlyBudget? }
 */
export const updateProfile = async (profileData) => {
  return apiClient.put('/auth/profile', profileData)
}

/**
 * Change password
 * @param {Object} passwordData - { currentPassword, newPassword }
 */
export const changePassword = async (passwordData) => {
  return apiClient.put('/auth/change-password', passwordData)
}

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await apiClient.post('/auth/logout', {})
  } finally {
    // Always clear token, even if API call fails
    apiClient.setToken(null)
  }
}