import { apiClient } from './client'

/**
 * AI Features API calls
 * Based on backend aiController.js
 */

/**
 * Scan receipt image
 * @param {File} receiptFile - Receipt image file (max 5MB)
 */
export const scanReceipt = async (receiptFile) => {
  const formData = new FormData()
  formData.append('receipt', receiptFile)
  
  const response = await apiClient.postFormData('/ai/scan-receipt', formData)
  return response.data // Returns scanned data
}

/**
 * Generate financial insights
 * @param {Object} params - { period?, accountId? }
 */
export const generateInsights = async (params = {}) => {
  const response = await apiClient.post('/ai/insights', params)
  return response.data // Returns { insights, summary, period }
}

/**
 * Get investment suggestions
 * @param {Object} params - { riskTolerance?, investmentAmount? }
 */
export const getInvestmentSuggestions = async (params = {}) => {
  const response = await apiClient.post('/ai/investment-suggestions', params)
  return response.data // Returns { suggestions, riskProfile, investmentAmount, userSnapshot }
}

/**
 * Get tax tips
 */
export const getTaxTips = async () => {
  const response = await apiClient.post('/ai/tax-tips', {})
  return response.data // Returns { tips, taxYear, totalDeductibleExpenses, totalInvestments }
}