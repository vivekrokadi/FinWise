import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Edit, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight, Calendar, Repeat
} from 'lucide-react'
import { useAccount, useAccountStats } from '../hooks/useAccounts'
import AccountForm from '../components/AccountForm'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../../../utils/formatters'

const AccountDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showEditForm, setShowEditForm] = useState(false)

  const { data, isLoading: accountLoading, error: accountError } = useAccount(id)
  const { data: stats, isLoading: statsLoading } = useAccountStats(id)

  if (accountLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (accountError || !data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load account details</p>
        <Button onClick={() => navigate('/accounts')}>Back to Accounts</Button>
      </div>
    )
  }

  const { account, transactions } = data

  const getAmountColor = (type) => {
    switch (type) {
      case 'INCOME':     return 'text-green-600'
      case 'EXPENSE':    return 'text-red-600'
      case 'INVESTMENT': return 'text-blue-600'
      default:           return 'text-yellow-600'
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'INCOME':     return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'EXPENSE':    return <ArrowDownRight className="h-4 w-4 text-red-600" />
      case 'INVESTMENT': return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      default:           return <ArrowDownRight className="h-4 w-4 text-yellow-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/accounts')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>

        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Colour dot */}
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: account.color || '#3B82F6' }}
          />
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 truncate">
            {account.name}
          </h1>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">
            {account.type?.replace('_', ' ')}
          </span>
          {account.isDefault && (
            <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full whitespace-nowrap">
              Default
            </span>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowEditForm(true)}
          leftIcon={<Edit className="h-4 w-4" />}
        >
          Edit
        </Button>
      </div>

      {/* Stats Grid */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-xs text-gray-500 mb-1">Current Balance</p>
            <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              {formatCurrency(stats.currentBalance, account.currency)}
            </p>
          </Card>

          <Card>
            <p className="text-xs text-gray-500 mb-1">Monthly Income</p>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0" />
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.monthlyIncome, account.currency)}
              </p>
            </div>
          </Card>

          <Card>
            <p className="text-xs text-gray-500 mb-1">Monthly Expenses</p>
            <div className="flex items-center gap-1.5">
              <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(stats.monthlyExpenses, account.currency)}
              </p>
            </div>
          </Card>

          <Card>
            <p className="text-xs text-gray-500 mb-1">Net Flow</p>
            <p className={`text-xl font-bold ${stats.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.netFlow >= 0 ? '+' : ''}{formatCurrency(stats.netFlow, account.currency)}
            </p>
          </Card>
        </div>
      )}

      {/* Account Info */}
      <Card>
        <h2 className="text-base font-semibold text-gray-900 mb-3">Account Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500 mb-0.5">Type</p>
            <p className="font-medium text-gray-900">{account.type?.replace('_', ' ')}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">Currency</p>
            <p className="font-medium text-gray-900">{account.currency || 'INR'}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">Total Transactions</p>
            <p className="font-medium text-gray-900">{stats?.transactionCount ?? transactions?.length ?? 0}</p>
          </div>
          <div>
            <p className="text-gray-500 mb-0.5">Created</p>
            <p className="font-medium text-gray-900">{formatDate(account.createdAt, 'short')}</p>
          </div>
        </div>
        {account.description && (
          <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
            {account.description}
          </p>
        )}
      </Card>

      {/* Recent Transactions */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/transactions?account=${id}`)}
          >
            View All
          </Button>
        </div>

        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No transactions yet for this account</p>
          </div>
        ) : (
          <div className="space-y-1">
            {transactions.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition"
                onClick={() => navigate(`/transactions/${t._id}`)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 bg-gray-100 rounded flex-shrink-0">
                    {getTypeIcon(t.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(t.date, 'short')} · <span className="capitalize">{t.category}</span>
                      {t.isRecurring && (
                        <span className="ml-1 text-blue-500">
                          <Repeat className="h-3 w-3 inline" />
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <p className={`text-sm font-semibold flex-shrink-0 ml-3 ${getAmountColor(t.type)}`}>
                  {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount, account.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Edit Form Modal */}
      {showEditForm && (
        <AccountForm
          account={account}
          onClose={() => setShowEditForm(false)}
        />
      )}
    </div>
  )
}

export default AccountDetail