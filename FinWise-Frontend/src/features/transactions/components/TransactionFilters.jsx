import { useState, useEffect } from 'react'
import { Search, Filter, X } from 'lucide-react'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'
import { TRANSACTION_TYPES } from '../../../utils/constants'
import { useDebounce } from '../../../hooks/useDebounce'

const TransactionFilters = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters)
  const [showFilters, setShowFilters] = useState(false)
  const [searchInput, setSearchInput] = useState(filters.search || '')

  const debouncedSearch = useDebounce(searchInput, 400)

  // Auto-apply debounced search without requiring button press
  useEffect(() => {
    if (debouncedSearch !== (filters.search || '')) {
      onFilterChange({ ...localFilters, search: debouncedSearch || undefined, page: 1 })
    }
  }, [debouncedSearch])

  // Sync local state when parent filters change
  useEffect(() => {
    setLocalFilters(filters)
    setSearchInput(filters.search || '')
  }, [filters])

  const handleChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApply = () => {
    onFilterChange({ ...localFilters, search: searchInput || undefined, page: 1 })
    setShowFilters(false)
  }

  const handleClear = () => {
    const cleared = { page: 1, limit: filters.limit || 10 }
    setLocalFilters(cleared)
    setSearchInput('')
    onFilterChange(cleared)
    setShowFilters(false)
  }

  const hasActiveFilters = filters.type || filters.category || filters.startDate || filters.endDate

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <Input
            placeholder="Search transactions..."
            leftIcon={<Search className="h-4 w-4 text-gray-400" />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button
          variant={showFilters || hasActiveFilters ? 'primary' : 'secondary'}
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter className="h-4 w-4" />}
        >
          Filters {hasActiveFilters ? '•' : ''}
        </Button>
      </div>

      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Advanced Filters</h3>
            <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-gray-200 rounded">
              <X className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={localFilters.type || ''}
                onChange={(e) => handleChange('type', e.target.value || undefined)}
              >
                <option value="">All Types</option>
                {TRANSACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <Input
                placeholder="e.g., groceries, salary"
                value={localFilters.category || ''}
                onChange={(e) => handleChange('category', e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={localFilters.startDate || ''}
                onChange={(e) => handleChange('startDate', e.target.value || undefined)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <Input
                type="date"
                value={localFilters.endDate || ''}
                onChange={(e) => handleChange('endDate', e.target.value || undefined)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="secondary" size="sm" onClick={handleClear}>Clear All</Button>
            <Button variant="primary" size="sm" onClick={handleApply}>Apply Filters</Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default TransactionFilters