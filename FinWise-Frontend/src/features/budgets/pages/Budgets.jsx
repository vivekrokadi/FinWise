import { useState } from 'react'
import { Plus, Calendar } from 'lucide-react'
import { useBudgets, useBudgetStats, useBudgetAlerts, useDeleteBudget } from '../hooks/useBudgets'
import BudgetCard from '../components/BudgetCard'
import BudgetForm from '../components/BudgetForm'
import BudgetAlerts from '../components/BudgetAlerts'
import Button from '../../../components/ui/Button'
import Card from '../../../components/ui/Card'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import { formatCurrency, formatPercentage } from '../../../utils/formatters'

const Budgets = () => {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [showForm, setShowForm] = useState(false)
  const [editingBudget, setEditingBudget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const { data: budgets, isLoading: budgetsLoading, error: budgetsError } = useBudgets(selectedYear)
  const { data: stats, isLoading: statsLoading } = useBudgetStats()
  const { data: alerts, refetch: refetchAlerts } = useBudgetAlerts()
  const deleteMutation = useDeleteBudget()

  const handleEdit = (budget) => {
    setEditingBudget(budget)
    setShowForm(true)
  }

  const handleDelete = async () => {
    if (deleteTarget) {
      await deleteMutation.mutateAsync(deleteTarget._id)
      setDeleteTarget(null)
      refetchAlerts()
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingBudget(null)
  }

  if (budgetsLoading || statsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (budgetsError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load budgets</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Budgets</h1>
          <p className="text-gray-600 mt-1">Set and track your spending limits</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create Budget
        </Button>
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <BudgetAlerts alerts={alerts} />
      )}

      {/* Overall Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.overall.totalBudget)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.overall.totalSpending)}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-gray-600 mb-1">Overall Usage</p>
            <p className={`text-2xl font-bold ${
              stats.overall.percentageUsed >= 100 
                ? 'text-red-600' 
                : stats.overall.percentageUsed >= 80
                ? 'text-yellow-600'
                : 'text-green-600'
            }`}>
              {formatPercentage(stats.overall.percentageUsed)}
            </p>
          </Card>
        </div>
      )}

      {/* Year Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Year:</label>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
        >
          <option value={currentYear - 1}>{currentYear - 1}</option>
          <option value={currentYear}>{currentYear}</option>
          <option value={currentYear + 1}>{currentYear + 1}</option>
        </select>
      </div>

      {/* Budgets Grid */}
      {budgets?.length === 0 ? (
        <Card className="text-center py-12">
          <div className="max-w-sm mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No budgets yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first budget to start tracking your spending limits
            </p>
            <Button
              variant="primary"
              onClick={() => setShowForm(true)}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Create Your First Budget
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets?.map((budget) => (
            <BudgetCard
              key={budget._id}
              budget={budget}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Budget Form Modal */}
      {showForm && (
        <BudgetForm
          budget={editingBudget}
          onClose={handleCloseForm}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <h3 className="text-lg font-semibold mb-2">Delete Budget</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete the budget for "{deleteTarget.category}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteTarget(null)}
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

export default Budgets