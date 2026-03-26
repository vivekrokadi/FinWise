import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, Trash2, BarChart2, X } from 'lucide-react'
import {
  useTransactions,
  useBulkDeleteTransactions,
  useCategoryBreakdown,
  useTransactionStats
} from '../hooks/useTransactions'
import TransactionFilters from '../components/TransactionFilters'
import TransactionList from '../components/TransactionList'
import TransactionForm from '../components/TransactionForm'
import CategoryBreakdown from '../components/CategoryBreakdown'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { PAGINATION } from '../../../utils/constants'
import { formatCurrency } from '../../../utils/formatters'

const Transactions = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const listTopRef = useRef(null)

  const [filters, setFilters] = useState({ page: 1, limit: PAGINATION.DEFAULT_LIMIT })
  const [selectedIds, setSelectedIds] = useState([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)

  // Date range for analytics — default last 30 days
  const [analyticsRange] = useState(() => {
    const end = new Date()
    const start = new Date()
    start.setDate(start.getDate() - 30)
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    }
  })

  useEffect(() => {
    if (location.pathname === '/transactions/new') setShowForm(true)
  }, [location.pathname])

  const { data, isLoading, error } = useTransactions(filters)
  const bulkDeleteMutation = useBulkDeleteTransactions()

  // Analytics data — only fetched when panel is open
  const { data: expenseBreakdown } = useCategoryBreakdown({
    type: 'EXPENSE',
    ...analyticsRange
  })
  const { data: incomeBreakdown } = useCategoryBreakdown({
    type: 'INCOME',
    ...analyticsRange
  })
  const { data: stats } = useTransactionStats(analyticsRange)

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
    setSelectedIds([])
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelect = (id, checked) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(i => i !== id))
  }

  const handleSelectAll = (checked) => {
    setSelectedIds(checked && data?.data ? data.data.map(t => t._id) : [])
  }

  const handleBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync({ transactionIds: selectedIds })
    setSelectedIds([])
    setShowBulkDelete(false)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    if (location.pathname === '/transactions/new') {
      navigate('/transactions', { replace: true })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load transactions</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  const { data: transactions, pagination } = data || {}
  const totalExpense = expenseBreakdown?.reduce((s, c) => s + c.totalAmount, 0) || 0
  const totalIncome = incomeBreakdown?.reduce((s, c) => s + c.totalAmount, 0) || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div ref={listTopRef} className="flex flex-wrap justify-between items-start gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track and manage your financial transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showAnalytics ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setShowAnalytics(!showAnalytics)}
            leftIcon={<BarChart2 className="h-4 w-4" />}
            className="whitespace-nowrap"
          >
            Analytics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowForm(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="whitespace-nowrap"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Analytics Panel */}
      {showAnalytics && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Last 30 Days Analytics</h2>
            <button
              onClick={() => setShowAnalytics(false)}
              className="p-1 hover:bg-gray-100 rounded text-gray-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Summary Stats */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Income', value: formatCurrency(stats.income), color: 'text-green-600', bg: 'bg-green-50' },
                { label: 'Expenses', value: formatCurrency(stats.expense), color: 'text-red-600', bg: 'bg-red-50' },
                { label: 'Investments', value: formatCurrency(stats.investment), color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Net', value: formatCurrency(stats.net), color: stats.net >= 0 ? 'text-green-600' : 'text-red-600', bg: stats.net >= 0 ? 'bg-green-50' : 'bg-red-50' }
              ].map(({ label, value, color, bg }) => (
                <div key={label} className={`${bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{label}</p>
                  <p className={`text-lg font-bold ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Category Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategoryBreakdown
              data={expenseBreakdown}
              total={totalExpense}
              type="EXPENSE"
            />
            <CategoryBreakdown
              data={incomeBreakdown}
              total={totalIncome}
              type="INCOME"
            />
          </div>
        </div>
      )}

      {/* Filters */}
      <TransactionFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedIds.length} transaction{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowBulkDelete(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Transaction count */}
      {data?.total > 0 && (
        <p className="text-sm text-gray-500">
          Showing {transactions?.length} of {data.total} transactions
        </p>
      )}

      {/* Transactions List */}
      <TransactionList
        transactions={transactions || []}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        selectedIds={selectedIds}
      />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg">
            {pagination.page} / {pagination.pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            rightIcon={<ChevronRight className="h-4 w-4" />}
          >
            Next
          </Button>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showForm && <TransactionForm onClose={handleCloseForm} />}

      {/* Bulk Delete Confirmation */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Transactions</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {selectedIds.length} transaction
              {selectedIds.length > 1 ? 's' : ''}? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowBulkDelete(false)}>Cancel</Button>
              <Button variant="danger" onClick={handleBulkDelete} isLoading={bulkDeleteMutation.isPending}>
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Transactions