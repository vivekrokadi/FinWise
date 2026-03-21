import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'

// Auth Pages
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'

// Dashboard
import Dashboard from './features/dashboard/pages/Dashboard'

// Accounts
import Accounts from './features/accounts/pages/Accounts'
import AccountDetail from './features/accounts/pages/AccountDetail'

// Transactions
import Transactions from './features/transactions/pages/Transactions'
import TransactionDetail from './features/transactions/pages/TransactionDetail'

// Budgets
import Budgets from './features/budgets/pages/Budgets'

// AI Features
import AIInsights from './features/ai/pages/AIInsights'

// Profile
import Profile from './features/profile/pages/Profile'

// Settings (placeholder)
const Settings = () => (
  <div className="p-8 text-center text-gray-500">
    Settings page coming soon
  </div>
)

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Accounts */}
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />
          
          {/* Transactions */}
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/transactions/new" element={<Transactions />} />
          <Route path="/transactions/:id" element={<TransactionDetail />} />
          
          {/* Budgets */}
          <Route path="/budgets" element={<Budgets />} />
          
          {/* AI Features */}
          <Route path="/ai/insights" element={<AIInsights />} />
          
          {/* User Profile */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App