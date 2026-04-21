import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/layout/Layout'

// Landing
import LandingPage from './features/landing/LandingPage'

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

// Profile & Settings
import Profile from './features/profile/pages/Profile'
import Settings from './features/settings/pages/Settings'

// 404
import NotFound from './features/errors/NotFound'

function App() {
  return (
    <Routes>
      {/* Landing page — shows for unauthenticated, redirects auth users to dashboard */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Accounts */}
          <Route path="/accounts"    element={<Accounts />} />
          <Route path="/accounts/:id" element={<AccountDetail />} />

          {/* Transactions */}
          <Route path="/transactions"      element={<Transactions />} />
          <Route path="/transactions/new"  element={<Transactions />} />
          <Route path="/transactions/:id"  element={<TransactionDetail />} />

          {/* Budgets */}
          <Route path="/budgets" element={<Budgets />} />

          {/* AI */}
          <Route path="/ai/insights" element={<AIInsights />} />

          {/* Profile & Settings */}
          <Route path="/profile"   element={<Profile />} />
          <Route path="/settings"  element={<Settings />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App