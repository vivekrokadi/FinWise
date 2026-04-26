import { ENV } from '../config/env'
import { STORAGE_KEYS, HTTP_STATUS } from '../utils/constants'

/**
 * Centralized API client with auth header handling
 * and global error processing
 */
class ApiClient {
  constructor() {
    this.baseURL = ENV.API_URL
  }

  /**
   * Get auth token from localStorage
   */
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  /**
   * Set auth token
   */
  setToken(token) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    }
  }

  /**
   * Get headers with auth token
   */
  getHeaders(options = {}) {
    const token = this.getToken()
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Handle response, check for errors
   */
  async handleResponse(response) {
    const data = await response.json()

    // Handle 401 Unauthorized globally
    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      this.setToken(null)
      window.location.href = '/login'
      throw new Error('Session expired. Please login again.')
    }

    // Handle other error statuses
    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  }

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(options),
      ...options
    })
    return this.handleResponse(response)
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(options),
      body: JSON.stringify(body),
      ...options
    })
    return this.handleResponse(response)
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(options),
      body: JSON.stringify(body),
      ...options
    })
    return this.handleResponse(response)
  }

  /**
   * DELETE request
   */
  // body is optional — needed for bulk-delete which sends { transactionIds: [...] }
  async delete(endpoint, body = null) {
    const config = {
      method: 'DELETE',
      headers: this.getHeaders()
    }
    if (body) {
      config.body = JSON.stringify(body)
    }
    const response = await fetch(`${this.baseURL}${endpoint}`, config)
    return this.handleResponse(response)
  }

  /**
   * POST with FormData (for file uploads)
   */
  async postFormData(endpoint, formData, options = {}) {
    const token = this.getToken()
    const headers = {}
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      ...options
    })
    return this.handleResponse(response)
  }
}

// Create singleton instance
export const apiClient = new ApiClient()