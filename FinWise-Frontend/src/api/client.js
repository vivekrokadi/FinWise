import { STORAGE_KEYS, HTTP_STATUS } from '../utils/constants'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

class ApiClient {
  getToken() {
    return localStorage.getItem(STORAGE_KEYS.TOKEN)
  }

  setToken(token) {
    if (token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    } else {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
    }
  }

  getHeaders(extra = {}) {
    const token = this.getToken()
    const headers = { 'Content-Type': 'application/json', ...extra }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return headers
  }

  async handleResponse(response) {
    const data = await response.json()

    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      this.setToken(null)
      window.location.href = '/login'
      throw new Error('Session expired. Please login again.')
    }

    if (!response.ok) {
      const error = new Error(data.message || 'Something went wrong')
      error.status = response.status
      error.data = data
      throw error
    }

    return data
  }

  async get(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders()
    })
    return this.handleResponse(response)
  }

  async post(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    })
    return this.handleResponse(response)
  }

  async put(endpoint, body) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body)
    })
    return this.handleResponse(response)
  }

  // body is optional — needed for bulk-delete which sends { transactionIds: [...] }
  async delete(endpoint, body) {
    const config = {
      method: 'DELETE',
      headers: this.getHeaders()
    }
    if (body) config.body = JSON.stringify(body)
    const response = await fetch(`${BASE_URL}${endpoint}`, config)
    return this.handleResponse(response)
  }

  async postFormData(endpoint, formData) {
    const token = this.getToken()
    const headers = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData
    })
    return this.handleResponse(response)
  }
}

export const apiClient = new ApiClient()