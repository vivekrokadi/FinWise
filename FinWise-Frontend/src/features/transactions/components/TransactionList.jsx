import { useNavigate } from 'react-router-dom'
import { Calendar, Tag, Building, ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react'
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
      case 'INCOME':    return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'EXPENSE':   return <ArrowDownRight className="h-4 w-4 text-red-600" />
      case 'INVESTMENT':return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      case 'TAX':       return <ArrowDownRight className="h-4 w-4 text-yellow-600" />
      default:          return null
    }
  }

  const getAmountColor = (type) => {
    switch (type) {
      case 'INCOME':    return 'text-green-600'
      case 'EXPENSE':   return 'text-red-600'
      case 'INVESTMENT':return 'text-blue-600'
      case 'TAX':       return 'text-yellow-600'
      default:          return 'text-gray-600'
    }
  }

  if (transactions.length === 0) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-500 mb-4">No transactions found</p>
        <Button variant="primary" onClick={() => navigate('/transactions/new')}>
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
          className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start gap-2 sm:gap-3">

            {/* Checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 flex-shrink-0 text-blue-600 rounded border-gray-300"
                checked={selectedIds.includes(transaction._id)}
                onChange={(e) => onSelect(transaction._id, e.target.checked)}
              />
            )}

            {/* Type icon */}
            <div className="mt-0.5 p-1.5 bg-gray-100 rounded-lg flex-shrink-0">
              {getTypeIcon(transaction.type)}
            </div>

            {/* Description + meta — takes all remaining space, min-w-0 prevents overflow */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => navigate(`/transactions/${transaction._id}`)}
            >
              {/* Title row */}
              <div className="flex flex-wrap items-center gap-1.5">
                <h3 className="font-medium text-gray-900 text-sm truncate">
                  {transaction.description}
                </h3>
                {transaction.isRecurring && (
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full whitespace-nowrap">
                    Recurring
                  </span>
                )}
                {transaction.taxDeductible && (
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full whitespace-nowrap">
                    Tax Deductible
                  </span>
                )}
              </div>

              {/* Metadata row — wraps on mobile */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                <span className="flex items-center text-xs text-gray-500 whitespace-nowrap">
                  <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                  {formatDate(transaction.date, 'short')}
                </span>
                <span className="flex items-center text-xs text-gray-500 whitespace-nowrap">
                  <Tag className="h-3 w-3 mr-1 flex-shrink-0" />
                  {transaction.category}
                  {transaction.subcategory ? ` / ${transaction.subcategory}` : ''}
                </span>
                {transaction.merchant && (
                  <span className="flex items-center text-xs text-gray-500 whitespace-nowrap">
                    <Building className="h-3 w-3 mr-1 flex-shrink-0" />
                    {transaction.merchant}
                  </span>
                )}
              </div>
            </div>

            {/* Amount + delete — flex-shrink-0 so it never collapses */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              <div className="text-right">
                <p className={`font-semibold text-sm ${getAmountColor(transaction.type)}`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-[64px]">
                  {transaction.account?.name || ''}
                </p>
              </div>

              {/* Delete button with confirmation popover */}
              <div className="relative">
                <button
                  onClick={() => setShowDeleteConfirm(transaction._id)}
                  className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-red-600 transition"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {showDeleteConfirm === transaction._id && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowDeleteConfirm(null)} />
                    <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50">
                      <p className="text-sm text-gray-700 mb-2">Delete this transaction?</p>
                      <div className="flex gap-2">
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