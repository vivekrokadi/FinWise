import { PieChart, TrendingUp } from 'lucide-react'
import Card from '../../../components/ui/Card'
import { formatCurrency, formatPercentage } from '../../../utils/formatters'

const CategoryBreakdown = ({ data, total, type = 'EXPENSE' }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="text-center py-8">
        <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No {type.toLowerCase()} data available</p>
      </Card>
    )
  }

  // Sort by amount descending
  const sortedData = [...data].sort((a, b) => b.totalAmount - a.totalAmount)

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">
        {type === 'EXPENSE' ? 'Expense' : 'Income'} Breakdown
      </h3>

      <div className="space-y-3">
        {sortedData.map((item) => {
          const percentage = (item.totalAmount / total) * 100
          
          return (
            <div key={item._id}>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {item._id}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({item.count} {item.count === 1 ? 'txn' : 'txns'})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.totalAmount)}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    ({formatPercentage(percentage)})
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    type === 'EXPENSE' ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Total {type.toLowerCase()}</span>
          <span className="text-lg font-bold text-gray-900">
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </Card>
  )
}

export default CategoryBreakdown