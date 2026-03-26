// FinWise-Frontend/src/utils/constants.js - UPDATED
/**
 * Application constants
 * Based on backend contract analysis
 */

// ==========================================
// ACCOUNT TYPES
// ==========================================
export const ACCOUNT_TYPES = [
  { value: 'CURRENT', label: 'Current' },
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'CREDIT_CARD', label: 'Credit Card' }
]

// ==========================================
// TRANSACTION TYPES
// ==========================================
export const TRANSACTION_TYPES = [
  { value: 'INCOME', label: 'Income' },
  { value: 'EXPENSE', label: 'Expense' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'TAX', label: 'Tax' }
]

// ==========================================
// INVESTMENT TYPES
// ==========================================
export const INVESTMENT_TYPES = [
  { value: 'STOCKS', label: 'Stocks' },
  { value: 'CRYPTO', label: 'Crypto' },
  { value: 'REAL_ESTATE', label: 'Real Estate' },
  { value: 'BONDS', label: 'Bonds' },
  { value: 'MUTUAL_FUNDS', label: 'Mutual Funds' },
  { value: 'OTHER', label: 'Other' }
]

// ==========================================
// RECURRING INTERVALS
// ==========================================
export const RECURRING_INTERVALS = [
  { value: 'DAILY', label: 'Daily' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' }
]

// ==========================================
// BUDGET PERIODS
// ==========================================
export const BUDGET_PERIODS = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'YEARLY', label: 'Yearly' }
]

// ==========================================
// RISK TOLERANCE LEVELS
// ==========================================
export const RISK_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'green' },
  { value: 'MODERATE', label: 'Moderate', color: 'yellow' },
  { value: 'HIGH', label: 'High', color: 'red' }
]

// ==========================================
// CURRENCY OPTIONS
// ==========================================
export const CURRENCIES = [
  { value: 'RUPEES', label: '₹ Rupees' },
  { value: 'USD', label: '$ Dollar' },
  { value: 'EUR', label: '€ Euro' },
  { value: 'GBP', label: '£ Pound' }
]

// ==========================================
// DEFAULT COLORS
// ==========================================
export const DEFAULT_COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#22c55e',
  WARNING: '#f59e0b',
  DANGER: '#ef4444',
  INFO: '#06b6d4',
  GRAY: '#6B7280'
}

// ==========================================
// ALERT THRESHOLDS
// ==========================================
export const ALERT_THRESHOLDS = [50, 60, 70, 80, 90, 100]

// ==========================================
// PAGINATION
// ==========================================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  PAGE_SIZES: [10, 25, 50, 100]
}

// ==========================================
// LOCAL STORAGE KEYS
// ==========================================
export const STORAGE_KEYS = {
  TOKEN: 'finwise_token',
  USER: 'finwise_user',
  THEME: 'finwise_theme',
  LANGUAGE: 'finwise_language',
  PREFERENCES: 'finwise_preferences'
}

// ==========================================
// HTTP STATUS CODES
// ==========================================
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500
}

// ==========================================
// API ROUTES - PHASE 1 FEATURES
// ==========================================
export const API_ROUTES = {
  // ========== AUTH ==========
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  CURRENT_USER: '/users/me',

  // ========== TRANSACTIONS ==========
  TRANSACTIONS: '/transactions',
  GET_TRANSACTION: '/transactions/:id',
  CREATE_TRANSACTION: '/transactions',
  UPDATE_TRANSACTION: '/transactions/:id',
  DELETE_TRANSACTION: '/transactions/:id',
  SEARCH_TRANSACTIONS: '/transactions/search',

  // ========== ACCOUNTS ==========
  ACCOUNTS: '/accounts',
  GET_ACCOUNT: '/accounts/:id',
  CREATE_ACCOUNT: '/accounts',
  UPDATE_ACCOUNT: '/accounts/:id',
  DELETE_ACCOUNT: '/accounts/:id',

  // ========== BUDGETS ==========
  BUDGETS: '/budgets',
  GET_BUDGET: '/budgets/:id',
  CREATE_BUDGET: '/budgets',
  UPDATE_BUDGET: '/budgets/:id',
  DELETE_BUDGET: '/budgets/:id',

  // ========== ML FEATURES (PHASE 1) ==========
  ML_TRAIN: '/ml/train',
  ML_PREDICT: '/ml/predict',
  ML_ANOMALIES: '/ml/anomalies',
  ML_ANOMALY_STATS: '/ml/anomaly-stats',

  // ========== NOTIFICATIONS (PHASE 1) ==========
  NOTIFICATIONS: '/notifications',
  GET_NOTIFICATIONS: '/notifications',
  MARK_AS_READ: '/notifications/:id/read',
  MARK_ALL_READ: '/notifications/read/all',
  DELETE_NOTIFICATION: '/notifications/:id',
  CHECK_BUDGETS: '/notifications/check-budgets',

  // ========== TAX FEATURES (PHASE 1) ==========
  TAX_CALCULATE: '/tax/calculate',
  TAX_REPORT: '/tax/report',
  TAX_OPPORTUNITIES: '/tax/opportunities',

  // ========== AI INSIGHTS ==========
  AI_INSIGHTS: '/ai/insights',
  AI_RECOMMENDATIONS: '/ai/recommendations',
  AI_TAX_ANALYSIS: '/ai/tax-analysis',

  // ========== USER SETTINGS ==========
  USER_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/password',
  NOTIFICATION_PREFERENCES: '/users/preferences',
  UPDATE_PREFERENCES: '/users/preferences'
}

