import { AlertCircle, AlertTriangle, X } from 'lucide-react'
import Card from '../../../components/ui/Card'
import Button from '../../../components/ui/Button'
import { formatCurrency, formatPercentage } from '../../../utils/formatters'

const BudgetAlerts = ({ alerts, onDismiss }) => {
  if (!alerts || alerts.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">Budget Alerts</h2>
      {alerts.map((alert) => (
        <Card key={alert.budgetId} className="border-l-4 border-l-yellow-500">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {alert.alertType === 'EXCEEDED' ? (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              )}
              <div>
                <h3 className="font-semibold text-gray-900 capitalize">
                  {alert.category}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <span>Budget: {formatCurrency(alert.budgetAmount)}</span>
                  <span className="mx-2">•</span>
                  <span>Spent: {formatCurrency(alert.currentSpending)}</span>
                  <span className="mx-2">•</span>
                  <span className={alert.alertType === 'EXCEEDED' ? 'text-red-600' : 'text-yellow-600'}>
                    {formatPercentage(alert.percentageUsed)} used
                  </span>
                </div>
              </div>
            </div>
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert.budgetId)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default BudgetAlerts