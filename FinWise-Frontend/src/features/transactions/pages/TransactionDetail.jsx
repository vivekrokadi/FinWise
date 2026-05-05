import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Building,
  Repeat,
  FileText,
  TrendingUp
} from 'lucide-react'
import { useState } from 'react'
import { useTransaction, useDeleteTransaction } from '../hooks/useTransactions'
import TransactionForm from '../components/TransactionForm'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../../../utils/formatters'

const TransactionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: transaction, isLoading, error } = useTransaction(id)
  const deleteMutation = useDeleteTransaction()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load transaction details</p>
        <Button onClick={() => navigate('/transactions')}>Back to Transactions</Button>
      </div>
    )
  }

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(id)
    navigate('/transactions')
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'INCOME':     return 'bg-green-100 text-green-800'
      case 'EXPENSE':    return 'bg-red-100 text-red-800'
      case 'INVESTMENT': return 'bg-blue-100 text-blue-800'
      case 'TAX':        return 'bg-yellow-100 text-yellow-800'
      default:           return 'bg-gray-100 text-gray-800'
    }
  }

  const getAmountColor = (type) => {
    switch (type) {
      case 'INCOME':     return 'text-green-600'
      case 'EXPENSE':    return 'text-red-600'
      case 'INVESTMENT': return 'text-blue-600'
      default:           return 'text-yellow-600'
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">

      {/* ── Header — stacks on mobile, row on desktop ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: back + title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transactions')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
            Transaction Details
          </h1>
        </div>

        {/* Right: action buttons — always visible, wrap if needed */}
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowEditForm(true)}
            leftIcon={<Edit className="h-4 w-4" />}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* ── Body — single column on mobile, 3-col grid on desktop ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

        {/* Main Info Card */}
        <Card className="lg:col-span-2">
          {/* Type badge + recurring */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getTypeColor(transaction.type)}`}>
              {transaction.type}
            </span>
            {transaction.isRecurring && (
              <span className="flex items-center gap-1 text-sm text-blue-600">
                <Repeat className="h-4 w-4" />
                Recurring ({transaction.recurringInterval})
              </span>
            )}
          </div>

          {/* Amount — responsive size */}
          <div className="mb-5">
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <p className={`text-3xl md:text-4xl font-bold ${getAmountColor(transaction.type)}`}>
              {transaction.type === 'INCOME' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <div className="space-y-4">
            {/* Description */}
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-base md:text-lg text-gray-900 break-words">
                {transaction.description}
              </p>
            </div>

            {/* Date + Category — stacks on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Date
                </p>
                <p className="text-gray-900 text-sm md:text-base">
                  {formatDate(transaction.date, 'long')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Tag className="h-4 w-4" /> Category
                </p>
                <p className="text-gray-900 capitalize text-sm md:text-base">
                  {transaction.category}
                  {transaction.subcategory ? ` / ${transaction.subcategory}` : ''}
                </p>
              </div>
            </div>

            {/* Merchant */}
            {transaction.merchant && (
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                  <Building className="h-4 w-4" /> Merchant
                </p>
                <p className="text-gray-900 text-sm md:text-base">{transaction.merchant}</p>
              </div>
            )}

            {/* Tags */}
            {transaction.tags && transaction.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {transaction.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Sidebar — stacks below on mobile, right column on desktop */}
        <div className="space-y-4">

          {/* Account */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Account</h3>
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${transaction.account?.color || '#3B82F6'}20` }}
              >
                <FileText
                  className="h-5 w-5"
                  style={{ color: transaction.account?.color || '#3B82F6' }}
                />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">{transaction.account?.name}</p>
                <p className="text-sm text-gray-500">{transaction.account?.type}</p>
              </div>
            </div>
          </Card>

          {/* Additional Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-semibold ${
                  transaction.status === 'COMPLETED' ? 'text-green-600'
                  : transaction.status === 'PENDING'  ? 'text-yellow-600'
                  : 'text-red-600'
                }`}>
                  {transaction.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Tax Deductible</span>
                <span className={`text-sm font-semibold ${transaction.taxDeductible ? 'text-green-600' : 'text-gray-700'}`}>
                  {transaction.taxDeductible ? 'Yes' : 'No'}
                </span>
              </div>

              {transaction.type === 'INVESTMENT' && transaction.investmentType && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" /> Investment Type
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    {transaction.investmentType}
                  </span>
                </div>
              )}

              {transaction.nextRecurringDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Next Recurring</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(transaction.nextRecurringDate)}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Metadata */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Metadata</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{formatDate(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Last Updated</span>
                <span className="text-gray-900">{formatDate(transaction.updatedAt)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Form Modal */}
      {showEditForm && (
        <TransactionForm
          transaction={transaction}
          onClose={() => setShowEditForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Transaction</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this transaction? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
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

export default TransactionDetail