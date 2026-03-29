// FinWise-Frontend/src/utils/constants.js
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
  USER: 'finwise_user',
  THEME: 'finwise_theme',
  LANGUAGE: 'finwise_language',
  PREFERENCES: 'finwise_preferences'
}

// HTTP Status codes
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
// CATEGORIES
// ==========================================
export const CATEGORIES = {
  EXPENSE: [
    {
      value: 'food',
      label: 'Food & Dining',
      subcategories: [
        { value: 'groceries', label: 'Groceries' },
        { value: 'restaurants', label: 'Restaurants' },
        { value: 'coffee', label: 'Coffee & Tea' },
        { value: 'takeaway', label: 'Takeaway / Delivery' },
        { value: 'snacks', label: 'Snacks' }
      ]
    },
    {
      value: 'transport',
      label: 'Transport',
      subcategories: [
        { value: 'fuel', label: 'Fuel' },
        { value: 'cab', label: 'Cab / Auto' },
        { value: 'metro', label: 'Metro / Bus' },
        { value: 'parking', label: 'Parking' },
        { value: 'maintenance', label: 'Vehicle Maintenance' }
      ]
    },
    {
      value: 'shopping',
      label: 'Shopping',
      subcategories: [
        { value: 'clothing', label: 'Clothing & Apparel' },
        { value: 'electronics', label: 'Electronics' },
        { value: 'home', label: 'Home & Furniture' },
        { value: 'accessories', label: 'Accessories' },
        { value: 'gifts', label: 'Gifts' }
      ]
    },
    {
      value: 'entertainment',
      label: 'Entertainment',
      subcategories: [
        { value: 'movies', label: 'Movies & OTT' },
        { value: 'games', label: 'Games' },
        { value: 'sports', label: 'Sports & Fitness' },
        { value: 'travel', label: 'Travel & Tourism' },
        { value: 'events', label: 'Events & Concerts' }
      ]
    },
    {
      value: 'utilities',
      label: 'Utilities & Bills',
      subcategories: [
        { value: 'electricity', label: 'Electricity' },
        { value: 'water', label: 'Water' },
        { value: 'internet', label: 'Internet & Phone' },
        { value: 'gas', label: 'Gas / LPG' },
        { value: 'subscriptions', label: 'Subscriptions' }
      ]
    },
    {
      value: 'healthcare',
      label: 'Healthcare',
      subcategories: [
        { value: 'doctor', label: 'Doctor / Hospital' },
        { value: 'medicines', label: 'Medicines' },
        { value: 'insurance', label: 'Health Insurance' },
        { value: 'gym', label: 'Gym & Wellness' },
        { value: 'dental', label: 'Dental' }
      ]
    },
    {
      value: 'education',
      label: 'Education',
      subcategories: [
        { value: 'fees', label: 'Tuition / Course Fees' },
        { value: 'books', label: 'Books & Stationery' },
        { value: 'coaching', label: 'Coaching / Tutoring' },
        { value: 'exams', label: 'Exam Fees' }
      ]
    },
    {
      value: 'housing',
      label: 'Housing',
      subcategories: [
        { value: 'rent', label: 'Rent' },
        { value: 'emi', label: 'Home Loan EMI' },
        { value: 'maintenance_soc', label: 'Society Maintenance' },
        { value: 'repairs', label: 'Repairs' }
      ]
    },
    {
      value: 'personal',
      label: 'Personal Care',
      subcategories: [
        { value: 'salon', label: 'Salon & Grooming' },
        { value: 'skincare', label: 'Skincare & Cosmetics' },
        { value: 'laundry', label: 'Laundry / Dry Clean' }
      ]
    },
    {
      value: 'other',
      label: 'Other',
      subcategories: [
        { value: 'miscellaneous', label: 'Miscellaneous' },
        { value: 'charity', label: 'Charity / Donation' },
        { value: 'fines', label: 'Fines & Penalties' }
      ]
    }
  ],

  INCOME: [
    {
      value: 'salary',
      label: 'Salary',
      subcategories: [
        { value: 'monthly_salary', label: 'Monthly Salary' },
        { value: 'bonus', label: 'Bonus' },
        { value: 'allowance', label: 'Allowance' },
        { value: 'arrears', label: 'Arrears' }
      ]
    },
    {
      value: 'freelance',
      label: 'Freelance / Business',
      subcategories: [
        { value: 'project', label: 'Project Payment' },
        { value: 'consulting', label: 'Consulting' },
        { value: 'commission', label: 'Commission' }
      ]
    },
    {
      value: 'investment_income',
      label: 'Investment Returns',
      subcategories: [
        { value: 'dividends', label: 'Dividends' },
        { value: 'interest', label: 'Interest' },
        { value: 'capital_gains', label: 'Capital Gains' },
        { value: 'rental_income', label: 'Rental Income' }
      ]
    },
    {
      value: 'gifts_received',
      label: 'Gifts & Transfers',
      subcategories: [
        { value: 'gift_money', label: 'Gift Money' },
        { value: 'transfer_in', label: 'Transfer Received' },
        { value: 'refund', label: 'Refund' }
      ]
    },
    {
      value: 'other_income',
      label: 'Other Income',
      subcategories: [
        { value: 'cashback', label: 'Cashback / Rewards' },
        { value: 'misc_income', label: 'Miscellaneous' }
      ]
    }
  ],

  INVESTMENT: [
    {
      value: 'investment',
      label: 'Investment',
      subcategories: [
        { value: 'sip', label: 'SIP / Mutual Fund' },
        { value: 'stocks_buy', label: 'Stock Purchase' },
        { value: 'fd', label: 'Fixed Deposit' },
        { value: 'ppf', label: 'PPF / NPS' },
        { value: 'crypto_buy', label: 'Crypto Purchase' },
        { value: 'real_estate_inv', label: 'Real Estate' },
        { value: 'gold', label: 'Gold / Bonds' }
      ]
    }
  ],

  TAX: [
    {
      value: 'tax',
      label: 'Tax',
      subcategories: [
        { value: 'income_tax', label: 'Income Tax (Advance)' },
        { value: 'tds', label: 'TDS' },
        { value: 'gst', label: 'GST' },
        { value: 'property_tax', label: 'Property Tax' },
        { value: 'professional_tax', label: 'Professional Tax' }
      ]
    }
  ]
}

