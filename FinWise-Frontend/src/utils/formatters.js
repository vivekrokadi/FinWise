/**
 * Utility functions for formatting data
 */

/**
 * Format currency based on currency code
 */
export const formatCurrency = (amount, currency = 'RUPEES') => {
  if (amount === null || amount === undefined) return '₹0'
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency === 'RUPEES' ? 'INR' : currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  
  return formatter.format(amount)
}

/**
 * Format date to readable string
 */
export const formatDate = (date, format = 'medium') => {
  if (!date) return 'N/A'
  
  const d = new Date(date)
  
  const options = {
    short: { day: 'numeric', month: 'short', year: 'numeric' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' }
  }
  
  return d.toLocaleDateString('en-IN', options[format] || options.medium)
}

/**
 * Format percentage
 */
export const formatPercentage = (value) => {
  if (value === null || value === undefined) return '0%'
  return `${Math.round(value)}%`
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

/**
 * Format account type for display
 */
export const formatAccountType = (type) => {
  const types = {
    CURRENT: 'Current',
    SAVINGS: 'Savings',
    INVESTMENT: 'Investment',
    CREDIT_CARD: 'Credit Card'
  }
  return types[type] || type
}

/**
 * Format transaction type for display
 */
export const formatTransactionType = (type) => {
  const types = {
    INCOME: 'Income',
    EXPENSE: 'Expense',
    INVESTMENT: 'Investment',
    TAX: 'Tax'
  }
  return types[type] || type
}

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num)
}

/**
 * Get color class based on amount (negative/positive)
 */
export const getAmountColorClass = (amount) => {
  if (amount > 0) return 'text-green-600'
  if (amount < 0) return 'text-red-600'
  return 'text-gray-600'
}

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}