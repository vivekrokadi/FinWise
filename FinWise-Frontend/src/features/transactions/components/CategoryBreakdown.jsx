import { PieChart } from 'lucide-react'
import Card from '../../../components/ui/Card'
import { formatCurrency, formatPercentage } from '../../../utils/formatters'

// Consistent colour per category name — deterministic so same category
// always gets the same colour across pie chart and breakdown list
const CATEGORY_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#F97316', '#EC4899',
  '#14B8A6', '#84CC16'
]

const getColor = (name, index) => CATEGORY_COLORS[index % CATEGORY_COLORS.length]

const CategoryBreakdown = ({ data, total, type = 'EXPENSE' }) => {
  if (!data || data.length === 0) {
    return (
      <Card className="text-center py-8">
        <PieChart className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No {type.toLowerCase()} data for this period</p>
      </Card>
    )
  }

  const sorted = [...data].sort((a, b) => b.totalAmount - a.totalAmount)

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          {type === 'EXPENSE' ? 'Expense' : 'Income'} Breakdown
        </h3>
        <span className="text-xs text-gray-400">{sorted.length} categories</span>
      </div>

      <div className="space-y-3">
        {sorted.map((item, i) => {
          const pct = total > 0 ? (item.totalAmount / total) * 100 : 0
          const color = getColor(item._id, i)

          return (
            <div key={item._id || i}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize truncate">
                    {item._id || 'uncategorised'}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {item.count} {item.count === 1 ? 'txn' : 'txns'}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="text-xs text-gray-500">{formatPercentage(pct)}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
        <span className="text-sm text-gray-500">Total {type.toLowerCase()}</span>
        <span className="text-base font-bold text-gray-900">{formatCurrency(total)}</span>
      </div>
    </Card>
  )
}

export default CategoryBreakdown