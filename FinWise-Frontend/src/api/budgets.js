import { apiClient } from './client'

/**
 * Budgets API calls
 * Based on backend budgetController.js
 */

/**
 * Get all budgets for a year
 * @param {number} year - Year (default: current year)
 */
export const getBudgets = async (year) => {
  const query = year ? `?year=${year}` : ''
  const response = await apiClient.get(`/budgets${query}`)
  return response.data // Returns array with currentSpending, remainingAmount, percentageUsed
}

/**
 * Get current month budget with expenses
 * @param {string} accountId - Optional account ID filter
 */
export const getCurrentBudget = async (accountId) => {
  const query = accountId ? `?accountId=${accountId}` : ''
  const response = await apiClient.get(`/budgets/current${query}`)
  return response.data // Returns { budget, currentExpenses }
}

/**
 * Create or update budget (upsert)
 * @param {Object} budgetData - { amount, period?, category, year?, month?, alertsEnabled?, alertThreshold? }
 */
export const createOrUpdateBudget = async (budgetData) => {
  const response = await apiClient.post('/budgets', budgetData)
  return response.data
}

/**
 * Update budget by ID
 * @param {string} id - Budget ID
 * @param {Object} budgetData - Fields to update
 */
export const updateBudget = async (id, budgetData) => {
  const response = await apiClient.put(`/budgets/${id}`, budgetData)
  return response.data
}

/**
 * Delete budget
 * @param {string} id - Budget ID
 */
export const deleteBudget = async (id) => {
  const response = await apiClient.delete(`/budgets/${id}`)
  return response
}

/**
 * Get budget alerts for current month
 */
export const getBudgetAlerts = async () => {
  const response = await apiClient.get('/budgets/alerts')
  return response.data // Returns array of alerts
}

/**
 * Get budget statistics for current month
 */
export const getBudgetStats = async () => {
  const response = await apiClient.get('/budgets/stats')
  return response.data // Returns { overall, byCategory }
}