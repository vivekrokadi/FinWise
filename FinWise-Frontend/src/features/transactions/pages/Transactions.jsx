import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useTransactions, useBulkDeleteTransactions } from '../hooks/useTransactions'
import TransactionFilters from '../components/TransactionFilters'
import TransactionList from '../components/TransactionList'
import CategoryBreakdown from '../components/CategoryBreakdown'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { PAGINATION } from '../../../utils/constants'

const Transactions = () => {
  const navigate = useNavigate()
  const [filters, setFilters] = useState({
    page: 1,
    limit: PAGINATION.DEFAULT_LIMIT
  })
  const [selectedIds, setSelectedIds] = useState([])
  const [showBulkDelete, setShowBulkDelete] = useState(false)

  const { data, isLoading, error } = useTransactions(filters)
  const bulkDeleteMutation = useBulkDeleteTransactions()

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))
    setSelectedIds([])
  }

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelect = (id, checked) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id])
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id))
    }
  }

  const handleSelectAll = (checked) => {
    if (checked && data?.data) {
      setSelectedIds(data.data.map(t => t._id))
    } else {
      setSelectedIds([])
    }
  }

  const handleBulkDelete = async () => {
    await bulkDeleteMutation.mutateAsync({ transactionIds: selectedIds })
    setSelectedIds([])
    setShowBulkDelete(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600 mt-1">Track and manage your financial transactions</p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/transactions/new')}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Transaction
        </Button>
      </div>

      {/* Filters */}
      <TransactionFilters filters={filters} onFilterChange={handleFilterChange} />

      {/* Bulk actions */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {selectedIds.length} transaction{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex space-x-2">
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowBulkDelete(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      {/* Transactions List */}
      <TransactionList
        transactions={transactions || []}
        onSelect={handleSelect}
        selectedIds={selectedIds}
      />

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Previous
          </Button>
          
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {pagination.page} of {pagination.pages}
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

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Transactions</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {selectedIds.length} transaction
              {selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowBulkDelete(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleBulkDelete}
                isLoading={bulkDeleteMutation.isPending}
              >
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