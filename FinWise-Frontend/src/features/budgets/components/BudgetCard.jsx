import { useState } from 'react'
import { MoreVertical, Edit, Trash2, Bell, BellOff } from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatCurrency, formatPercentage } from '../../../utils/formatters'

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false)

  const getStatusColor = () => {
    if (budget.percentageUsed >= 100) return 'bg-red-500'
    if (budget.percentageUsed >= budget.alertThreshold) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusText = () => {
    if (budget.percentageUsed >= 100) return 'Exceeded'
    if (budget.percentageUsed >= budget.alertThreshold) return 'Warning'
    return 'On Track'
  }

  const getStatusTextColor = () => {
    if (budget.percentageUsed >= 100) return 'text-red-600'
    if (budget.percentageUsed >= budget.alertThreshold) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <Card className="relative hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 capitalize">
            {budget.category}
          </h3>
          <p className="text-sm text-gray-500">
            {budget.period} Budget
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onEdit(budget)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false)
                    onDelete(budget)
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amounts */}
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm text-gray-500">Budget</span>
        <span className="text-lg font-semibold text-gray-900">
          {formatCurrency(budget.amount)}
        </span>
      </div>

      <div className="flex justify-between items-baseline mb-3">
        <span className="text-sm text-gray-500">Spent</span>
        <span className="text-base font-medium text-gray-700">
          {formatCurrency(budget.currentSpending)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${getStatusColor()}`}
            style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center text-sm mb-3">
        <span className="text-gray-500">
          {formatPercentage(budget.percentageUsed)} used
        </span>
        <span className="font-medium text-gray-700">
          Remaining: {formatCurrency(budget.remainingAmount)}
        </span>
      </div>

      {/* Status Badge */}
      <div className="flex justify-between items-center">
        <span className={`text-xs font-medium ${getStatusTextColor()}`}>
          {getStatusText()}
        </span>
        
        {budget.alertsEnabled ? (
          <span className="flex items-center text-xs text-gray-500">
            <Bell className="h-3 w-3 mr-1" />
            Alert at {budget.alertThreshold}%
          </span>
        ) : (
          <span className="flex items-center text-xs text-gray-500">
            <BellOff className="h-3 w-3 mr-1" />
            Alerts off
          </span>
        )}
      </div>
    </Card>
  )
}

export default BudgetCard