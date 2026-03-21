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
      case 'INCOME':
        return 'bg-green-100 text-green-800'
      case 'EXPENSE':
        return 'bg-red-100 text-red-800'
      case 'INVESTMENT':
        return 'bg-blue-100 text-blue-800'
      case 'TAX':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transactions')}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Transaction Details
          </h1>
        </div>
        <div className="flex space-x-2">
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

      {/* Transaction Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(transaction.type)}`}>
              {transaction.type}
            </span>
            {transaction.isRecurring && (
              <span className="flex items-center text-sm text-blue-600">
                <Repeat className="h-4 w-4 mr-1" />
                Recurring ({transaction.recurringInterval})
              </span>
            )}
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-1">Amount</p>
            <p className={`text-4xl font-bold ${
              transaction.type === 'INCOME' 
                ? 'text-green-600' 
                : transaction.type === 'EXPENSE'
                ? 'text-red-600'
                : 'text-blue-600'
            }`}>
              {transaction.type === 'INCOME' ? '+' : '-'}
              {formatCurrency(transaction.amount)}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Description</p>
              <p className="text-lg text-gray-900">{transaction.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-1" /> Date
                </p>
                <p className="text-gray-900">{formatDate(transaction.date, 'long')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <Tag className="h-4 w-4 mr-1" /> Category
                </p>
                <p className="text-gray-900 capitalize">
                  {transaction.category}
                  {transaction.subcategory && ` / ${transaction.subcategory}`}
                </p>
              </div>
            </div>

            {transaction.merchant && (
              <div>
                <p className="text-sm text-gray-500 mb-1 flex items-center">
                  <Building className="h-4 w-4 mr-1" /> Merchant
                </p>
                <p className="text-gray-900">{transaction.merchant}</p>
              </div>
            )}

            {transaction.tags && transaction.tags.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {transaction.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Account Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Account</h3>
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${transaction.account?.color}20` }}
              >
                <FileText className="h-5 w-5" style={{ color: transaction.account?.color }} />
              </div>
              <div>
                <p className="font-medium text-gray-900">{transaction.account?.name}</p>
                <p className="text-sm text-gray-500">{transaction.account?.type}</p>
              </div>
            </div>
          </Card>

          {/* Additional Info */}
          <Card>
            <h3 className="font-semibold text-gray-900 mb-3">Additional Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium ${
                  transaction.status === 'COMPLETED' 
                    ? 'text-green-600' 
                    : transaction.status === 'PENDING'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }`}>
                  {transaction.status}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Tax Deductible</span>
                <span className="text-sm font-medium">
                  {transaction.taxDeductible ? 'Yes' : 'No'}
                </span>
              </div>

              {transaction.type === 'INVESTMENT' && transaction.investmentType && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" /> Investment Type
                  </span>
                  <span className="text-sm font-medium">
                    {transaction.investmentType}
                  </span>
                </div>
              )}

              {transaction.nextRecurringDate && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Next Recurring</span>
                  <span className="text-sm font-medium">
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
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="text-gray-900">{formatDate(transaction.createdAt)}</span>
              </div>
              <div className="flex justify-between">
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
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
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