// ==========================================
// API ROUTES
// ==========================================
export const API_ROUTES = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  CURRENT_USER: '/users/me',

  // Transactions
  TRANSACTIONS: '/transactions',
  CREATE_TRANSACTION: '/transactions',
  UPDATE_TRANSACTION: '/transactions/:id',
  DELETE_TRANSACTION: '/transactions/:id',

  // Accounts
  ACCOUNTS: '/accounts',
  CREATE_ACCOUNT: '/accounts',
  UPDATE_ACCOUNT: '/accounts/:id',
  DELETE_ACCOUNT: '/accounts/:id',

  // Budgets
  BUDGETS: '/budgets',
  CREATE_BUDGET: '/budgets',
  UPDATE_BUDGET: '/budgets/:id',
  DELETE_BUDGET: '/budgets/:id',

  // ML Features
  ML_TRAIN: '/ml/train',
  ML_PREDICT: '/ml/predict',
  ML_ANOMALIES: '/ml/anomalies',
  ML_ANOMALY_STATS: '/ml/anomaly-stats',

  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_AS_READ: '/notifications/:id/read',
  MARK_ALL_READ: '/notifications/read/all',
  DELETE_NOTIFICATION: '/notifications/:id',
  CHECK_BUDGETS: '/notifications/check-budgets',

  // Tax
  TAX_CALCULATE: '/tax/calculate',
  TAX_REPORT: '/tax/report',
  TAX_OPPORTUNITIES: '/tax/opportunities'
}

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
// FEATURE FLAGS
// ==========================================
export const FEATURE_FLAGS = {
  ENABLE_ML_PREDICTION: true,
  ENABLE_ANOMALY_DETECTION: true,
  ENABLE_TAX_PLANNING: true,
  ENABLE_BUDGET_ALERTS: true,
  ENABLE_NOTIFICATIONS: true
}