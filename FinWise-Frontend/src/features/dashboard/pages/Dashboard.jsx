import { useNavigate } from 'react-router-dom'
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  ArrowRight,
  Loader2
} from 'lucide-react'
import { useDashboardStats } from '../hooks/useDashboardStats'
import StatCard from '../components/StatCard'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatCurrency } from '../../../utils/formatters'

const Dashboard = () => {
  const navigate = useNavigate()
  const { data, isLoading, error } = useDashboardStats()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load dashboard data</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Default stats if backend returns empty
  const stats = data || {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    netWorth: 0,
    budgetUsage: 0,
    recentTransactions: []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="space-x-2">
          <Button 
            variant="primary" 
            size="sm"
            onClick={() => navigate('/transactions/new')}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(stats.totalBalance)}
          icon={Wallet}
          color="blue"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(stats.monthlyIncome)}
          icon={TrendingUp}
          color="green"
          trend="up"
          trendValue="+12.5%"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(stats.monthlyExpenses)}
          icon={TrendingDown}
          color="red"
          trend="down"
          trendValue="-8.3%"
        />
        <StatCard
          title="Budget Usage"
          value={`${stats.budgetUsage}%`}
          icon={PieChart}
          color="purple"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/transactions')}
            >
              View Transactions
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/accounts')}
            >
              Manage Accounts
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/budgets')}
            >
              Set Budgets
            </Button>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => navigate('/ai/insights')}
            >
              Get Insights
            </Button>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Recent Transactions</h2>
            <button 
              onClick={() => navigate('/transactions')}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
            >
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>
          
          {stats.recentTransactions?.length > 0 ? (
            <div className="space-y-2">
              {/* Transaction items would go here */}
              <p className="text-gray-500 text-center py-4">
                Recent transactions feature coming soon
              </p>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No recent transactions
            </p>
          )}
        </Card>
      </div>

      {/* Net Worth Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-blue-100 mb-1">Net Worth</p>
            <p className="text-3xl font-bold">{formatCurrency(stats.netWorth)}</p>
          </div>
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 border-0"
            onClick={() => navigate('/accounts')}
          >
            View Details
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Dashboard