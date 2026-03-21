import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import { useAccount, useAccountStats } from '../hooks/useAccounts'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { formatCurrency, formatDate } from '../../../utils/formatters'

const AccountDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/accounts')}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{account.name}</h1>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Edit className="h-4 w-4" />}
        >
          Edit
        </Button>
      </div>

      {/* Stats Grid */}
      {!statsLoading && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <p className="text-sm text-gray-600 mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.currentBalance, account.currency)}
            </p>
          </Card>
          
          <Card>
            <p className="text-sm text-gray-600 mb-1">Monthly Income</p>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(stats.monthlyIncome, account.currency)}
              </p>
            </div>
          </Card>
          
          <Card>
            <p className="text-sm text-gray-600 mb-1">Monthly Expenses</p>
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(stats.monthlyExpenses, account.currency)}
              </p>
            </div>
          </Card>
          
          <Card>
            <p className="text-sm text-gray-600 mb-1">Net Flow</p>
            <p className={`text-xl font-bold ${
              stats.netFlow >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(stats.netFlow, account.currency)}
            </p>
          </Card>
        </div>
      )}

      {/* Recent Transactions */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Transactions</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            View All
          </Button>
        </div>

        {transactions?.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No transactions yet</p>
        ) : (
          <div className="space-y-2">
            {transactions?.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                onClick={() => navigate(`/transactions/${transaction._id}`)}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.date)} • {transaction.category}
                    </p>
                  </div>
                </div>
                <p className={`font-semibold ${
                  transaction.type === 'INCOME' 
                    ? 'text-green-600' 
                    : transaction.type === 'EXPENSE'
                    ? 'text-red-600'
                    : 'text-gray-600'
                }`}>
                  {transaction.type === 'INCOME' ? '+' : '-'}
                  {formatCurrency(transaction.amount, account.currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default AccountDetail