// ==========================================
// CATEGORY OPTIONS
// ==========================================
export const EXPENSE_CATEGORIES = [
  { value: 'food', label: '🍔 Food & Dining', color: '#FF6B6B' },
  { value: 'transport', label: '🚗 Transport', color: '#4ECDC4' },
  { value: 'shopping', label: '🛍️ Shopping', color: '#FFE66D' },
  { value: 'entertainment', label: '🎬 Entertainment', color: '#95E1D3' },
  { value: 'utilities', label: '💡 Utilities', color: '#A8D8EA' },
  { value: 'healthcare', label: '⚕️ Healthcare', color: '#AA96DA' },
  { value: 'education', label: '📚 Education', color: '#FCBAD3' },
  { value: 'travel', label: '✈️ Travel', color: '#F7DC6F' },
  { value: 'investment', label: '📈 Investment', color: '#52C77F' },
  { value: 'subscriptions', label: '📱 Subscriptions', color: '#85C1E9' },
  { value: 'other', label: '📌 Other', color: '#BDC3C7' }
]

// ==========================================
// SEVERITY LEVELS
// ==========================================
export const SEVERITY_LEVELS = {
  LOW: { value: 'LOW', label: 'Low', color: '#3498DB', bgColor: '#D6EAF8' },
  MEDIUM: { value: 'MEDIUM', label: 'Medium', color: '#F39C12', bgColor: '#FEF5E7' },
  HIGH: { value: 'HIGH', label: 'High', color: '#E74C3C', bgColor: '#FADBD8' },
  CRITICAL: { value: 'CRITICAL', label: 'Critical', color: '#C0392B', bgColor: '#F5B7B1' }
}

// ==========================================
// NOTIFICATION TYPES
// ==========================================
export const NOTIFICATION_TYPES = {
  BUDGET_EXCEEDED: 'Budget Exceeded',
  BUDGET_WARNING: 'Budget Warning',
  BUDGET_CAUTION: 'Budget Caution',
  TRANSACTION_ALERT: 'Transaction Alert',
  SAVINGS_MILESTONE: 'Savings Milestone',
  INVESTMENT_ALERT: 'Investment Alert'
}

// ==========================================
// TAX SECTIONS
// ==========================================
export const TAX_SECTIONS = {
  '80C': { name: 'Section 80C', limit: 150000, description: 'Life Insurance, PPF, ELSS' },
  '80D': { name: 'Section 80D', limit: 100000, description: 'Medical Insurance' },
  '80E': { name: 'Section 80E', limit: 50000, description: 'Education Loan Interest' },
  '80G': { name: 'Section 80G', limit: null, description: 'Charitable Donations (50% of income)' },
  '80TTA': { name: 'Section 80TTA', limit: 10000, description: 'Savings Account Interest' }
}

// ==========================================
// ERROR MESSAGES
// ==========================================
export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SESSION_EXPIRED: 'Your session has expired. Please login again.'
}

// ==========================================
// SUCCESS MESSAGES
// ==========================================
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully!',
  REGISTRATION: 'Registration successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  TRANSACTION_CREATED: 'Transaction added successfully!',
  TRANSACTION_UPDATED: 'Transaction updated successfully!',
  TRANSACTION_DELETED: 'Transaction deleted successfully!',
  BUDGET_CREATED: 'Budget created successfully!',
  BUDGET_UPDATED: 'Budget updated successfully!',
  BUDGET_DELETED: 'Budget deleted successfully!'
}

// ==========================================
// FEATURE FLAGS
// ==========================================
export const FEATURE_FLAGS = {
  ENABLE_ML_PREDICTION: true,
  ENABLE_ANOMALY_DETECTION: true,
  ENABLE_TAX_PLANNING: true,
  ENABLE_BUDGET_ALERTS: true,
  ENABLE_AI_INSIGHTS: true,
  ENABLE_NOTIFICATIONS: true,
  ENABLE_SOCIAL_SHARING: false,
  ENABLE_DARK_MODE: true
}

// ==========================================
// DATE FORMATS
// ==========================================
export const DATE_FORMATS = {
  SHORT: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  TIME: 'hh:mm a',
  FULL: 'MMMM dd, yyyy hh:mm a',
  ISO: 'yyyy-MM-dd',
  ISO_TIME: 'yyyy-MM-dd HH:mm:ss'
}

// ==========================================
// CHART COLORS
// ==========================================
export const CHART_COLORS = {
  GRADIENT_BLUE: ['#3B82F6', '#1D4ED8'],
  GRADIENT_GREEN: ['#10B981', '#059669'],
  GRADIENT_RED: ['#EF4444', '#DC2626'],
  CATEGORICAL: [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#EC4899',
    '#6366F1'
  ]
}

// ==========================================
// VALIDATION RULES
// ==========================================
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  USERNAME_MIN_LENGTH: 3,
  TRANSACTION_AMOUNT_MIN: 0.01,
  DESCRIPTION_MAX_LENGTH: 200
}