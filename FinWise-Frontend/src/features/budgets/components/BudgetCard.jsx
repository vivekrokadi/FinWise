import { useState } from 'react'
import { MoreVertical, Edit, Trash2, Bell, BellOff } from 'lucide-react'
import Card from '../../../components/ui/Card'
import { formatCurrency, formatPercentage } from '../../../utils/formatters'

// Month name lookup
const MONTHS = [
  '', 'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const BudgetCard = ({ budget, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false)

  const pct = budget.percentageUsed || 0

  const statusColor = pct >= 100
    ? { bar: 'bg-red-500', text: 'text-red-600', badge: 'bg-red-50 text-red-700', label: 'Exceeded' }
    : pct >= (budget.alertThreshold || 80)
    ? { bar: 'bg-yellow-500', text: 'text-yellow-600', badge: 'bg-yellow-50 text-yellow-700', label: 'Warning' }
    : { bar: 'bg-green-500', text: 'text-green-600', badge: 'bg-green-50 text-green-700', label: 'On Track' }

  // Human-readable period label e.g. "March 2026" or "2026 (Yearly)"
  const periodLabel = budget.period === 'MONTHLY' && budget.month
    ? `${MONTHS[budget.month]} ${budget.year}`
    : `${budget.year} — Yearly`

  return (
    <Card className="relative hover:shadow-md transition-shadow">

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="min-w-0 pr-2">
          <h3 className="font-semibold text-gray-900 capitalize truncate">
            {budget.category}
          </h3>
          {/* Period label — this was missing before */}
          <p className="text-xs text-gray-500 mt-0.5">{periodLabel}</p>
        </div>

        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <MoreVertical className="h-5 w-5 text-gray-500" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={() => { setShowMenu(false); onEdit(budget) }}
                  className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDelete(budget) }}
                  className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Amounts */}
      <div className="flex justify-between items-baseline mb-1">
        <span className="text-sm text-gray-500">Budget</span>
        <span className="text-lg font-semibold text-gray-900">{formatCurrency(budget.amount)}</span>
      </div>
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-sm text-gray-500">Spent</span>
        <span className={`text-base font-medium ${pct > 0 ? statusColor.text : 'text-gray-700'}`}>
          {formatCurrency(budget.currentSpending)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${statusColor.bar}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* Footer row */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor.badge}`}>
            {statusColor.label}
          </span>
          <span className="text-xs text-gray-500">{formatPercentage(pct)}</span>
        </div>

        <div className="flex items-center gap-2 text-right">
          <span className="text-xs text-gray-500">
            Left: <span className="font-medium text-gray-700">{formatCurrency(budget.remainingAmount)}</span>
          </span>
          {budget.alertsEnabled ? (
            <Bell className="h-3.5 w-3.5 text-gray-400" title={`Alert at ${budget.alertThreshold}%`} />
          ) : (
            <BellOff className="h-3.5 w-3.5 text-gray-300" title="Alerts off" />
          )}
        </div>
      </div>
    </Card>
  )
}

export default BudgetCard