import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet, TrendingUp, TrendingDown, PieChart as PieChartIcon,
  ArrowRight, Loader2, Plus, ArrowUpRight, ArrowDownRight,
  Calendar, RefreshCw, Repeat, AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts'
import { useDashboardStats } from '../hooks/useDashboardStats'
import StatCard from '../components/StatCard'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatCurrency, formatDate } from '../../../utils/formatters'
import TransactionForm from '../../transactions/components/TransactionForm'
import { useQueryClient } from '@tanstack/react-query'

// ── Constants ─────────────────────────────────────────────────────────────────
const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

// ── Custom Tooltips ───────────────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 capitalize">{d.name}</p>
      <p className="text-gray-600">{formatCurrency(d.value)}</p>
      <p className="text-gray-400">{d.percentage}%</p>
    </div>
  )
}

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
  if (percentage < 6) return null
  const RADIAN = Math.PI / 180
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {percentage}%
    </text>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: stats, isLoading, error, isFetching } = useDashboardStats()
  const [showTransactionForm, setShowTransactionForm] = useState(false)

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
        <p className="text-red-600 mb-4">Failed to load dashboard</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}>
          Retry
        </Button>
      </div>
    )
  }

  // Enrich pie data with percentage
  const totalExpense = stats?.categoryBreakdown?.reduce((s, c) => s + c.total, 0) || 0
  const pieData = (stats?.categoryBreakdown || []).map((c, i) => ({
    name: c._id,
    value: c.total,
    percentage: totalExpense > 0 ? Math.round((c.total / totalExpense) * 100) : 0,
    color: PIE_COLORS[i % PIE_COLORS.length]
  }))

  const getTypeIcon = (type) => {
    switch (type) {
      case 'INCOME':     return <ArrowUpRight className="h-4 w-4 text-green-600" />
      case 'EXPENSE':    return <ArrowDownRight className="h-4 w-4 text-red-600" />
      case 'INVESTMENT': return <ArrowUpRight className="h-4 w-4 text-blue-600" />
      default:           return <ArrowDownRight className="h-4 w-4 text-yellow-600" />
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
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {stats?.period || 'Last 30 days'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
            title="Refresh data"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowTransactionForm(true)}
            leftIcon={<Plus className="h-4 w-4" />}
            className="whitespace-nowrap"
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance"   value={formatCurrency(stats?.totalBalance || 0)}    icon={Wallet}       color="blue" />
        <StatCard title="Income (30d)"    value={formatCurrency(stats?.monthlyIncome || 0)}   icon={TrendingUp}   color="green" />
        <StatCard title="Expenses (30d)"  value={formatCurrency(stats?.monthlyExpenses || 0)} icon={TrendingDown} color="red" />
        <StatCard title="Budget Used"     value={`${stats?.budgetUsage ?? 0}%`}               icon={PieChartIcon} color="purple" />
      </div>

      {/* ── Savings Rate ── */}
      {stats?.monthlyIncome > 0 && (
        <Card className="py-4 px-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Savings Rate (30d)</span>
            <span className={`text-sm font-bold ${
              stats.savingsRate >= 20 ? 'text-green-600' :
              stats.savingsRate >= 0  ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {stats.savingsRate}%
              <span className="text-gray-400 font-normal ml-1 text-xs">(target ≥ 20%)</span>
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                stats.savingsRate >= 20 ? 'bg-green-500' :
                stats.savingsRate >= 0  ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(Math.max(stats.savingsRate || 0, 0), 100)}%` }}
            />
          </div>
        </Card>
      )}

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Bar Chart — 6-month trend */}
        <Card className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-900">6-Month Trend</h2>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500 inline-block" /> Income</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-400 inline-block" /> Expense</span>
            </div>
          </div>
          {stats?.monthlyTrend?.some(m => m.income > 0 || m.expense > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stats.monthlyTrend} margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%" barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} width={48} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#F9FAFB' }} />
                <Bar dataKey="income"  name="Income"  fill="#10B981" radius={[3,3,0,0]} />
                <Bar dataKey="expense" name="Expense" fill="#F87171" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[220px] text-gray-300">
              <TrendingUp className="h-10 w-10 mb-2" />
              <p className="text-sm text-gray-400">Add transactions to see trends</p>
            </div>
          )}
        </Card>

        {/* Pie Chart — expense breakdown */}
        <Card className="lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Expense Breakdown</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={PieLabel}>
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="white" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((entry, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                      <span className="text-gray-600 capitalize truncate">{entry.name}</span>
                    </div>
                    <span className="text-gray-900 font-medium ml-2 flex-shrink-0">{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[180px] text-gray-300">
              <PieChartIcon className="h-10 w-10 mb-2" />
              <p className="text-sm text-gray-400">No expense data yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* ── Bottom Row: Recent Transactions + Upcoming Bills + Quick Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Transactions */}
        <Card className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-900">Recent Transactions</h2>
            <button onClick={() => navigate('/transactions')} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {stats?.recentTransactions?.length > 0 ? (
            <div className="space-y-1">
              {stats.recentTransactions.map((t) => (
                <div
                  key={t._id}
                  className="flex items-center justify-between py-2 px-1 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => navigate(`/transactions/${t._id}`)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="p-1.5 bg-gray-100 rounded flex-shrink-0">{getTypeIcon(t.type)}</div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                      <p className="text-xs text-gray-500">{formatDate(t.date, 'short')}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${getAmountColor(t.type)}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 text-sm mb-3">No transactions yet</p>
              <Button variant="primary" size="sm" onClick={() => setShowTransactionForm(true)}>
                Add First Transaction
              </Button>
            </div>
          )}
        </Card>

        {/* Upcoming Bills */}
        <Card className="lg:col-span-1">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Repeat className="h-4 w-4 text-blue-500" />
              Upcoming Bills
            </h2>
          </div>
          {stats?.upcomingBills?.length > 0 ? (
            <div className="space-y-2">
              {stats.upcomingBills.map((bill) => (
                <div
                  key={bill._id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => navigate(`/transactions/${bill._id}`)}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Repeat className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{bill.description}</p>
                      <p className="text-xs text-blue-600">
                        Due {formatDate(bill.nextRecurringDate, 'short')}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-semibold flex-shrink-0 ml-2 ${getAmountColor(bill.type)}`}>
                    {bill.type === 'INCOME' ? '+' : '-'}{formatCurrency(bill.amount)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Repeat className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No upcoming recurring bills</p>
              <p className="text-xs mt-1">Mark transactions as recurring to see them here</p>
            </div>
          )}
        </Card>

        {/* Quick Actions + Net Worth */}
        <div className="space-y-4">
          <Card>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Transactions', path: '/transactions' },
                { label: 'Accounts',     path: '/accounts' },
                { label: 'Budgets',      path: '/budgets' },
                { label: 'AI Insights',  path: '/ai/insights' }
              ].map(({ label, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="px-3 py-2.5 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 text-gray-700 text-sm font-medium rounded-lg transition border border-gray-200 hover:border-blue-200 text-left"
                >
                  {label}
                </button>
              ))}
            </div>
          </Card>

          <div
            className="rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-5 text-white cursor-pointer hover:shadow-lg transition"
            onClick={() => navigate('/accounts')}
          >
            <p className="text-blue-200 text-xs mb-1">Total Net Worth</p>
            <p className="text-2xl font-bold">{formatCurrency(stats?.netWorth || 0)}</p>
            <p className="text-blue-300 text-xs mt-2">
              {stats?.accountCount ?? 0} account{stats?.accountCount !== 1 ? 's' : ''} · tap to view
            </p>
          </div>
        </div>

      </div>

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm onClose={() => setShowTransactionForm(false)} />
      )}
    </div>
  )
}

export default Dashboard