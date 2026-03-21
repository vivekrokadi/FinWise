import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  Tag, 
  Building, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreVertical,
  Trash2
} from 'lucide-react'
import { useState } from 'react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import { useDeleteTransaction } from '../hooks/useTransactions'

const TransactionList = ({ transactions, onSelect, selectedIds = [] }) => {
  const navigate = useNavigate()
  const deleteMutation = useDeleteTransaction()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)

  const handleDelete = async (id) => {
    await deleteMutation.mutateAsync(id)
    setShowDeleteConfirm(null)
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'INCOME':
        return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'EXPENSE':
        return <ArrowDownRight className="h-4 w-4 text-red-600" />
      case 'INVESTMENT':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      case 'TAX':
        return <ArrowDownRight className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getAmountColor = (transaction) => {
    switch (transaction.type) {
      case 'INCOME':
        return 'text-green-600'
      case 'EXPENSE':
        return 'text-red-600'
      case 'INVESTMENT':
        return 'text-blue-600'
      case 'TAX':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (transactions.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500 mb-4">No transactions found</p>
        <Button
          variant="primary"
          onClick={() => navigate('/transactions/new')}
        >
          Add Your First Transaction
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow relative"
        >
          <div className="flex items-center justify-between">
            {/* Left section - Checkbox and icon */}
            <div className="flex items-center space-x-3 flex-1">
              {onSelect && (
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  checked={selectedIds.includes(transaction._id)}
                  onChange={(e) => onSelect(transaction._id, e.target.checked)}
                />
              )}
              
              <div className="p-2 bg-gray-100 rounded-lg">
                {getTypeIcon(transaction.type)}
              </div>

              {/* Transaction details */}
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => navigate(`/transactions/${transaction._id}`)}
              >
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">
                    {transaction.description}
                  </h3>
                  {transaction.isRecurring && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      Recurring
                    </span>
                  )}
                  {transaction.taxDeductible && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                      Tax Deductible
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(transaction.date)}
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {transaction.category}
                    {transaction.subcategory && ` / ${transaction.subcategory}`}
                  </div>
                  {transaction.merchant && (
                    <div className="flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      {transaction.merchant}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount and actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className={`font-semibold ${getAmountColor(transaction)}`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">
                  {transaction.account?.name || 'Account'}
                </p>
              </div>

              {/* Actions menu */}
              <div className="relative">
                <button
                  onClick={() => setShowDeleteConfirm(transaction._id)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Delete confirmation */}
                {showDeleteConfirm === transaction._id && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDeleteConfirm(null)}
                    />
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
                      <p className="text-sm text-gray-700 mb-2">Delete this transaction?</p>
                      <div className="flex space-x-2">
                        <Button
                          variant="danger"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleDelete(transaction._id)}
                          isLoading={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => setShowDeleteConfirm(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TransactionList