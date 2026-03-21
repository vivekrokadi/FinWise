import { apiClient } from './client'

/**
 * Accounts API calls
 * Based on backend accountController.js
 */

/**
 * Get all accounts for current user
 */
export const getAccounts = async () => {
  const response = await apiClient.get('/accounts')
  return response.data // Returns array of accounts
}

/**
 * Get single account with recent transactions
 * @param {string} id - Account ID
 */
export const getAccount = async (id) => {
  const response = await apiClient.get(`/accounts/${id}`)
  return response.data // Returns { account, transactions }
}

/**
 * Get account statistics
 * @param {string} id - Account ID
 */
export const getAccountStats = async (id) => {
  const response = await apiClient.get(`/accounts/${id}/stats`)
  return response.data // Returns stats object
}

/**
 * Create new account
 * @param {Object} accountData - { name, type?, balance?, currency?, isDefault?, color?, description? }
 */
export const createAccount = async (accountData) => {
  const response = await apiClient.post('/accounts', accountData)
  return response.data // Returns created account
}

/**
 * Update account
 * @param {string} id - Account ID
 * @param {Object} accountData - Fields to update
 */
export const updateAccount = async (id, accountData) => {
  const response = await apiClient.put(`/accounts/${id}`, accountData)
  return response.data // Returns updated account
}

/**
 * Delete account
 * @param {string} id - Account ID
 */
export const deleteAccount = async (id) => {
  const response = await apiClient.delete(`/accounts/${id}`)
  return response // Returns { success, message }
}

/**
 * Set account as default
 * @param {string} id - Account ID
 */
export const setDefaultAccount = async (id) => {
  const response = await apiClient.put(`/accounts/${id}/set-default`, {})
  return response.data // Returns updated account
}