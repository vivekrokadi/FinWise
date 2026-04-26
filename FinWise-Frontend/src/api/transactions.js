import { apiClient } from './client'

/**
 * Transactions API calls
 * Based on backend transactionController.js
 */

/**
 * Get transactions with pagination and filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @param {string} params.type - Filter by type
 * @param {string} params.category - Filter by category
 * @param {string} params.account - Filter by account ID
 * @param {string} params.startDate - Start date ISO string
 * @param {string} params.endDate - End date ISO string
 * @param {string} params.search - Search in description/merchant
 */
export const getTransactions = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value)
    }
  })
  
  const queryString = queryParams.toString()
  const endpoint = `/transactions${queryString ? `?${queryString}` : ''}`
  
  const response = await apiClient.get(endpoint)
  return response // Returns paginated response with data array
}

/**
 * Get single transaction by ID
 * @param {string} id - Transaction ID
 */
export const getTransaction = async (id) => {
  const response = await apiClient.get(`/transactions/${id}`)
  return response.data
}

/**
 * Create new transaction
 * @param {Object} transactionData - Transaction data
 */
export const createTransaction = async (transactionData) => {
  const response = await apiClient.post('/transactions', transactionData)
  return response.data
}

/**
 * Update transaction
 * @param {string} id - Transaction ID
 * @param {Object} transactionData - Fields to update
 */
export const updateTransaction = async (id, transactionData) => {
  const response = await apiClient.put(`/transactions/${id}`, transactionData)
  return response.data
}

/**
 * Delete transaction
 * @param {string} id - Transaction ID
 */
export const deleteTransaction = async (id) => {
  const response = await apiClient.delete(`/transactions/${id}`)
  return response
}

/**
 * Bulk delete transactions
 * @param {string[]} transactionIds - Array of transaction IDs
 */
export const bulkDeleteTransactions = async (transactionIds) => {
  // transactionIds must be a plain array — pass as body to DELETE request
  const ids = Array.isArray(transactionIds) ? transactionIds : transactionIds?.transactionIds || []
  return apiClient.delete('/transactions/bulk-delete', { transactionIds: ids })
}

/**
 * Get transaction statistics
 * @param {Object} params - { startDate?, endDate?, account? }
 */
export const getTransactionStats = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value)
  })
  
  const queryString = queryParams.toString()
  const endpoint = `/transactions/stats${queryString ? `?${queryString}` : ''}`
  
  const response = await apiClient.get(endpoint)
  return response.data
}

/**
 * Get category breakdown
 * @param {Object} params - { type?, startDate?, endDate? }
 */
export const getCategoryBreakdown = async (params = {}) => {
  const queryParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value) queryParams.append(key, value)
  })
  
  const queryString = queryParams.toString()
  const endpoint = `/transactions/category-breakdown${queryString ? `?${queryString}` : ''}`
  
  const response = await apiClient.get(endpoint)
  return response.data
}