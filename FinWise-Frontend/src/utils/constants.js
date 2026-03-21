/**
 * Application constants
 * Based on backend contract analysis
 */

// Account types
export const ACCOUNT_TYPES = [
  { value: 'CURRENT', label: 'Current' },
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'CREDIT_CARD', label: 'Credit Card' }
]

// Transaction types
export const TRANSACTION_TYPES = [
  { value: 'INCOME', label: 'Income' },
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'TAX', label: 'Tax' }
]

// Investment types
export const INVESTMENT_TYPES = [
  { value: 'STOCKS', label: 'Stocks' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'BONDS', label: 'Bonds' },
  { value: 'MUTUAL_FUNDS', label: 'Mutual Funds' },
  { value: 'OTHER', label: 'Other' }
]

// Recurring intervals
export const RECURRING_INTERVALS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' }
]

// Budget periods
export const BUDGET_PERIODS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' }
]

// Risk tolerance levels
export const RISK_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'green' },
  { value: 'MODERATE', label: 'Moderate', color: 'yellow' },
  { value: 'HIGH', label: 'High', color: 'red' }
]

// Currency options
export const CURRENCIES = [
  { value: 'RUPEES', label: '₹ Rupees' },
  { value: 'USD', label: '$ Dollar' },
  { value: 'EUR', label: '€ Euro' },
  { value: 'GBP', label: '£ Pound' }
]

// Default colors
export const DEFAULT_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  GRAY: '#6B7280'
}

// Alert threshold options
export const ALERT_THRESHOLDS = [50, 60, 70, 80, 90, 100]

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 25, 50, 100]
}

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'finwise_token',
  USER: 'finwise_user'
}

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500
}